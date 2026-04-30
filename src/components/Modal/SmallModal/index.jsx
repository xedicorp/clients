import { FiX } from "react-icons/fi";
import ModalWrapper from "./style";

const SmallModal = ({
    title,
    children,
    onClose,
    show,
    actions,
    transparentOverlay = false,
    size = "default",
}) => {
    if (!show) return null;

    return (
        <ModalWrapper $transparentOverlay={transparentOverlay} $size={size}> 
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                    <div className="modal-header">
                        {title && <h3>{title}</h3>}
                        <button className="modal-close-btn" onClick={onClose}>
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="">
                        {children}
                    </div>

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

export default SmallModal;
