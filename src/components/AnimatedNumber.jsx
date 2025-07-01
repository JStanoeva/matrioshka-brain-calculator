import React, { useState, useEffect, useRef } from "react";

const useCountUp = (endValue, duration = 2000) => {
  const [currentValue, setCurrentValue] = useState(0);
  const frameRef = useRef();
  const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
  useEffect(() => {
    let startTime = null;
    const a = (t) => {
      if (!startTime) startTime = t;
      const p = Math.min((t - startTime) / duration, 1);
      setCurrentValue(endValue * ease(p));
      if (p < 1) frameRef.current = requestAnimationFrame(a);
    };
    frameRef.current = requestAnimationFrame(a);
    return () => cancelAnimationFrame(frameRef.current);
  }, [endValue, duration]);
  return currentValue;
};

const AnimatedNumber = ({ value, formatter }) => (
  <>{formatter(useCountUp(value))}</>
);

export default AnimatedNumber;
