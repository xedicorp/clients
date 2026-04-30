import React from 'react';
import { SliderWrapper } from './style';

const Slider = ({ title, children, onClose }) => {
    return (
        <SliderWrapper className="slider">
            <div className="slider-header">
                <h2>{title}</h2>
                {onClose && (
                    <button
                        type="button"
                        className="slider-close"
                        onClick={onClose}
                        aria-label="Close slider"
                    >
                        ×
                    </button>
                )}
            </div>
            
            <div className="slider-content">
                {children}
            </div>
        </SliderWrapper>
    );
};

export default Slider;
