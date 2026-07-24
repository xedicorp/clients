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
const [currentPlan, setCurrentPlan] = useState(null);
const clientId = localStorage.getItem("tenant_id");
const fetchCurrentSubscription = async () => {
    if (!clientId) return;

    try {
        const response = await axiosInstance.get(
            `${API_ENDPOINTS.CLIENT_GET_BY_ID}/${clientId}`
        );

        setCurrentPlan(response.data);
    } catch (error) {
        console.error(error);

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Unable to load subscription details."
        });
    }
};
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
    fetchCurrentSubscription();
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
{/* 
                       <button
    className="primary-btn"
    onClick={() => setShowUpgradeModal(true)}
>
    <i className="fa fa-arrow-up me-2"></i>
    Upgrade Subscription
</button> */}

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
                <label className="me-2">Edition :</label>
                <span className="booking-info-value">
                    REALe ERP SaaS Edition
                </span>
            </div>

            <div className="booking-info-row">
                <label className="me-2">Company :</label>
                <span className="booking-info-value">
                    {currentPlan?.organizationName || "N/A"}
                </span>
            </div>

            <div className="booking-info-row">
                <label className="me-2">Total Users :</label>
                <span className="booking-info-value">
                    {currentPlan?.userLicenses?.[0]?.maxUserLimit || 0}
                </span>
            </div>

            <div className="booking-info-row">
                <label className="me-2">Start Date : </label>
                <span className="booking-info-value">
                    {
currentPlan?.userLicenses?.[0]?.startDate
    ? new Date(
        currentPlan.userLicenses[0].startDate
      ).toLocaleDateString('en-GB')
    : "N/A"
}
                </span>
            </div>

            <div className="booking-info-row">
                <label className="me-2">Renewal :</label>
                <span className="booking-info-value">
                    {
currentPlan?.userLicenses?.[0]?.endDate
    ? new Date(
        currentPlan.userLicenses[0].endDate
      ).toLocaleDateString('en-GB')
    : "N/A"
}
                </span>
            </div>

            <div className="booking-info-row">
                <label className="me-2">Status : </label>
                <span className="booking-info-value">
                    <span
                      className={`booking-status-badge ${
    currentPlan?.userLicenses?.[0]?.isActive === "Y"
        ? "status-confirmed"
        : "status-cancelled"
}`}
                    >
                        {currentPlan?.userLicenses?.[0]?.isActive === "Y"
    ? "Active"
    : "Inactive"}
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
                    {
currentPlan?.tenantModules?.length > 0 ? (
    currentPlan.tenantModules.map((module) => (
        <span
            key={module.id}
            className="booking-status-badge status-workflow-selected"
        >
            {module.moduleName}
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

                {/* <th className="text-center">Action</th> */}

            </tr>

        </thead>

        <tbody>
    {currentPlan?.tenantModules?.map((item, index) => (
        <tr key={item.id}>
            <td>{index + 1}</td>
            <td>
                <strong>{item.moduleName}</strong>
            </td>
            <td>
                {currentPlan?.userLicenses?.[0]?.maxUserLimit || "-"}
            </td>
            <td>Annual</td>

            <td>
                {item.startDate
                    ? new Date(item.startDate).toLocaleDateString('en-GB')
                    : "-"}
            </td>

            <td>
                {item.endDate
                    ? new Date(item.endDate).toLocaleDateString('en-GB')
                    : "-"}
            </td>

            <td>
                <span
                    className={`booking-status-badge ${
                        item.isActive === "Y"
                            ? "status-confirmed"
                            : "status-cancelled"
                    }`}
                >
                    {item.isActive === "Y"
                        ? "Active"
                        : "Inactive"}
                </span>
            </td>

            {/* <td className="text-center">
                <button className="primary-btn">
                    Upgrade
                </button>
            </td> */}
        </tr>
    ))}
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

                <th>Max Users</th>

                <th>Activated On</th>

                <th>Expiry Date</th>
                <th>Status</th>

               

            </tr>

        </thead>

       <tbody>
    {currentPlan?.userLicenses?.length > 0 ? (
        currentPlan.userLicenses.map((license, index) => (
            <tr key={license.id}>
                <td>{index + 1}</td>
                <td>
                    {license.id}
                </td>

                <td>
                    {license.maxUserLimit} Users
                </td>

                <td>
                    {license.startDate
                        ? new Date(license.startDate).toLocaleDateString("en-GB")
                        : "-"}
                </td>

                <td>
                    {license.endDate
                        ? new Date(license.endDate).toLocaleDateString("en-GB")
                        : "-"}
                </td>

                <td>
                    <span
                        className={`booking-status-badge ${
                            license.isActive === "Y" ||
                            license.isActive === true
                                ? "status-confirmed"
                                : "status-cancelled"
                        }`}
                    >
                        {license.isActive === "Y" ||
                        license.isActive === true
                            ? "Active"
                            : "Inactive"}
                    </span>
                </td>

               
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan={6} className="text-center py-4">
                No License Found
            </td>
        </tr>
    )}
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