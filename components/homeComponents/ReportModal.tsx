import * as Location from "expo-location";
import { Dispatch, SetStateAction, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
} from "react-native";
import styled from "styled-components/native";
import { Text, TextInput, View } from "../Themed";
import DropdownComponent from "./DropDownComponent";
import ImageSelector from "./ImageSelector";
import LocationSelector from "./LocationSelector";
import MapPickerModal from "./MapPickerModal";

interface ReportModalProps {
  isModalVisible: boolean;
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
}

const ReportModal = ({
  isModalVisible,
  setIsModalVisible,
}: ReportModalProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setselectedCategory] = useState<string | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleConfirmLocation = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    setIsMapVisible(false);

    const reverse = await Location.reverseGeocodeAsync(coords);
    if (reverse.length > 0) {
      const addr = reverse[0];
      setSelectedLocation(`${addr.street} ${addr.name}, ${addr.subregion}`);
    }
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <ModalOverlay
        onPress={() => {
          Keyboard.dismiss();
          setIsModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%" }}
        >
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
          >
            <ModalContent
              onStartShouldSetResponder={() => {
                Keyboard.dismiss();
                return true;
              }}
            >
              <Indicator />
              <Title>Reportar Incidente</Title>

              <ImageSelector
                image={selectedImage}
                setImage={setSelectedImage}
              />

              <LocationSelector
                locationName={selectedLocation}
                setLocationName={setSelectedLocation}
                setCoords={setSelectedCoords}
                onOpenMapPicker={() => setIsMapVisible(true)}
              />

              <MapPickerModal
                visible={isMapVisible}
                onClose={() => setIsMapVisible(false)}
                onConfirm={handleConfirmLocation}
              />
              <DropdownComponent
                selectedCategory={selectedCategory}
                setselectedCategory={setselectedCategory}
              />

              <DescriptionText
                placeholder="Describa el problema aquí..."
                multiline={true}
              />

              <ButtonContainer>
                <CloseButton onPress={() => setIsModalVisible(false)}>
                  <Text style={{ color: "white" }}>Cerrar</Text>
                </CloseButton>
                <SentButton onPress={() => console.log("Enviado")}>
                  <Text style={{ color: "white" }}>Enviar</Text>
                </SentButton>
              </ButtonContainer>
            </ModalContent>
          </ScrollView>
        </KeyboardAvoidingView>
      </ModalOverlay>
    </Modal>
  );
};
export default ReportModal;

const ModalOverlay = styled.Pressable`
  flex: 1;
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

const Title = styled(Text)`
  font-size: 18;
  font-weight: bold;
  margin-bottom: 20;
`;

const ButtonContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const DescriptionText = styled(TextInput)`
  width: 100%;
  height: 160px;
  border-style: solid;
  border-color: #4e7ed0;
  background-color: ${(props) => props.theme.background};
  border-width: 2px;
  padding-left: 2%;
  border-radius: 10px;
`;

const CloseButton = styled.TouchableOpacity`
  margin-top: 20px;
  background-color: #ff4444;
  padding: 10px 20px;
  border-radius: 10px;
`;

const SentButton = styled.TouchableOpacity`
  margin-top: 20px;
  background-color: #0e9aec;
  padding: 10px 20px;
  border-radius: 10px;
`;
