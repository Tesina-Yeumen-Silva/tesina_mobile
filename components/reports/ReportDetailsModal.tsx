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
import { Text, View, ModalOverlay, ModalBottomSheet, LoaderContainer, InfoRow } from "../ui/Themed";
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

const getCategoryIcon = (
  categoryName: string,
): keyof typeof MaterialIcons.glyphMap => {
  if (!categoryName) return "label";

  const norm = categoryName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (norm.includes("acequia") || norm.includes("drenaje")) return "water";
  if (norm.includes("alumbrado") || norm.includes("luz")) return "lightbulb";
  if (norm.includes("arbol") || norm.includes("arbolado")) return "nature";
  if (norm.includes("bache") || norm.includes("paviment") || norm.includes("calzada")) return "construction";
  if (norm.includes("limpieza") || norm.includes("residuo") || norm.includes("basura") || norm.includes("higiene")) return "delete-outline";
  if (norm.includes("plaza") || norm.includes("parque") || norm.includes("verde") || norm.includes("espacio")) return "park";
  if (norm.includes("semaforo") || norm.includes("senales") || norm.includes("senalisacion") || norm.includes("transito")) return "traffic";
  if (norm.includes("vereda") || norm.includes("accesib")) return "directions-walk";
  if (norm.includes("agua") || norm.includes("cloaca")) return "water-drop";

  return "report-problem";
};

const ReportDetailModal = ({ reportId, onClose }: Props) => {
  const [reportData, setReportData] = useState<ReportDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isImageVisible, setIsImageVisible] = useState(false);
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
                <CategoryBadgeWrapper style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <MaterialIcons
                    name={getCategoryIcon(reportData.category)}
                    size={18}
                    color="#2196F3"
                  />
                  <Badge
                    text={reportData.category.toUpperCase()}
                    color="transparent"
                    style={{ borderWidth: 1, borderColor: theme.border }}
                  />
                </CategoryBadgeWrapper>
                <MetaInfoWrapper>
                  <StatusWrapper>
                    <StatusDot style={{ backgroundColor: reportData.statusColor }} />
                    <StatusText>{reportData.status}</StatusText>
                  </StatusWrapper>
                  <DateText>{formatDate(reportData.updatedState)}</DateText>
                </MetaInfoWrapper>
              </Header>
              {reportData.imageUrl && (
                <ImageContainer>
                  {isImageVisible ? (
                    <ReportImage
                      source={reportData.imageUrl}
                      contentFit="cover"
                      cachePolicy="disk"
                      recyclingKey={reportData.imageUrl}
                      transition={300}
                    />
                  ) : (
                    <ShowImageButton onPress={() => setIsImageVisible(true)}>
                      <Ionicons
                        name="image-outline"
                        size={24}
                        color={theme.background === "#000" ? "#000000" : "#ffffff"}
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
  );
};

export default ReportDetailModal;

const Header = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  width: 100%;
`;

const CategoryBadgeWrapper = styled(View)`
  flex: 1.3;
  margin-right: 12px;
`;

const MetaInfoWrapper = styled(View)`
  flex: 0.7;
  align-items: flex-end;
`;

const StatusWrapper = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const StatusDot = styled(View)`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  margin-right: 6px;
`;

const StatusText = styled(Text)`
  font-weight: bold;
  font-size: 12px;
  color: ${(props) => props.theme.text};
`;

const DateText = styled(Text)`
  font-size: 11px;
  color: ${(props) => props.theme.text};
  opacity: 0.6;
  margin-top: 4px;
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
  color: ${(props) => (props.theme.background === "#000" ? "#000000" : "#ffffff")};
`;

const ReportImage = styled(Image)`
  width: 100%;
  height: 400px;
  border-radius: 15px;
  margin-bottom: 15px;
  background-color: ${(props) => props.theme.background};
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
