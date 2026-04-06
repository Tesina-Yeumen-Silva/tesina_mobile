import { Ionicons } from "@expo/vector-icons";
import MapView, { UrlTile } from "react-native-maps";
import styled from "styled-components/native";

const MapHome = () => {
  return (
    <Container>
      <Map
        userInterfaceStyle="light"
        showsUserLocation={true}
        initialRegion={{
          latitude: -32.8894,
          longitude: -68.8458,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          zIndex={1}
          tileSize={256}
        />
      </Map>
      <CenterLocation>
        <Ionicons name="locate" size={32} />
      </CenterLocation>
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
