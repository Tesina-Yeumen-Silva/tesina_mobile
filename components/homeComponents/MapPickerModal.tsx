import { Text } from "@/components/Themed";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Region } from "react-native-maps";
import styled from "styled-components/native";
interface MapPickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (coords: { latitude: number; longitude: number }) => void;
}

interface PlaceResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
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

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (visible) {
      getUserLocation();
    } else {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [visible]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const searchAddress = async () => {
      if (debouncedQuery.length < 4) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const finalQuery = debouncedQuery.toLowerCase().includes("mendoza")
          ? debouncedQuery
          : `${debouncedQuery}, Mendoza`;

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            finalQuery,
          )}&countrycodes=ar&limit=5`,
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.log("Error buscando dirección:", error);
      } finally {
        setIsSearching(false);
      }
    };

    searchAddress();
  }, [debouncedQuery]);

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

  const handleSelectPlace = (place: PlaceResult) => {
    Keyboard.dismiss();
    setSearchResults([]);
    setSearchQuery(place.display_name);

    const newRegion = {
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };

    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <Container>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={region}
          onTouchStart={() => {
            Keyboard.dismiss();
            setSearchResults([]);
          }}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        />

        <Header>
          <CircleButton onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#000" />
          </CircleButton>
          <HeaderText>Ubicá el problema</HeaderText>
        </Header>

        <SearchContainer>
          <InputWrapper>
            <MaterialIcons name="search" size={24} color="#666" />
            <SearchInput
              placeholder="Buscar dirección en Mendoza..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {isSearching && <ActivityIndicator size="small" color="#2196f3" />}
            {searchQuery.length > 0 && !isSearching && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </InputWrapper>

          {searchResults.length > 0 && (
            <ResultsList
              data={searchResults}
              keyExtractor={(item: any) => item.place_id.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }: any) => (
                <ResultItem onPress={() => handleSelectPlace(item)}>
                  <MaterialIcons name="location-on" size={20} color="#2196F3" />
                  <ResultText numberOfLines={2}>{item.display_name}</ResultText>
                </ResultItem>
              )}
            />
          )}
        </SearchContainer>

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
  padding: 0 20px; 
  justify-content: space-between;
  z-index: 10;
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

const SearchContainer = styled.View`
  position: absolute;
  top: 110px; 
  width: 90%;
  align-self: center;
  z-index: 10;
`;

const InputWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  padding: 0 15px;
  height: 50px;
  elevation: 4;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  shadow-offset: 0px 2px;
`;

const SearchInput = styled(TextInput)`
  flex: 1;
  font-size: 16px;
  margin: 0 10px;
`;

const ResultsList = styled(FlatList)`
  background-color: white;
  border-radius: 8px;
  margin-top: 5px;
  max-height: 200px;
  elevation: 4;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  shadow-offset: 0px 2px;
`;

const ResultItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 15px;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

const ResultText = styled(Text)`
  margin-left: 10px;
  flex: 1;
  font-size: 14px;
  color: #333;
`;
