import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import MapView, { Region, Marker } from "react-native-maps";
import styled from "styled-components/native";
import ReportModal from "./ReportModal";
import * as Location from "expo-location";
import { ReportMaker } from "@/types/reports.types";
import { fetchMapMakers } from "@/api/reports.api";
import ReportDetailModal from "./ReportDetailsModal";

const MapHome = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReportDetailVisible, setIsReportDetailVisible] = useState<boolean>(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null)
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [markers, setMarkers] = useState<ReportMaker[]>([]);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const centerToUser = async () => {
    let loc = await Location.getLastKnownPositionAsync();
    if (mapRef.current && loc) {
      mapRef.current.animateToRegion(
        {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000,
      );
    }
  };

  const loadMarkersForRegion = async (region: Region) => {
    try {
      const data = await fetchMapMakers(region);
      setMarkers(data);
    } catch (error) {
      console.log("Error al cargar marcadores:", error);
    }
  };
  return (
    <Container>
      {isModalVisible && (
        <ReportModal isModalVisible setIsModalVisible={setIsModalVisible} />
      )}

      {selectedReportId !== null && (
        <ReportDetailModal 
          reportId={selectedReportId} 
          onClose={() => setSelectedReportId(null)} 
        />
      )}
      <Map
        ref={mapRef}
        userInterfaceStyle="light"
        showsUserLocation={true}
        initialRegion={{
          latitude: -32.8894,
          longitude: -68.8458,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onRegionChangeComplete={loadMarkersForRegion}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            onPress={() => setSelectedReportId(marker.id)}
            pinColor={marker.statusColor}
            title={`Reporte: ${marker.status}`}
            description="Toca para ver detalles"
          />
        ))}
      </Map>
      <CenterLocation onPress={centerToUser}>
        <Ionicons name="locate" size={32} />
      </CenterLocation>
      <FabButton onPress={() => setIsModalVisible(true)}>
        <MaterialIcons name="report-problem" size={32} />
      </FabButton>
    </Container>
  );
};
export default MapHome;

const Container = styled.View`
  flex: 1;
  background-color: #ffffff;
`;

const Map = styled(MapView)`
  width: 100%;
  height: 100%;
`;

const CenterLocation = styled.TouchableOpacity`
  position: absolute;
  bottom: 30px;
  right: 20px;
  background-color: #007aff;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  justify-content: center;
  align-items: center;
`;

const FabButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 30px;
  left: 20px;
  background-color: red;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  justify-content: center;
  align-items: center;
`;
