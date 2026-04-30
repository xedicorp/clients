import React from 'react';
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
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (disabled) return;
        if (to) navigate(to, { state });
        else if (onClick) onClick();
    };

    return (
        <StyledButton
            variant={variant}
            disabled={disabled}
            onClick={handleClick}
            fullWidth={fullWidth}
            className='primary-btn'
        >
            {children}
        </StyledButton>
    );
};

export default Button;


