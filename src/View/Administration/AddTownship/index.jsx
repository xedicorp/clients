import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_ENDPOINTS from "../../../utilities/apiConfig";
import axiosInstance from "../../../utilities/axiosInstance";
import Swal from "sweetalert2";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function LocationPicker({ setLatitude, setLongitude, initialPosition }) {
  const [position, setPosition] = useState(initialPosition || null);

  useEffect(() => {
    if (initialPosition) setPosition(initialPosition);
  }, [initialPosition]);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setLatitude(lat);
      setLongitude(lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function TownshipForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // edit হলে id থাকবে

  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);

  const [townships, setTownships] = useState([]);
  const [bankList, setBankList] = useState([]);
  // form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [reraNo, setReraNo] = useState("");
  const [collectionAccount, setCollectionAccount] = useState({
  bankName: "",
  ifscCode: "",
  accountNumber: "",
  accountName: ""
});

const [reraAccount, setReraAccount] = useState({
  bankName: "",
  ifscCode: "",
  accountNumber: "",
  accountName: ""
});

const [transactionAccount, setTransactionAccount] = useState({
  bankName: "",
  ifscCode: "",
  accountNumber: "",
  accountName: ""
});

useEffect(() => {
  const fetchBanks = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.BANK_LIST);

      const raw = response?.data;
      console.log("Bank List response:", raw);

      const banks = Array.isArray(raw)
        ? raw
        : raw?.value || raw?.data || [];

      setBankList(banks);
    } catch (err) {
      console.error(err);
    }
  };

  fetchBanks();
}, []);
  // 🔹 Fetch all (duplicate check + edit data)
  const fetchTownships = useCallback(async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.TOWNSHIP_LIST);

    let list = res.data?.data || res.data || [];

    const normalized = list.map(t => ({
      id: t.id ?? t.townshipId,
      name: t.name ?? t.townshipName,
      address: t.address ?? t.townshipAddress,
      latitude: t.latitude,
      longitude: t.longitude,
      rerAno: t.rerAno ?? t.reraNo,
      // Collection
  collection_BankName: t.collection_BankName,
  collection_IFSCCode: t.collection_IFSCCode,
  collection_AccountNumber: t.collection_AccountNumber,
  collection_AccountName: t.collection_AccountName,

  // RERA
  rerA_BankName: t.rerA_BankName,
  rerA_IFSCCode: t.rerA_IFSCCode,
  rerA_AccountNumber: t.rerA_AccountNumber,
  rerA_AccountName: t.rerA_AccountName,

  // Transaction
  transaction_BankName: t.transaction_BankName,
  transaction_IFSCCode: t.transaction_IFSCCode,
  transaction_AccountNumber: t.transaction_AccountNumber,
  transaction_AccountName: t.transaction_AccountName
    }));

    setTownships(normalized);

    // 🔹 Edit mode → fill data
    if (isEditMode) {
      const found = normalized.find(t => t.id == id);
      if (found) {
        setName(found.name || "");
        setAddress(found.address || "");
        setLatitude(found.latitude || "");
        setLongitude(found.longitude || "");
        setReraNo(found.rerAno || "");

        setCollectionAccount({
    bankName: found.collection_BankName || "",
    ifscCode: found.collection_IFSCCode || "",
    accountNumber: found.collection_AccountNumber || "",
    accountName: found.collection_AccountName || ""
  });

  setReraAccount({
    bankName: found.rerA_BankName || "",
    ifscCode: found.rerA_IFSCCode || "",
    accountNumber: found.rerA_AccountNumber || "",
    accountName: found.rerA_AccountName || ""
  });

  setTransactionAccount({
    bankName: found.transaction_BankName || "",
    ifscCode: found.transaction_IFSCCode || "",
    accountNumber: found.transaction_AccountNumber || "",
    accountName: found.transaction_AccountName || ""
  });
      }
    }
  }, [id, isEditMode]);

  useEffect(() => {
    fetchTownships();
  }, [fetchTownships]);

  // 🔥 Save
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return Swal.fire("Error", "Enter name", "error");
    if (!address.trim()) return Swal.fire("Error", "Enter address", "error");
    if (!latitude || !longitude)
      return Swal.fire("Error", "Select location", "error");

    if (
      townships.some(
        (t) =>
          t.name.toLowerCase() === name.toLowerCase() &&
          t.id != id
      )
    ) {
      return Swal.fire("Error", "Name exists", "error");
    }

    setLoading(true);

    try {
      const payload = {
        id: isEditMode ? Number(id) : 0,
        name: name.trim(),
        address: address.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        rerAno: reraNo,
        //  Collection
  collection_BankName: collectionAccount.bankName,
  collection_IFSCCode: collectionAccount.ifscCode,
  collection_AccountNumber: collectionAccount.accountNumber,
  collection_AccountName: collectionAccount.accountName,

  //  RERA
  rerA_BankName: reraAccount.bankName,
  rerA_IFSCCode: reraAccount.ifscCode,
  rerA_AccountNumber: reraAccount.accountNumber,
  rerA_AccountName: reraAccount.accountName,

  //  Transaction
  transaction_BankName: transactionAccount.bankName,
  transaction_IFSCCode: transactionAccount.ifscCode,
  transaction_AccountNumber: transactionAccount.accountNumber,
  transaction_AccountName: transactionAccount.accountName,
      };

      await axiosInstance.post(API_ENDPOINTS.TOWNSHIP_SAVE, payload);

      Swal.fire(
        "Success",
        isEditMode ? "Updated!" : "Added!",
        "success"
      );

      navigate("/property/township-list"); // back to list
    } catch (err) {
      Swal.fire("Error", "Save failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">

  {/* Header */}
  <div className="dashboard-header">
    <div>
        <h1 className="dashboard-title">
      {isEditMode ? "Edit Township" : "Add Township"}
    </h1>
    <p className="dashboard-subtitle">
      {isEditMode ? "Edit existing township details" : "Add a new township"}
    </p>
    </div>
    
    <div className="dashboard-header-actions">
        <button className="primary-btn" onClick={() => navigate(-1)}>
          Back
        </button>
    </div>
  </div>

  <div className="card">
    <form onSubmit={handleSubmit}>
      <div className="row">

        {/* Name */}
        <div className="col-md-6">
          <div className="form-group">
            <label>Township Name *</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* RERA */}
        <div className="col-md-6">
          <div className="form-group">
            <label>RERA No</label>
            <input
              className="form-control"
              value={reraNo}
              onChange={(e) => setReraNo(e.target.value)}
            />
          </div>
        </div>

        {/* Address */}
        <div className="col-md-12">
          <div className="form-group">
            <label>Address *</label>
            <input
              className="form-control"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        {/* Lat Long */}
        <div className="col-md-6">
          <div className="form-group">
            <label>Latitude</label>
            <input
              className="form-control"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group">
            <label>Longitude</label>
            <input
              className="form-control"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
        </div>

        {/* Map */}
        <div className="col-md-12">
          <div className="form-group">
            <label>Select Location</label>
            <MapContainer
              center={[26.9124, 75.7873]}
              zoom={10}
              style={{ height: "300px" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker
                setLatitude={setLatitude}
                setLongitude={setLongitude}
                initialPosition={
                  latitude && longitude
                    ? [parseFloat(latitude), parseFloat(longitude)]
                    : null
                }
              />
            </MapContainer>
          </div>
        </div>

        {/* ========================= */}
        {/* 🔥 BANK SECTIONS START */}
        {/* ========================= */}

        {/* Collection Account */}
        <div className="col-md-12 mt-3">
          <h5 className="section-title">Collection Account</h5>
        </div>

        <div className="col-md-6">
          <div className="form-group">
            <label>Bank Name</label>
            <select
  className="form-control"
  value={collectionAccount.bankName}
  onChange={(e) =>
    setCollectionAccount({
      ...collectionAccount,
      bankName: e.target.value
    })
  }
>
  <option value="">Select Bank</option>

  {bankList.map((bank, index) => (
    <option key={index} value={bank.bankName || bank.name}>
      {bank.bankName || bank.name}
    </option>
  ))}
</select>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group">
            <label>IFSC Code</label>
             <input
            className="form-control"
            value={collectionAccount.ifscCode}
            onChange={(e) =>
              setCollectionAccount({
                ...collectionAccount,
                ifscCode: e.target.value
              })
            }
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group">
            <label>Account Number</label>
             <input
            className="form-control"
            value={collectionAccount.accountNumber}
            onChange={(e) =>
              setCollectionAccount({
                ...collectionAccount,
                accountNumber: e.target.value
              })
            }
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group">
            <label>Account Name</label>
             <input
            className="form-control"
            value={collectionAccount.accountName}
            onChange={(e) =>
              setCollectionAccount({
                ...collectionAccount,
                accountName: e.target.value
              })
            }
            />
          </div>
        </div>


        {/* RERA / Escrow */}
        <div className="col-md-12 mt-4">
          <h5 className="section-title">
            RERA Designated / Escrow Account
          </h5>
        </div>

        <div className="col-md-6"><div className="form-group"><label>Bank Name</label>
         <select
  className="form-control"
  value={reraAccount.bankName}
  onChange={(e) =>
    setReraAccount({
      ...reraAccount,
      bankName: e.target.value
    })
  }
>
  <option value="">Select Bank</option>

  {bankList.map((bank, index) => (
    <option key={index} value={bank.bankName || bank.name}>
      {bank.bankName || bank.name}
    </option>
  ))}
</select></div></div>
        <div className="col-md-6"><div className="form-group"><label>IFSC Code</label><input
            className="form-control"
            value={reraAccount.ifscCode}
            onChange={(e) =>
              setReraAccount({
                ...reraAccount,
                ifscCode: e.target.value
              })
            }
            /></div></div>
        <div className="col-md-6"><div className="form-group"><label>Account Number</label><input
            className="form-control"
            value={reraAccount.accountNumber}
            onChange={(e) =>
              setReraAccount({
                ...reraAccount,
                accountNumber: e.target.value
              })
            }
            /></div></div>
        <div className="col-md-6"><div className="form-group"><label>Account Name</label><input
            className="form-control"
            value={reraAccount.accountName}
            onChange={(e) =>
              setReraAccount({
                ...reraAccount,
                accountName: e.target.value
              })
            }
            /></div></div>


        {/* Transaction */}
        <div className="col-md-12 mt-4">
          <h5 className="section-title">Transaction Account</h5>
        </div>

        <div className="col-md-6"><div className="form-group"><label>Bank Name</label><select
  className="form-control"
  value={transactionAccount.bankName}
  onChange={(e) =>
    setTransactionAccount({
      ...transactionAccount,
      bankName: e.target.value
    })
  }
>
  <option value="">Select Bank</option>

  {bankList.map((bank, index) => (
    <option key={index} value={bank.bankName || bank.name}>
      {bank.bankName || bank.name}
    </option>
  ))}
</select></div></div>
        <div className="col-md-6"><div className="form-group"><label>IFSC Code</label><input
            className="form-control"
            value={transactionAccount.ifscCode}
            onChange={(e) =>
              setTransactionAccount({
                ...transactionAccount,
                ifscCode: e.target.value
              })
            }
            /></div></div>
        <div className="col-md-6"><div className="form-group"><label>Account Number</label><input
            className="form-control"
            value={transactionAccount.accountNumber}
            onChange={(e) =>
              setTransactionAccount({
                ...transactionAccount,
                accountNumber: e.target.value
              })
            }
            /></div></div>
        <div className="col-md-6"><div className="form-group"><label>Account Name</label><input
            className="form-control"
            value={transactionAccount.accountName}
            onChange={(e) =>
              setTransactionAccount({
                ...transactionAccount,
                accountName: e.target.value
              })
            }
            /></div></div>

      </div>

      {/* Buttons */}
      <div className="mt-3 d-flex gap-2 justify-content-end">
        <button
          type="button"
          className="primary-btn"
          onClick={() => navigate("/township")}
        >
          Cancel
        </button>

        <button className="primary-btn" disabled={loading}>
          {loading
            ? isEditMode
              ? "Updating..."
              : "Saving..."
            : isEditMode
            ? "Update"
            : "Save"}
        </button>
      </div>

    </form>
  </div>
</div>
  );
}