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
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "2px solid #15803d",
        padding: "12px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        width: "fit-content",
      }}
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
        style={{
          marginTop:"8px",
          fontSize:"12px",
          fontWeight:"700",
          letterSpacing:"0.2em",
          color:"#166534",
        }}
      >
        STUDENT ID
      </p>


    </div>

  );
}