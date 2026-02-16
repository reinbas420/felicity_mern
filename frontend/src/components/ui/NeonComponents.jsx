import React from 'react';

export const NeonButton = ({ children, onClick, secondary, type = "button", style }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`neon-button ${secondary ? 'secondary' : ''}`}
            style={style}
        >
            {children}
        </button>
    );
};

export const NeonCard = ({ children, title, style, variant = 'default' }) => {
    return (
        <div className={`card ${variant === 'pure-black' ? 'bg-pure-black' : ''}`} style={style}>
            {title && <h2 style={{
                color: 'var(--neon-magenta)',
                marginTop: 0,
                textShadow: '0 0 5px var(--neon-magenta)'
            }}>{title}</h2>}
            {children}
        </div>
    );
};

export const NeonInput = ({ type, placeholder, value, onChange, name, required }) => {
    return (
        <input
            className="neon-input"
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            required={required}
            style={{ marginBottom: '1rem' }}
        />
    );
};
