import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS, { API_BASE_URL } from "../../utilities/apiConfig";
import Swal from "sweetalert2";
import SmallModal from "../../components/Modal/SmallModal";
const SubscriptionLicense = () => {
    const [orders, setOrders] = useState([]);
const [loadingOrders, setLoadingOrders] = useState(false);
const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const currentPlan = {
        company: "Rajbhoomi Build Estate LLP",
        edition: "REALe ERP SaaS Edition",
        users: 10,
        startDate: "01 Jul 2026",
        renewalDate: "30 Jun 2027",
        status: "Active",
        modules: [
            "Core Module",
            "HR Module",
            "CRM Module"
        ]
    };
    const clientId = localStorage.getItem("tenant_id");
    const fetchOrders = async () => {

    if (!clientId) return;

    try {

        setLoadingOrders(true);

        const response = await axiosInstance.post(
            `${API_ENDPOINTS.GET_CLIENT_INVOICES}/${clientId}`
        );

        setOrders(response.data || []);

    } catch (error) {

        console.error(error);

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Unable to load invoices."
        });

    } finally {

        setLoadingOrders(false);

    }

};
useEffect(() => {

    fetchOrders();

}, []);
const handleDownloadInvoice = (invoiceId) => {

    window.open(
        `${API_BASE_URL}${API_ENDPOINTS.DOWNLOAD_INVOICE}/${invoiceId}`,
        "_blank"
    );

};

    return (

        <div className="dashboard-container">

            {/* =========================
                    Page Header
            ========================== */}

            <div className="dashboard-header">

                

                    <div>

                        <h3 className="dashboard-title">
                            Subscription & Licenses
                        </h3>

                        <p className="dashboard-subtitle">
                            Manage your subscription and license details
                        </p>

                    </div>

                    <div className="text-end">

                       <button
    className="primary-btn"
    onClick={() => setShowUpgradeModal(true)}
>
    <i className="fa fa-arrow-up me-2"></i>
    Upgrade Subscription
</button>

                    </div>

                

            </div>

            {/* =========================
                Current Subscription
            ========================== */}

            {/* Current Subscription */}

<div className="card">

    <div className="dashboard-table-header d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">
            Current Subscription
        </h5>
    </div>

    <div className="card-body">

        {/* First Section */}

        <div className="booking-info-matrix">

            <div className="booking-info-row">
                <label>Edition :</label>
                <span className="booking-info-value">
                    {currentPlan.edition || "N/A"}
                </span>
            </div>

            <div className="booking-info-row">
                <label>Company :</label>
                <span className="booking-info-value">
                    {currentPlan.company || "N/A"}
                </span>
            </div>

            <div className="booking-info-row">
                <label>Total Users :</label>
                <span className="booking-info-value">
                    {currentPlan.users || "0"}
                </span>
            </div>

            <div className="booking-info-row">
                <label>Start Date :</label>
                <span className="booking-info-value">
                    {currentPlan.startDate || "N/A"}
                </span>
            </div>

            <div className="booking-info-row">
                <label>Renewal :</label>
                <span className="booking-info-value">
                    {currentPlan.renewalDate || "N/A"}
                </span>
            </div>

            <div className="booking-info-row">
                <label >Status : </label>
                <span className="booking-info-value">
                    <span
                        className={`booking-status-badge ${
                            currentPlan.status === "Active"
                                ? "status-confirmed"
                                : "bg-danger"
                        }`}
                    >
                        {currentPlan.status}
                    </span>
                </span>
            </div>

        </div>

        {/* Second Section */}

        <div
            className="booking-info-grid"
            style={{ marginTop: "20px" }}
        >
            <div className="info-item" style={{ flex: 1 }}>
                <span className="info-label">
                    Modules :
                </span>

                <span
                    className="info-value"
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginTop: "8px",
                    }}
                >
                    {currentPlan.modules?.length > 0 ? (
                        currentPlan.modules.map((item, index) => (
                            <span
                                key={index}
                                className="booking-status-badge status-workflow-selected"
                            >
                                {item}
                            </span>
                        ))
                    ) : (
                        "N/A"
                    )}
                </span>
            </div>
        </div>

    </div>

</div>

            {/* =========================
                    Tabs
            ========================== */}

            <div className="card">

                 <div className="dashboard-table-header d-flex justify-content-between align-items-center mb-4">

    <div>

        <h5 className="mb-1">
            Active Subscriptions
        </h5>

        <small className="text-muted">
            View and upgrade your subscribed modules.
        </small>

    </div>

    {/* <button className="primary-btn">

        <i className="fa fa-plus me-2"></i>

        Upgrade Module

    </button> */}

</div>

<div className="table-responsive">

    <table className="table">

        <thead>

            <tr>

                <th style={{ width: "60px" }}>#</th>

                <th>Module</th>

                <th>Users</th>

                <th>Plan</th>

                <th>Start Date</th>

                <th>Renewal Date</th>

                <th>Status</th>

                <th className="text-center">Action</th>

            </tr>

        </thead>

        <tbody>

            <tr>

                <td>1</td>

                <td>
                    <strong>Core Module</strong>
                </td>

                <td>10</td>

                <td>Annual</td>

                <td>01 Jul 2026</td>

                <td>30 Jun 2027</td>

                <td>

                    <span className="booking-status-badge status-confirmed">

                        Active

                    </span>

                </td>

                <td className="text-center">

                    <button className="primary-btn">

                        Upgrade

                    </button>

                </td>

            </tr>

            <tr>

                <td>2</td>

                <td>
                    <strong>HR Module</strong>
                </td>

                <td>10</td>

                <td>Annual</td>

                <td>01 Jul 2026</td>

                <td>30 Jun 2027</td>

                <td>

                    <span className="booking-status-badge status-confirmed">

                        Active

                    </span>

                </td>

                <td className="text-center">

                    <button className="primary-btn">

                        Upgrade

                    </button>

                </td>

            </tr>

            <tr>

                <td>3</td>

                <td>
                    <strong>CRM Module</strong>
                </td>

                <td>10</td>

                <td>Annual</td>

                <td>01 Jul 2026</td>

                <td>30 Jun 2027</td>

                <td>

                    <span className="booking-status-badge status-confirmed">

                        Active

                    </span>

                </td>

                <td className="text-center">

                    <button className="primary-btn">

                        Upgrade

                    </button>

                </td>

            </tr>

            <tr>

                <td>4</td>

                <td>
                    <strong>Material Module</strong>
                </td>

                <td>-</td>

                <td>-</td>

                <td>-</td>

                <td>-</td>

                <td>

                    <span className="booking-status-badge status-cancelled">

                        Not Subscribed

                    </span>

                </td>

                <td className="text-center">

                    <button className="primary-btn">

                        Subscribe

                    </button>

                </td>

            </tr>

            <tr>

                <td>5</td>

                <td>
                    <strong>Development Module</strong>
                </td>

                <td>-</td>

                <td>-</td>

                <td>-</td>

                <td>-</td>

                <td>

                    <span className="booking-status-badge status-cancelled">

                        Not Subscribed

                    </span>

                </td>

                <td className="text-center">

                    <button className="primary-btn">

                        Subscribe

                    </button>

                </td>

            </tr>

        </tbody>

    </table>

</div>
</div>
<div className="card">
 <div className="d-flex justify-content-between align-items-center mb-4">

    <div>

        <h5 className="mb-1">
            License Management
        </h5>

        <small className="text-muted">
            View all purchased licenses and their current status.
        </small>

    </div>

</div>


<div className="table-responsive">

    <table className="table">

        <thead>

            <tr>

                <th style={{ width: "60px" }}>#</th>

                <th>License Key</th>

                <th>Module</th>

                <th>Users</th>

                <th>Activated On</th>

                <th>Expiry Date</th>

                <th>Status</th>

                <th className="text-center">Action</th>

            </tr>

        </thead>

        <tbody>

            <tr>

                <td>3</td>

                <td>
                    <code>LIC-CRM-5QP9-WX73-BC85</code>
                </td>

                <td>CRM Module</td>

                <td>10</td>

                <td>01 Jul 2026</td>

                <td>30 Jun 2027</td>

                <td>

                    <span className="booking-status-booking-status-badge status-confirmed">
                        Active
                    </span>

                </td>

                <td className="d-flex gap-2 justify-content-center">

                    <button className="primary-btn">

                        <i className="fa fa-eye me-1"></i>

                        View

                    </button>

                    <button className="primary-btn">

                        <i className="fa fa-copy me-1"></i>

                        Copy

                    </button>

                </td>

            </tr>

        </tbody>

    </table>

</div>
</div>
<div className="card">
 <div className="d-flex justify-content-between align-items-center mb-4">

    <div>

        <h5 className="mb-1">
            Orders & Payment History
        </h5>

        <small className="text-muted">
            View all your previous orders, payment status and download invoices.
        </small>

    </div>

</div>

<div className="table-responsive">

    <table className="table">

        <thead>

            <tr>

                <th style={{ width: "60px" }}>#</th>

                <th>Order ID</th>

                <th>Invoice No</th>

                <th>Payment Date</th>

                <th>Amount</th>

                <th>Paid On</th>

                <th>Status</th>

                <th className="text-center">Invoice</th>

            </tr>

        </thead>

        <tbody>

{
loadingOrders ?

<tr>
    <td colSpan="7" className="text-center">
        Loading...
    </td>
</tr>

:

orders.length === 0 ?

<tr>
    <td colSpan="7" className="text-center">
        No Orders Found
    </td>
</tr>

:

orders.map((order,index)=>(

<tr key={order.id}>

   <td>{index + 1}</td>

<td>{order.id}</td>

<td>{order.invoiceNumber || "-"}</td>

<td>
    {order.createdOn
        ? new Date(order.createdOn).toLocaleDateString()
        : "-"}
</td>

<td>
    ₹ {order.totalAmount?.toLocaleString()}
</td>

<td>{order.paidON || "-"}</td>

<td>
    <span
        className={`badge ${
            order.isPaid
                ? "bg-success"
                : "bg-warning text-dark"
        }`}
    >
        {order.isPaid ? "Paid" : "Pending"}
    </span>
</td>

<td>
    <button
        className="primary-btn"
        onClick={() => handleDownloadInvoice(order.id)}
    >
        Download
    </button>
</td>
</tr>

))

}

</tbody>

    </table>

</div>



            </div>
            {/* ============================
        Upgrade Subscription Modal
============================= */}

<SmallModal
    title="Upgrade Subscription"
    show={showUpgradeModal}
    onClose={() => setShowUpgradeModal(false)}
    size="lg"
    actions={
        <>
            <button
                className="primary-btn"
                onClick={() => setShowUpgradeModal(false)}
            >
                Cancel
            </button>

            <button className="primary-btn">
                <i className="fa fa-credit-card me-2"></i>
                Proceed to Payment
            </button>
        </>
    }
>

    <div className="row">

        {/* Left */}

        <div className="col-lg-7">

            <h6 className="mb-3">
                Select Modules
            </h6>

            <div className="form-check mb-3">
                <input
                    className="form-check-input"
                    type="checkbox"
                    defaultChecked
                />
                <label className="form-check-label">
                    Core Module
                </label>
            </div>

            <div className="form-check mb-3">
                <input
                    className="form-check-input"
                    type="checkbox"
                    defaultChecked
                />
                <label className="form-check-label">
                    HR Module
                </label>
            </div>

            <div className="form-check mb-3">
                <input
                    className="form-check-input"
                    type="checkbox"
                    defaultChecked
                />
                <label className="form-check-label">
                    CRM Module
                </label>
            </div>

            <div className="form-check mb-3">
                <input
                    className="form-check-input"
                    type="checkbox"
                />
                <label className="form-check-label">
                    Material Module
                </label>
            </div>

            <div className="form-check mb-4">
                <input
                    className="form-check-input"
                    type="checkbox"
                />
                <label className="form-check-label">
                    Development Module
                </label>
            </div>

            <div>

                <label className="form-label">
                    Number of Users
                </label>

                <select className="form-control">

                    <option>5 Users</option>
                    <option>10 Users</option>
                    <option>20 Users</option>
                    <option>30 Users</option>
                    <option>50 Users</option>
                    <option>100 Users</option>

                </select>

            </div>

        </div>

        {/* Right */}

        <div className="col-lg-5">

            <div className="card">

                <div className="card-header">

                    <strong>
                        Order Summary
                    </strong>

                </div>

                <div className="card-body">

                    <div className="d-flex justify-content-between mb-2">
                        <span>Core Module</span>
                        <span>₹5,000</span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                        <span>HR Module</span>
                        <span>₹5,000</span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                        <span>CRM Module</span>
                        <span>₹5,000</span>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between">
                        <span>Subtotal</span>
                        <strong>₹15,000</strong>
                    </div>

                    <div className="d-flex justify-content-between mt-2">
                        <span>GST (18%)</span>
                        <strong>₹2,700</strong>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between">
                        <h5>Total</h5>
                        <h5 className="text-primary">
                            ₹17,700
                        </h5>
                    </div>

                </div>

            </div>

        </div>

    </div>

</SmallModal>

        </div>

    );

};

export default SubscriptionLicense;