import React from 'react';

export default function BookingListTitle({ title }) {
  return (
    <h2
      style={{
        fontSize: 20,
        fontWeight: 700,
        color: '#111827',
        padding: '0.5rem 1rem',
        borderRadius: 9999,
        background: 'linear-gradient(90deg, #fee2e2, #ffedd5)',
        border: '1px solid #fecaca',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span role="img" aria-hidden="true">
        📋
      </span>
      <span>{title}</span>
    </h2>
  );
}

