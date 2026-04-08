import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert } from "react-native";
import styled from "styled-components/native";
import { Text, View } from "../Themed";

interface ImageSelectorProps {
  image: string | null;
  setImage: (uri: string | null) => void;
}

const ImageSelector = ({ image, setImage }: ImageSelectorProps) => {
  const handlePickImage = async (useCamera: boolean) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos acceso para documentar el reporte.",
      );
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    };

    const result = useCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <MainContainer>
      {image ? (
        <PreviewWrapper>
          <StyledImage source={{ uri: image }} />
          <DeleteBadge onPress={() => setImage(null)}>
            <MaterialIcons name="close" size={20} color="white" />
          </DeleteBadge>
        </PreviewWrapper>
      ) : (
        <ButtonRow>
          <SelectionButton onPress={() => handlePickImage(true)}>
            <MaterialIcons name="photo-camera" size={32} color="#2196F3" />
            <ButtonLabel>Cámara</ButtonLabel>
          </SelectionButton>

          <SelectionButton onPress={() => handlePickImage(false)}>
            <MaterialIcons name="photo-library" size={32} color="#2196F3" />
            <ButtonLabel>Galería</ButtonLabel>
          </SelectionButton>
        </ButtonRow>
      )}
    </MainContainer>
  );
};

export default ImageSelector;

const MainContainer = styled(View)`
  width: 100%;
`;

const ButtonRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const SelectionButton = styled.TouchableOpacity`
  width: 48%;
  height: 120px;
  border-width: 2px;
  border-color: #2196f3;
  border-style: dashed;
  border-radius: 12px;
  background-color: ${(props) => props.theme.background};
  justify-content: center;
  align-items: center;
`;

const ButtonLabel = styled(Text)`
  color: ${(props) => props.theme.tint};
  font-size: 13px;
  font-weight: bold;
  margin-top: 8px;
`;

const PreviewWrapper = styled(View)`
  width: 100%;
  height: 220px;
  border-radius: 15px;
  position: relative;
  overflow: visible;
`;

const StyledImage = styled.Image`
  width: 100%;
  height: 100%;
  border-radius: 15px;
`;

const DeleteBadge = styled.TouchableOpacity`
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #ff4444;
  width: 34px;
  height: 34px;
  border-radius: 17px;
  justify-content: center;
  align-items: center;
`;
