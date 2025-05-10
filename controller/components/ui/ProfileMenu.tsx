import { useState } from 'react';
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
  IconButton
} from '@chakra-ui/react';
import { ChevronDownIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { FaUser, FaCog, FaSignOutAlt, FaBook, FaInfoCircle, FaHistory } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCommonColors } from './Theme';

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  
  const colors = useCommonColors();

  const handleShowModal = () => {
    setShowSettingsModal(!showSettingsModal);
  };

  if (!session?.user) {
    return (
      <HStack spacing={2}>
        <IconButton
          size="sm"
          variant="ghost"
          aria-label="Toggle dark mode"
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
        />
        <Button 
          size="sm" 
          colorScheme="teal" 
          onClick={() => router.push('/auth/signin')}
        >
          Sign In
        </Button>
      </HStack>
    );
  }

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  const userName = session.user.name || session.user.email?.split('@')[0] || 'User';
  const userImage = session.user.image;

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
          _hover={{ bg: colors.hoverBg }}
        >
          <HStack spacing={2}>
            <Avatar 
              size="xs" 
              name={userName} 
              src={userImage || undefined} 
              bg="teal.500"
            />
            <Text display={{ base: 'none', md: 'block' }}>
              {userName}
            </Text>
          </HStack>
        </MenuButton>
        <MenuList>
          
          {/* User items */}
          <MenuItem icon={<FaUser />} as={Link} href="/profile">
            Profile
          </MenuItem>
          {session.isAdmin && (
            <MenuItem icon={<FaCog />} as={Link} href="/settings">
              Admin Settings
            </MenuItem>
          )}
          
          {/* General items */}
          <MenuItem icon={<FaCog />} onClick={handleShowModal}>
            Settings
          </MenuItem>
          <MenuItem icon={<FaBook />} as={Link} href="/logs">
            Logs
          </MenuItem>
          
          {/* Help items */}
          <MenuItem icon={<FaInfoCircle />}>
            About
          </MenuItem>
          <MenuItem icon={<FaHistory />} as={Link} href="/docs/changelog">
            Change Log
          </MenuItem>
          
          <MenuItem 
            icon={<FaSignOutAlt />} 
            onClick={handleSignOut}
            isDisabled={isLoggingOut}
          >
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
}; 