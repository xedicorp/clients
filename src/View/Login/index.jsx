import Lottie from 'lottie-react';
import { useCallback, useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Loading from '../../assets/Loading.json';
import Wrapper from './style';
import XediLoader from '../../components/XediLoader';
import { FaHeadset } from "react-icons/fa";

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
                    slug:"clients"
                };

                const response = await axiosInstance.post('/Identity/SupportLogin', payload);
                const data = response?.data || {};

                if (!data?.isSuccessful) {
                    throw new Error('Login failed');
                }
 
                const detail = data.detail ||{};
                   
                     localStorage.setItem('tenant_id', detail.id);
                 
                const currentUsername = detail.supportUserId?.toLowerCase() || '';

                // Store username for specific role checks
                localStorage.setItem('userName', currentUsername);
                 
                localStorage.setItem('userToken', data?.token);
                // ===== STORE ROLE ID =====
                const roleId = data?.user?.roleId || null;

               
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
 <div>
        {loading && (
          <div className="loading-overlay">
            <div className="loading-container">
              {/* <Lottie animationData={Loading} loop autoplay /> */}
              <XediLoader/>
            </div>
          </div>
        )}
        <div className='page-wrapper'>
          <div className="dc-signin theme-two">
    <div className="signin-wrapper">

        {/* LEFT SIDE */}
        <div className="intro-box">
            <div className="intro-content style-dark">

                <img
                    src="/src/assets/img/support.png"
                    className="logo"
                    alt={appSettings?.companyName}
                />

                <div className="heading-wrapper">
                    <h2 className="h1">
                        Welcome to <span>REALe Support Portal</span>
                    </h2>
                </div>

                <div className="text-wrapper">
                    <p>
                        Welcome to the REALe Support Portal. Create and manage support tickets, track issue resolution, and communicate directly with our support team.
                    </p>
                </div>

                <div className="btn-wrapper">
                    <button
    type="button"
    className="primary-btn"
    onClick={() => window.open("https://realeerp.com/", "_blank")}
>
    Discover More
</button>
                </div>

            </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="form-box">

            <div className="text-center mb-4">
                <img
                    src={appSettings?.logoUrl}
                    alt={appSettings?.companyName}
                    style={{ maxWidth: "140px" }}
                />
            </div>

            <div className="text-center mb-4">
                <h3>Sign In</h3>
                <p className="text-muted">
                    Enter your credentials to continue
                </p>
            </div>

            <form onSubmit={handleSubmit}>

                <div className="form-group mb-3">
                    <input
                        type="text"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter Username"
                        required
                    />
                </div>

                <div
                    className="form-group mb-3 position-relative"
                >
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter Password"
                        required
                    />

                    <button
                        type="button"
                        className="toggle-password"
                        onClick={togglePassword}
                    >
                        {showPassword ? (
                            <FaEyeSlash />
                        ) : (
                            <FaEye />
                        )}
                    </button>
                </div>

                <div className="form-group">
                    <button
                        type="submit"
                        className="primary-btn login-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing In..."
                            : "Sign In"}
                    </button>
                </div>

            </form>

        </div>

    </div>
</div>
        </div>
        
      </div>
);
};

export default Login;
