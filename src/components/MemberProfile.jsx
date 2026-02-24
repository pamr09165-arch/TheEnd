import React from 'react';

export default function MemberProfile({ user, onOpenSettings }) {
  if (!user) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        background: '#ffffff',
        boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
        border: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '9999px',
          background: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
        }}
      >
        {user.name?.[0]?.toUpperCase?.() || 'U'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>{user.name || user.username || 'ผู้ใช้'}</div>
        <div style={{ color: '#6b7280', fontSize: 14 }}>{user.email}</div>
        {user.phone && (
          <div style={{ color: '#4b5563', fontSize: 14, marginTop: 4 }}>โทร: {user.phone}</div>
        )}
      </div>
      <button
        type="button"
        onClick={onOpenSettings}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: 9999,
          border: 'none',
          background: '#3b82f6',
          color: 'white',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        แก้ไขโปรไฟล์
      </button>
    </div>
  );
}

