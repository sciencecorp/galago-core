// components/Barcode.js
import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { palette, semantic } from "../themes/colors";
import tokens from "../themes/tokens";
import { useColorModeValue } from "@chakra-ui/react";

const Barcode = ({ value }) => {
  const barcodeRef = useRef(null);
  const lineColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);

  useEffect(() => {
    JsBarcode(barcodeRef.current, value, {
      format: "CODE128",
      lineColor: lineColor,
      width: 1.5,
      height: 25,
      displayValue: true,
      fontSize: tokens.typography.fontSizes.md,
    });
  }, [value, lineColor]);

  return <svg ref={barcodeRef}></svg>;
};

export default Barcode;
