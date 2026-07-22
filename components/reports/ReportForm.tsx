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
import { reportsController } from "@/controllers/reports.controller";
import { locationController } from "@/controllers/location.controller";
import { CreateReport } from "@/models";
import styled from "styled-components/native";
import { TextInput, View } from "../ui/Themed";
import { Button } from "../ui/Button";
import DropdownComponent from "../shared/DropDownComponent";
import MapPickerModal from "../map/MapPickerModal";
import ImageSelector from "../shared/ImageSelector";
import LocationSelector from "../map/LocationSelector";

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
      const address = await locationController.reverseGeocodeAction(
        coords.latitude,
        coords.longitude,
      );
      setSelectedLocation(address);
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
        if (result.data?.offline) {
          Alert.alert(
            "Reporte Guardado 💾",
            "No tienes conexión a internet. Tu reporte ha sido guardado de forma segura y se enviará automáticamente cuando recuperes la señal.",
          );
        } else {
          Alert.alert("¡Gracias!", "Tu reporte ha sido enviado exitosamente.");
        }

        setSelectedImage(null);
        setSelectedLocation(null);
        setSelectedCoords(null);
        setselectedCategory(null);
        setDescription("");

        if (onSuccess) onSuccess();
      } else {
        Alert.alert("Error", result.error || "Hubo un problema al enviar el reporte. Intenta de nuevo.");
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
              <Button
                label="Cerrar"
                variant="danger"
                onPress={onCancel}
                disabled={isLoading}
                style={{ marginTop: 20 }}
              />
            )}

            <Button
              label="Enviar"
              variant="primary"
              onPress={handleSend}
              isLoading={isLoading}
              style={{ marginTop: 20 }}
            />
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


