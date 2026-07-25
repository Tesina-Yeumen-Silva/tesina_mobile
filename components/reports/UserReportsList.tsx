import styled from "styled-components/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { reportsController } from "@/controllers/reports.controller";
import { categoryController } from "@/controllers/category.controller";
import { UserReports, Category } from "@/models";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Platform, View, TouchableOpacity } from "react-native";
import { formatDate } from "@/utils/formatDate";
import ReportDetailModal from "./ReportDetailsModal";
import { useInfiniteQuery } from "@tanstack/react-query";
import ReportHistoryModal from "./ReportHistoryModal";
import { Badge } from "@/components/ui/Badge";
import { useFocusEffect } from "expo-router";

const getCategoryIcon = (
  categoryName: string,
): keyof typeof MaterialIcons.glyphMap => {
  const name = categoryName.toLowerCase();

  if (name.includes("bache") || name.includes("paviment")) {
    return "add-road";
  }
  if (name.includes("arbol") || name.includes("verde") || name.includes("espacio")) {
    return "park";
  }
  if (name.includes("basura") || name.includes("higiene")) {
    return "delete-outline";
  }
  if (name.includes("acequia") || name.includes("drenaje")) {
    return "water-drop";
  }
  return "report-problem";
};

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
  return (
    <ReportCard onPress={() => onPress(item.id)}>
      <IconWrapper>
        <MaterialIcons
          name={getCategoryIcon(item.categoryName)}
          size={28}
          color="#2196F3"
        />
      </IconWrapper>
      <InfoContainer>
        <CategoryText numberOfLines={1}>{item.categoryName}</CategoryText>
        <AddressText numberOfLines={1}>{item.address}</AddressText>
        <DateText>{formatDate(item.createdAt)}</DateText>
        <HistoryButton onPress={() => onPressHistory(item.id)}>
          <Ionicons name="time-outline" size={12} color="#2196F3" />
          <HistoryButtonText>Ver historial</HistoryButtonText>
        </HistoryButton>
      </InfoContainer>
      <Badge text={item.stateName} color={item.stateColor} style={{ marginLeft: 10 }} />
    </ReportCard>
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
      const res = activeTab === "mine"
        ? await reportsController.getReportsByUserIdAction(pageParam)
        : await reportsController.getAdheredReportsByUserIdAction(pageParam);
      return res || { data: [], meta: { total: 0, page: 1, limit: 10, hasMore: false } };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasMore ? lastPage.meta.page + 1 : undefined;
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch, activeTab])
  );

  const reports = data?.pages.flatMap((page) => page.data) || [];

  const filteredReports = reports.filter((report) => {
    // 1. Filtrar por búsqueda de dirección o categoría
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const matchAddress = report.address?.toLowerCase().includes(query);
      const matchCategory = report.categoryName?.toLowerCase().includes(query);
      if (!matchAddress && !matchCategory) return false;
    }

    // 2. Filtrar por categoría seleccionada
    if (selectedCategory) {
      if (report.categoryName?.toLowerCase() !== selectedCategory.toLowerCase()) {
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

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color="#2196F3" />
      </View>
    );
  };

  if (isLoading) {
    return (
      <CenterContainer>
        <ActivityIndicator size="large" color="#2196F3" />
        <LoadingText>Cargando reportes...</LoadingText>
      </CenterContainer>
    );
  }

  if (isError) {
    Alert.alert("Error", error?.message || "Hubo un problema al cargar");
  }

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
          <Ionicons name="search-outline" size={18} color="#7F8C8D" style={{ marginRight: 8 }} />
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
        <FilterScroll horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 8 }}>
          <CategoryPill 
            selected={selectedCategory === null} 
            onPress={() => setSelectedCategory(null)}
          >
            <PillText selected={selectedCategory === null}>Todas las categorías</PillText>
          </CategoryPill>
          {categories.map((cat) => (
            <CategoryPill 
              key={cat.id} 
              selected={selectedCategory === cat.name} 
              onPress={() => setSelectedCategory(cat.name)}
            >
              <PillText selected={selectedCategory === cat.name}>{cat.name}</PillText>
            </CategoryPill>
          ))}
        </FilterScroll>

        {/* Carrusel de Estados */}
        <FilterScroll horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 4 }}>
          <StatePill 
            selected={selectedState === null} 
            onPress={() => setSelectedState(null)}
            color="#7F8C8D"
          >
            <PillText selected={selectedState === null}>Todos los estados</PillText>
          </StatePill>
          {STATES.filter(s => s.value !== null).map((st) => (
            <StatePill 
              key={st.value} 
              selected={selectedState === st.value} 
              onPress={() => setSelectedState(st.value)}
              color={st.color}
            >
              <PillText selected={selectedState === st.value}>{st.label}</PillText>
            </StatePill>
          ))}
        </FilterScroll>
      </FiltersContainer>

      {/* 4. Listado de Reportes Filtrados */}
      {filteredReports.length === 0 ? (
        <CenterContainer>
          <MaterialIcons name="search-off" size={60} color="#ccc" />
          {reports.length === 0 ? (
            <EmptyText>
              {activeTab === "mine"
                ? "Aún no has realizado ningún reporte."
                : "Aún no te has adherido a ningún reporte."}
            </EmptyText>
          ) : (
            <EmptyText>No se encontraron reportes con los filtros aplicados.</EmptyText>
          )}
        </CenterContainer>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ReportCardItem
              item={item}
              onPress={handlePressDetail}
              onPressHistory={handlePressHistory}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshing={isFetching && !isFetchingNextPage}
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
  background-color: ${(props) => (props.selected ? "#2196F3" : props.theme.surface || "#FFFFFF")};
  margin-right: 8px;
  border-width: 1px;
  border-color: ${(props) => (props.selected ? "#2196F3" : props.theme.border || "#E0E0E0")};
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
  background-color: ${(props) => (props.selected ? props.color : props.theme.surface || "#FFFFFF")};
  margin-right: 8px;
  border-width: 1px;
  border-color: ${(props) => (props.selected ? props.color : props.theme.border || "#E0E0E0")};
  elevation: 1;
  shadow-color: #000;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  shadow-offset: 0px 1px;
`;

const PillText = styled.Text<{ selected: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${(props) => (props.selected ? "#FFFFFF" : props.theme.text || "#2C3E50")};
`;

const ReportCard = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.theme.surface || "#FFFFFF"};
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 12px;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.06;
  shadow-radius: 4px;
  shadow-offset: 0px 2px;
`;

const IconWrapper = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: ${(props) => props.theme.background || "#F0F3F6"};
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  border-width: 1px;
  border-color: ${(props) => props.theme.border || "#E0E0E0"};
`;

const InfoContainer = styled.View`
  flex: 1;
  justify-content: center;
`;

const CategoryText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${(props) => props.theme.text || "#2C3E50"};
`;

const AddressText = styled.Text`
  font-size: 13px;
  color: #7F8C8D;
  margin-top: 2px;
`;

const DateText = styled.Text`
  font-size: 11px;
  color: #BDC3C7;
  margin-top: 4px;
`;

const HistoryButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
  align-self: flex-start;
  background-color: ${(props) => props.theme.background || "#F0F3F6"};
  padding-horizontal: 8px;
  padding-vertical: 4px;
  border-radius: 6px;
`;

const HistoryButtonText = styled.Text`
  font-size: 11px;
  color: #2196F3;
  margin-left: 4px;
  font-weight: 600;
`;

const CenterContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.background || "#F5F7FA"};
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
