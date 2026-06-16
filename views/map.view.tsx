import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MapView, { Region, Marker, UrlTile } from "react-native-maps";
import styled from "styled-components/native";
import ReportModal from "@/components/homeComponents/ReportModal";
import { locationController } from "@/controllers/location.controller";
import { ReportMaker } from "@/models";
import { reportsController } from "@/controllers/reports.controller";
import ReportDetailModal from "@/components/homeComponents/ReportDetailsModal";
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, Platform } from "react-native";
import { useAuthStore } from "@/store/authStore";

const MapViewHome = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReportDetailVisible, setIsReportDetailVisible] =
    useState<boolean>(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [markers, setMarkers] = useState<ReportMaker[]>([]);
  const mapRef = useRef<MapView | null>(null);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const router = useRouter();
  const [isFetchingMarkers, setIsFetchingMarkers] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchIdRef = useRef<number>(0);

  useEffect(() => {
    (async () => {
      await locationController.requestPermissionsAction();
    })();
  }, []);

  const handleOpenReportModal = () => {
    if (isLoggedIn) {
      setIsModalVisible(true);
    } else {
      Alert.alert(
        "Identificación requerida",
        "Para reportar incidentes en la vía pública necesitas tener una cuenta activa. ¿Quieres iniciar sesión ahora?",
        [
          { text: "Después", style: "cancel" },
          {
            text: "Ir al Login",
            onPress: () => router.push("/login"),
          },
        ],
      );
    }
  };

  const centerToUser = async () => {
    const coords = await locationController.getLastKnownLocationAction() || await locationController.getCurrentLocationAction();
    if (mapRef.current && coords) {
      mapRef.current.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000,
      );
    }
  };

  const loadMarkersForRegion = useCallback((region: Region) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      const currentFetchId = ++fetchIdRef.current;

      try {
        setIsFetchingMarkers(true);
        const data = await reportsController.fetchMapMakersAction(region);
        if (currentFetchId === fetchIdRef.current) {
          setMarkers(data);
        }
      } catch (error) {
        console.log("Error al cargar marcadores:", error);
      } finally {
        if (currentFetchId === fetchIdRef.current) {
          setIsFetchingMarkers(false);
        }
      }
    }, 500);
  }, []);

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
        mapType={Platform.OS === "android" ? "none" : "standard"}
        initialRegion={{
          latitude: -32.8894,
          longitude: -68.8458,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onRegionChangeComplete={loadMarkersForRegion}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          tileSize={256}
          shouldReplaceMapContent={true}
        />
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
            tracksViewChanges={false}
          />
        ))}
      </Map>
      <CenterLocation onPress={centerToUser}>
        <Ionicons name="locate" size={32} />
      </CenterLocation>
      <FabButton onPress={handleOpenReportModal}>
        <MaterialIcons name="report-problem" size={32} />
      </FabButton>
    </Container>
  );
};

export default MapViewHome;

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
