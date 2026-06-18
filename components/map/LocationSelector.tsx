import { MaterialIcons } from "@expo/vector-icons";
import { locationController } from "@/controllers/location.controller";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import styled from "styled-components/native";
import * as Network from "expo-network";

interface LocationSelectorProps {
  locationName: string | null;
  setLocationName: (name: string | null) => void;
  setCoords: (coords: { lat: number; lng: number } | null) => void;
  onOpenMapPicker: () => void;
}

const LocationSelector = ({
  locationName,
  setLocationName,
  setCoords,
  onOpenMapPicker,
}: LocationSelectorProps) => {
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        setIsOnline(!!(state.isConnected && state.isInternetReachable));
      } catch (error) {
        setIsOnline(true);
      }
    };
    checkConnection();
  }, []);

  const handleGps = async () => {
    setLoading(true);
    try {
      const hasPermission = await locationController.requestPermissionsAction();
      if (!hasPermission) {
        Alert.alert(
          "Permiso denegado",
          "Necesitamos GPS para ubicar el incidente.",
        );
        return;
      }
      const coords = await locationController.getCurrentLocationAction();
      if (!coords) {
        Alert.alert("Error", "No se pudo conectar con el satélite GPS.");
        return;
      }

      setCoords({
        lat: coords.latitude,
        lng: coords.longitude,
      });

      try {
        const address = await locationController.reverseGeocodeAction(
          coords.latitude,
          coords.longitude,
        );
        setLocationName(address);
      } catch (geocodeError) {
        console.log("Modo Offline: No se pudo traducir la dirección a texto.");
        setLocationName("Ubicación guardada (Sin conexión)");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el satélite GPS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <MainBar>
        {isOnline ? (
          <OptionButton onPress={onOpenMapPicker}>
            <MaterialIcons name="map" size={22} color="#2196f3" />
            <OptionText>Seleccionar en el Mapa</OptionText>
          </OptionButton>
        ) : (
          <OptionButton onPress={handleGps} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#2196f3" />
            ) : (
              <>
                <MaterialIcons name="gps-fixed" size={22} color="#2196f3" />
                <OptionText>Usar mis Coordenadas (Sin Conexión)</OptionText>
              </>
            )}
          </OptionButton>
        )}
      </MainBar>

      {locationName && (
        <SelectedAddressContainer>
          <MaterialIcons name="check-circle" size={16} color="#4caf50" />
          <AddressLabel numberOfLines={1}>{locationName}</AddressLabel>
        </SelectedAddressContainer>
      )}
    </Container>
  );
};
export default LocationSelector;

const Container = styled.View`
  width: 100%;
  margin-vertical: 10px;
`;

const MainBar = styled.View`
  width: 100%;
  height: 60px;
  background-color: ${(props) => props.theme.background};
  border-radius: 15px;
  border-width: 2px;
  border-color: #2196f3;
  border-style: dashed;
  flex-direction: row;
  overflow: hidden;
`;

const OptionButton = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 10px;
`;

const OptionText = styled.Text`
  color: #2196f3;
  font-weight: bold;
  margin-left: 8px;
  font-size: 14px;
`;

const SelectedAddressContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
`;

const AddressLabel = styled.Text`
  color: ${(props) => props.theme.text};
  font-size: 13px;
  margin-left: 5px;
  font-style: italic;
`;
