import { useNavigate } from 'react-router-dom';
import StyledButton from './style';

const Button = ({
    children,
    variant = 'primary',
    to,
    onClick,
    disabled = false,
    fullWidth = false,
    state = null,
    className = '',
    type = 'button',
}) => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        if (type !== 'submit') {
            e.preventDefault(); 
        }

        if (disabled) return;

        if (to) navigate(to, { state });
        else if (onClick) onClick(e);
    };

    return (
        <StyledButton
            type={type}      
            variant={variant}
            disabled={disabled}
            onClick={handleClick}
            fullWidth={fullWidth}
            className="primary-btn"
        >
            {children}
        </StyledButton>
    );
};

export default Button;
