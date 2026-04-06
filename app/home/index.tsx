import * as Location from "expo-location";
import { useEffect } from "react";
import MapView from "react-native-maps";
import styled from "styled-components/native";

const Home = () => {
  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);
  return (
    <Container>
      <Map showsUserLocation={true} followsUserLocation={true} />
    </Container>
  );
};
export default Home;

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Map = styled(MapView)`
  width: 100%;
  height: 100%;
`;
