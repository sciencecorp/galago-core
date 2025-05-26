import { useState, useEffect } from "react";
import {
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  HStack,
  useColorMode,
  IconButton,
} from "@chakra-ui/react";
import { ChevronDownIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { FaUser, FaCog, FaSignOutAlt, FaBook, FaInfoCircle, FaHistory } from "react-icons/fa";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useCommonColors } from "./Theme";
import { useAuth } from "../../hooks/useAuth";

// Dark mode toggle component to be used in the profile page
export const DarkModeToggle: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      onClick={toggleColorMode}
      icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
      aria-label="Toggle dark mode"
      size="sm"
      variant="ghost"
    />
  );
};

export const ProfileMenu: React.FC = () => {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const { user: customAuthUser, logout: customAuthLogout, loading: customAuthLoading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const colors = useCommonColors();

  // Determine which auth system is being used
  const isNextAuthActive = nextAuthStatus === "authenticated" && !!nextAuthSession?.user;
  const isCustomAuthActive = !!customAuthUser;
  const isAuthenticated = isNextAuthActive || isCustomAuthActive;

  // Extract user information from active auth system
  const userName = isNextAuthActive
    ? nextAuthSession?.user?.name || nextAuthSession?.user?.email?.split("@")[0] || "User"
    : customAuthUser?.username || customAuthUser?.email?.split("@")[0] || "User";

  const userEmail = isNextAuthActive ? nextAuthSession?.user?.email : customAuthUser?.email;

  const userImage = isNextAuthActive ? nextAuthSession?.user?.image : undefined;

  const isAdmin = isNextAuthActive ? !!nextAuthSession?.isAdmin : !!customAuthUser?.is_admin;

  const handleShowModal = () => {
    setShowSettingsModal(!showSettingsModal);
  };

  // If not authenticated, show sign-in button
  if (!isAuthenticated && !customAuthLoading && nextAuthStatus !== "loading") {
    return (
      <HStack spacing={2}>
        <IconButton
          size="sm"
          variant="ghost"
          aria-label="Toggle dark mode"
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
        />
        <Button size="sm" colorScheme="teal" onClick={() => router.push("/auth/signin")}>
          Sign In
        </Button>
      </HStack>
    );
  }

  // If still loading auth state, show minimal UI
  if ((nextAuthStatus === "loading" || customAuthLoading) && !isAuthenticated) {
    return (
      <HStack spacing={2}>
        <IconButton
          size="sm"
          variant="ghost"
          aria-label="Toggle dark mode"
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
        />
      </HStack>
    );
  }

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    
    try {
      // First sign out from custom auth system if active
      if (isCustomAuthActive) {
        customAuthLogout();
      }
      
      // Then sign out from NextAuth if active
      if (isNextAuthActive) {
        // Use redirect: true here to allow NextAuth to handle the redirect properly
        await signOut({ 
          callbackUrl: "/auth/signin",
          redirect: true
        });
        return; // NextAuth will handle the redirect
      }
      
      // Only redirect manually if we're not using NextAuth
      router.push("/auth/signin");
    } catch (error) {
      console.error("Error during sign out:", error);
      // Force redirect to sign-in page in case of error
      window.location.href = "/auth/signin";
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <HStack spacing={2} data-testid="profile-menu">
      <IconButton
        size="sm"
        variant="ghost"
        aria-label="Toggle dark mode"
        icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        onClick={toggleColorMode}
      />
      <Menu placement="bottom-end">
        <MenuButton
          as={Button}
          variant="ghost"
          size="sm"
          rightIcon={<ChevronDownIcon />}
          _hover={{ bg: colors.hoverBg }}>
          <HStack spacing={2}>
            <Avatar size="xs" name={userName} src={userImage || undefined} bg="teal.500" />
            <Text display={{ base: "none", md: "block" }}>{userName}</Text>
          </HStack>
        </MenuButton>
        <MenuList>
          {/* User items */}
          <MenuItem icon={<FaUser />} as={Link} href="/profile">
            Profile
          </MenuItem>
          {isAdmin && (
            <MenuItem icon={<FaCog />} as={Link} href="/settings">
              Admin Settings
            </MenuItem>
          )}
          <MenuItem icon={<FaSignOutAlt />} onClick={handleSignOut} isDisabled={isLoggingOut}>
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
};
