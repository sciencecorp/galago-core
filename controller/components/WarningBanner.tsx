import { useState, FC } from "react";

interface WarningBannerProps {
  message: string;
}

const WarningBanner: FC<WarningBannerProps> = ({ message }) => {
  const [isVisible, _setIsVisible] = useState(true);

  // const _closeBanner = () => {
  //   _setIsVisible(false);
  // };

  return (
    <>
      {isVisible && (
        <div
          style={{
            background: "#ffc107",
            color: "#212529",
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
