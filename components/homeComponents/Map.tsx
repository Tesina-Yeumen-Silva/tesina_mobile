import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import MapView from "react-native-maps";
import styled from "styled-components/native";
import ReportModal from "./ReportModal";

const MapHome = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  return (
    <Container>
      {isModalVisible && (
        <ReportModal isModalVisible setIsModalVisible={setIsModalVisible} />
      )}
      <Map
        userInterfaceStyle="light"
        showsUserLocation={true}
        initialRegion={{
          latitude: -32.8894,
          longitude: -68.8458,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      ></Map>
      <CenterLocation>
        <Ionicons name="locate" size={32} />
      </CenterLocation>
      <FabButton onPress={() => setIsModalVisible(true)}>
        <MaterialIcons name="report-problem" size={32} />
      </FabButton>
    </Container>
  );
};
export default MapHome;

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
