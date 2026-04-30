import { useEffect, useState } from "react";
import { ReportDetails } from "@/types/reports.types";
import styled, { useTheme } from "styled-components/native";
import { fetchReportById } from "@/api/reports.api";
import {
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "../Themed";
import { Image } from "expo-image";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { toggleAdhesion } from "@/api/reports.api";
import { formatDate } from "@/utils/formatDate";

interface Props {
  reportId: number;
  onClose: () => void;
}

const ReportDetailModal = ({ reportId, onClose }: Props) => {
  const [reportData, setReportData] = useState<ReportDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setIsLoading(true);
        const data = await fetchReportById(reportId);
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
    try {
      const result = await toggleAdhesion(reportId);

      setReportData((prevData) => {
        if (!prevData) return null;

        return {
          ...prevData,
          adhesionsCount: result.adhered
            ? prevData.adhesionsCount + 1
            : prevData.adhesionsCount - 1,
        };
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al registrar apoyo";
      Alert.alert("Aviso", errorMessage);
    }
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
                <CategoryBadge>
                  <CategoryText>
                    {reportData.category.toUpperCase()}
                  </CategoryText>
                </CategoryBadge>
                <StatusBadge
                  style={{ backgroundColor: reportData.statusColor }}
                ></StatusBadge>
                <StatusText>{reportData.status}</StatusText>
                <StatusText>{formatDate(reportData.updatedState)}</StatusText>
              </Header>
              {reportData.imageUrl && (
                <ImageContainer>
                  {isImageVisible ? (
                    <ReportImage
                      source={reportData.imageUrl}
                      contentFit="cover"
                      cachePolicy="disk"
                      transition={300}
                    />
                  ) : (
                    <ShowImageButton onPress={() => setIsImageVisible(true)}>
                      <Ionicons name="image-outline" size={24} color={theme.text} />
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

              <CloseButton onPress={onClose}>
                <CloseButtonText>Cerrar</CloseButtonText>
              </CloseButton>
            </ScrollView>
          ) : (
            <LoaderContainer>
              <MaterialIcons name="error-outline" size={40} color="red" />
              <Text style={{ marginTop: 10 }}>
                No se pudo cargar la información.
              </Text>
              <CloseButton
                onPress={onClose}
                style={{ marginTop: 20, width: "100%" }}
              >
                <CloseButtonText>Volver</CloseButtonText>
              </CloseButton>
            </LoaderContainer>
          )}
        </ModalContainer>
      </Overlay>
    </Modal>
  );
};

export default ReportDetailModal;

const Overlay = styled(View)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
  justify-content: flex-end;
`;

const ModalContainer = styled(View)`
  background-color: ${(props) => props.theme.background};
  padding: 25px;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  max-height: 85%;
  min-height: 40%;
`;

const LoaderContainer = styled(View)`
  align-items: center;
  justify-content: center;
  padding: 40px 0;
`;

const Header = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const CategoryBadge = styled(View)`
  background-color: ${(props) => props.theme.background};
  padding: 6px 12px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${(props) => props.theme.border};
`;

const CategoryText = styled(Text)`
  font-weight: bold;
  font-size: 12px;
  color: ${(props) => props.theme.text};
`;

const StatusBadge = styled(View)`
  padding: 6px 12px;
  height: 30px;
  border-radius: 8px;
`;

const StatusText = styled(Text)`
  font-weight: bold;
  font-size: 12px;
  color: ${(props) => props.theme.text};
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
  color: #ffffff;
  font-weight: bold;
  font-size: 16px;
  margin-left: 10px;
  color: ${(props) => props.theme.text};
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

const InfoRow = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
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

const CloseButton = styled.TouchableOpacity`
  background-color: ${(props: any) => props.theme.tint};
  padding: 15px;
  border-radius: 12px;
  align-items: center;
  margin-bottom: 20px;
`;

const CloseButtonText = styled(Text)`
  color: #fff;
  font-weight: bold;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${(props) => props.theme.text};
`;
