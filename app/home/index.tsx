import * as Location from "expo-location";
import React, { useEffect } from "react";
import MapView, { UrlTile } from "react-native-maps";
import styled from "styled-components/native";

const Home = () => {
  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

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
    </Container>
  );
};

export default Home;

const Container = styled.View`
  flex: 1;
  background-color: #ffffff;
`;

const Map = styled(MapView)`
  width: 100%;
  height: 100%;
`;
