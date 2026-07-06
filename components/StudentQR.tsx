"use client";

import { QRCodeSVG } from "qrcode.react";

interface StudentQRProps {
  value: string;
  size?: number;
}

export default function StudentQR({
  value,
  size = 95,
}: StudentQRProps) {

  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        bg-white
        rounded-md
        p-1
      "
    >

      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        includeMargin={true}
        bgColor="#ffffff"
        fgColor="#000000"
      />


      <p
        className="
          mt-1
          text-[8px]
          font-bold
          text-gray-800
          tracking-wider
        "
      >
        {value}
      </p>

    </div>
  );
}