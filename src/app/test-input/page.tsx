"use client";
import { useState } from "react";

export default function TestInput() {
  const [value, setValue] = useState("");

  return (
    <div className="p-8">
      <h1>Input Test</h1>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          console.log("Change:", e.target.value);
          setValue(e.target.value);
        }}
        className="border p-2"
        placeholder="Teste hier..."
      />
      <p>Value: {value}</p>

      <div className="mt-8">
        <h2>Debug-Info:</h2>
        <p>Wenn du hier tippen kannst, ist das Problem nicht global.</p>
        <p>
          Wenn du nicht tippen kannst, liegt es an einem globalen Event-Handler.
        </p>
      </div>
    </div>
  );
}
