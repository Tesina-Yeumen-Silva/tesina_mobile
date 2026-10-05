import React, { Dispatch, SetStateAction } from "react";
import { ReportForm } from "./ReportForm";
import styled from "styled-components/native";

interface ReportModalProps {
  isModalVisible: boolean;
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
}

const ReportModal = ({
  isModalVisible,
  setIsModalVisible,
}: ReportModalProps) => {
  const closeModal = () => setIsModalVisible(false);

  if (!isModalVisible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 999, elevation: 999 }]}>
      <ModalOverlay onPress={closeModal} />
      <View style={[StyleSheet.absoluteFill]} pointerEvents="box-none">
        <View
          style={{ flex: 1, justifyContent: "flex-end" }}
          pointerEvents="box-none"
        >
          <ReportForm
            onSuccess={closeModal}
            onCancel={closeModal}
            isModal={true}
          />
        </View>
      </View>
    </View>
  );
};

export default ReportModal;

import { StyleSheet, View } from "react-native";

const ModalOverlay = styled.Pressable`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;
