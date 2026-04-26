import MapHome from "@/components/homeComponents/Map";
import * as Location from "expo-location";
import React, { useEffect } from "react";
import styled from "styled-components/native";

const Home = () => {
  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  return <MapHome />;
};

export default Home;

const Container = styled.View`
  flex: 1;
  background-color: #ffffff;
`;
