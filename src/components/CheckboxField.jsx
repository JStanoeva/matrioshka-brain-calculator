import React from "react";
import InfoTooltip from "./InfoTooltip.jsx";

const CheckboxField = React.memo(({ id, label, tooltip, ...props }) => (
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      id={id}
      {...props}
      className="w-4 h-4 rounded accent-blue-500 focus:ring-blue-500"
    />
    <label
      htmlFor={id}
      className="flex items-center text-sm text-white cursor-pointer"
    >
      {label}
      {tooltip && <InfoTooltip text={tooltip} />}
    </label>
  </div>
));

export default CheckboxField;
