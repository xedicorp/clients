import React, { useState, useRef, useEffect } from "react";
import Wrapper from "./style";

const ToggleSlider = ({ value, onChange, disabled = false }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const ref = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (ref.current && showTooltip) {
            const rect = ref.current.getBoundingClientRect();
            ref.current.style.setProperty("--tooltip-top", `${rect.top}px`);
            ref.current.style.setProperty("--tooltip-left", `${rect.left + rect.width / 2}px`);
        }
    }, [showTooltip]);

    const handleClick = () => {
        if (disabled) return;

        onChange(!value);
        setShowTooltip(true);

        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setShowTooltip(false);
        }, 1500);
    };

    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

    return (
        <Wrapper
            ref={ref}
            className={`${value ? "active" : ""} ${disabled ? "disabled" : ""}`}
            onClick={handleClick}
        >

            <div className="toggle-circle" />
            {showTooltip && !disabled && (
                <span className="tooltip">
                    {value ? "Enabled" : "Disabled"}
                </span>
            )}

        </Wrapper>
    );
};

export default ToggleSlider;
