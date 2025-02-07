import React, { useEffect, useRef } from 'react';
import { Box, VStack, Button } from '@chakra-ui/react';
import { Script } from '@/types/api';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onNewFolder?: (folderName: string) => void;
  onNewScript?: (scriptName: string) => void;
  onOpen?: () => void;
  onDelete?: () => void;
  type?: 'folder' | 'file';
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ 
  x, 
  y, 
  onClose, 
  onNewFolder, 
  onNewScript,
  onOpen,
  onDelete,
  type = 'folder'
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <Box
      ref={menuRef}
      position="fixed"
      left={`${x}px`}
      top={`${y}px`}
      zIndex={1000}
      bg="white"
      shadow="md"
      borderRadius="md"
      borderWidth="1px"
    >
      <VStack align="stretch" spacing={0}>
        {type === 'folder' ? (
          <>
            {onNewFolder && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onNewFolder('New Folder');
                  onClose();
                }}
              >
                New Folder
              </Button>
            )}
            {onNewScript && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onNewScript('New Script');
                  onClose();
                }}
              >
                New Script
              </Button>
            )}
          </>
        ) : (
          <>
            {onOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onOpen();
                  onClose();
                }}
              >
                Open
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                colorScheme="red"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
              >
                Delete
              </Button>
            )}
          </>
        )}
      </VStack>
    </Box>
  );
}; 