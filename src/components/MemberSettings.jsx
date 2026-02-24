import React, { useState } from 'react';

export default function MemberSettings({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message || 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
      }}
    >
      <h3 style={{ marginBottom: 12, fontWeight: 700 }}>ตั้งค่าบัญชี</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
          ชื่อ
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              border: '1px solid #d1d5db',
            }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
          อีเมล
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              border: '1px solid #d1d5db',
            }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
          เบอร์โทร
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              border: '1px solid #d1d5db',
            }}
          />
        </label>

        {error && (
          <p style={{ color: '#dc2626', fontSize: 14 }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              border: 'none',
              background: '#16a34a',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </form>
    </div>
  );
}

