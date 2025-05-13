import { Divider, HStack } from "@chakra-ui/react";

import { ProfileMenu } from "./ProfileMenu";
import { useCommonColors } from "./Theme";

export default function Nav() {
  const colors = useCommonColors();

  return (
    <>
      <HStack
        spacing={4}
        width={"100%"}
        height="45px"
        className={process.env.appMode == "PROD" ? "production-nav" : "development-nav"}
        bg={colors.inputBg}
        color={colors.textColor}
        px={4}
        justifyContent="flex-end">
        <ProfileMenu />
      </HStack>
      <Divider />
    </>
  );
}
