import React from "react";
import AnimatedNumber from "./AnimatedNumber.jsx";

const StatCard = React.memo(
  ({ icon, label, value, unit, color, formatter }) => (
    <div className="flex flex-col justify-between p-4 bg-black/20 rounded-lg border border-gray-700">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <p className="text-sm text-gray-400">{label}</p>
      </div>
      <p
        className="mt-auto text-2xl font-semibold text-white whitespace-nowrap"
        style={{ color }}
      >
        <AnimatedNumber value={value} formatter={formatter} />{' '}
        <span className="ml-1 text-lg">{unit}</span>
      </p>
    </div>
  )
);

export default StatCard;
