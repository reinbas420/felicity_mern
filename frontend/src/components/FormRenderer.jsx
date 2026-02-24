import React, { useState } from 'react';
import { NeonInput, NeonButton } from './ui/NeonComponents';

const FormRenderer = ({ fields = [], onSubmit, onCancel, submitting = false }) => {
    const [responses, setResponses] = useState(() => {
        const init = {};
        fields.forEach(f => {
            if (f.fieldType === 'checkbox') init[f.fieldId] = [];
            else init[f.fieldId] = '';
        });
        return init;
    });
    const [errors, setErrors] = useState({});

    const updateResponse = (fieldId, value) => {
        setResponses(prev => ({ ...prev, [fieldId]: value }));
        if (errors[fieldId]) setErrors(prev => ({ ...prev, [fieldId]: null }));
    };

    const toggleCheckbox = (fieldId, option) => {
        setResponses(prev => {
            const current = prev[fieldId] || [];
            return { ...prev, [fieldId]: current.includes(option) ? current.filter(o => o !== option) : [...current, option] };
        });
        if (errors[fieldId]) setErrors(prev => ({ ...prev, [fieldId]: null }));
    };

    const validate = () => {
        const errs = {};
        fields.forEach(f => {
            if (f.required) {
                const val = responses[f.fieldId];
                if (val === '' || val === null || val === undefined || (Array.isArray(val) && val.length === 0)) {
                    errs[f.fieldId] = `"${f.label}" is required`;
                }
            }
            // Phone validation
            if (f.fieldType === 'phone' && responses[f.fieldId]) {
                const digits = responses[f.fieldId].replace(/\D/g, '');
                if (digits.length !== 10) {
                    errs[f.fieldId] = 'Must be exactly 10 digits';
                }
            }
            // Email validation
            if (f.fieldType === 'email' && responses[f.fieldId]) {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responses[f.fieldId])) {
                    errs[f.fieldId] = 'Invalid email format';
                }
            }
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        const formResponses = fields.map(f => ({
            fieldId: f.fieldId,
            value: f.fieldType === 'phone' && responses[f.fieldId]
                ? `+91${responses[f.fieldId].replace(/\D/g, '')}`
                : responses[f.fieldId],
        }));
        onSubmit(formResponses);
    };

    const sortedFields = [...fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const inputStyle = { fontSize: '0.85rem' };
    const labelStyle = { fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.2rem', display: 'block' };
    const errorStyle = { fontSize: '0.72rem', color: 'var(--neon-magenta)', margin: '0.2rem 0 0 0' };

    return (
        <div style={{ padding: '1rem', border: '1px solid var(--neon-cyan)', borderRadius: '14px', background: 'rgba(0,243,255,0.03)' }}>
            <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', background: 'linear-gradient(135deg, #00f3ff, #da00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Registration Form
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {sortedFields.map(field => (
                    <div key={field.fieldId}>
                        <label style={labelStyle}>
                            {field.label}
                            {field.required && <span style={{ color: 'var(--neon-magenta)', marginLeft: '0.2rem' }}>*</span>}
                        </label>

                        {/* Text */}
                        {field.fieldType === 'text' && (
                            <NeonInput
                                placeholder={field.placeholder || ''}
                                value={responses[field.fieldId] || ''}
                                onChange={e => updateResponse(field.fieldId, e.target.value)}
                                style={inputStyle}
                            />
                        )}

                        {/* Textarea */}
                        {field.fieldType === 'textarea' && (
                            <textarea
                                placeholder={field.placeholder || ''}
                                value={responses[field.fieldId] || ''}
                                onChange={e => updateResponse(field.fieldId, e.target.value)}
                                rows={3}
                                style={{
                                    width: '100%', padding: '0.5rem 0.7rem', borderRadius: '10px',
                                    border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)',
                                    color: 'var(--text-color)', fontSize: '0.85rem', resize: 'vertical',
                                    fontFamily: 'inherit', boxSizing: 'border-box',
                                }}
                            />
                        )}

                        {/* Number */}
                        {field.fieldType === 'number' && (
                            <NeonInput
                                type="number"
                                placeholder={field.placeholder || ''}
                                value={responses[field.fieldId] || ''}
                                onChange={e => updateResponse(field.fieldId, e.target.value)}
                                style={inputStyle}
                            />
                        )}

                        {/* Date */}
                        {field.fieldType === 'date' && (
                            <NeonInput
                                type="date"
                                value={responses[field.fieldId] || ''}
                                onChange={e => updateResponse(field.fieldId, e.target.value)}
                                style={inputStyle}
                            />
                        )}

                        {/* Email */}
                        {field.fieldType === 'email' && (
                            <NeonInput
                                type="email"
                                placeholder={field.placeholder || 'email@example.com'}
                                value={responses[field.fieldId] || ''}
                                onChange={e => updateResponse(field.fieldId, e.target.value)}
                                style={inputStyle}
                            />
                        )}

                        {/* Phone */}
                        {field.fieldType === 'phone' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                <span style={{ padding: '0.5rem 0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRight: 'none', borderRadius: '10px 0 0 10px', color: 'var(--text-dim)', fontSize: '0.82rem' }}>+91</span>
                                <NeonInput
                                    placeholder={field.placeholder || '10-digit number'}
                                    value={responses[field.fieldId] || ''}
                                    onChange={e => updateResponse(field.fieldId, e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    maxLength={10}
                                    style={{ ...inputStyle, borderRadius: '0 10px 10px 0', flex: 1 }}
                                />
                            </div>
                        )}

                        {/* Dropdown */}
                        {field.fieldType === 'dropdown' && (
                            <select
                                value={responses[field.fieldId] || ''}
                                onChange={e => updateResponse(field.fieldId, e.target.value)}
                                style={{
                                    width: '100%', padding: '0.5rem 0.7rem', borderRadius: '10px',
                                    border: '1px solid var(--border-color)', background: 'var(--bg-color)',
                                    color: 'var(--text-color)', fontSize: '0.85rem',
                                }}
                            >
                                <option value="">{field.placeholder || 'Select...'}</option>
                                {(field.options || []).map((opt, i) => (
                                    <option key={i} value={opt}>{opt}</option>
                                ))}
                            </select>
                        )}

                        {/* Checkbox */}
                        {field.fieldType === 'checkbox' && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.2rem' }}>
                                {(field.options || []).map((opt, i) => (
                                    <label key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer',
                                        fontSize: '0.82rem', color: (responses[field.fieldId] || []).includes(opt) ? 'var(--neon-cyan)' : 'var(--text-dim)',
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={(responses[field.fieldId] || []).includes(opt)}
                                            onChange={() => toggleCheckbox(field.fieldId, opt)}
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* File */}
                        {field.fieldType === 'file' && (
                            <input
                                type="file"
                                onChange={e => updateResponse(field.fieldId, e.target.files?.[0]?.name || '')}
                                style={{ fontSize: '0.82rem', color: 'var(--text-color)' }}
                            />
                        )}

                        {errors[field.fieldId] && <p style={errorStyle}>{errors[field.fieldId]}</p>}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                {onCancel && (
                    <NeonButton onClick={onCancel} style={{ fontSize: '0.82rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
                        Cancel
                    </NeonButton>
                )}
                <NeonButton onClick={handleSubmit} disabled={submitting} style={{ fontSize: '0.82rem' }}>
                    {submitting ? 'Submitting...' : 'Submit & Register'}
                </NeonButton>
            </div>
        </div>
    );
};

export default FormRenderer;
