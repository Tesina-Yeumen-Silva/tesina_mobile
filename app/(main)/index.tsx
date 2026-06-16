import MapViewHome from "@/views/map.view";
import * as Location from "expo-location";
import React, { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  return <MapViewHome />;
};

export default Home;
