import styled, { useTheme } from "styled-components/native";
import { Text, View, ModalOverlay, ModalBottomSheet, LoaderContainer } from "@/components/ui/Themed";
import { useEffect, useState } from "react";
import { reportsController } from "@/controllers/reports.controller";
import { ReportHistoryResponse } from "@/models";
import { ActivityIndicator, FlatList, Modal } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { formatDate } from "@/utils/formatDate";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface props {
  reportId: number;
  onClose: () => void;
}

const ReportHistoryModal = ({ reportId, onClose }: props) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [history, setHistory] = useState<ReportHistoryResponse | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await reportsController.getHistoryByReportIdAction(reportId);
        setHistory(data);
      } catch (error) {
        console.log("Error al cargar detalle:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [reportId]);

  const sortedHistory = history
    ? [...history].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
    : [];

  const renderItem = ({
    item,
    index,
  }: {
    item: ReportHistoryResponse[number];
    index: number;
  }) => {
    const isLast = index === sortedHistory.length - 1;
    return (
      <HistoryItem>
        <TimelineColumn>
          <StateDot style={{ backgroundColor: item.state.color }} />
          {!isLast && <TimelineLine />}
        </TimelineColumn>
        <ItemContent>
          <ItemHeader>
            <Badge text={item.state.name} color={item.state.color} />
            <ItemDate>{formatDate(item.createdAt)}</ItemDate>
          </ItemHeader>
          <ObservationText>{item.observation}</ObservationText>
        </ItemContent>
      </HistoryItem>
    );
  };
  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <ModalOverlay>
        <ModalBottomSheet style={{ maxHeight: "75%" }}>
          <ModalHeader>
            <ModalTitle>Historial de Estados</ModalTitle>
            <CloseIconButton onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </CloseIconButton>
          </ModalHeader>

          {isLoading ? (
            <LoaderContainer>
              <ActivityIndicator size="large" color={theme.tint} />
              <Text style={{ marginTop: 10, color: theme.text }}>Cargando historial...</Text>
            </LoaderContainer>
          ) : !history || history.length === 0 ? (
            <LoaderContainer>
              <MaterialIcons name="error-outline" size={40} color="red" />
              <Text style={{ marginTop: 10, color: theme.text }}>No hay historial disponible.</Text>
            </LoaderContainer>
          ) : (
            <FlatList
              data={sortedHistory}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}

          <Button label="Cerrar" variant="close" onPress={onClose} style={{ marginTop: 10 }} />
        </ModalBottomSheet>
      </ModalOverlay>
    </Modal>
  );
};

export default ReportHistoryModal;

const ModalHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;
const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${(props) => props.theme.text};
`;
const CloseIconButton = styled.TouchableOpacity`
  padding: 4px;
`;
const HistoryItem = styled.View`
  flex-direction: row;
  margin-bottom: 4px;
`;
const TimelineColumn = styled.View`
  align-items: center;
  margin-right: 14px;
  width: 14px;
`;
const StateDot = styled.View`
  width: 14px;
  height: 14px;
  border-radius: 7px;
  margin-top: 4px;
`;
const TimelineLine = styled.View`
  width: 2px;
  flex: 1;
  background-color: ${(props) => props.theme.border};
  margin-top: 4px;
  min-height: 20px;
`;
const ItemContent = styled.View`
  flex: 1;
  padding-bottom: 20px;
`;
const ItemHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`;
const ItemDate = styled.Text`
  font-size: 11px;
  color: ${(props) => props.theme.text};
  opacity: 0.6;
`;
const ObservationText = styled.Text`
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => props.theme.text};
  opacity: 0.8;
`;
