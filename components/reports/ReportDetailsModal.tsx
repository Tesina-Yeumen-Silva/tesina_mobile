import { useEffect, useState } from "react";
import { ReportDetails } from "@/models";
import styled, { useTheme } from "styled-components/native";
import { reportsController } from "@/controllers/reports.controller";
import {
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  View,
  ModalOverlay,
  ModalBottomSheet,
  LoaderContainer,
  InfoRow,
} from "../ui/Themed";
import { Image } from "expo-image";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { formatDate } from "@/utils/formatDate";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

interface Props {
  reportId: number;
  onClose: () => void;
}

import { getCategoryIcon } from "@/utils/getCategoryIcon";
import ReportHistoryModal from "./ReportHistoryModal";

const ReportDetailModal = ({ reportId, onClose }: Props) => {
  const [reportData, setReportData] = useState<ReportDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isFullScreenImageVisible, setIsFullScreenImageVisible] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setIsLoading(true);
        const data = await reportsController.fetchReportByIdAction(reportId);
        setReportData(data);
      } catch (error) {
        console.log("Error al cargar detalle:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [reportId]);

  const toggleAdhesionHandler = async () => {
    const result = await reportsController.toggleAdhesionAction(reportId);

    if (result.ok && result.data) {
      setReportData((prevData) => {
        if (!prevData) return null;

        return {
          ...prevData,
          adhesionsCount: result.data!.adhered
            ? prevData.adhesionsCount + 1
            : prevData.adhesionsCount - 1,
        };
      });
    } else {
      Alert.alert("Aviso", result.error || "Error al registrar apoyo");
    }
  };

  return (
    <>
      <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <ModalOverlay>
        <ModalBottomSheet style={{ maxHeight: "85%" }}>
          {isLoading ? (
            <LoaderContainer>
              <ActivityIndicator size="large" color={theme.tint} />
              <Text style={{ marginTop: 10, color: theme.text }}>
                Cargando Reporte...
              </Text>
            </LoaderContainer>
          ) : reportData ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Header>
                <CategoryBadgeWrapper>
                  <CategoryPill style={{ borderColor: theme.border }}>
                    <MaterialIcons
                      name={getCategoryIcon(reportData.category)}
                      size={15}
                      color="#2196F3"
                    />
                    <CategoryText numberOfLines={1}>
                      {reportData.category.toUpperCase()}
                    </CategoryText>
                  </CategoryPill>
                </CategoryBadgeWrapper>
                <MetaInfoWrapper>
                  <StatusWrapper
                    onPress={() => setIsHistoryVisible(true)}
                    activeOpacity={0.7}
                  >
                    <StatusDot
                      style={{ backgroundColor: reportData.statusColor }}
                    />
                    <StatusText>{reportData.status}</StatusText>
                    <MaterialIcons
                      name="history"
                      size={14}
                      color={reportData.statusColor}
                      style={{ marginLeft: 3 }}
                    />
                  </StatusWrapper>
                  <DateText>{formatDate(reportData.updatedState)}</DateText>
                </MetaInfoWrapper>
              </Header>
              {reportData.imageUrl && (
                <ImageContainer>
                  {isImageVisible ? (
                    <ImagePreviewWrapper
                      onPress={() => setIsFullScreenImageVisible(true)}
                      activeOpacity={0.85}
                    >
                      <ReportImage
                        source={reportData.imageUrl}
                        contentFit="contain"
                        cachePolicy="disk"
                        recyclingKey={reportData.imageUrl}
                        transition={300}
                      />
                      <ZoomHintBadge>
                        <Ionicons name="expand" size={13} color="#ffffff" />
                        <ZoomHintText>Toca para ampliar</ZoomHintText>
                      </ZoomHintBadge>
                    </ImagePreviewWrapper>
                  ) : (
                    <ShowImageButton onPress={() => setIsImageVisible(true)}>
                      <Ionicons
                        name="image-outline"
                        size={24}
                        color={
                          theme.background === "#000" ? "#000000" : "#ffffff"
                        }
                      />
                      <ShowImageText>Ver foto del reporte</ShowImageText>
                    </ShowImageButton>
                  )}
                </ImageContainer>
              )}

              <TitleContainer>
                <Title>Detalle del Reporte</Title>
                <AdhesionContainer onPress={toggleAdhesionHandler}>
                  <MaterialIcons name="thumb-up" size={20} color={theme.tint} />
                  <AdhesionText>{reportData.adhesionsCount}</AdhesionText>
                </AdhesionContainer>
              </TitleContainer>

              <InfoRow>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={theme.text}
                />
                <InfoText>
                  {reportData.address || "Ubicación en el mapa"}
                </InfoText>
              </InfoRow>

              <InfoRow>
                <Ionicons name="person-outline" size={20} color={theme.text} />
                <InfoText>Reportado por: {reportData.reporterName}</InfoText>
              </InfoRow>

              <InfoRow>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.text}
                />
                <InfoText>Fecha: {formatDate(reportData.createdAt)}</InfoText>
              </InfoRow>

              <DescriptionContainer>
                <DescriptionTitle>Descripción</DescriptionTitle>
                <DescriptionText>{reportData.description}</DescriptionText>
              </DescriptionContainer>

              <Button label="Cerrar" variant="close" onPress={onClose} />

              {isHistoryVisible && (
                <ReportHistoryModal
                  reportId={reportId}
                  onClose={() => setIsHistoryVisible(false)}
                />
              )}
            </ScrollView>
          ) : (
            <LoaderContainer>
              <MaterialIcons name="error-outline" size={40} color="red" />
              <Text style={{ marginTop: 10 }}>
                No se pudo cargar la información.
              </Text>
              <Button
                label="Volver"
                variant="close"
                onPress={onClose}
                style={{ marginTop: 20 }}
              />
            </LoaderContainer>
          )}
        </ModalBottomSheet>
        </ModalOverlay>
      </Modal>

      {reportData?.imageUrl && isFullScreenImageVisible && (
        <Modal
          visible={isFullScreenImageVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsFullScreenImageVisible(false)}
        >
          <FullScreenOverlay
            activeOpacity={1}
            onPress={() => setIsFullScreenImageVisible(false)}
          >
            <FullScreenCloseButton
              onPress={() => setIsFullScreenImageVisible(false)}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="close" size={28} color="#ffffff" />
            </FullScreenCloseButton>
            <FullScreenImage
              source={reportData.imageUrl}
              contentFit="contain"
              cachePolicy="disk"
            />
          </FullScreenOverlay>
        </Modal>
      )}
    </>
  );
};

export default ReportDetailModal;

const Header = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  width: 100%;
  gap: 10px;
`;

const CategoryBadgeWrapper = styled(View)`
  flex: 1;
  flex-direction: row;
  align-items: center;
`;

const CategoryPill = styled(View)`
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-radius: 12px;
  padding: 4px 8px;
  align-self: flex-start;
`;

const CategoryText = styled(Text)`
  font-size: 11px;
  font-weight: bold;
  color: ${(props) => props.theme.text};
  margin-left: 5px;
`;

const MetaInfoWrapper = styled(View)`
  align-items: flex-end;
  flex-shrink: 0;
`;

const StatusWrapper = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: 4px 8px;
  border-radius: 10px;
  background-color: ${(props) =>
    props.theme.background === "#000"
      ? "rgba(255,255,255,0.08)"
      : "rgba(0,0,0,0.04)"};
`;

const StatusDot = styled(View)`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  margin-right: 5px;
`;

const StatusText = styled(Text)`
  font-weight: bold;
  font-size: 11px;
  color: ${(props) => props.theme.text};
`;

const DateText = styled(Text)`
  font-size: 10px;
  color: ${(props) => props.theme.text};
  opacity: 0.6;
  margin-top: 3px;
`;

const ImageContainer = styled(View)`
  width: 100%;
  margin-bottom: 15px;
  align-items: center;
  justify-content: center;
  min-height: 60px;
`;

const ShowImageButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${(props: any) => props.theme.tint};
  padding: 15px 20px;
  border-radius: 12px;
  width: 100%;

  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 3px;
  elevation: 3;
`;

const ShowImageText = styled(Text)`
  font-weight: bold;
  font-size: 16px;
  margin-left: 10px;
  color: ${(props) =>
    props.theme.background === "#000" ? "#000000" : "#ffffff"};
`;

const ImagePreviewWrapper = styled.TouchableOpacity`
  width: 100%;
  height: 240px;
  border-radius: 14px;
  overflow: hidden;
  background-color: ${(props: any) =>
    props.theme.background === "#000" ? "#141414" : "#f0f0f0"};
  position: relative;
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: ${(props: any) => props.theme.border};
`;

const ReportImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const ZoomHintBadge = styled(View)`
  position: absolute;
  bottom: 8px;
  right: 8px;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  background-color: rgba(0, 0, 0, 0.65);
  padding: 5px 10px;
  border-radius: 12px;
`;

const ZoomHintText = styled(Text)`
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
`;

const FullScreenOverlay = styled.TouchableOpacity`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.95);
  justify-content: center;
  align-items: center;
`;

const FullScreenCloseButton = styled.TouchableOpacity`
  position: absolute;
  top: 50px;
  right: 20px;
  z-index: 20;
  background-color: rgba(255, 255, 255, 0.25);
  width: 40px;
  height: 40px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
`;

const FullScreenImage = styled(Image)`
  width: 100%;
  height: 80%;
`;

const TitleContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const Title = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  flex: 1;
  color: ${(props) => props.theme.text};
`;

const AdhesionContainer = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.theme.background};
  padding: 5px 10px;
  border-radius: 20px;
`;

const AdhesionText = styled(Text)`
  margin-left: 5px;
  font-size: 16px;
  font-weight: bold;
  color: ${(props) => props.theme.text};
`;

const InfoText = styled(Text)`
  margin-left: 10px;
  font-size: 15px;
  color: ${(props: any) => props.theme.text};
  opacity: 0.8;
`;

const DescriptionContainer = styled(View)`
  margin-top: 15px;
  margin-bottom: 25px;
  background-color: ${(props: any) => props.theme.surface};
  padding: 15px;
  border-radius: 10px;
`;

const DescriptionTitle = styled(Text)`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
  color: ${(props: any) => props.theme.text};
`;

const DescriptionText = styled(Text)`
  font-size: 15px;
  line-height: 22px;
  color: ${(props: any) => props.theme.text};
`;
