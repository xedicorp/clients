import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utilities/axiosInstance";
import API_ENDPOINTS, { API_BASE_URL } from "../../utilities/apiConfig";
import Swal from "sweetalert2";

const TicketDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState([]);
const [remark, setRemark] = useState("");
const [file, setFile] = useState(null);
const [sending, setSending] = useState(false);
const [receiptPreview, setReceiptPreview] = useState(null);
const [screenshot, setscreenshot] = useState(null);

const isPdf = (fileOrUrl) => {
  if (!fileOrUrl) return false;
  return fileOrUrl.type === "application/pdf";
};

  // ✅ Fetch Ticket Info
  const fetchTicket = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `${API_ENDPOINTS.SUPPORT_TICKET_BY_ID}?id=${id}`
      );

      setTicket(res.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to load ticket",
        text:
          error?.response?.data?.message ||
          "Something went wrong while fetching ticket.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchTicket();
  fetchConversation();
}, [id]);



  // ✅ Screenshot URL
  const getScreenshotUrl = () => {
    if (!ticket?.screenshot) return null;
    return `${API_BASE_URL}/Uploads/Support/${ticket.screenshot}`;
  };
  const fetchConversation = async () => {
  try {
    const res = await axiosInstance.get(
      `/Support/GetTicketDetails?supportTicketId=${id}`
    );

    setConversation(res.data);
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Failed to load conversation",
      text:
        error?.response?.data?.message ||
        "Something went wrong",
    });
  }
};

const getAttachmentUrl = (path) => {
  if (!path) return null;
  return `${API_BASE_URL}/Uploads/Support/${path}`;
};

const handleSend = async () => {
  if (!remark.trim() && !file) return;

  try {
    setSending(true);

    const formData = new FormData();
    formData.append("SupportTicketId", id);
    formData.append("Message", remark);
    formData.append("ClientId", 0); // 🔁 replace with real clientId if available

    if (file) {
      formData.append("Attachment", file);
    }

    await axiosInstance.post(
      "/Support/SaveTicketDetail",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    

    setRemark("");
    setFile(null);

    // 🔁 Refresh conversation
    fetchConversation();

  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Failed to send",
      text:
        error?.response?.data?.message ||
        "Something went wrong",
    });
  } finally {
    setSending(false);
  }
};
    useEffect(() => {
        return () => {
            if (receiptPreview?.startsWith?.("blob:")) {
                URL.revokeObjectURL(receiptPreview);
            }
        };
    }, [receiptPreview]);
  if (loading) return <div className="loading-container"><p>Loading...</p></div>;
  if (!ticket) return <div className="loading-container">No ticket found</div>;

  return (
    <div className="dashboard-container">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Ticket Details</h1>
          <p className="dashboard-subtitle">
            View full ticket details and chat history
          </p>
        </div>

        <div className="dashboard-header-actions">
<button className="primary-btn" onClick={() => navigate(-1)}>
          Back
        </button>
        </div>

        
      </div>

      {/* ================= CARD 1 ================= */}
       <div className="card">
        <h3 className="dashboard-table-title mb-3">Ticket Info</h3>

        <div className="row">

          <div className="col-lg-4">
            <div className="d-flex gap-2 align-items-center">
              <label>Subject:</label>
              <span>{ticket.subject}</span>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="d-flex gap-2 align-items-center">
              <label>Status:</label>
              <span>{ticket.statusText}</span>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="d-flex gap-2 align-items-center">
              <label>Created:</label>
              <span>
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="col-lg-6 mt-3">
            <div className="d-flex gap-2 align-items-center">
              <label>Message:</label>
              <span>{ticket.message}</span>
            </div>
          </div>

          {/* ✅ Screenshot (Conditional) */}
          {ticket.screenshot && (
            <div className="col-lg-6 mt-3 ">
              <div className="d-flex gap-2 align-items-center">
                <label>Screenshot:</label>
                <span  onClick={() =>
                    window.open(getScreenshotUrl(), "_blank")
                  } style={{ cursor: "pointer", color: "blue" }}>
                  {ticket.screenshot}
                </span>

              </div>
            </div>
          )}
        </div>
      </div>
      {/* ================= CARD 3 ================= */}
      <div className="card">
        <div className="row">
          <div className="col-lg-6 col-md-12 mb-3">
            <div className="form-group">
                 <label htmlFor="remarks">
                                    Message
                                </label>
                                <textarea
                                    id="remarks"
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    placeholder="Type your message here"
                                    rows="4"
                                    className='form-control'
                                    style={{height:"240px"}}
                                />
            </div>
                               
                            </div>
                            <div className="col-lg-6 col-md-12  mb-3">
                                <div className="form-group">
                                    <label>
                                   Attachment (optional)
                                </label>
                                <div className="file-item-wrapper">
                                    <label className="upload-box">
                                        <span className="upload-text">Click to Upload</span>

                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => {
  const selectedFile = e.target.files[0];
  if (!selectedFile) return;

  setFile(selectedFile);

  const previewUrl = URL.createObjectURL(selectedFile);
  setReceiptPreview(previewUrl);
}}
                                            className='form-control'
                                        />
                                    </label>


                                  <div className="file-preview-box">
  {receiptPreview ? (
    isPdf(file) ? (
      <div className="pdf-preview-box">
        <button
          className="pdf-preview-btn"
          onClick={(e) => {
            e.preventDefault();
            window.open(receiptPreview, "_blank");
          }}
        >
          Preview PDF
        </button>
      </div>
    ) : (
      <img
        src={receiptPreview}
        alt="preview"
        className="preview-image"
      />
    )
  ) : (
    <div className="empty-preview">No file selected</div>
  )}
</div>
                                </div>
                                </div>
                                
                            </div>
                            <div className="col-12 ">
                               <button
        className="primary-btn ms-auto"
        onClick={handleSend}
        disabled={sending}
      >
        {sending ? "Sending..." : "Send"}
      </button>
                            </div>
        </div>
  
</div>

      {/* ================= CARD 2 (CHAT UI) ================= */}
      <div className="card">
  <h3 className="dashboard-table-title">Chat History</h3>

  <div className="chat-container">
    {conversation.length === 0 && <p>No messages yet</p>}

    {conversation.map((msg) => {
      const isClient = msg.clientId !== null;

      return (
        <div
          key={msg.id}
          className={`chat-row ${isClient ? "right" : "left"}`}
        >
          <div className="chat-bubble">
            <p>{msg.message}</p>

            {/* ✅ Attachment */}
            {msg.attachmentPath && (
              <img
                src={getAttachmentUrl(msg.attachmentPath)}
                alt="attachment"
                style={{
                  width: "120px",
                  marginTop: "8px",
                  cursor: "pointer",
                  borderRadius: "6px",
                }}
                onClick={() =>
                  window.open(
                    getAttachmentUrl(msg.attachmentPath),
                    "_blank"
                  )
                }
              />
            )}

            <span>
              {new Date(msg.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      );
    })}
  </div>
</div>

      
       
    </div>
  );
};

export default TicketDetails;