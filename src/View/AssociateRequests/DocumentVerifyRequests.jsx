import { useEffect, useState } from "react";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS, { API_BASE_URL } from "../../utilities/apiConfig";
import Swal from "sweetalert2";
import { FiX } from "react-icons/fi";

const AssociateDocumentVerifyRequests = () => {

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    townshipId: "",
    status: ""
  });

  const adminId = Number(localStorage.getItem("userId"));
  console.log("Admin ID 👉", adminId);

  const [townshipList, setTownshipList] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [remarks, setRemarks] = useState("");

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "0", label: "Pending" },
    { value: "1", label: "Approved" },
    { value: "2", label: "Rejected" },
  ];

  // ✅ Fetch Township
  useEffect(() => {
    const fetchTownships = async () => {
      try {
        const res = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_LIST);
        setTownshipList(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTownships();
  }, []);

  // ✅ Fetch Document Verify List
  const fetchList = async () => {
    setLoading(true);

    try {
      let url = API_ENDPOINTS.GET_DOCUMENT_VERIFY_REQUESTS;

      const params = [];

      if (filters.townshipId) {
        params.push(`townshipId=${filters.townshipId}`);
      }

      if (filters.status) {
        params.push(`status=${filters.status}`);
      }

      if (params.length > 0) {
        url += "?" + params.join("&");
      }

      console.log("📡 API URL =>", url);

      const res = await axiosInstance.get(url);

      console.log("🔥 FULL RESPONSE =>", res);
      console.log("📦 DATA =>", res.data);

      // adjust later if needed
      setList(res.data?.data || res.data || []);

    } catch (err) {
      console.error("❌ API ERROR =>", err);
      setError("Failed to load data");
      setList([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  fetchList();
}, []);

  // ✅ Approve / Reject API
  const handleUpdateStatus = async (isApprove) => {
    if (!isApprove && !remarks) {
      Swal.fire("Error", "Reject reason required", "error");
      return;
    }

    try {
      await axiosInstance.post(API_ENDPOINTS.APPROVE_REJECT_DOCUMENT_REQUEST, {
        requestId: selectedItem.id,
        status: isApprove ? 1 : 2,
        reason: remarks || "",
        adminId: adminId, 
      });

      Swal.fire(
        isApprove ? "Approved!" : "Rejected!",
        "Action completed successfully",
        "success"
      );

      setShowApproveModal(false);
      setShowRejectModal(false);
      setRemarks("");
      fetchList();

    } catch (err) {
      Swal.fire("Error", "Action failed", "error");
    }
  };

  

const handleDownload = async (filePath) => {
  if (!filePath) {
    Swal.fire("Error", "File not found", "error");
    return;
  }

  try {
    const fileUrl = `${API_BASE_URL}/Uploads/UserDocuments/${filePath}`;

    console.log("📥 Download URL =>", fileUrl);

    const response = await fetch(fileUrl);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    // clean filename
    const fileName = filePath.split("_").pop();
    link.setAttribute("download", fileName);

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Download error:", error);
    Swal.fire("Error", "Download failed", "error");
  }
};

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Documents Verification Requests</h1>
          <p className="dashboard-subtitle">
            Here are the documents sent by associates for verification. You can view details, download files, and approve or reject each request.
          </p>
        </div>

        <button className="primary-btn" onClick={() => window.history.back()}>
          Back
        </button>
      </div>

      {/* FILTER CARD */}
      <div className="card">
        <div className="row">

          <div className="col-md-4">
            <select
              className="form-control"
              value={filters.townshipId}
              onChange={(e) =>
                setFilters(prev => ({ ...prev, townshipId: e.target.value }))
              }
            >
              <option value="">All Townships</option>
              {townshipList.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <select
              className="form-control"
              value={filters.status}
              onChange={(e) =>
                setFilters(prev => ({ ...prev, status: e.target.value }))
              }
            >
              {statusOptions.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <div className="d-flex gap-2">
            <button className="primary-btn" onClick={fetchList}>
              Search
            </button>
             <button className="primary-btn" onClick={fetchList}>
              Reset
            </button>
            </div>
          </div>
           

        </div>
      </div>

      {/* TABLE */}
      <div className="card">

        {loading ? (
          <p>Loading...</p>
        ) : list.length === 0 ? (
          <p>No data found</p>
        ) : (

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Township / Plot</th>
                  <th>Document Type</th>
                  <th>Associate Details</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {list.map(item => (
                  <tr key={item.id}>
                    <td>{item.townshipName} <br /> Plot {item.plotNo || 'N/A'} / {item.plotSize || 'N/A'}</td>
                    <td>{item.documentTypName}</td>
                    <td>{item.associateName} <br /> {item.associateReraNo} <br /> {item.associateContactNo}</td>
                    <td>{item.notes}</td>
                    <td>{item.statusName}</td>

                    <td className="d-flex gap-2">

                      {/* <button
                        className="primary-btn"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowViewModal(true);
                        }}
                      >
                        View
                      </button> */}
                      <button
                        className="primary-btn"
                        onClick={() => handleDownload(item.filePath)}
                        >
                        Download
                        </button>

                      <button
                        className="primary-btn"
                        disabled={item.status !== 0}
                        onClick={() => {
                          setSelectedItem(item);
                          setShowApproveModal(true);
                        }}
                      >
                        Approve
                      </button>

                      <button
                        className="primary-btn"
                        disabled={item.status !== 0}
                        onClick={() => {
                          setSelectedItem(item);
                          setShowRejectModal(true);
                        }}
                      >
                        Reject
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {showViewModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Document Details</h3>
              <FiX onClick={() => setShowViewModal(false)} />
            </div>

            <p><b>Document:</b> {selectedItem?.documentType}</p>
            <p><b>Associate:</b> {selectedItem?.associateName}</p>
            <p><b>Notes:</b> {selectedItem?.notes}</p>
          </div>
        </div>
      )}

      {/* APPROVE MODAL */}
      {showApproveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Approve Document</h3>
              <FiX onClick={() => setShowApproveModal(false)} />
            </div>

            <textarea
              placeholder="Remarks (optional)"
              className="form-control"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <button
              className="primary-btn"
              onClick={() => handleUpdateStatus(true)}
            >
              Confirm Approve
            </button>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Reject Document</h3>
              <FiX onClick={() => setShowRejectModal(false)} />
            </div>

            <textarea
              placeholder="Enter reject reason *"
              className="form-control"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <button
              className="primary-btn"
              onClick={() => handleUpdateStatus(false)}
            >
              Confirm Reject
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssociateDocumentVerifyRequests;