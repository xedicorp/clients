import React from "react";
import { FiX } from "react-icons/fi";
import ModalWrapper from "./style";

const LargeModal = ({ title, children, onClose, show, actions, hideClose = false, fullscreen = false, }) => {
    if (!show) return null;

    return (
        <ModalWrapper>
            <div className="modal-overlay">
                <div className={`modal-content large-modal ${fullscreen ? 'fullscreen' : ''}`}
                    onClick={(e) => e.stopPropagation()}
                >
                   
                    
                        <div className="modal-header">
                            {title && (<h3 className="modal-title">{title}</h3>)}
                            <button className="modal-close-btn" onClick={onClose}>
                                                        <FiX size={20} />
                                                    </button>
                        </div>
                    

                    <div className="">{children}</div>

                    {/* ---------- FOOTER ---------- */}
                    {actions && (
                        <div className="modal-actions">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </ModalWrapper>
    );
};

export default LargeModal;
