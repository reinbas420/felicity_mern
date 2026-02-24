import React from 'react';

export const NeonButton = ({ children, onClick, secondary, type = "button", style, disabled, ...rest }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`neon-button ${secondary ? 'secondary' : ''}`}
            style={style}
            {...rest}
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

export const NeonInput = ({ type, placeholder, value, onChange, name, required, style, disabled, onFocus, min, max, ...rest }) => {
    return (
        <input
            className="neon-input"
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            required={required}
            disabled={disabled}
            onFocus={onFocus}
            min={min}
            max={max}
            style={{ marginBottom: '0.6rem', ...style }}
            {...rest}
        />
    );
};
