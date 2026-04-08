import { Dispatch, SetStateAction } from "react";
import { Modal } from "react-native";
import styled from "styled-components/native";
import { Text, View } from "../Themed";
import ImageSelector from "./ImageSelector";

import { useState } from "react";

interface ReportModalProps {
  isModalVisible: boolean;
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
}

const ReportModal = ({
  isModalVisible,
  setIsModalVisible,
}: ReportModalProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={() => {
        setIsModalVisible(false);
      }}
    >
      <ModalOverlay onPress={() => setIsModalVisible(false)}>
        <ModalContent>
          <Indicator />
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>
            Reportar Incidente
          </Text>
          <ImageSelector image={selectedImage} setImage={setSelectedImage} />
          <CloseButton onPress={() => setIsModalVisible(false)}>
            <Text style={{ color: "white" }}>Cerrar</Text>
          </CloseButton>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
export default ReportModal;

const ModalOverlay = styled.Pressable`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const ModalContent = styled(View)`
  background-color: ${(props) => props.theme.background || "white"};
  padding: 20px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  min-height: 250px;
  justify-content: center;
  align-items: center;
`;

const Indicator = styled(View)`
  width: 40px;
  height: 5px;
  background-color: #ccc;
  border-radius: 2.5px;
  margin-bottom: 15px;
`;

const CloseButton = styled.Pressable`
  margin-top: 20px;
  background-color: #ff4444;
  padding: 10px 20px;
  border-radius: 10px;
`;
