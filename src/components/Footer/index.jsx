// components/Footer.jsx
import React from 'react';
import Wrapper from './style';

const Footer = ({ appSettings }) => {
    console.log('Footer - appSettings:', appSettings);
    return (
        <Wrapper>
            <footer className="footer-container">
                <div className="footer-left">
                    © {new Date().getFullYear()} {appSettings?.companyName}
                </div>

                <div className="footer-center">
                    {/* Links removed */}
                </div>

                <div className="footer-right">
                    Developed by :{" "}
                    <a
                        href="https://xedicorporation.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: "black",
                            textDecoration: "underline",
                            fontSize: "16px"
                        }}
                    >
                        XEDI Corporation
                    </a>
                </div>
            </footer>

        </Wrapper>
    );
};

export default Footer;
