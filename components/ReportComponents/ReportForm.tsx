import React, { useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
} from "react-native";
import * as Location from "expo-location";
import { reportsController } from "@/controllers/reports.controller";
import { CreateReport } from "@/models";
import styled from "styled-components/native";
import { TextInput, View } from "../Themed";
import DropdownComponent from "../homeComponents/DropDownComponent";
import MapPickerModal from "../homeComponents/MapPickerModal";
import ImageSelector from "../homeComponents/ImageSelector";
import LocationSelector from "../homeComponents/LocationSelector";
import * as Network from "expo-network";
import { File } from "expo-file-system";
import { documentDirectory } from "expo-file-system/legacy";
import { saveOfflineReport } from "@/services/offlineStorage";

interface ReportFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const ReportForm = ({
  onSuccess,
  onCancel,
  isModal = false,
}: ReportFormProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setselectedCategory] = useState<string | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleConfirmLocation = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    setIsMapVisible(false);

    setSelectedCoords({
      lat: coords.latitude,
      lng: coords.longitude,
    });

    try {
      const reverse = await Location.reverseGeocodeAsync(coords);
      if (reverse.length > 0) {
        const addr = reverse[0];
        const street = addr.street || addr.name || "Ubicación seleccionada";
        const subregion = addr.subregion ? `, ${addr.subregion}` : "";

        setSelectedLocation(`${street}${subregion}`);
      }
    } catch (error) {
      console.log("Error al obtener la dirección:", error);
      setSelectedLocation("Ubicación seleccionada en el mapa");
    }
  };

  const handleSend = async () => {
    if (!selectedImage)
      return Alert.alert(
        "Falta foto",
        "Por favor, adjunta una imagen del problema.",
      );
    if (!selectedCoords || !selectedLocation)
      return Alert.alert(
        "Falta ubicación",
        "Por favor, selecciona la ubicación en el mapa.",
      );
    if (!selectedCategory)
      return Alert.alert(
        "Falta categoría",
        "Por favor, selecciona una categoría.",
      );
    if (!description.trim())
      return Alert.alert(
        "Falta descripción",
        "Por favor, escribe una breve descripción.",
      );

    try {
      setIsLoading(true);

      const networkState = await Network.getNetworkStateAsync();
      if (networkState.isConnected && networkState.isInternetReachable) {
        const payload: CreateReport = {
          address: selectedLocation,
          latitude: selectedCoords.lat,
          longitude: selectedCoords.lng,
          description: description,
          isAnonymous: isAnonymous,
          categoryId: Number(selectedCategory),
          image: selectedImage,
        };

        const result = await reportsController.createReportAction(payload);

        if (result.ok) {
          Alert.alert("¡Gracias!", "Tu reporte ha sido enviado exitosamente.");

          setSelectedImage(null);
          setSelectedLocation(null);
          setSelectedCoords(null);
          setselectedCategory(null);
          setDescription("");

          if (onSuccess) onSuccess();
        } else {
          Alert.alert("Error", result.error || "Hubo un problema al enviar el reporte. Intenta de nuevo.");
        }
      } else {
        const filename = selectedImage.split("/").pop();
        const permanentImageUri = `${documentDirectory}offline_${Date.now()}_${filename}`;

        const originalFile = new File(selectedImage);
        const destinationFile = new File(permanentImageUri);

        await originalFile.copy(destinationFile);

        const reportData = {
          address: selectedLocation,
          latitude: selectedCoords.lat,
          longitude: selectedCoords.lng,
          description: description,
          isAnonymous: isAnonymous,
          categoryId: Number(selectedCategory),
        };

        saveOfflineReport(reportData, permanentImageUri);

        Alert.alert(
          "Reporte Guardado 💾",
          "No tienes conexión a internet. Tu reporte ha sido guardado de forma segura y se enviará automáticamente cuando recuperes la señal.",
        );

        setSelectedImage(null);
        setSelectedLocation(null);
        setSelectedCoords(null);
        setselectedCategory(null);
        setDescription("");

        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.log("Error enviando reporte:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al enviar el reporte. Intenta de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSwitch = () => setIsAnonymous((previousState) => !previousState);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ width: "100%", flex: 1 }}
    >
      <ScrollView
        ref={scrollViewRef}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: isModal ? "flex-end" : "center",
        }}
      >
        <ModalContent
          onStartShouldSetResponder={() => {
            Keyboard.dismiss();
            return true;
          }}
        >
          {onCancel && <Indicator />}
          <Title>Reportar Incidente</Title>

          <AnonymousContainer>
            <AnonymousText>Reporte anonimo</AnonymousText>
            <Switch
              trackColor={{ false: "red", true: "white" }}
              thumbColor={isAnonymous ? "#2196f3" : "#1e1c1e"}
              onValueChange={toggleSwitch}
              value={isAnonymous}
            />
          </AnonymousContainer>

          <ImageSelector image={selectedImage} setImage={setSelectedImage} />

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
            value={description}
            onChangeText={setDescription}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 150);
            }}
          />

          <ButtonContainer
            style={{
              justifyContent: onCancel ? "space-between" : "flex-end",
            }}
          >
            {onCancel && (
              <CloseButton onPress={onCancel} disabled={isLoading}>
                <Text style={{ color: "white" }}>Cerrar</Text>
              </CloseButton>
            )}

            <SentButton onPress={handleSend} disabled={isLoading}>
              <Text style={{ color: "white" }}>
                {isLoading ? "Enviando..." : "Enviar"}
              </Text>
            </SentButton>
          </ButtonContainer>
        </ModalContent>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: ${(props) => props.theme.text};
`;

const AnonymousContainer = styled(View)`
  flex: 1;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
`;

const AnonymousText = styled(Text)`
  font-size: 12px;
  font-weight: bold;
  color: ${(props) => props.theme.text};
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
