"use client";

import { QRCodeSVG } from "qrcode.react";

export default function StudentQR({ value }: { value: string }) {
  function downloadQR() {
    const svg = document.getElementById("qr-svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);

    const blob = new Blob([source], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${value}-qr.svg`;
    a.click();
  }

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow">
      <QRCodeSVG id="qr-svg" value={value} size={180} />

      <p className="mt-2 text-sm font-semibold">{value}</p>

      <button
        onClick={downloadQR}
        className="mt-3 px-3 py-1 bg-blue-600 text-white rounded"
      >
        Download QR
      </button>
    </div>
  );
}