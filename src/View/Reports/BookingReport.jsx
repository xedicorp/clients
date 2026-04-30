import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookingWrapper from "./style";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import XediLoader from '../../components/XediLoader';
import {
  determineWorkflowCode,
  getWorkflowBadgeClass,
  getWorkflowDisplayName,
  normalizeWorkflowTypeId,
  workflowCodeToId
} from '../../utilities/workflowUtils';


const BookingReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const getBadgeClass = (workflowCode) => {
      return getWorkflowBadgeClass(workflowCode);
    };
  
    const getDisplayName = (workflowCode) => {
      return getWorkflowDisplayName(workflowCode);
    };

  //  Fetch Booking List
  const fetchBookings = async () => {
      try {
        setLoading(true);

        const response = await axiosInstance.get(API_ENDPOINTS.BOOKING_LIST);

        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.value || [];

          console.log(list)

        setData(list);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    const getBookingTypeForExport = (item) => {
  if (!item || typeof item !== "object") {
    return "Unknown";
  }

  const workflowCode =
    item.workflowCode || determineWorkflowCode(item);

  const status = item.status || "";

  // Workflow types
  if (
    workflowCode &&
    ["WITH_LOAN", "WITHOUT_LOAN", "WITHOUT_7DAY_CLOSED"].includes(workflowCode)
  ) {
    return getDisplayName(workflowCode);
  }

  // Other statuses
  if (status && status !== "booking_created") {
    return getDisplayName(status);
  }

  // Default
  return "Initiated";
};
  useEffect(() => {
    

    fetchBookings();
  }, []);

  // ✅ Date format
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  // ✅ Excel Download
  const downloadExcel = () => {
    const headers = [
      "Booking ID",
      "Township",
      "Plot",
      "Client Name",
      "Mobile",
      "Booking Date",
      "Booking Type",
      "Agreement Value",
      "Total Agreement Value"
    ];

    const rows = data.map(item => [
      item.id,
      item.townshipName,
      item.plotNo,
      item.clientName,
      item.contactNo,
      formatDate(item.bookingDate),
      getBookingTypeForExport(item),
      item.agreementValue,
      item.totalAgreementValue
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(e => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "booking_report.csv";
    link.click();
  };

  // ✅ Loader (temporary)
  if (loading) {
    return (
      <BookingWrapper className="dashboard-container">
        <XediLoader/>
        <h2>Loading Booking Report...</h2>
      </BookingWrapper>
    );
  }

const totalAgreementValue = data.reduce(
  (sum, item) => sum + (Number(item.agreementValue) || 0),
  0
);

const totalFinalValue = data.reduce(
  (sum, item) => sum + (Number(item.totalAgreementValue) || 0),
  0
);
const formatCurrency = (num) =>
  Number(num || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });

  return (
    <BookingWrapper className="dashboard-container">
      
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Booking Report</h2>
          <p className="dashboard-subtitle">View and download booking report</p>
        </div>

        <div className="dashboard-header-actions">
          <button className="primary-btn" onClick={() => navigate(-1)}>
            Back
          </button>

          <button className="primary-btn" onClick={downloadExcel}>
            Download Excel
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Township / Plot</th>
                <th>Client Name / Mobile</th>
                <th>Booking Date</th>
                <th>Booking Type</th>
                <th>Agreement Value</th>
                <th>Total Agreement Value</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr key={item.id}>

                  {/* ✅ Clickable Booking ID */}
                  <td
                    style={{
                      cursor: "pointer",
                      color: "#2563eb",
                      textDecoration: "underline"
                    }}
                    onClick={() => navigate(`/booking-summery-report/${item.id}`)}
                  >
                    {item.id}
                  </td>

                  <td>{item.townshipName} / {item.plotNo}</td>

                  <td>
                    {item.clientName} <br />
                    {item.contactNo}
                  </td>

                  <td>{formatDate(item.bookingDate)}</td>
                    <td className="status center" style={{ color: item.progressColor }}>
                          {(() => {
                            if (
                              !item ||
                              typeof item !==
                              'object'
                            ) {
                              return (
                                <span
                                  style={{
                                    color: '#999',
                                    fontSize:
                                      '12px',
                                  }}
                                >
                                  Unknown
                                </span>
                              );
                            }

                            const workflowCode =
                            item.workflowCode ||
                            determineWorkflowCode(item);
                            const status =
                              item.status || '';

                            // Show workflow types first
                            if (
                              workflowCode &&
                              [
                                'WITH_LOAN',
                                'WITHOUT_LOAN',
                                'WITHOUT_7DAY_CLOSED',
                              ].includes(
                                workflowCode,
                              )
                            ) {
                              return (
                                <span
                                  className={getBadgeClass(
                                    workflowCode,
                                  )}
                                >
                                  {getDisplayName(
                                    workflowCode,
                                  )}
                                </span>
                              );
                            }

                            // Show other status values like plot_changed, payment_pending, etc.
                            if (
                              status &&
                              status !==
                              'booking_created'
                            ) {
                              return (
                                <span
                                  className={getBadgeClass(
                                    status,
                                  )}
                                >
                                  {getDisplayName(
                                    status,
                                  )}
                                </span>
                              );
                            }

                            // Default for booking_created or no status
                            return (
                              <span
                                style={{
                                  color: '#999',
                                  fontSize:
                                    '12px',
                                }}
                              >
                                Initiated
                              </span>
                            );
                          })()}
                        </td>
                  <td>₹ {item.agreementValue}</td>

                  <td>₹ {item.totalAgreementValue}</td>

                </tr>
              ))}
              <tr style={{ fontWeight: "bold", background: "#f8fafc" }}>
                <td colSpan="5" style={{ textAlign: "right" }}>
                  TOTAL
                </td>

                <td>₹ {formatCurrency(totalAgreementValue)}</td>
                <td>₹ {formatCurrency(totalFinalValue)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </BookingWrapper>
  );
};

export default BookingReport;