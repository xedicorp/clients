import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS from "../../utilities/apiConfig";
import { FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";

export default function DailyBalanceUpdate() {
  const navigate = useNavigate();

  const [townshipList, setTownshipList] = useState([]);
  const [selectedTownship, setSelectedTownship] = useState("");
   const [townshipBanks, setTownshipBanks] = useState("");
  const [balances, setBalances] = useState({
    collection: "",
    rera: "",
    transaction: ""
  });

  const today = new Date().toISOString().split("T")[0];

  // ✅ Township fetch only
  const fetchTownships = async () => {
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_LIST);

      const data =
        res.data?.value || res.data?.data || res.data || [];

      setTownshipList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTownships();
  }, []);

    const getUserId = () => {
        const stored = localStorage.getItem("userId") || localStorage.getItem("spendwise_userId");
        const parsed = stored ? Number(stored) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      };

  // ✅ handle balance input
  const handleChange = (type, value) => {
    setBalances((prev) => ({
      ...prev,
      [type]: value
    }));
  };

  // ✅ fake submit (demo)
  const handleSubmit = async () => {
    if (!selectedTownship) {
      return Swal.fire("Warning", "Select Township", "warning");
    }

   let payload={
        userId: getUserId(), 
        collection_Bank	:balances.collection,
        rera_Bank	:balances.rera,
        transaction_Bank:balances.transaction,
        townshipId:selectedTownship
    }
      const response = await axiosInstance.post(
            API_ENDPOINTS.ACCOUNT_UPDATE_DAILY_BALANCE,
            payload
        );

        if (response?.data) {


            await Swal.fire({
                icon: 'success',
                title: 'Saved!',
                text: 'Balances updated successfully.',
                confirmButtonColor: '#3085d6'
            });

            balances.collection="0";
            balances.rera="0";
            balances.transaction="0";

            loadBanks();
        }

    
  };

  const loadBanks=async()=>{
      balances.collection="0";
            balances.rera="0";
            balances.transaction="0";
     try {
      const res = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_BANKS+"?id="+selectedTownship);
      const data = res.data ;
      setTownshipBanks(data);
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <div className="dashboard-container">

  {/* HEADER */}
  <div className="dashboard-header">
    <div>
      <h2 className="dashboard-title">Daily Balance Update</h2>
      <p className="dashboard-subtitle">Update daily balances </p>
    </div>

    <button className="primary-btn" onClick={() => navigate(-1)}>
      <FaArrowLeft /> Back
    </button>
  </div>

  {/* MAIN CARD */}
  <div className="card">

    {/* TOP ROW */}
    <div className="row">
      <div className="col-md-6">

             <div className="form-group">
          <label>Select Township</label>
           <div className="d-flex gap-3 align-items-end">
            <select
            className="form-control"
            value={selectedTownship}
            onChange={(e) => setSelectedTownship(e.target.value)}
          >
            <option value="">Select</option>
            {townshipList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button onClick={loadBanks} className="primary-btn" style={{ width: "170px" }}>Load Banks</button>
           </div>
          
        </div>
      </div>
      <div className="col-md-6">
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={today}
            disabled
            className="form-control"
          />
        </div>
      </div>
    </div>

    {/* BANK GRID */}
    <div className="bank-grid mt-3">

      {/* COLLECTION */}
      <div className="">
        <h4 className="dashboard-table-title mb-2">Collection Account</h4>

        <div className="row mb-2">
          {/* BANK INFO */}
          <div className="col-lg-4">
            <div className="card equal-height-card">
              <p><b>Bank Name:</b> {townshipBanks.collection_BankName}</p>
              <p><b>IFSC:</b> {townshipBanks.collection_IFSCCode}</p>
              <p><b>Account Number:</b> {townshipBanks.collection_AccountNumber}</p>
              <p><b>Account Name:</b> {townshipBanks.collection_AccountName}</p>
            </div>
          </div>

          {/* PREVIOUS */}
          <div className="col-lg-4">
            <div className="card equal-height-card">
              <h4 className="dashboard-table-title mb-2">Previous Balance</h4>
              <h4><b>Balance:</b> ₹ {townshipBanks.collection_PrevBal}</h4>
            </div>
          </div>

          {/* INPUT */}
          <div className="col-lg-4">
            <div className="card equal-height-card">
              <div className="form-group">
                <label htmlFor="collection">Balance</label>
                <input
                  id="collection"
                  type="number"
                  placeholder="Enter Balance"
                  value={balances.collection}
                  onChange={(e) =>
                    handleChange("collection", e.target.value)
                  }
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RERA */}
      <div className="">
        <h4 className="dashboard-table-title mb-2">RERA / Escrow Account</h4>

        <div className="row mb-2">
          {/* BANK INFO */}
          <div className="col-lg-4">
            <div className="card equal-height-card">
              <p><b>Bank Name:</b> {townshipBanks.rerA_BankName}</p>
              <p><b>IFSC:</b> {townshipBanks.rerA_IFSCCode}</p>
              <p><b>Account Number:</b> {townshipBanks.rerA_AccountNumber}</p>
              <p><b>Account Name:</b> {townshipBanks.rerA_AccountName}</p>
            </div>
          </div>

          {/* PREVIOUS */}
          <div className="col-lg-4">
            <div className="card equal-height-card">
              <h4 className="dashboard-table-title mb-2">Previous Balance</h4>
              <h4><b>Balance:</b> ₹ {townshipBanks.rerA_PrevBal}</h4>
            </div>
          </div>

          {/* INPUT */}
          <div className="col-lg-4">
            <div className="card equal-height-card">
              <div className="form-group">
                <label htmlFor="rera">Balance</label>
                <input
                  id="rera"
                  type="number"
                  placeholder="Enter Balance"
                  value={balances.rera}
                  onChange={(e) =>
                    handleChange("rera", e.target.value)
                  }
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTION */}
      <div className="">
        <h4 className="dashboard-table-title mb-2">Transaction Account</h4>

        <div className="row mb-2">
          {/* BANK INFO */}
          <div className="col-lg-4">
            <div className="card equal-height-card">
              <p><b>Bank Name:</b> {townshipBanks.transaction_BankName}</p>
              <p><b>IFSC:</b> {townshipBanks.transaction_IFSCCode}</p>
              <p><b>Account Number:</b> {townshipBanks.transaction_AccountNumber}</p>
              <p><b>Account Name:</b> {townshipBanks.transaction_AccountName}</p>
            </div>
          </div>

          {/* PREVIOUS */}
          <div className="col-lg-4">
            <div className="card equal-height-card">
              <h4 className="dashboard-table-title mb-2">Previous Balance</h4>
              <h4><b>Balance:</b> ₹ { townshipBanks.transaction_PrevBal}</h4>
            </div>
          </div>

          {/* INPUT */}
          <div className="col-lg-4">
            <div className="card equal-height-card">
              <div className="form-group">
                <label htmlFor="transaction">Balance</label>
                <input
                  id="transaction"
                  type="number"
                  placeholder="Enter Balance"
                  value={balances.transaction}
                  onChange={(e) =>
                    handleChange("transaction", e.target.value)
                  }
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    {/* SUBMIT */}
    <div className="mt-3 ms-auto">
      <button className="primary-btn" onClick={handleSubmit}>
        Submit
      </button>
    </div>

  </div>
</div>
  );
}