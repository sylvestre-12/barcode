"use client";

import { QRCodeSVG } from "qrcode.react";

interface StudentQRProps {
  value: string;
  size?: number;
}

export default function StudentQR({
  value,
  size = 100,
}: StudentQRProps) {

  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        bg-white
        rounded-lg
        p-1.5
      "
    >

      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        includeMargin={false}
        bgColor="#ffffff"
        fgColor="#000000"
      />

      <p
        className="
          mt-1
          text-[9px]
          font-bold
          text-gray-700
          tracking-wide
        "
      >
        {value}
      </p>

    </div>
  );
}