import React, { Dispatch, SetStateAction } from 'react';
import { Modal } from 'react-native';
import { ReportForm } from './ReportForm';
import styled from 'styled-components/native';

interface ReportModalProps {
  isModalVisible: boolean;
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
}

const ReportModal = ({
  isModalVisible,
  setIsModalVisible,
}: ReportModalProps) => {
  
  const closeModal = () => setIsModalVisible(false);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={closeModal}
    >
      <ModalOverlay onPress={closeModal}>
        
        <ReportForm 
          onSuccess={closeModal} 
          onCancel={closeModal} 
          isModal={true}
        />

      </ModalOverlay>
    </Modal>
  );
};

export default ReportModal;

const ModalOverlay = styled.Pressable`
  flex: 1;
  justify-content: flex-end;
`;