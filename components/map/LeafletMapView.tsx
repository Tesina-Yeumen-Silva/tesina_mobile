import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Region } from '@/models';

export interface MarkerProps {
  id: number;
  latitude: number;
  longitude: number;
  color?: string;
}

interface LeafletMapViewProps {
  initialRegion: Region;
  markers?: MarkerProps[];
  onRegionChangeComplete?: (region: Region) => void;
  onMarkerPress?: (id: number) => void;
  onMapReady?: () => void;
  style?: any;
}

export interface LeafletMapRef {
  animateToRegion: (region: Region) => void;
}

export const LeafletMapView = forwardRef<LeafletMapRef, LeafletMapViewProps>(({
  initialRegion,
  markers = [],
  onRegionChangeComplete,
  onMarkerPress,
  onMapReady,
  style
}, ref) => {
  const webViewRef = useRef<WebView>(null);
  const isReady = useRef(false);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region: Region) => {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`setCenter(${region.latitude}, ${region.longitude}); true;`);
      }
    }
  }));

  const getHtml = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { padding: 0; margin: 0; }
          html, body, #map { height: 100%; width: 100%; }
          .leaflet-control-container { display: none; }
          .custom-marker {
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 4px rgba(0,0,0,0.5);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          let map;
          let markersDict = {};

          function initMap() {
            map = L.map('map', {zoomControl: false}).setView([${initialRegion.latitude}, ${initialRegion.longitude}], 14);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            map.on('moveend', function() {
              const center = map.getCenter();
              const bounds = map.getBounds();
              const region = {
                latitude: center.lat,
                longitude: center.lng,
                latitudeDelta: bounds.getNorth() - bounds.getSouth(),
                longitudeDelta: bounds.getEast() - bounds.getWest()
              };
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'onRegionChangeComplete', region }));
            });

            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'onMapReady' }));
          }

          function addMarker(id, lat, lng, color) {
            const iconHtml = \`<div class="custom-marker" style="background-color: \${color}; width: 100%; height: 100%;"></div>\`;
            const customIcon = L.divIcon({
              className: '',
              html: iconHtml,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });
            const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
            marker.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'onMarkerPress', id }));
            });
            markersDict[id] = marker;
          }

          function clearMarkers() {
            for (let id in markersDict) {
              map.removeLayer(markersDict[id]);
            }
            markersDict = {};
          }

          function setCenter(lat, lng) {
            map.flyTo([lat, lng], 14, { duration: 1 });
          }

          document.addEventListener("DOMContentLoaded", initMap);
        </script>
      </body>
      </html>
    `;
  };

  useEffect(() => {
    if (!isReady.current || !webViewRef.current) return;
    
    const js = `
      clearMarkers();
      ${markers.map(m => `addMarker(${m.id}, ${m.latitude}, ${m.longitude}, '${m.color || '#2196f3'}');`).join('\n')}
      true;
    `;
    webViewRef.current.injectJavaScript(js);
  }, [markers]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'onMapReady') {
        isReady.current = true;
        if (onMapReady) onMapReady();
        const js = `
          ${markers.map(m => `addMarker(${m.id}, ${m.latitude}, ${m.longitude}, '${m.color || '#2196f3'}');`).join('\n')}
          true;
        `;
        webViewRef.current?.injectJavaScript(js);
      } else if (data.type === 'onRegionChangeComplete') {
        if (onRegionChangeComplete) onRegionChangeComplete(data.region);
      } else if (data.type === 'onMarkerPress') {
        if (onMarkerPress) onMarkerPress(data.id);
      }
    } catch (e) {
      console.warn("Error parsing WebView message", e);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: getHtml() }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        containerStyle={styles.webview}
        originWhitelist={['*']}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden'
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent'
  }
});
