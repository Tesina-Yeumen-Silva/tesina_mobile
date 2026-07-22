import styled from "styled-components/native";
import { Text, View } from "@/components/ui/Themed";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { reportsController } from "@/controllers/reports.controller";
import { UserReports } from "@/models";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Platform } from "react-native";
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

  switch (name) {
    case "bache":
      return "add-road";
    case "arbol":
      return "park";
    case "basura":
      return "delete-outline";
    case "acequia":
      return "water-drop";
    default:
      return "report-problem";
  }
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

const UserReportsList = () => {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(
    null,
  );

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
    queryKey: ["userReports"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await reportsController.getReportsByUserIdAction(pageParam);
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
    }, [refetch])
  );

  const reports = data?.pages.flatMap((page) => page.data) || [];

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
        <LoadingText>Cargando tus reportes...</LoadingText>
      </CenterContainer>
    );
  }

  if (isError) {
    Alert.alert("Error", error?.message || "Hubo un problema al cargar");
  }

  if (reports.length === 0) {
    return (
      <CenterContainer>
        <MaterialIcons name="fact-check" size={60} color="#ccc" />
        <EmptyText>Aún no has realizado ningún reporte.</EmptyText>
      </CenterContainer>
    );
  }

  return (
    <Container>
      <TitleText>Mis Reportes</TitleText>
      <FlatList
        data={reports}
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
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === "android"}
      />

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

const TitleText = styled.Text`
  color: ${(props) => props.theme.text};
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  padding: 15px;
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
  color: #666;
  font-size: 16px;
`;

const EmptyText = styled.Text`
  margin-top: 15px;
  color: #999;
  font-size: 16px;
  text-align: center;
`;

const ReportCard = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.theme.surface};
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 12px;
  elevation: 3;
  shadow-color: #000;
  shadow-opacity: 0.05;
  shadow-radius: 4px;
  shadow-offset: 0px 2px;
`;

const IconWrapper = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: ${(props) => props.theme.border};
  justify-content: center;
  align-items: center;
  margin-right: 15px;
`;

const InfoContainer = styled.View`
  flex: 1;
  justify-content: center;
`;

const CategoryText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${(props) => props.theme.text};
`;

const AddressText = styled.Text`
  font-size: 14px;
  color: ${(props) => props.theme.tint};
  margin-top: 2px;
`;

const DateText = styled.Text`
  font-size: 12px;
  color: ${(props) => props.theme.tint};
  margin-top: 4px;
`;



const HistoryButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-top: 6px;
  align-self: flex-start;
`;

const HistoryButtonText = styled.Text`
  font-size: 12px;
  color: #2196f3;
  margin-left: 4px;
  font-weight: 600;
`;
