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

const BackupRestore = () => {
  const [associateList, setAssociateList] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  
 const [selected, setSelected] = useState('Option1'); // Default value
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

 const handleChange = (e) => {
    setSelected(e.target.value);
  };

  return (
    <div className='dashboard-container'>
      <div className="dashboard-header">
        <div className="dashboard-content">
          <h1 className="dashboard-title">Backup & Restore</h1>
          <p className="dashboard-subtitle">Manage database backup and restore.</p>
        </div>
        <div className="dashboard-header-actions">
           
        </div>
      </div> 
        <div className="card">
          <div className='row'>

          <div className='col-lg-6'>
             <label for="rbtBackup" className='control-label'>Back up</label> 
             <input id="rbtBackup" type="radio"
               value="Option1" 
            checked={selected === 'Option1'} 
            onChange={handleChange} 
             name="backupRestore"     />
          </div>
           <div className='col-lg-6'>
             <label for="rbtRestore" className='control-label'>Restore</label> 
             <input id="rbtRestore" type="radio"   
              value="Option2" 
          checked={selected === 'Option2'} 
          onChange={handleChange} 
             name="backupRestore"    />
          </div></div> 
        </div> 
         {selected === 'Option1' &&    (  
        
        <div className="card">
            <div className='row'>
              <div className='col-lg-6'>              
                <input className="primary-btn" type="button" value="Create &amp; Download Backup" name="backupRestore"/>
              </div>
             </div> 
        </div>    )}
     {selected === 'Option2' && (    
        <div className="card">
          <div className='row'>       
            <div className='col-lg-6'>              
              <input  type="file"   className='form-control'  />
            </div>
            <div className='col-lg-6'>              
             <input  type="button" value="Restore" className="primary-btn" />
            </div>
          </div> 
        </div> 
     )}
    </div >
  );
}

export default BackupRestore;
