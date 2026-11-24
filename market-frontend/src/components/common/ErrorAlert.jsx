import React from 'react';

export default function ErrorAlert({ errors }) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className="alert alert-danger" role="alert">
      <ul className="mb-0">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
}