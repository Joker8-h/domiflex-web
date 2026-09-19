import React from 'react';

const WaveDivider = ({ color = "#ffffff", flip = false }) => {
    return (
        <div style={{ 
            lineHeight: 0, 
            width: '100%', 
            overflow: 'hidden', 
            transform: flip ? 'rotate(180deg)' : 'none',
            backgroundColor: 'transparent'
        }}>
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ 
                position: 'relative', 
                display: 'block', 
                width: '100%', 
                height: '80px' 
            }}>
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
                      fill={color}
                ></path>
            </svg>
        </div>
    );
};

export default WaveDivider;
