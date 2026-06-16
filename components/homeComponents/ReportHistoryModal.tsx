import styled, { useTheme } from "styled-components/native";
import { Text, View } from "@/components/Themed";
import { useEffect, useState } from "react";
import { reportsController } from "@/controllers/reports.controller";
import { ReportHistoryResponse } from "@/models";
import { ActivityIndicator, FlatList, Modal } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { formatDate } from "@/utils/formatDate";

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
            <StateBadge style={{ backgroundColor: item.state.color }}>
              <StateBadgeText>{item.state.name}</StateBadgeText>
            </StateBadge>
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
      <Overlay>
        <ModalContainer>
          <ModalHeader>
            <ModalTitle>Historial de Estados</ModalTitle>
            <CloseIconButton onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </CloseIconButton>
          </ModalHeader>

          {isLoading ? (
            <LoaderContainer>
              <ActivityIndicator size="large" color={theme.tint} />
              <LoaderText>Cargando historial...</LoaderText>
            </LoaderContainer>
          ) : !history || history.length === 0 ? (
            <LoaderContainer>
              <MaterialIcons name="error-outline" size={40} color="red" />
              <LoaderText>No hay historial disponible.</LoaderText>
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

          <CloseButton onPress={onClose}>
            <CloseButtonText>Cerrar</CloseButtonText>
          </CloseButton>
        </ModalContainer>
      </Overlay>
    </Modal>
  );
};

export default ReportHistoryModal;

const Overlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
  justify-content: flex-end;
`;
const ModalContainer = styled.View`
  background-color: ${(props) => props.theme.background};
  padding: 25px;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  max-height: 75%;
  min-height: 40%;
`;
const LoaderContainer = styled.View`
  align-items: center;
  justify-content: center;
  padding: 40px 0;
`;
const LoaderText = styled.Text`
  margin-top: 10px;
  color: ${(props) => props.theme.text};
`;
const ModalHeader = styled.View`
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
const StateBadge = styled.View`
  padding: 3px 10px;
  border-radius: 8px;
`;
const StateBadgeText = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: #fff;
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
const CloseButton = styled.TouchableOpacity`
  background-color: ${(props: any) => props.theme.tint};
  padding: 15px;
  border-radius: 12px;
  align-items: center;
  margin-top: 10px;
`;
const CloseButtonText = styled.Text`
  font-weight: bold;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${(props) => props.theme.text};
`;
