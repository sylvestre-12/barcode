"use client";

import Barcode from "react-barcode";

interface StudentBarcodeProps {
  value: string;
  width?: number;
  height?: number;
}

export default function StudentBarcode({
  value,
  width = 2,
  height = 60,
}: StudentBarcodeProps) {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        bg-white
        rounded-xl
        border-2
        border-green-700
        p-3
        shadow-md
        w-fit
      "
    >
      <Barcode
        value={value}
        format="CODE128"
        width={width}
        height={height}
        displayValue={true}
        fontSize={14}
        font="monospace"
        textAlign="center"
        textPosition="bottom"
        textMargin={5}
        background="#ffffff"
        lineColor="#000000"
        margin={10}
      />

      <p
        className="
          mt-2
          text-xs
          font-bold
          tracking-widest
          text-green-800
        "
      >
        STUDENT ID
      </p>
    </div>
  );
}