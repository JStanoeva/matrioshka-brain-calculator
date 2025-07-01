import React from "react";
import InfoTooltip from "./InfoTooltip.jsx";

const InputField = React.memo(
  ({ id, label, unit, tooltip, disabled, ...props }) => (
    <div className="w-full">
      <label
        htmlFor={id}
        className={`flex items-center text-sm mb-2 ${
          disabled ? "text-gray-500" : "text-cyan-200/80"
        }`}
      >
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </label>
      <div className="relative">
        <input
          id={id}
          {...props}
          disabled={disabled}
          className={`w-full rounded-lg border border-sky-400/30 py-2 pl-4 backdrop-blur-sm transition-colors focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${
            unit ? "pr-14" : "pr-4"
          } ${
            disabled
              ? "cursor-not-allowed bg-slate-800/80 text-gray-400"
              : "bg-slate-800/50 text-white"
          }`}
        />
        {unit && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
);

export default InputField;
