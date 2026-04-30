import { useEffect, useMemo, useState } from 'react';
 
import axiosInstance from '../../utilities/axiosInstance';
import API_ENDPOINTS from '../../utilities/apiConfig';
 import LargeModal from '../../components/NewComponent/Modal/LargeModal';
 import he from 'he';
 import { indent } from 'indent.js'; 
import { useNavigate, useParams } from 'react-router-dom';  
import Swal from 'sweetalert2';
 
const ManageEmailTemplate = () => {
  
    const {id } = useParams();
    const [loading, setLoading] = useState(false);  
    const [template, setTemplate] = useState({});
    const [editedTemplate, setEditedTemplate] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const navigate = useNavigate(); 
    
    const handleSave = async () => {
    try {
        setLoading(true);

        const htmlContent = he.decode(
            document.getElementById("html").innerHTML
        );

        const payload = {
            id: id ? parseInt(id) : 0,
            name: template?.name || "",
            templateHtml: htmlContent
        };

        const response = await axiosInstance.post(
            API_ENDPOINTS.SAVE_TEMPLATES,
            payload
        );

        if (response?.data) {
            await Swal.fire({
                icon: 'success',
                title: 'Saved!',
                text: 'Template saved successfully.',
                confirmButtonColor: '#3085d6'
            });
        }

    } catch (error) {
        console.error("Save error:", error);

        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong while saving!',
            confirmButtonColor: '#d33'
        });

    } finally {
        setLoading(false);
    }
};
    const showPreview=()=>{
      setEditedTemplate(he.decode((document.getElementById("html").innerHTML)));
      setShowCancelModal(true);
    }
    useEffect(() => {

         const loadTemplate = async () => {
            try {
                const response = await axiosInstance.get(
                    API_ENDPOINTS.GET_TEMPLATE+"?id="+ id
                ).then((res) => {   
                     // const formattedHTML1 = indent.html(res?.data?.templateHtml, { tab_size: 2 });                
                      const formattedHTML =  res.data.templateHtml;
                    setTemplate(res.data); 
                    }); 
            } catch (error) {
                console.error('Error fetching status data:', error);
            }
        };  
        loadTemplate();

    }, []);



   
    return (
       <div className="dashboard-container">
            <div className="dashboard-header">
                <div >
                    <h2 className="dashboard-title">Manage Template</h2>
                    <p className="dashboard-subtitle">
                       Mangage  {template?.name}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginLeft: "auto" }}>
                    
                    <button className="primary-btn" onClick={() => navigate(-1)}>
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
                
                   <div id="editor" style={{minHeight:"400px"}}>
                  
                   
                     <div contentEditable={true}   id="html">{template.templateHtml  }</div>

                </div>
                    
                     <div className="booking-form-actions">
                                         <button
                                                   type="button"
                                                   className="primary-btn"
                                                   onClick={showPreview}
                                               >
                                                 
                                                   <span>Preview </span>
                                               </button>
                                        
                                               <button
                                                type="button"
                                                className="primary-btn"
                                                onClick={handleSave}
                                                disabled={loading}
                                              >
                                                <span>{loading ? "Saving..." : "Save"}</span>
                                              </button>
                                        
                   
                                           
                                       </div>
            </div>

              <LargeModal
                  show={showCancelModal}
                  size="small"
                  transparentOverlay={false}
                  onClose={() => {
                     
                      setShowCancelModal(false);
                    
                    
                  }}
                  title="Preview"
                >
                  <div className="simple-cancel-modal">
                 
                    <div>
                     
                    
                    </div>
                      <div dangerouslySetInnerHTML={{ __html: editedTemplate }} />  

          
                    {/* Buttons inside popup */}
                    <div
                      className="simple-cancel-actions"
                      style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'flex-end',
                        marginTop: '20px',
                        paddingTop: '15px',
                        borderTop: '1px solid #eee',
                      }}
                    >
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => {
                         
                            setShowCancelModal(false);
                            
                           
                        }}
                        
                       
                      >
                        Close
                      </button>
                     
                    </div>
                  </div>
                </LargeModal>
            
        </div> 
    );
};

export default ManageEmailTemplate;
