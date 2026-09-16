import { Text } from "@/components/ui/Themed";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Region, UrlTile } from "react-native-maps";
import styled from "styled-components/native";
import { locationController } from "@/controllers/location.controller";
import { PlaceResult } from "@/models";

interface MapPickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (coords: { latitude: number; longitude: number }) => void;
  initialCoords?: { latitude: number; longitude: number } | null;
}

const MapPickerModal = ({ visible, onClose, onConfirm, initialCoords }: MapPickerProps) => {
  const mapRef = useRef<MapView>(null);
  const isMapReadyRef = useRef<boolean>(false);
  const pendingRegionRef = useRef<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const currentRegionRef = useRef<Region>({
    latitude: initialCoords?.latitude || -32.8895,
    longitude: initialCoords?.longitude || -68.844,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const moveToCoords = (latitude: number, longitude: number) => {
    const targetRegion = {
      latitude,
      longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    currentRegionRef.current = targetRegion;
    if (isMapReadyRef.current && mapRef.current) {
      mapRef.current.animateToRegion(targetRegion, 800);
    } else {
      pendingRegionRef.current = targetRegion;
    }
  };

  const getUserLocation = async () => {
    setLoading(true);
    try {
      if (initialCoords) {
        moveToCoords(initialCoords.latitude, initialCoords.longitude);
        setLoading(false);
        return;
      }

      // 1. Ubicación inmediata desde caché / última conocida
      const lastKnown = await locationController.getLastKnownLocationAction();
      if (lastKnown) {
        moveToCoords(lastKnown.latitude, lastKnown.longitude);
        setLoading(false);
      }

      // 2. Ubicación GPS precisa en tiempo real
      const freshCoords = await locationController.getCurrentLocationAction();
      if (freshCoords) {
        moveToCoords(freshCoords.latitude, freshCoords.longitude);
      }
    } catch (error) {
      console.log("Error al obtener ubicación inicial", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      getUserLocation();
    } else {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [visible]);

  const handleMapReady = () => {
    isMapReadyRef.current = true;
    if (pendingRegionRef.current && mapRef.current) {
      mapRef.current.animateToRegion(pendingRegionRef.current, 800);
      pendingRegionRef.current = null;
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

    currentRegionRef.current = newRegion;
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Container>
        <Map
          ref={mapRef}
          userInterfaceStyle="light"
          mapType={Platform.OS === "android" ? "none" : "standard"}
          initialRegion={{
            latitude: -32.8895,
            longitude: -68.844,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          onMapReady={handleMapReady}
          onTouchStart={() => {
            Keyboard.dismiss();
          }}
          onRegionChangeComplete={(newRegion) => {
            currentRegionRef.current = newRegion;
          }}
        >
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            tileSize={256}
            shouldReplaceMapContent={true}
            tileCachePath={`${Platform.OS === 'android' ? 'file://' : ''}/data/osm_tiles`}
            tileCacheMaxAge={86400}
          />
        </Map>

        <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 5, paddingVertical: 2, zIndex: 5 }}>
          <Text style={{ fontSize: 10, color: '#333' }}>© OpenStreetMap contributors</Text>
        </View>

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
              <TouchableOpacity onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </InputWrapper>

          {searchResults.length > 0 && (
            <ResultsList
              data={searchResults}
              keyExtractor={(item: any) => item.place_id.toString()}
              keyboardShouldPersistTaps="always"
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

        <LocateButton onPress={getUserLocation} activeOpacity={0.8}>
          <Ionicons name="locate" size={24} color="#007aff" />
        </LocateButton>

        <Footer>
          <ConfirmButton onPress={() => onConfirm(currentRegionRef.current)}>
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
  width: 100%;
  height: 100%;
  background-color: #ffffff;
`;

const Map = styled(MapView)`
  width: 100%;
  height: 100%;
`;

const LocateButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 110px;
  right: 20px;
  background-color: white;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  justify-content: center;
  align-items: center;
  elevation: 5;
  shadow-color: #000;
  shadow-opacity: 0.15;
  shadow-radius: 4px;
  shadow-offset: 0px 2px;
  z-index: 20;
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
  color: black;
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
  z-index: 100;
  elevation: 10;
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
  color: #1a1a1a;
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
