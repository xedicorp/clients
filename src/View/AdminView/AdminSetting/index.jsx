/* eslint-disable no-unused-vars */
import { Sun, Moon } from "lucide-react";
import { useContext } from "react";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Wrapper } from "./style";
import { ThemeContext } from "../../../Context/Theme";

const AdminSettingsPage = () => {
    const { theme, setTheme } = useContext(ThemeContext);
    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    return (
        <Wrapper>
            <div className="settings-page">
                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your account and preferences</p>
                </div>

                {/* Settings Grid */}
                <div className="settings-grid">
                    {/* Appearance Card */}
                    <div className="settings-card appearance-card">
                        <div className="card-header">
                            <div className="card-icon appearance">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="5"></circle>
                                    <line x1="12" y1="1" x2="12" y2="3"></line>
                                    <line x1="12" y1="21" x2="12" y2="23"></line>
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                    <line x1="1" y1="12" x2="3" y2="12"></line>
                                    <line x1="21" y1="12" x2="23" y2="12"></line>
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                </svg>
                            </div>
                            <div>
                                <h3 className="card-title">Appearance</h3>
                                <p className="card-description">Customize your theme preference</p>
                            </div>
                        </div>

                        <div className="theme-toggle-container">
                            <button className="theme-toggle-btn" onClick={toggleTheme}>
                                <div className="theme-option">
                                    {theme === "dark" ? (
                                        <>
                                            <Sun size={24} />
                                            <span>Switch to Light Mode</span>
                                        </>
                                    ) : (
                                        <>
                                            <Moon size={24} />
                                            <span>Switch to Dark Mode</span>
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={2500} theme="dark" limit={3} />
        </Wrapper>
    );
};

export default AdminSettingsPage;
