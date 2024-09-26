import React , {useEffect} from 'react';
import {Box,Modal,ModalOverlay,ModalContent,ModalHeader,ModalCloseButton,ModalBody,Button,ModalFooter} from '@chakra-ui/react'

interface UserMessageProps {
    title:string;
    message:string;
    type:"error"|"warning"| "info" | "success";
    isOpen: boolean;
    onClose: () => void;
}


export const UserMessage: React.FC<UserMessageProps> = ({title,message,type,isOpen,onClose}) => {
    return(
    <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {message}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
}

export default UserMessage;