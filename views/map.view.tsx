import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components/native";
import { locationController } from "@/controllers/location.controller";
import { ReportMaker, Category, Region } from "@/models";
import { reportsController } from "@/controllers/reports.controller";
import ReportDetailModal from "@/components/reports/ReportDetailsModal";
import { useRouter } from "expo-router";
import { LeafletMapView, LeafletMapRef } from "@/components/map/LeafletMapView";
import { Alert, ScrollView, Text, View } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { categoryService } from "@/services/category.service";
import { stateService, ReportStateItem } from "@/services/state.service";

const MapViewHome = () => {
  const [isReportDetailVisible, setIsReportDetailVisible] =
    useState<boolean>(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [markers, setMarkers] = useState<ReportMaker[]>([]);
  const mapRef = useRef<LeafletMapRef | null>(null);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const router = useRouter();
  const [isFetchingMarkers, setIsFetchingMarkers] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchIdRef = useRef<number>(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [states, setStates] = useState<ReportStateItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);
  const [selectedStateId, setSelectedStateId] = useState<number | undefined>(
    undefined,
  );
  const currentRegionRef = useRef<Region | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      await locationController.requestPermissionsAction();

      try {
        const loc = await locationController.getCurrentLocationAction();
        if (loc) {
          setUserLocation({ latitude: loc.latitude, longitude: loc.longitude });
        }
      } catch (err) {
        console.log("Error getting location", err);
      }

      try {
        const [cats, stts] = await Promise.all([
          categoryService.getCategories(),
          stateService.getStates(),
        ]);
        setCategories(cats);
        const allowedMapStates = ["validado", "en progreso", "resuelto"];
        const visibleStates = (stts || []).filter((s) =>
          allowedMapStates.includes(s.name.toLowerCase().trim()),
        );
        setStates(visibleStates);
      } catch (err) {
        console.log("Error fetching filters", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (currentRegionRef.current) {
      loadMarkersForRegion(
        currentRegionRef.current,
        selectedCategoryId,
        selectedStateId,
      );
    }
  }, [selectedCategoryId, selectedStateId]);

  const centerToUser = async () => {
    const coords =
      (await locationController.getLastKnownLocationAction()) ||
      (await locationController.getCurrentLocationAction());
    if (coords) {
      setUserLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    }
  };

  const loadMarkersForRegion = useCallback(
    (region: Region, catId?: number, stId?: number) => {
      currentRegionRef.current = region;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(async () => {
        const currentFetchId = ++fetchIdRef.current;

        try {
          setIsFetchingMarkers(true);
          const data = await reportsController.fetchMapMakersAction(
            region,
            catId,
            stId,
          );
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
      }, 300);
    },
    [],
  );

  return (
    <Container>
      {selectedReportId !== null && (
        <ReportDetailModal
          reportId={selectedReportId}
          onClose={() => setSelectedReportId(null)}
        />
      )}
      <LeafletMapView
        ref={mapRef}
        userLocation={userLocation}
        initialRegion={{
          latitude: -32.8894,
          longitude: -68.8458,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        markers={markers.map((m) => ({
          id: m.id,
          latitude: m.latitude,
          longitude: m.longitude,
          color: m.statusColor,
        }))}
        onRegionChangeComplete={(region: Region) =>
          loadMarkersForRegion(region, selectedCategoryId, selectedStateId)
        }
        onMarkerPress={(id) => setSelectedReportId(id)}
      />

      <View
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          backgroundColor: "rgba(255,255,255,0.7)",
          paddingHorizontal: 5,
          paddingVertical: 2,
        }}
      >
        <Text style={{ fontSize: 10, color: "#333" }}>
          © OpenStreetMap contributors
        </Text>
      </View>

      <FiltersContainer pointerEvents="box-none">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, marginBottom: 8 }}
        >
          <Chip
            active={selectedCategoryId === undefined}
            onPress={() => setSelectedCategoryId(undefined)}
          >
            <ChipText active={selectedCategoryId === undefined}>
              Todas las categorías
            </ChipText>
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c.id}
              active={selectedCategoryId === c.id}
              onPress={() => setSelectedCategoryId(c.id)}
            >
              <ChipText active={selectedCategoryId === c.id}>{c.name}</ChipText>
            </Chip>
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
        >
          <Chip
            active={selectedStateId === undefined}
            onPress={() => setSelectedStateId(undefined)}
          >
            <ChipText active={selectedStateId === undefined}>
              Todos los estados
            </ChipText>
          </Chip>
          {states.map((s) => (
            <Chip
              key={s.id}
              active={selectedStateId === s.id}
              onPress={() => setSelectedStateId(s.id)}
            >
              <ChipText active={selectedStateId === s.id}>{s.name}</ChipText>
            </Chip>
          ))}
        </ScrollView>
      </FiltersContainer>

      <CenterLocation onPress={centerToUser}>
        <Ionicons name="locate" size={32} />
      </CenterLocation>
    </Container>
  );
};

export default MapViewHome;

const Container = styled.View`
  flex: 1;
  background-color: #ffffff;
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

const FiltersContainer = styled.View`
  position: absolute;
  top: 50px;
  left: 0;
  right: 0;
  padding: 0 15px;
  z-index: 100;
  elevation: 10;
`;

const Chip = styled.TouchableOpacity<{ active: boolean }>`
  background-color: ${(props) => (props.active ? "#007aff" : "#ffffff")};
  padding: 8px 16px;
  border-radius: 20px;
  margin-right: 8px;
  border: 1px solid ${(props) => (props.active ? "#007aff" : "#cccccc")};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
`;

const ChipText = styled.Text<{ active: boolean }>`
  color: ${(props) => (props.active ? "#ffffff" : "#333333")};
  font-weight: 600;
  font-size: 14px;
`;
