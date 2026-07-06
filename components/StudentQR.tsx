"use client";

import { QRCodeSVG } from "qrcode.react";

interface StudentQRProps {
  value: string;
}


export default function StudentQR({
  value,
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
      p-2
      "
    >

      <QRCodeSVG

        value={value}

        size={130}

        level="H"

        includeMargin={true}

      />


      <p
        className="
        mt-2
        text-xs
        font-bold
        text-gray-700
        "
      >

        {value}

      </p>


    </div>

  );

}