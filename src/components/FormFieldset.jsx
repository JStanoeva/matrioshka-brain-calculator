import React from "react";

const FormFieldset = ({ legend, children }) => (
  <fieldset className="p-5 mb-6 border rounded-lg border-sky-400/20">
    <legend className="px-2 font-medium text-cyan-200">{legend}</legend>
    {children}
  </fieldset>
);

export default FormFieldset;
