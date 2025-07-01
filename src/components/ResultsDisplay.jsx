import React from "react";
import StatCard from "./StatCard.jsx";
import InfoTooltip from "./InfoTooltip.jsx";
import {
  LayersIcon,
  SunIcon,
  TargetIcon,
  CpuIcon,
  AlertTriangleIcon,
} from "./Icons.jsx";

const ResultsDisplay = React.memo(({ results, params }) => (
  <div
    className="w-full max-w-6xl mt-10"
    style={{ animation: "fade-in-up 0.7s ease-out 0.2s forwards", opacity: 0 }}
  >
    <div
      className="p-8 bg-gray-900/50 rounded-2xl border border-sky-400/30 backdrop-blur-sm shadow-2xl"
      style={{ boxShadow: "0 25px 50px -12px rgba(56,189,248,0.1)" }}
    >
      <h2 className="mb-6 text-3xl font-bold text-center text-transparent bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text">
        Computational Architecture
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
        <StatCard
          icon={<LayersIcon className="text-purple-400" />}
          label="Total Calculated Layers"
          value={results.totalLayers}
          unit=""
          color="#c084fc"
          formatter={(n) => n.toFixed(0)}
        />
        <StatCard
          icon={<SunIcon className="text-yellow-300" />}
          label="Stellar Luminosity"
          value={results.calculatedLuminosity}
          unit="Watts"
          color="#fde047"
          formatter={(n) => n.toExponential(2)}
        />
        <StatCard
          icon={<TargetIcon className="text-red-400" />}
          label="Inner Shell Radius"
          value={results.innerShellRadiusAu}
          unit="AU"
          color="#f87171"
          formatter={(n) => n.toFixed(3)}
        />
        <StatCard
          icon={<CpuIcon className="text-cyan-300" />}
          label="Total Throughput"
          value={results.totalThroughput}
          unit="bits/s"
          color="#67e8f9"
          formatter={(n) => n.toExponential(2)}
        />
      </div>
      {results.warnings?.length > 0 && (
        <div className="flex gap-3 p-4 mb-8 text-yellow-300 border rounded-lg bg-yellow-300/10 border-yellow-400">
          <AlertTriangleIcon />
          <div>
            <h3 className="mb-1 font-bold">Scientific Accuracy Notes</h3>
            {results.warnings.map((w, i) => (
              <p key={i} className="text-sm">
                {w}
              </p>
            ))}
          </div>
        </div>
      )}
      <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold">
        Shell Breakdown
      </h3>
      <div className="pr-2 overflow-y-auto max-h-80">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-gray-900">
            <tr>
              <th className="p-2 text-left">Shell</th>
              <th className="p-2 text-left">Radius (AU)</th>
              <th className="flex items-center p-2 text-left">
                Temp (K)
                <InfoTooltip text="~0.00 signifies a temperature approaching, but not reaching, absolute zero, which is physically impossible." />
              </th>
              {params.showCarnot && <th className="p-2 text-left">Carnot η</th>}
              {params.showLandauer && (
                <th className="p-2 text-left">Landauer (J)</th>
              )}
              {params.showExergy && (
                <th className="p-2 text-left">Exergy (W)</th>
              )}
            </tr>
          </thead>
          <tbody>
            {results.shellDetails.map((s) => (
              <tr key={s.layer} className="border-t border-gray-800">
                <td className="py-3 px-2 font-bold text-purple-400">
                  #{s.layer + 1}
                </td>
                <td className="py-3 px-2">
                  {s.radiusAu < 1000
                    ? s.radiusAu.toFixed(2)
                    : s.radiusAu.toExponential(2)}
                </td>
                <td className="py-3 px-2">
                  {s.equilibriumTemp.toFixed(2) === "0.00"
                    ? "~0.00"
                    : s.equilibriumTemp.toFixed(2)}
                </td>
                {params.showCarnot && (
                  <td className="py-3 px-2">
                    {s.carnot ? s.carnot.toFixed(2) : "–"}
                  </td>
                )}
                {params.showLandauer && (
                  <td className="py-3 px-2">
                    {s.landauer ? s.landauer.toExponential(2) : "–"}
                  </td>
                )}
                {params.showExergy && (
                  <td className="py-3 px-2">
                    {s.exergy ? s.exergy.toExponential(2) : "–"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
));

export default ResultsDisplay;
