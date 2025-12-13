"use client";

import { useState } from "react";

function initials(name = "") {
  return name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AvatarGenerator() {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4f46e5");

  function downloadSVG() {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><rect width='100%' height='100%' fill='${color}'/><text x='50%' y='55%' font-size='96' fill='#fff' font-family='Helvetica,Arial' text-anchor='middle' dominant-baseline='middle'>${initials(
      name
    )}</text></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name || "avatar"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4 bg-white rounded shadow max-w-sm">
      <h4 className="font-semibold">Avatar Generator</h4>
      <label className="block text-sm mt-2">Name</label>
      <input className="border p-2 w-full" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="block text-sm mt-2">Background color</label>
      <input type="color" className="w-12 h-10 p-0 border-0" value={color} onChange={(e) => setColor(e.target.value)} />

      <div className="mt-3">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl" style={{ background: color }}>
          {initials(name)}
        </div>
      </div>

      <div className="flex justify-end mt-3">
        <button onClick={downloadSVG} className="px-3 py-2 bg-blue-600 text-white rounded">
          Download SVG
        </button>
      </div>
    </div>
  );
}
