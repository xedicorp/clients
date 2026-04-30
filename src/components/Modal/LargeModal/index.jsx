import React from "react";
import ModalWrapper from "./style";
import { FiX } from "react-icons/fi";

const LargeModal = ({ title, children, show, actions,onClose }) => {
    if (!show) return null;

    return (
        <ModalWrapper>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
                    {/* ---------- HEADER ---------- */}
                    
                        <div className="modal-header">
                            {title && (<h3 className="modal-title">{title}</h3> )}
                            <button className="modal-close-btn" onClick={onClose}>
                                <FiX size={20} />
                            </button>
                        </div>
                   

                    <div className="">{children}</div>

                    {/* ---------- FOOTER ---------- */}
                    {actions && (
                        <div className="modal-actions">
                            <div className="action-buttons">{actions}</div>
                        </div>
                    )}
                </div>
            </div>
        </ModalWrapper>
    );
};

export default LargeModal;
