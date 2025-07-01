import React, { useState, useCallback } from "react";
import Starfield from "./components/Starfield.jsx";
import ResultsDisplay from "./components/ResultsDisplay.jsx";
import InputField from "./components/InputField.jsx";
import CheckboxField from "./components/CheckboxField.jsx";
import FormFieldset from "./components/FormFieldset.jsx";
import { RefreshCwIcon, LoaderIcon } from "./components/Icons.jsx";

/* ============================================================================
    1.  STYLES & ANIMATIONS
    ========================================================================== */
const GlobalStyles = () => (
  <style>{`
    @keyframes twinkle { 0%,100% {opacity:0;} 50% {opacity:1;} }
    @keyframes fade-in-down { from {opacity:0;transform:translateY(-20px);}
                              to   {opacity:1;transform:translateY(0);} }
    @keyframes fade-in-up   { from {opacity:0;transform:translateY(20px);}
                              to   {opacity:1;transform:translateY(0);} }
    @keyframes shake {0%,100%{transform:translateX(0);}
      10%,30%,50%,70%,90%{transform:translateX(-5px);}
      20%,40%,60%,80%{transform:translateX(5px);} }
    @keyframes spin {from{transform:rotate(0deg);}to{transform:rotate(360deg);} }

    /* Custom Scrollbar Styles */
    /* For Firefox */
    html {
      scrollbar-width: thin;
      scrollbar-color: #3b82f6 #1e293b; /* thumb-color track-color */
    }

    /* For Webkit-based browsers (Chrome, Safari, Edge) */
    ::-webkit-scrollbar {
      width: 12px;
    }
    ::-webkit-scrollbar-track {
      background-color: #1e293b; /* slate-800 */
    }
    ::-webkit-scrollbar-thumb {
      background-image: linear-gradient(to bottom, #06b6d4, #3b82f6); /* cyan-500 to blue-500 */
      border-radius: 20px;
      border: 3px solid #1e293b; /* Creates padding around the thumb */
    }
    ::-webkit-scrollbar-thumb:hover {
      background-image: linear-gradient(to bottom, #0891b2, #2563eb); /* cyan-600 to blue-600 */
    }
  `}</style>
);



/* ============================================================================
    4.  PHYSICS & CALCULATION LOGIC
    ========================================================================== */
const SIGMA = 5.670374419e-8,
  K_B = 1.380649e-23,
  LN2 = 0.69314718056,
  AU = 1.495978707e11,
  L_SUN = 3.828e26;
const calculateBrainProps = (params) => {
  const {
    luminosityMethod,
    starMass,
    starRadius,
    starTeff,
    starLuminosity,
    alpha,
    epsilon,
    T_inner,
    f_T,
    f_r,
    terminationCriterion,
    T_outer,
    N_max,
    showCarnot,
    showLandauer,
    showExergy,
  } = params;
  const warnings = [];
  if (
    f_T >= 1 ||
    f_r <= 1 ||
    alpha <= 0 ||
    alpha > 1 ||
    epsilon <= 0 ||
    epsilon > 1
  )
    throw new Error("Invalid physics parameters.");
  let L_star;
  if (luminosityMethod === "direct") L_star = starLuminosity;
  else if (luminosityMethod === "radius_temp")
    L_star =
      4 * Math.PI * Math.pow(starRadius, 2) * SIGMA * Math.pow(starTeff, 4);
  else {
    L_star = L_SUN * Math.pow(starMass, 2.3);
    if (starMass > 0.5)
      warnings.push(
        "Scientific Accuracy: The mass-luminosity law M^2.3 is only accurate for red dwarfs (< 0.5 M☉). The result may be inaccurate."
      );
  }
  if (!L_star || L_star <= 0)
    throw new Error("Could not calculate a positive stellar luminosity.");
  const r0 = Math.sqrt(
    (alpha * L_star) / (4 * Math.PI * epsilon * SIGMA * Math.pow(T_inner, 4))
  );
  let numLayers;
  if (terminationCriterion === "temp") {
    if (!T_outer || T_outer <= 0 || T_outer >= T_inner)
      throw new Error("Invalid outer temperature.");
    numLayers = Math.ceil(Math.log(T_outer / T_inner) / Math.log(f_T));
  } else {
    if (!N_max || N_max <= 0) throw new Error("Invalid number of layers.");
    numLayers = N_max - 1;
  }
  const shells = [];
  let T = T_inner,
    r = r0;
  for (let n = 0; n <= numLayers; n++) {
    const row = {
      layer: n,
      equilibriumTemp: T,
      radiusMeters: r,
      radiusAu: r / AU,
    };
    if (showCarnot && n < numLayers) row.carnot = 1 - f_T;
    if (showLandauer) row.landauer = K_B * T * LN2;
    if (showExergy && n < numLayers) row.exergy = (1 - f_T) * L_star;
    shells.push(row);
    if (terminationCriterion === "temp" && T <= T_outer) break;
    T *= f_T;
    r *= f_r;
  }
  const finalTemp =
    shells.length > 0 ? shells[shells.length - 1].equilibriumTemp : 0;
  const landauerLimitEnergy = K_B * finalTemp * LN2;
  const totalThroughput = finalTemp > 0 ? L_star / landauerLimitEnergy : 0;
  return {
    shellDetails: shells,
    totalLayers: shells.length,
    calculatedLuminosity: L_star,
    innerShellRadiusAu: shells[0]?.radiusAu ?? 0,
    warnings: warnings,
    totalThroughput: totalThroughput,
  };
};

/* ============================================================================
    5.  HELPER UI COMPONENTS
    ========================================================================== */

/* ============================================================================
    6.  MAIN PAGE COMPONENT
    ========================================================================== */
const initialParams = {
  luminosityMethod: "mass",
  starMass: "1",
  starRadius: "6.957e8",
  starTeff: "5778",
  starLuminosity: "3.828e26",
  alpha: "0.99",
  epsilon: "0.99",
  sameAlphaEpsilon: true,
  T_inner: "1000",
  architectureDriver: "radius",
  f_T: "0.50",
  f_r: "4.00",
  terminationCriterion: "temp",
  T_outer: "3",
  N_max: "20",
  showCarnot: false,
  showLandauer: true,
  showExergy: false,
};
const numericFields = new Set([
  "starMass",
  "starRadius",
  "starTeff",
  "starLuminosity",
  "alpha",
  "epsilon",
  "T_inner",
  "f_T",
  "f_r",
  "T_outer",
  "N_max",
]);

export default function HomePage() {
  const [params, setParams] = useState(initialParams);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    if (numericFields.has(name)) {
      val = val.replace(/[^0-9.e-]/g, "");
    }

    setParams((p) => {
      let newParams = { ...p, [name]: val };
      const updateLinkedFactors = (driver) => {
        const alpha = parseFloat(newParams.alpha);
        if (!isFinite(alpha) || alpha <= 0) return;
        if (driver === "temp") {
          const f_T = parseFloat(newParams.f_T);
          if (isFinite(f_T) && f_T > 0 && f_T < 1) {
            const new_f_r = Math.sqrt(alpha) / (f_T * f_T);
            newParams.f_r = new_f_r.toFixed(4);
          }
        } else {
          const f_r = parseFloat(newParams.f_r);
          if (isFinite(f_r) && f_r > 1) {
            const new_f_T = Math.pow(alpha, 0.25) / Math.sqrt(f_r);
            newParams.f_T = new_f_T.toFixed(4);
          }
        }
      };
      if (name === "f_T") updateLinkedFactors("temp");
      if (name === "f_r") updateLinkedFactors("radius");
      if (name === "alpha") updateLinkedFactors(newParams.architectureDriver);
      if (name === "architectureDriver") updateLinkedFactors(val);
      if (name === "alpha" && newParams.sameAlphaEpsilon) {
        newParams.epsilon = val;
      }
      if (name === "sameAlphaEpsilon") {
        newParams.epsilon = checked ? newParams.alpha : p.epsilon;
      }
      return newParams;
    });
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");
      setResults(null);
      const parsedParams = Object.fromEntries(
        Object.entries(params).map(([k, v]) =>
          numericFields.has(k) ? [k, parseFloat(v)] : [k, v]
        )
      );
      setTimeout(() => {
        try {
          const res = calculateBrainProps(parsedParams);
          setResults({ ...res, paramsUsed: params });
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }, 800);
    },
    [params]
  );

  const handleReset = useCallback(() => {
    setParams(initialParams);
    setResults(null);
    setError("");
    setIsLoading(false);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans text-white bg-slate-900">
      <GlobalStyles />
      <Starfield />
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 py-8">
        <header
          className="mb-8 text-center"
          style={{ animation: "fade-in-down 0.7s ease-out forwards" }}
        >
          <h1
            className="mb-2 text-5xl font-bold text-transparent bg-gradient-to-r from-cyan-300 via-purple-400 to-indigo-400 bg-clip-text"
            style={{ textShadow: "0 0 15px rgba(100,200,255,0.5)" }}
          >
            Matrioshka Brain Builder
          </h1>
          <p className="mx-auto max-w-[42rem] text-gray-300/80">
            Design a Matrioshka Brain megastructure based on stellar physics and
            thermodynamic principles.
          </p>
        </header>

        <main className="flex flex-col items-center w-full max-w-6xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="w-full p-8 border rounded-xl bg-slate-800/40 border-sky-400/20 backdrop-blur-md shadow-2xl"
            style={{
              animation: "fade-in-up 0.7s ease-out 0.2s forwards",
              opacity: 0,
            }}
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* LEFT COLUMN */}
              <div>
                <FormFieldset legend="A. Stellar Data">
                  <div className="flex flex-wrap gap-4 mb-4">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="luminosityMethod"
                        value="mass"
                        checked={params.luminosityMethod === "mass"}
                        onChange={handleInputChange}
                        className="mr-2 accent-blue-500"
                      />
                      By Mass
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="luminosityMethod"
                        value="radius_temp"
                        checked={params.luminosityMethod === "radius_temp"}
                        onChange={handleInputChange}
                        className="mr-2 accent-blue-500"
                      />
                      By R & T
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="luminosityMethod"
                        value="direct"
                        checked={params.luminosityMethod === "direct"}
                        onChange={handleInputChange}
                        className="mr-2 accent-blue-500"
                      />
                      By Luminosity
                    </label>
                  </div>
                  {params.luminosityMethod === "mass" && (
                    <InputField
                      key="starMass"
                      id="starMass"
                      name="starMass"
                      label="Mass"
                      type="text"
                      value={params.starMass}
                      onChange={handleInputChange}
                      unit="M☉"
                      tooltip="Mass of the star in solar masses. Used for a rough luminosity estimate for red dwarfs."
                    />
                  )}
                  {params.luminosityMethod === "radius_temp" && (
                    <div className="flex flex-col gap-4">
                      <InputField
                        key="starRadius"
                        id="starRadius"
                        name="starRadius"
                        label="Radius"
                        type="text"
                        value={params.starRadius}
                        onChange={handleInputChange}
                        unit="m"
                        tooltip="The star's radius in meters. Used for precise luminosity calculation."
                      />
                      <InputField
                        key="starTeff"
                        id="starTeff"
                        name="starTeff"
                        label="Surface Temp"
                        type="text"
                        value={params.starTeff}
                        onChange={handleInputChange}
                        unit="K"
                        tooltip="The star's effective surface temperature in Kelvin."
                      />
                    </div>
                  )}
                  {params.luminosityMethod === "direct" && (
                    <InputField
                      key="starLuminosity"
                      id="starLuminosity"
                      name="starLuminosity"
                      label="Luminosity"
                      type="text"
                      value={params.starLuminosity}
                      onChange={handleInputChange}
                      unit="Watts"
                      tooltip="The star's total energy output in Watts. The most direct input."
                    />
                  )}
                </FormFieldset>
                <FormFieldset legend="B. Shell Radiative Properties">
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <InputField
                      key="alpha"
                      id="alpha"
                      name="alpha"
                      label="Absorptivity (α)"
                      type="text"
                      value={params.alpha}
                      onChange={handleInputChange}
                      tooltip="Fraction (0-1) of incoming energy a shell absorbs. Higher values capture more energy."
                    />
                    <InputField
                      key="epsilon"
                      id="epsilon"
                      name="epsilon"
                      label="Emissivity (ε)"
                      type="text"
                      value={params.epsilon}
                      onChange={handleInputChange}
                      disabled={params.sameAlphaEpsilon}
                      tooltip="Fraction (0-1) of energy a shell radiates away as heat. Higher values cool more effectively."
                    />
                  </div>
                  <div className="mt-4">
                    <CheckboxField
                      id="sameAlphaEpsilon"
                      name="sameAlphaEpsilon"
                      label="Same for both (α = ε)"
                      checked={params.sameAlphaEpsilon}
                      onChange={handleInputChange}
                    />
                  </div>
                </FormFieldset>
              </div>
              {/* RIGHT COLUMN */}
              <div>
                <FormFieldset legend="C. Architecture Knobs">
                  <div className="flex flex-wrap gap-4 mb-4">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="architectureDriver"
                        value="radius"
                        checked={params.architectureDriver === "radius"}
                        onChange={handleInputChange}
                        className="mr-2 accent-blue-500"
                      />
                      Control Radius Factor
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="architectureDriver"
                        value="temp"
                        checked={params.architectureDriver === "temp"}
                        onChange={handleInputChange}
                        className="mr-2 accent-blue-500"
                      />
                      Control Temp Factor
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <InputField
                      key="T_inner"
                      id="T_inner"
                      name="T_inner"
                      label="Inner Temp"
                      type="text"
                      value={params.T_inner}
                      onChange={handleInputChange}
                      unit="K"
                      tooltip="Operating temperature of the innermost shell. Limited by material science (e.g., 1000K)."
                    />
                    <InputField
                      key="f_r"
                      id="f_r"
                      name="f_r"
                      label="Radius Factor (fr)"
                      type="text"
                      value={params.f_r}
                      onChange={handleInputChange}
                      disabled={params.architectureDriver !== "radius"}
                      tooltip="The radius ratio between shells. Physically linked to Temp Factor."
                    />
                    <InputField
                      key="f_T"
                      id="f_T"
                      name="f_T"
                      label="Temp Factor (fT)"
                      type="text"
                      value={params.f_T}
                      onChange={handleInputChange}
                      disabled={params.architectureDriver !== "temp"}
                      tooltip="The temperature ratio between shells. Physically linked to Radius Factor."
                    />
                  </div>
                </FormFieldset>
                <FormFieldset legend="D. Termination Criterion">
                  <div className="flex flex-wrap gap-4 mb-4">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="terminationCriterion"
                        value="temp"
                        checked={params.terminationCriterion === "temp"}
                        onChange={handleInputChange}
                        className="mr-2 accent-blue-500"
                      />
                      By Outer Temp
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="terminationCriterion"
                        value="layers"
                        checked={params.terminationCriterion === "layers"}
                        onChange={handleInputChange}
                        className="mr-2 accent-blue-500"
                      />
                      By Layer Count
                    </label>
                  </div>
                  {params.terminationCriterion === "temp" ? (
                    <InputField
                      key="T_outer"
                      id="T_outer"
                      name="T_outer"
                      label="Target Outer Temperature"
                      type="text"
                      value={params.T_outer}
                      onChange={handleInputChange}
                      unit="K"
                      tooltip="Build layers until the outermost shell is at or below this temperature (e.g., 3K CMB)."
                    />
                  ) : (
                    <InputField
                      key="N_max"
                      id="N_max"
                      name="N_max"
                      label="Number of Layers"
                      type="text"
                      value={params.N_max}
                      onChange={handleInputChange}
                      tooltip="Build a specific number of layers, starting from the inside."
                    />
                  )}
                </FormFieldset>
              </div>
            </div>
            <FormFieldset legend="E. Optional Columns">
              <div className="flex flex-wrap justify-center gap-6">
                <CheckboxField
                  id="showCarnot"
                  name="showCarnot"
                  label="Carnot η"
                  checked={params.showCarnot}
                  onChange={handleInputChange}
                  tooltip="Ideal thermodynamic efficiency of converting heat into work between two shells."
                />
                <CheckboxField
                  id="showLandauer"
                  name="showLandauer"
                  label="Landauer Limit"
                  checked={params.showLandauer}
                  onChange={handleInputChange}
                  tooltip="The minimum energy required to erase one bit of information at the shell's temperature."
                />
                <CheckboxField
                  id="showExergy"
                  name="showExergy"
                  label="Layer Exergy"
                  checked={params.showExergy}
                  onChange={handleInputChange}
                  tooltip="A simplified model of the maximum power available for computation in each layer."
                />
              </div>
            </FormFieldset>
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset form"
                className="p-3 font-bold text-white rounded-lg cursor-pointer bg-slate-600/50 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <RefreshCwIcon />
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center w-48 gap-2 py-3 font-bold text-white rounded-lg cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {isLoading ? (
                  <>
                    <LoaderIcon />
                    Building...
                  </>
                ) : (
                  "Build Brain"
                )}
              </button>
            </div>
            {error && (
              <p
                className="mt-4 text-center text-red-400"
                style={{ animation: "shake 0.5s ease-in-out" }}
              >
                {error}
              </p>
            )}
          </form>
          {results && (
            <ResultsDisplay results={results} params={results.paramsUsed} />
          )}
        </main>
      </div>
    </div>
  );
}
