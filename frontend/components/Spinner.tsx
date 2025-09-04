import React from 'react';

interface SpinnerProps {
  overlay?: boolean;
  size?: 'small' | 'large';
}

function Spinner({ overlay = false, size = 'large' }: SpinnerProps) {
  if (overlay) {
    return (
      <div className="spinner-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (size === 'small') {
    return <div className="spinner-small"></div>;
  }

  return <div className="spinner"></div>;
}

export default Spinner;
