import { Text } from "@/components/Themed";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet } from "react-native";
import MapView, { Region } from "react-native-maps";
import styled from "styled-components/native";
interface MapPickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (coords: { latitude: number; longitude: number }) => void;
}

const MapPickerModal = ({ visible, onClose, onConfirm }: MapPickerProps) => {
  const mapRef = useRef<MapView>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region>({
    latitude: -32.8895,
    longitude: -68.844,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  useEffect(() => {
    if (visible) {
      getUserLocation();
    }
  }, [visible]);

  const getUserLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setRegion(userRegion);

      mapRef.current?.animateToRegion(userRegion, 1000);
    } catch (error) {
      console.log("Error al obtener ubicación inicial", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal visible={visible} animationType="slide">
      <Container>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={region}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        />

        <PinContainer pointerEvents="none">
          <MaterialIcons name="location-on" size={45} color="#F44336" />
          <PinShadow />
        </PinContainer>
        {loading && (
          <LoadingOverlay>
            <ActivityIndicator size="large" color="#2196f3" />
            <LoadingText>Buscandote...</LoadingText>
          </LoadingOverlay>
        )}

        <Header>
          <CircleButton onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#000" />
          </CircleButton>
          <HeaderText>Ubicá el problema</HeaderText>
        </Header>
        <Footer>
          <ConfirmButton onPress={() => onConfirm(region)}>
            <ButtonText>Confirmar Ubicación</ButtonText>
          </ConfirmButton>
        </Footer>
      </Container>
    </Modal>
  );
};
export default MapPickerModal;

const Container = styled.View`
  flex: 1;
`;

const Header = styled.View`
  position: absolute;
  top: 50px;
  flex-direction: row;
  align-items: center;
  width: 100%;
`;

const HeaderText = styled(Text)`
  background-color: white;
  padding: 10px 15px;
  border-radius: 20px;
  font-weight: bold;
  margin-left: 10px;
`;

const Footer = styled.View`
  position: absolute;
  bottom: 40px;
  width: 100%;
  align-items: center;
`;

const PinContainer = styled.View`
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -45px;
  margin-left: -22px;
  align-items: center;
`;

const PinShadow = styled.View`
  width: 10px;
  height: 4px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  margin-top: -2px;
`;

const LoadingOverlay = styled.View`
  position: absolute;
  top: 100px;
  align-self: center;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 20px;
  border-radius: 20px;
  flex-direction: row;
  align-items: center;
`;

const LoadingText = styled(Text)`
  margin-left: 10px;
  font-weight: bold;
  color: #2196f3;
`;

const ConfirmButton = styled.TouchableOpacity`
  background-color: #2196f3;
  padding: 15px 30px;
  border-radius: 30px;
`;

const ButtonText = styled(Text)`
  color: white;
  font-weight: bold;
  font-size: 16px;
`;

const CircleButton = styled.TouchableOpacity`
  width: 45px;
  height: 45px;
  background-color: white;
  border-radius: 22.5px;
  justify-content: center;
  align-items: center;
`;
