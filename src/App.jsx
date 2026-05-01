// App.jsx (modified: added select-workflow route)
import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import './App.css';
import PermissionProtected from "./components/PermissionProtected";
import { GlobalStyle } from "./globalTheme";
import Layout from "./Layout";
import './styles/common-buttons.css';
import AuthService from "./utilities/auth";
import { initializeUserPermissions } from "./utilities/menuPermissions";
import StorageMigration from "./utilities/storageMigration";
import AdminDashboard from "./View/AdminView/AdminDashboard";
 
import RolePermissions from "./View/AdminView/RolePermissions";
import UserList from "./View/AdminView/UserList";
import AdminViewContainer from "./View/AdminView/ViewContainer";

import axiosInstance from "./utilities/axiosInstance";
import Login from "./View/Login/index";
  
 
 
  
 
  
import TicketList from "./View/Support/TicketList"; 
import CreateTicket from "./View/Support/CreateTicket"; 
import TicketDetails from "./View/Support/ViewTicket";
import 'quill/dist/quill.snow.css';
import BackupRestore from "./View/Administration/BackupRestore";
const isAuthenticated = () => {
    return AuthService.isAuthenticated();
};
const getRole = () => {
    return AuthService.getRole();
};
const getDefaultPathForRole = (role) => {    
    return '/admin';
};

const PrivateRoute = () => {
 

    return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

const PublicRoute = () => {
    return !isAuthenticated() ? <Outlet /> : <Navigate to="/" />;
}; 

const RoleProtected = ({ allowedRoles }) => {
    if (!isAuthenticated()) return <Navigate to="/login" />;

    const role = getRole();
    const username = (localStorage.getItem('userName') || '').toLowerCase();

    // Special debug logging for ITAdmin
    if (username === 'itadmin') {

    }

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

function App() {
    const [appSettings, setAppSettings] = useState(null);
    useEffect(() => {
        try {
            StorageMigration.runMigrationIfNeeded();
        } catch (error) { }

        if (AuthService.isAuthenticated()) {
            try {
                initializeUserPermissions();
            } catch (error) { }
        }

        // 🔥 ADD THIS PART
        const getLogo = async () => {
            try {
                const res = await axiosInstance.get('/Master/AppSettings');
                debugger;
                setAppSettings(res.data?.[0]);
                localStorage.setItem('logoUrl', res.data?.[0].logoUrl);
                localStorage.setItem('logo2Url', res.data?.[0].logo2Url);
                localStorage.setItem('companyName', res.data?.[0].companyName);

            } catch (error) {
                console.error('Error fetching logo:', error);
            }
        };
        getLogo();
    }, []);


    return (
        <>
            <GlobalStyle />
            <Router>
                <Routes>

                    <Route element={<PublicRoute />}>
                        <Route path="/login" element={<Login appSettings={appSettings} />} />
                    </Route>
                    <Route element={<PrivateRoute />}>
                       
                            <Route path="/" element={<Layout appSettings={appSettings} />}>
                               

                                    <Route path="admin" element={<AdminDashboard />} />
                                    
                                    <Route path="admin-container" element={<AdminViewContainer />} />
                                    <Route path="admin-user-list" element={<UserList />} />
                                    <Route path="role-permissions" element={<RolePermissions />} />
                                     
                                   
                                {/* permission */} 
                                        
                                                                   
                                
                                     
                                      <Route path="support/ticket-list" element={<TicketList />} />
                                        <Route path="support/create-ticket" element={<CreateTicket />} />
                                        <Route path="support/view-ticket/:id" element={<TicketDetails />} />
                            </Route>
                         
                    </Route>

                    <Route
                        path="*"
                        element={
                            isAuthenticated()
                                ? <Navigate to="/" />
                                : <Navigate to="/login" />
                        }
                    />

                </Routes>
            </Router>
        </>
    );
}

export default App;
