import styled from "styled-components/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { reportsController } from "@/controllers/reports.controller";
import { categoryController } from "@/controllers/category.controller";
import { UserReports, Category } from "@/models";
import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { formatDate } from "@/utils/formatDate";
import ReportDetailModal from "./ReportDetailsModal";
import { useInfiniteQuery } from "@tanstack/react-query";
import ReportHistoryModal from "./ReportHistoryModal";
import { Badge } from "@/components/ui/Badge";
import { useFocusEffect } from "expo-router";

import { getCategoryIcon } from "@/utils/getCategoryIcon";

interface ReportCardItemProps {
  item: UserReports;
  onPress: (id: number) => void;
  onPressHistory: (id: number) => void;
}

const ReportCardItemComponent = ({
  item,
  onPress,
  onPressHistory,
}: ReportCardItemProps) => {
  const handlePress = useCallback(() => onPress(item.id), [onPress, item.id]);
  const handlePressHistory = useCallback(
    () => onPressHistory(item.id),
    [onPressHistory, item.id],
  );

  return (
    <TouchableOpacity
      style={cardStyles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={cardStyles.iconWrapper}>
        <MaterialIcons
          name={getCategoryIcon(item.categoryName)}
          size={28}
          color="#2196F3"
        />
      </View>
      <View style={cardStyles.infoContainer}>
        <Text style={cardStyles.categoryText} numberOfLines={1}>
          {item.categoryName}
        </Text>
        <Text style={cardStyles.addressText} numberOfLines={1}>
          {item.address}
        </Text>
        <Text style={cardStyles.dateText}>{formatDate(item.createdAt)}</Text>
        <TouchableOpacity
          style={cardStyles.historyButton}
          onPress={handlePressHistory}
          activeOpacity={0.7}
        >
          <Ionicons name="time-outline" size={12} color="#2196F3" />
          <Text style={cardStyles.historyButtonText}>Ver historial</Text>
        </TouchableOpacity>
      </View>
      <Badge
        text={item.stateName}
        color={item.stateColor}
        style={{ marginLeft: 10 }}
      />
    </TouchableOpacity>
  );
};

const ReportCardItem = React.memo(ReportCardItemComponent);

const STATES = [
  { label: "Todos los estados", value: null, color: "#7F8C8D" },
  { label: "Pendiente", value: "Pendiente", color: "#FF9800" },
  { label: "Validado", value: "Validado", color: "#4CAF50" },
  { label: "En Progreso", value: "En Progreso", color: "#2196F3" },
  { label: "Resuelto", value: "Resuelto", color: "#8BC34A" },
  { label: "Rechazado", value: "Rechazado", color: "#F44336" },
  { label: "Duplicado", value: "Duplicado", color: "#9E9E9E" },
];

const UserReportsList = () => {
  const [activeTab, setActiveTab] = useState<"mine" | "adhered">("mine");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(
    null,
  );

  const isFirstMount = useRef(true);
  const lastFetchRef = useRef(Date.now());

  useEffect(() => {
    (async () => {
      const fetched = await categoryController.getCategoriesAction();
      setCategories(fetched);
    })();
  }, []);

  const handlePressDetail = useCallback((id: number) => {
    setSelectedReportId(id);
  }, []);

  const handlePressHistory = useCallback((id: number) => {
    setSelectedHistoryId(id);
  }, []);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["userReports", activeTab],
    queryFn: async ({ pageParam = 1 }) => {
      lastFetchRef.current = Date.now();
      const res =
        activeTab === "mine"
          ? await reportsController.getReportsByUserIdAction(pageParam)
          : await reportsController.getAdheredReportsByUserIdAction(pageParam);
      return (
        res || {
          data: [],
          meta: { total: 0, page: 1, limit: 10, hasMore: false },
        }
      );
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasMore ? lastPage.meta.page + 1 : undefined;
    },
    staleTime: 1000 * 30, // 30s cache prevents unnecessary re-fetches and flash
    gcTime: 1000 * 60 * 5, // Keep cached pages in memory for 5 minutes
  });

  useFocusEffect(
    useCallback(() => {
      if (isFirstMount.current) {
        isFirstMount.current = false;
        return; // Don't trigger duplicate fetch on initial screen mount
      }
      // Only refetch on refocus if more than 25 seconds elapsed
      if (Date.now() - lastFetchRef.current > 25000) {
        refetch();
      }
    }, [refetch]),
  );

  const reports = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // 1. Filtrar por búsqueda de dirección o categoría
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchAddress = report.address?.toLowerCase().includes(query);
        const matchCategory = report.categoryName?.toLowerCase().includes(query);
        if (!matchAddress && !matchCategory) return false;
      }

      // 2. Filtrar por categoría seleccionada
      if (selectedCategory) {
        if (
          report.categoryName?.toLowerCase() !== selectedCategory.toLowerCase()
        ) {
          return false;
        }
      }

      // 3. Filtrar por estado seleccionado
      if (selectedState) {
        if (report.stateName?.toLowerCase() !== selectedState.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [reports, searchQuery, selectedCategory, selectedState]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color="#2196F3" />
      </View>
    );
  }, [isFetchingNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: UserReports }) => (
      <ReportCardItem
        item={item}
        onPress={handlePressDetail}
        onPressHistory={handlePressHistory}
      />
    ),
    [handlePressDetail, handlePressHistory],
  );

  useEffect(() => {
    if (isError) {
      Alert.alert("Error", error?.message || "Hubo un problema al cargar");
    }
  }, [isError, error]);

  return (
    <Container>
      <HeaderContainer>
        <TitleText>Mis Actividades</TitleText>

        {/* 1. Selector de Pestañas */}
        <TabsContainer>
          <TabButton
            active={activeTab === "mine"}
            onPress={() => setActiveTab("mine")}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={activeTab === "mine" ? "#FFFFFF" : "#7F8C8D"}
            />
            <TabText active={activeTab === "mine"}>Mis Reportes</TabText>
          </TabButton>
          <TabButton
            active={activeTab === "adhered"}
            onPress={() => setActiveTab("adhered")}
          >
            <Ionicons
              name="people-outline"
              size={18}
              color={activeTab === "adhered" ? "#FFFFFF" : "#7F8C8D"}
            />
            <TabText active={activeTab === "adhered"}>Adheridos</TabText>
          </TabButton>
        </TabsContainer>

        {/* 2. Barra de Búsqueda */}
        <SearchWrapper>
          <Ionicons
            name="search-outline"
            size={18}
            color="#7F8C8D"
            style={{ marginRight: 8 }}
          />
          <SearchInput
            placeholder="Buscar por dirección o categoría..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#95A5A6"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#95A5A6" />
            </TouchableOpacity>
          )}
        </SearchWrapper>
      </HeaderContainer>

      {/* 3. Filtros Horizontales (Categoría y Estado) */}
      <FiltersContainer>
        {/* Carrusel de Categorías */}
        <FilterScroll
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 8 }}
        >
          <CategoryPill
            selected={selectedCategory === null}
            onPress={() => setSelectedCategory(null)}
          >
            <PillText selected={selectedCategory === null}>
              Todas las categorías
            </PillText>
          </CategoryPill>
          {categories.map((cat) => (
            <CategoryPill
              key={cat.id}
              selected={selectedCategory === cat.name}
              onPress={() => setSelectedCategory(cat.name)}
            >
              <MaterialIcons
                name={getCategoryIcon(cat.name)}
                size={14}
                color={selectedCategory === cat.name ? "#FFFFFF" : "#555555"}
                style={{ marginRight: 5 }}
              />
              <PillText selected={selectedCategory === cat.name}>
                {cat.name}
              </PillText>
            </CategoryPill>
          ))}
        </FilterScroll>

        {/* Carrusel de Estados */}
        <FilterScroll
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 4 }}
        >
          <StatePill
            selected={selectedState === null}
            onPress={() => setSelectedState(null)}
            color="#7F8C8D"
          >
            <PillText selected={selectedState === null}>
              Todos los estados
            </PillText>
          </StatePill>
          {STATES.filter((s) => s.value !== null).map((st) => (
            <StatePill
              key={st.value}
              selected={selectedState === st.value}
              onPress={() => setSelectedState(st.value)}
              color={st.color}
            >
              <PillText selected={selectedState === st.value}>
                {st.label}
              </PillText>
            </StatePill>
          ))}
        </FilterScroll>
      </FiltersContainer>

      {/* 4. Listado de Reportes o Estado de Carga/Vacío */}
      {isLoading ? (
        <CenterContainer style={{ flex: 1, marginTop: 40 }}>
          <ActivityIndicator size="large" color="#2196F3" />
          <LoadingText>Cargando reportes...</LoadingText>
        </CenterContainer>
      ) : filteredReports.length === 0 ? (
        <CenterContainer style={{ flex: 1, marginTop: 40 }}>
          <MaterialIcons name="search-off" size={60} color="#ccc" />
          {reports.length === 0 ? (
            <EmptyText>
              {activeTab === "mine"
                ? "Aún no has realizado ningún reporte."
                : "Aún no te has adherido a ningún reporte."}
            </EmptyText>
          ) : (
            <View style={{ alignItems: "center" }}>
              <EmptyText>
                No se encontraron reportes con los filtros aplicados en esta página.
              </EmptyText>
              {hasNextPage && (
                <TouchableOpacity
                  onPress={handleLoadMore}
                  style={cardStyles.loadMoreButton}
                >
                  <Text style={cardStyles.loadMoreText}>
                    Buscar en siguientes páginas
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </CenterContainer>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshing={isFetching && !isFetchingNextPage && !isLoading}
          onRefresh={refetch}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === "android"}
        />
      )}

      {selectedReportId !== null && (
        <ReportDetailModal
          reportId={selectedReportId}
          onClose={() => setSelectedReportId(null)}
        />
      )}

      {selectedHistoryId !== null && (
        <ReportHistoryModal
          reportId={selectedHistoryId}
          onClose={() => setSelectedHistoryId(null)}
        />
      )}
    </Container>
  );
};

export default UserReportsList;

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F3F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  addressText: {
    fontSize: 13,
    color: "#7F8C8D",
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: "#BDC3C7",
    marginTop: 4,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#F0F3F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  historyButtonText: {
    fontSize: 11,
    color: "#2196F3",
    marginLeft: 4,
    fontWeight: "600",
  },
  loadMoreButton: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#2196F3",
    borderRadius: 8,
  },
  loadMoreText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});

const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.background || "#F5F7FA"};
`;

const HeaderContainer = styled.View`
  background-color: ${(props) => props.theme.surface || "#FFFFFF"};
  padding: 15px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.border || "#E0E0E0"};
`;

const TitleText = styled.Text`
  color: ${(props) => props.theme.text || "#2C3E50"};
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
`;

const TabsContainer = styled.View`
  flex-direction: row;
  background-color: ${(props) => props.theme.background || "#F0F3F6"};
  border-radius: 25px;
  padding: 4px;
  margin-bottom: 12px;
`;

const TabButton = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding-vertical: 10px;
  border-radius: 21px;
  background-color: ${(props) => (props.active ? "#2196F3" : "transparent")};
  elevation: ${(props) => (props.active ? 3 : 0)};
  shadow-color: ${(props) => (props.active ? "#2196F3" : "transparent")};
  shadow-opacity: ${(props) => (props.active ? 0.2 : 0)};
  shadow-radius: 3px;
  shadow-offset: 0px 2px;
`;

const TabText = styled.Text<{ active: boolean }>`
  font-size: 14px;
  font-weight: ${(props) => (props.active ? "bold" : "600")};
  color: ${(props) => (props.active ? "#FFFFFF" : "#7F8C8D")};
  margin-left: 6px;
`;

const SearchWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.theme.background || "#F0F3F6"};
  border-radius: 12px;
  padding-horizontal: 12px;
  height: 44px;
  border-width: 1px;
  border-color: ${(props) => props.theme.border || "#E0E0E0"};
`;

const SearchInput = styled.TextInput`
  flex: 1;
  color: ${(props) => props.theme.text || "#2C3E50"};
  font-size: 14px;
  padding-vertical: 0px;
`;

const FiltersContainer = styled.View`
  padding-vertical: 10px;
  background-color: ${(props) => props.theme.background || "#F5F7FA"};
`;

const FilterScroll = styled.ScrollView`
  margin-bottom: 4px;
`;

const CategoryPill = styled.TouchableOpacity<{ selected: boolean }>`
  padding-horizontal: 14px;
  padding-vertical: 8px;
  border-radius: 20px;
  background-color: ${(props) =>
    props.selected ? "#2196F3" : props.theme.surface || "#FFFFFF"};
  margin-right: 8px;
  border-width: 1px;
  border-color: ${(props) =>
    props.selected ? "#2196F3" : props.theme.border || "#E0E0E0"};
  elevation: 1;
  shadow-color: #000;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  shadow-offset: 0px 1px;
`;

const StatePill = styled.TouchableOpacity<{ selected: boolean; color: string }>`
  padding-horizontal: 14px;
  padding-vertical: 8px;
  border-radius: 20px;
  background-color: ${(props) =>
    props.selected ? props.color : props.theme.surface || "#FFFFFF"};
  margin-right: 8px;
  border-width: 1px;
  border-color: ${(props) =>
    props.selected ? props.color : props.theme.border || "#E0E0E0"};
  elevation: 1;
  shadow-color: #000;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  shadow-offset: 0px 1px;
`;

const PillText = styled.Text<{ selected: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${(props) =>
    props.selected ? "#FFFFFF" : props.theme.text || "#2C3E50"};
`;

const CenterContainer = styled.View`
  justify-content: center;
  align-items: center;
  background-color: transparent;
  padding: 20px;
`;

const LoadingText = styled.Text`
  margin-top: 10px;
  color: #7F8C8D;
  font-size: 16px;
`;

const EmptyText = styled.Text`
  margin-top: 15px;
  color: #95A5A6;
  font-size: 15px;
  text-align: center;
  line-height: 22px;
`;
