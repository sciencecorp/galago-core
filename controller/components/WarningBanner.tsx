import React, { useState, FC } from "react";
import { palette } from "../themes/colors";

interface WarningBannerProps {
  message: string;
}

const WarningBanner: FC<WarningBannerProps> = ({ message }) => {
  const [isVisible, setIsVisible] = useState(true);

  const closeBanner = () => {
    setIsVisible(false);
  };

  return (
    <>
      {isVisible && (
        <div
          style={{
            background: palette.custom.warningYellow,
            color: palette.custom.warningText,
            padding: "8px",
            textAlign: "center",
            top: 0,
            left: 0,
            right: 0,
          }}>
          <p style={{ margin: 0 }}>{message}</p>
        </div>
      )}
    </>
  );
};

export default WarningBanner;
