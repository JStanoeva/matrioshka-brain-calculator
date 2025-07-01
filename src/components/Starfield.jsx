import React, { useMemo } from "react";

const Starfield = React.memo(() => (
  <div className="absolute inset-0 z-0 overflow-hidden">
    {useMemo(
      () =>
        Array.from({ length: 50 }).map(() => ({
          "--star-x": `${Math.random() * 100}%`,
          "--star-y": `${Math.random() * 100}%`,
          width: `${1 + Math.random() * 2}px`,
          height: `${1 + Math.random() * 2}px`,
          "--animation-delay": `${Math.random() * 10}s`,
          "--animation-duration": `${5 + Math.random() * 10}s`,
        })),
      []
    ).map((s, i) => (
      <div
        key={i}
        className="absolute bg-white rounded-full"
        style={{
          left: s["--star-x"],
          top: s["--star-y"],
          animation: `twinkle ${s["--animation-duration"]} ${s["--animation-delay"]} infinite`,
          ...s,
        }}
      />
    ))}
  </div>
));

export default Starfield;
