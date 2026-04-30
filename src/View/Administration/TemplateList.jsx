import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
 
import axiosInstance from '../../utilities/axiosInstance';
import API_ENDPOINTS from '../../utilities/apiConfig';
 
 
import SmallModal from '../../components/NewComponent/Modal/SmallModal';
import Button from '../../components/NewComponent/Button';
import { HiPencilSquare } from "react-icons/hi2";
import Swal from "sweetalert2";

const TemplateList = () => {
  const [associateList, setAssociateList] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
   

  const navigate = useNavigate(); 

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.GET_TEMPLATES, {
        timeout: 10000
      });

       setTemplateList(response?.data); 
    } catch (error) {
      toast.error('Failed to load associate list');
      
    } finally {
      setLoading(false);
    }
  }, []); 
 
  useEffect(() => {
    fetchTemplates();
  }, [ ]);



  return (
    <div className='dashboard-container'>
      <div className="dashboard-header">
        <div className="dashboard-content">
          <h1 className="dashboard-title">Template List</h1>
          <p className="dashboard-subtitle">View and manage templates</p>
        </div>
        <div className="dashboard-header-actions">
           
        </div>
      </div> 
        <div className="card">
            <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Id#</th>
             
                <th>Name</th>
                
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templateList.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    No templates found
                  </td>
                 
                </tr>
              ) : (
                templateList.map((associate) => (
                  <tr key={associate.id}>
                    <td>{associate.id}</td>
                   
                    <td>{associate.name || '-'}</td>
                    
                    <td className='actions'>
                      <div className="d-flex gap-2">
                          <button
                        className="primary-btn"
                        onClick={() => handleDelete(associate.id, associate.firstName)}
                        disabled={deleteLoading === associate.id}
                        title="Delete Associate"
                      >
                        {deleteLoading === associate.id ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="spinner">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        )}
                      </button>
                      <button
                        className="primary-btn"
                        onClick={() => navigate(`/administration/template/${associate.id}`)}
                        title="Edit Associate"
                      >
                       <HiPencilSquare size={22}/>
                      </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div> 
    </div >
  );
}

export default TemplateList;
