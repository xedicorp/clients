import ModalWrapper from './style';
import { IoClose } from "react-icons/io5";

const SmallModal = ({ title, children, onClose, show, actions, hideClose = false }) => {
    if (!show) return null;

    return (
        <ModalWrapper>
            <div className="modal-overlay">
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        {title && (
                            <h3 className="modal-title">{title}</h3>
                        )}
                        {!hideClose && (
                            <button className="modal-close-btn" onClick={onClose}>
                                <IoClose size={22} />
                            </button>
                        )}
                    </div>
                    <div className="">{children}</div>
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


export default SmallModal;
