// components/Barcode.js
import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

const Barcode = ({ value }) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    JsBarcode(barcodeRef.current, value, {
      format: "CODE128",
      lineColor: "#000",
      width: 1.5,
      height: 25,
      displayValue: true,
      fontSize:'20px'
    });
  }, [value]);

  return <svg ref={barcodeRef}></svg>;
};

export default Barcode;
