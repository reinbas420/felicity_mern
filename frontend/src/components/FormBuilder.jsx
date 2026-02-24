import React, { useState } from 'react';
import { NeonButton, NeonInput } from './ui/NeonComponents';

const FIELD_TYPES = [
    { value: 'text', label: 'Short Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'number', label: 'Number' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'file', label: 'File Upload' },
    { value: 'date', label: 'Date' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
];

let fieldCounter = 0;
const genId = () => `field_${Date.now()}_${++fieldCounter}`;

const FormBuilder = ({ fields = [], formLocked = false, onSave }) => {
    const [formFields, setFormFields] = useState(
        fields.length > 0 ? fields.map((f, i) => ({ ...f, order: f.order ?? i })) : []
    );
    const [saving, setSaving] = useState(false);

    const addField = (type) => {
        setFormFields([...formFields, {
            fieldId: genId(),
            label: '',
            fieldType: type,
            required: false,
            options: type === 'dropdown' || type === 'checkbox' ? [''] : [],
            placeholder: '',
            order: formFields.length,
        }]);
    };

    const updateField = (idx, key, value) => {
        const updated = [...formFields];
        updated[idx] = { ...updated[idx], [key]: value };
        setFormFields(updated);
    };

    const removeField = (idx) => {
        setFormFields(formFields.filter((_, i) => i !== idx).map((f, i) => ({ ...f, order: i })));
    };

    const moveField = (idx, dir) => {
        const newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= formFields.length) return;
        const updated = [...formFields];
        [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
        setFormFields(updated.map((f, i) => ({ ...f, order: i })));
    };

    const updateOption = (fieldIdx, optIdx, value) => {
        const updated = [...formFields];
        const opts = [...updated[fieldIdx].options];
        opts[optIdx] = value;
        updated[fieldIdx] = { ...updated[fieldIdx], options: opts };
        setFormFields(updated);
    };

    const addOption = (fieldIdx) => {
        const updated = [...formFields];
        updated[fieldIdx] = { ...updated[fieldIdx], options: [...updated[fieldIdx].options, ''] };
        setFormFields(updated);
    };

    const removeOption = (fieldIdx, optIdx) => {
        const updated = [...formFields];
        updated[fieldIdx] = { ...updated[fieldIdx], options: updated[fieldIdx].options.filter((_, i) => i !== optIdx) };
        setFormFields(updated);
    };

    const handleSave = async () => {
        // Validate: all fields must have labels
        for (const f of formFields) {
            if (!f.label.trim()) {
                alert('All fields must have a label');
                return;
            }
            if ((f.fieldType === 'dropdown' || f.fieldType === 'checkbox') && f.options.filter(o => o.trim()).length === 0) {
                alert(`Field "${f.label}" needs at least one option`);
                return;
            }
        }
        setSaving(true);
        try {
            // Clean options: remove empty strings
            const cleaned = formFields.map(f => ({
                ...f,
                options: f.options ? f.options.filter(o => o.trim()) : [],
            }));
            await onSave(cleaned);
        } catch (err) {
            alert(err.message || 'Failed to save form');
        }
        setSaving(false);
    };

    const fieldTypeIcon = (type) => {
        const icons = { text: 'Aa', textarea: '¶', number: '#', dropdown: '▾', checkbox: '☑', file: '📎', date: '📅', email: '@', phone: '📞' };
        return icons[type] || '?';
    };

    return (
        <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, background: 'linear-gradient(135deg, #00f3ff, #da00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Custom Registration Form
                </h4>
                {formLocked && (
                    <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', fontWeight: '600' }}>
                        🔒 Locked
                    </span>
                )}
            </div>

            {formLocked && (
                <p style={{ fontSize: '0.8rem', color: '#f59e0b', margin: '0 0 1rem 0', padding: '0.5rem', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    Form is locked — registrations have already started. Form fields cannot be modified.
                </p>
            )}

            {/* Field list */}
            {formFields.length === 0 && !formLocked && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1.5rem 0' }}>
                    No fields yet. Add fields using the buttons below.
                </p>
            )}

            {formFields.map((field, idx) => (
                <div key={field.fieldId} style={{
                    padding: '0.8rem', marginBottom: '0.6rem', borderRadius: '12px',
                    border: '1px solid var(--border-color)', background: 'rgba(0,243,255,0.02)',
                    opacity: formLocked ? 0.7 : 1,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.85rem', width: '1.5rem', textAlign: 'center' }}>{fieldTypeIcon(field.fieldType)}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{FIELD_TYPES.find(t => t.value === field.fieldType)?.label || field.fieldType}</span>
                        </div>
                        {!formLocked && (
                            <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                                <button type="button" onClick={() => moveField(idx, -1)} disabled={idx === 0}
                                    style={{ background: 'none', border: 'none', color: idx > 0 ? 'var(--neon-cyan)' : 'var(--text-dim)', cursor: idx > 0 ? 'pointer' : 'default', fontSize: '0.9rem', padding: '0.1rem' }}>↑</button>
                                <button type="button" onClick={() => moveField(idx, 1)} disabled={idx === formFields.length - 1}
                                    style={{ background: 'none', border: 'none', color: idx < formFields.length - 1 ? 'var(--neon-cyan)' : 'var(--text-dim)', cursor: idx < formFields.length - 1 ? 'pointer' : 'default', fontSize: '0.9rem', padding: '0.1rem' }}>↓</button>
                                <button type="button" onClick={() => removeField(idx)}
                                    style={{ background: 'none', border: 'none', color: 'var(--neon-magenta)', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', padding: '0.1rem 0.3rem' }}>×</button>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <NeonInput
                            placeholder="Field Label *"
                            value={field.label}
                            onChange={e => updateField(idx, 'label', e.target.value)}
                            disabled={formLocked}
                            style={{ fontSize: '0.85rem' }}
                        />
                        <NeonInput
                            placeholder="Placeholder text"
                            value={field.placeholder}
                            onChange={e => updateField(idx, 'placeholder', e.target.value)}
                            disabled={formLocked}
                            style={{ fontSize: '0.8rem' }}
                        />

                        {/* Options for dropdown/checkbox */}
                        {(field.fieldType === 'dropdown' || field.fieldType === 'checkbox') && (
                            <div style={{ paddingLeft: '0.5rem', borderLeft: '2px solid var(--border-color)' }}>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', margin: '0 0 0.3rem 0' }}>Options:</p>
                                {field.options.map((opt, optIdx) => (
                                    <div key={optIdx} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem', alignItems: 'center' }}>
                                        <NeonInput
                                            placeholder={`Option ${optIdx + 1}`}
                                            value={opt}
                                            onChange={e => updateOption(idx, optIdx, e.target.value)}
                                            disabled={formLocked}
                                            style={{ fontSize: '0.8rem', flex: 1 }}
                                        />
                                        {!formLocked && (
                                            <button type="button" onClick={() => removeOption(idx, optIdx)}
                                                style={{ background: 'none', border: 'none', color: 'var(--neon-magenta)', cursor: 'pointer', fontSize: '0.85rem' }}>×</button>
                                        )}
                                    </div>
                                ))}
                                {!formLocked && (
                                    <button type="button" onClick={() => addOption(idx)}
                                        style={{ background: 'none', border: '1px dashed var(--border-color)', color: 'var(--neon-cyan)', cursor: 'pointer', fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '6px', marginTop: '0.2rem' }}>
                                        + Add Option
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Required toggle */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: formLocked ? 'default' : 'pointer', fontSize: '0.8rem', color: field.required ? 'var(--neon-cyan)' : 'var(--text-dim)' }}>
                            <input
                                type="checkbox"
                                checked={field.required}
                                onChange={e => updateField(idx, 'required', e.target.checked)}
                                disabled={formLocked}
                            />
                            Required
                        </label>
                    </div>
                </div>
            ))}

            {/* Add field buttons */}
            {!formLocked && (
                <div style={{ marginTop: '0.8rem' }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>Add field:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {FIELD_TYPES.map(ft => (
                            <button key={ft.value} type="button" onClick={() => addField(ft.value)} style={{
                                padding: '0.3rem 0.6rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '600',
                                background: 'rgba(0,243,255,0.08)', border: '1px solid var(--border-color)',
                                color: 'var(--neon-cyan)', cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}>
                                {fieldTypeIcon(ft.value)} {ft.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Save button */}
            {!formLocked && (
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <NeonButton onClick={handleSave} disabled={saving} style={{ fontSize: '0.82rem' }}>
                        {saving ? 'Saving...' : '💾 Save Form'}
                    </NeonButton>
                </div>
            )}
        </div>
    );
};

export default FormBuilder;
