import Lottie from 'lottie-react';
import { useCallback, useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Loading from '../../assets/Loading.json';
import Wrapper from './style';
import XediLoader from '../../components/XediLoader'

import axiosInstance from '../../utilities/axiosInstance';

const Login = ({ appSettings }) => {
    console.log(appSettings);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ userName: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePassword = () => setShowPassword((prev) => !prev);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
                const payload = {
                    userName: formData.userName?.trim(),
                    password: formData.password,
                };

                const response = await axiosInstance.post('/Identity/Login', payload);
                const data = response?.data || {};

                if (!data?.isSuccessful) {
                    throw new Error('Login failed');
                }

                

                const user =
                    data.user ||
                    data.profile ||
                    data.currentUser ||
                    data?.data?.user ||
                    {};
                localStorage.setItem('spendwise_user', JSON.stringify(user));
                localStorage.setItem('userId', user.inpd);
                localStorage.setItem('spendwise_permissions', JSON.stringify(data.permissions || data.roles || []));

                // Normalize role name for routing guards (handle multiple api shapes)
                
              
                const currentUsername = formData.userName?.toLowerCase() || '';

                // Store username for specific role checks
                localStorage.setItem('userName', currentUsername);
               

                 
                // Store userId if available
                const userId = data?.user?.id || data?.userId || user?.id || null;
                if (userId) {
                    localStorage.setItem('spendwise_userId', userId);
                    localStorage.setItem('userId', userId);

                }
               
                // ===== STORE ROLE =====
                const role = data?.user?.roleName || null;

                if (role) {
                    const normalizedRole = role.replace(/\s+/g, '').toLowerCase();
                    localStorage.setItem("spendwise_role", normalizedRole);
                }

                localStorage.setItem('userToken', data?.token);
                // ===== STORE ROLE ID =====
                const roleId = data?.user?.roleId || null;

                // Fetch and cache user permissions
                try {
                    if (roleId) {
                        const permResponse = await axiosInstance.get(`/Identity/RolePermissions?roleId=${roleId}`);
                        const permsData = permResponse?.data || [];

                        // Convert permissions array to object
                        const permissionsObj = {};
                        if (Array.isArray(permsData)) {
                            permsData.forEach(perm => {
                                permissionsObj[perm.name] = perm.isAssigned === true;
                            });
                        } else if (Array.isArray(permsData.value)) {
                            permsData.value.forEach(perm => {
                                permissionsObj[perm.name] = perm.isAssigned === true;
                            });
                        } else if (Array.isArray(permsData.data)) {
                            permsData.data.forEach(perm => {
                                permissionsObj[perm.name] = perm.isAssigned === true;
                            });
                        }

                        // Cache permissions
                        localStorage.setItem('user_permissions', JSON.stringify(permissionsObj));
                    }
                } catch (permError) {
                    // Continue with login even if permissions fetch fails
                } 
                setLoading(false);

                await Swal.fire({
                    icon: 'success',
                    title: 'Login Successful',
                    text: 'Redirecting to Dashboard...',
                    timer: 1400,
                    showConfirmButton: false,
                });
 
                navigate("/admin", { replace: true });
            } catch (error) {
                setLoading(false);

                const message =
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    'Invalid username or password. Please try again.';

                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: message,
                });
            }
        },
        [formData, navigate]
    );

  useEffect(() => {
      document.title = localStorage.getItem("companyName");
   
    }, []);

    useEffect(() => {
        const handleEnter = (e) => e.key === 'Enter' && handleSubmit(e);
        window.addEventListener('keydown', handleEnter);
        return () => window.removeEventListener('keydown', handleEnter);
    }, [handleSubmit]);

    return (
        <Wrapper>
        {loading && (
          <div className="loading-overlay">
            <div className="loading-container">
              {/* <Lottie animationData={Loading} loop autoplay /> */}
              <XediLoader/>
            </div>
          </div>
        )}
      
        <div className="container-fluid login-container">
          <div className="row">
      
            {/* LEFT SIDE */}
            <div className="col-lg-6 d-none d-lg-flex login-hero text-center"  >
                <div className="text-center mb-4">
                
             
                <h1>Admin Panel</h1>
               
              </div>
            </div>
      
            {/* RIGHT SIDE */}
            <div className="col-lg-6 login-right">
              <div className="login-box">
      
                <div className="text-center mb-4">
                  <img
                    src={appSettings?.logoUrl}
                    alt={appSettings?.companyName}
                    style={{ maxWidth: "160px" }}
                  />
                </div>
      
                <h2 className="mb-2">Welcome Back!</h2>
                <p className="text-muted mb-4">
                  Login to continue managing your operations.
                </p>
      
                <form onSubmit={handleSubmit}>
      
                  <div className="mb-3 input-group">
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      placeholder="Username"
                      className="form-control"
                      required
                    />
                  </div>
      
                  <div className="mb-3 input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className="form-control"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={togglePassword}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
      
                  <button
                    type="submit"
                    className="primary-btn login-btn"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login Now"}
                  </button>
      
                </form>
      
                {/* <div className="text-center mt-3">
                    <div className="d-flex justify-content-center">
                        <p className='m-0'>Forget Password </p>
                        <button
                    type="button"
                    className="forget-btn-link"
                    onClick={() => navigate("/resetpassword")}
                  >
                    Click here
                  </button>
                    </div>
                  
                </div> */}
      
              </div>
            </div>
      
          </div>
        </div>
      </Wrapper>
    );
};

export default Login;
