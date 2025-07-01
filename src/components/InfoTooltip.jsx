import React, { useState } from "react";

const InfoTooltip = React.memo(({ text }) => {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="relative inline-flex ml-1"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-400 cursor-help"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      {visible && (
        <span className="absolute top-[125%] left-1/2 z-50 w-[220px] -translate-x-1/2 rounded-md bg-gray-800 py-2 px-3 text-center text-sm text-white shadow-md pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
});

export default InfoTooltip;
