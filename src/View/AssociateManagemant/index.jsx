import { useState, useEffect } from 'react'
import Wrapper from './style'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utilities/axiosInstance';
import API_ENDPOINTS from '../../utilities/apiConfig';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

const DOCUMENT_TYPES = [
  { key: "PhotoFile", label: "Photo Upload", accept: "image/*,application/pdf" },
  { key: "ReraCertificateFile", label: "RERA Certificate Upload", accept: "image/*,application/pdf" },
  { key: "BankDocumentFile", label: "Bank Passbook / Cheque Upload", accept: "image/*,application/pdf" },
  { key: "PassportFile", label: "Passport Upload (Optional)", accept: "image/*,application/pdf" },
];

const AssociateManagement = () => {
  const navigate = useNavigate();
  const ALLOWED_FILE_REGEX = /\.(jpg|jpeg|png|pdf)$/i;
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 5MB
  const [associateList, setAssociateList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bankList, setBankList] = useState([]);
 const [associateForm, setAssociateForm] = useState({
  FullName: '',
  DOB: '',
  AnniversaryDate: '',
  ContactNo: '',
  PANNo: '',
  AadhaarNo: '',
  reraNo: '',
  LeaderName: '',
  LeaderContactNo: '',
  PassportNo: '',

  // NEW
  Address: '',
  City: '',
  State: '',
  PinCode: '',
  AccountNumber: '',
  AccountName: '',
  BankName: '',
  BankIFSC: '',

  ReraCertificateFile: null,
  PassportFile: null,
  PhotoFile: null,
  BankDocumentFile: null,
});
  const [errors, setErrors] = useState({});

  const [previews, setPreviews] = useState({
    PassportFile: null,
    BankDocumentFile: null,
    PhotoFile: null,
    ReraCertificateFile: null,
  });
  

  // fetch banks
  const fetchBanks = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.BANK_LIST);

      const raw = response?.data;

      const banks = Array.isArray(raw)
        ? raw
        : raw?.value || raw?.data || [];

      setBankList(banks);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const validateForm = () => {
  const newErrors = {};

  if (!associateForm.FullName.trim()) {
    newErrors.FullName = "Full Name is required";
  }

  if (!associateForm.ContactNo.trim()) {
    newErrors.ContactNo = "Contact Number is required";
  }

  if (!associateForm.reraNo.trim()) {
    newErrors.reraNo = "RERA Number is required";
  }

  if (!associateForm.LeaderName.trim()) {
    newErrors.LeaderName = "Leader Name is required";
  }

  if (!associateForm.LeaderContactNo.trim()) {
    newErrors.LeaderContactNo = "Leader Contact Number is required";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

  // Fetch associates on component mount
  const fetchAssociates = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.ASSOCIATE_LIST, {
        timeout: 10000
      });

      const raw = response?.data;
      const listData = Array.isArray(raw)
        ? raw
        : raw?.value || raw?.data || [];

      setAssociateList(listData);
    } catch (error) {
      toast.error('Failed to load associate list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssociates();
  }, []);

  const isPdf = (previewUrl, docType) => {
    if (!previewUrl) return false;
    const file = associateForm?.[docType];
    if (previewUrl.startsWith("blob:")) {
      return file instanceof File && file.type === "application/pdf";
    }
    return previewUrl.toLowerCase().endsWith(".pdf");
  };




  const handleFileChange = (type, fileList) => {
    const file = fileList?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_REGEX.test(file.name)) {
      alert("Only JPG, JPEG, PNG or PDF files allowed");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("File must be less than 5MB");
      return;
    }

   

setErrors((prev) => ({
  ...prev,
  [name]: "",
}));
 setAssociateForm(prev => ({
    ...prev,
    [type]: file
  }));
    // Save preview
    setPreviews(prev => {
      const next = { ...prev };

      if (next[type]?.startsWith("blob:")) {
        URL.revokeObjectURL(next[type]);
      }

      next[type] = URL.createObjectURL(file);
      return next;
    });
  };

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url?.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);




  const handleChange = (e) => {
  const { name, value } = e.target;
  let updatedValue = value;

  switch (name) {
    case "FullName":
    case "LeaderName":
      updatedValue = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 50);
      break;

    case "ContactNo":
    case "LeaderContactNo":
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
      break;

    case "AadhaarNo":
      updatedValue = value.replace(/\D/g, "").slice(0, 12);
      break;

    case "PANNo":
      updatedValue = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
      break;

    case "PassportNo":
      updatedValue = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 9);
      break;

    default:
      break;
  }

  // ✅ update form
  setAssociateForm((prev) => ({
    ...prev,
    [name]: updatedValue,
  }));

  // ✅ CLEAR ERROR when user types
  setErrors((prev) => ({
    ...prev,
    [name]: "",
  }));
};

  const handleAddAssociate = async () => {
    if (!validateForm()) return;
    try {

      const requiredFields = [
        { key: "FullName", label: "Full Name" },
        // { key: "DOB", label: "Date of Birth" },
        { key: "ContactNo", label: "Mobile Number" },
        // { key: "PANNo", label: "PAN Number" },
        // { key: "AadhaarNo", label: "Aadhaar Number" },
        { key: "reraNo", label: "RERA Number" },
        { key: "LeaderName", label: "Leader Name" },
        { key: "LeaderContactNo", label: "Leader Contact Number" },
        // { key: "PhotoFile", label: "Photo Upload" },
        // { key: "ReraCertificateFile", label: "RERA Certificate" },
        // { key: "BankDocumentFile", label: "Bank Document" },

      ];

      // for (let field of requiredFields) {
      //   const value = associateForm[field.key];
      //   if (value instanceof File === false && typeof value !== "string") {
      //     if (!value) {
      //       alert(`Please fill ${field.label}`);
      //       return;
      //     }
      //   }
      //   if (typeof value === "string" && value.trim() === "") {
      //     alert(`Please fill ${field.label}`);
      //     return;
      //   }
      // }

      const formData = new FormData();

      formData.append('FirstName', associateForm.FullName);
      formData.append('DOB', associateForm.DOB);
      formData.append('AnniversaryDate', associateForm.AnniversaryDate);
      formData.append('ContactNo', associateForm.ContactNo);
      formData.append('PANNo', associateForm.PANNo);
      formData.append('AadhaarNo', associateForm.AadhaarNo);
      formData.append('ReraNo', associateForm.reraNo);
      formData.append('PassportNo', associateForm.PassportNo);
      formData.append('LeaderName', associateForm.LeaderName);
      formData.append('LeaderContactNo', associateForm.LeaderContactNo);
      formData.append('Address', associateForm.Address);
      formData.append('City', associateForm.City);
      formData.append('State', associateForm.State);
      formData.append('PinCode', associateForm.PinCode);
      formData.append('AccountNumber', associateForm.AccountNumber);
      formData.append('AccountName', associateForm.AccountName);
      formData.append('BankName', associateForm.BankName);
      formData.append('BankIFSC', associateForm.BankIFSC);

      if (associateForm.ReraCertificateFile) {
        formData.append('ReraCertificateFile', associateForm.ReraCertificateFile);
      }

      if (associateForm.PassportFile) {
        formData.append('PassportFile', associateForm.PassportFile);
      }

      if (associateForm.PhotoFile) {
        formData.append('PhotoFile', associateForm.PhotoFile);
      }

      if (associateForm.BankDocumentFile) {
        formData.append('BankDocumentFile', associateForm.BankDocumentFile);
      }

      await axiosInstance.post(API_ENDPOINTS.ASSOCIATE_CREATE, formData);

     // toast.success('Associate created successfully');
         await Swal.fire({
                    icon: 'success',
                    title: 'Associate Created Successfully',
                    text: 'Redirecting to List ...',
                    timer: 1400,
                    showConfirmButton: false,
                });
                  navigate("/associate-list", { replace: true });
      // setAssociateForm({
      //   FullName: '',
      //   DOB: '',
      //   AnniversaryDate: '',
      //   ContactNo: '',
      //   PANNo: '',
      //   AadhaarNo: '',
      //   reraNo: '',
      //   PassportNo: '',
      //   LeaderName: '',
      //   LeaderContactNo: '',
      //   ReraCertificateFile: null,
      //   PassportFile: null,
      //   PhotoFile: null,
      //   BankDocumentFile: null,
      // });

      setPreviews({
        ReraCertificateFile: null,
        PassportFile: null,
        PhotoFile: null,
        BankDocumentFile: null,
      });

      // Refresh the associate list
      fetchAssociates();

    } catch (error) {
      const msg =
    error?.response?.data?.message ||
    error?.response?.data ||
    "Something went wrong";

  Swal.fire({
    icon: "error",
    title: "Failed to Save",
    text: msg
  });
    }
  };



  return (
    <Wrapper className='dashboard-container'>
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div><h1 className='dashboard-title'>Associate Management</h1>
            <p className="dashboard-subtitle">
              Here you can manage your Associates
            </p></div>

        </div>
        <div className="dashboard-header-actions">
          <button
            className="primary-btn"
            onClick={() => navigate('/associate-list')}
          >
             <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="20"
                height="20"
            >
                <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>   
        </div>
      </div>
      <div className="card">
  <div className="row">

    {/* Row 1 */}
    <div className="col-md-4">
      <div className="form-group">
        <label>Full Name <span className="required">*</span></label>
        <input
          type="text"
          name="FullName"
          value={associateForm.FullName}
          onChange={handleChange}
          className="form-control"
        />
        {errors.FullName && <div className="error-text">{errors.FullName}</div>}
      </div>
    </div>

    <div className="col-md-4">
      <div className="form-group">
        <label>Contact No <span className="required">*</span></label>
        <input
          type="text"
          name="ContactNo"
          value={associateForm.ContactNo}
          onChange={handleChange}
          className="form-control"
        />
        {errors.ContactNo && <div className="error-text">{errors.ContactNo}</div>}
      </div>
    </div>

    <div className="col-md-4">
      <div className="form-group">
        <label>RERA No <span className="required">*</span></label>
        <input
          type="text"
          name="reraNo"
          value={associateForm.reraNo}
          onChange={handleChange}
          className="form-control"
        />
        {errors.reraNo && <div className="error-text">{errors.reraNo}</div>}
      </div>
    </div>

    {/* Row 2 */}
    <div className="col-md-4">
      <div className="form-group">
        <label>Leader Name <span className="required">*</span></label>
        <input
          type="text"
          name="LeaderName"
          value={associateForm.LeaderName}
          onChange={handleChange}
          className="form-control"
        />
        {errors.LeaderName && <div className="error-text">{errors.LeaderName}</div>}
      </div>
    </div>

    <div className="col-md-4">
      <div className="form-group">
        <label>Leader Contact No <span className="required">*</span></label>
        <input
          type="text"
          name="LeaderContactNo"
          value={associateForm.LeaderContactNo}
          onChange={handleChange}
          className="form-control"
        />
        {errors.LeaderContactNo && <div className="error-text">{errors.LeaderContactNo}</div>}
      </div>
    </div>

    <div className="col-md-4">
      <div className="form-group">
        <label>Address</label>
        <input
  type="text"
  name="Address"
  value={associateForm.Address}
  onChange={handleChange}
  className="form-control"
/>
      </div>
    </div>

    {/* Row 3 */}
    <div className="col-md-4">
      <div className="form-group">
        <label>City</label>
        <input
  type="text"
  name="City"
  value={associateForm.City}
  onChange={handleChange}
  className="form-control"
/>
      </div>
    </div>

    <div className="col-md-4">
      <div className="form-group">
        <label>State</label>
        <input
  type="text"
  name="State"
  value={associateForm.State}
  onChange={handleChange}
  className="form-control"
/>
      </div>
    </div>

    <div className="col-md-4">
      <div className="form-group">
        <label>PIN Code</label>
        <input
  type="text"
  name="PinCode"
  value={associateForm.PinCode}
  onChange={handleChange}
  className="form-control"
/>
      </div>
    </div>

    {/* Row 4 */}
    <div className="col-md-4">
      <div className="form-group">
        <label>PAN No</label>
        <input
          type="text"
          name="PANNo"
          value={associateForm.PANNo}
          onChange={handleChange}
          className="form-control"
        />
      </div>
    </div>

    <div className="col-md-4">
      <div className="form-group">
        <label>Aadhaar No</label>
        <input
          type="text"
          name="AadhaarNo"
          value={associateForm.AadhaarNo}
          onChange={handleChange}
          className="form-control"
        />
      </div>
    </div>

    <div className="col-md-4">
      <div className="form-group">
        <label>Passport No</label>
        <input
          type="text"
          name="PassportNo"
          value={associateForm.PassportNo}
          onChange={handleChange}
          className="form-control"
        />
      </div>
    </div>

    {/* Row 5 */}
    <div className="col-md-4">
      <div className="form-group">
        <label>Bank Name</label>
        {/* <input
          type="text"
          name="BankName"
          value={associateForm.BankName}
          onChange={handleChange}
          className="form-control"
        /> */}
        <select
        name="BankName"
        value={associateForm.BankName}
        onChange={handleChange}
        className="form-control"
      >
        <option value="">Select Bank</option>
        {bankList.map((bank) => (
          <option key={bank.id} value={bank.name}>
            {bank.name}
          </option>
        ))}
      </select>
      </div>
    </div>

    <div className="col-md-4">
      <div className="form-group">
        <label>Account Name</label>
        <input
          type="text"
          name="AccountName"
          value={associateForm.AccountName}
          onChange={handleChange}
          className="form-control"
        />
      </div>
    </div>

    <div className="col-md-4">
      <div className="form-group">
        <label>Account No</label>
        <input
  type="text"
  name="AccountNumber"
  value={associateForm.AccountNumber}
  onChange={handleChange}
  className="form-control"
/>
      </div>
    </div>

    {/* Row 6 */}
    <div className="col-md-4">
      <div className="form-group">
        <label>IFSC No</label>
        <input
          type="text"
          name="IFSCNo"
          value={associateForm.IFSCNo}
          onChange={handleChange}
          className="form-control"
        />
      </div>
    </div>

    <div className="col-md-4">
      <div className="form-group">
        <label>Date of Birth</label>
        <input
          type="date"
          name="DOB"
          value={associateForm.DOB}
          onChange={handleChange}
          className="form-control"
        />
      </div>
    </div>

    <div className="col-md-4">
      <div className="form-group">
        <label>Date of Anniversary</label>
        <input
          type="date"
          name="AnniversaryDate"
          value={associateForm.AnniversaryDate}
          onChange={handleChange}
          className="form-control"
        />
      </div>
    </div>

  </div>
</div>
      <div className="card">
        <div className="row">
          {DOCUMENT_TYPES.map(({ key, label, accept }) => (
            <div className="col-lg-3" key={key}>
              <div className="file-item-wrapper">
                <div className="file-header">
                  <div className="file-title">{label}</div>
                </div>
                <label className="upload-box">
                  <span className="upload-text">Click to Upload</span>
                  <input
                    type="file"
                    accept={accept}
                    onChange={(e) => { handleFileChange(key, e.target.files) }}
                  />
                </label>
                <div className="file-preview-box">
                  {previews[key] ? (
                    isPdf(previews[key], key) ? (
                      <button
                        className="pdf-preview-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(previews[key], "_blank");
                        }}
                      >
                        Preview PDF
                      </button>
                    ) : (
                      <img
                        src={previews[key]}
                        alt={key}
                        className="preview-image"
                      />
                    )
                  ) : (
                    <div className="empty-preview">No file selected</div>
                  )}
                </div>
              </div>
            </div>

          ))}
        </div>

      </div>
      <div className="associate-add-btn">
        <button
          className="primary-btn"
          onClick={handleAddAssociate}
        >
          Save Associate
        </button>
      </div>

     
    </Wrapper>
  )

}

export default AssociateManagement