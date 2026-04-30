import axios from 'axios';
import Swal from 'sweetalert2';

const axiosInstance = axios.create({
    baseURL: "https://adminapi.xedicorporation.com",
   
});
const publicRoutes = ["/login", "/register", "/forgot-password"];
  const pathname = window.location.pathname;
                const isPublicRoute = publicRoutes.some((route) =>
                pathname.startsWith(route)
            );

axiosInstance.interceptors.request.use(
    (config) => {
        config.headers['tenant-host'] = window.location.hostname;
        const token = localStorage.getItem('userToken');

        
                if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
     
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        } else {
            config.headers['Content-Type'] = 'application/json';

        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status || null;
        const pathname = window.location.pathname;
 
        const publicRoutes = ["/login", "/register", "/forgot-password"];
        const isPublicRoute = publicRoutes.some((route) =>
            pathname.startsWith(route)
        );
       
        if(status==400)
        {
          
            await Swal.fire({
                icon: 'error',
                title:  error?.response?.data,
                text: 'Please correct',
                timer: 1400,
                showConfirmButton: false,
            });
                        
        }

        if (status === 401 && !isPublicRoute) {
            if (!window.__SESSION_EXPIRED_SHOWN__) {
                window.__SESSION_EXPIRED_SHOWN__ = true;

                localStorage.clear('userToken');
                localStorage.clear('spendwise_role');
                localstorage.clear('spendwise_permissions');
                await Swal.fire({
                    icon: 'warning',
                    title: 'Session Expired',
                    text: 'Your session has expired. Please log in again.',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                });

                window.__SESSION_EXPIRED_SHOWN__ = false;
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
