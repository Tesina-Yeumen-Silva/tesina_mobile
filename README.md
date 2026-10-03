# Mendoza Reporta - App Ciudadana (Mobile)

Este repositorio contiene el código fuente de la aplicación móvil nativa diseñada para los habitantes. Constituye el principal canal de captura de reportes fotográficos y textuales sobre incidencias urbanas. 

## 🚀 Tecnologías Principales

- **Framework**: [React Native](https://reactnative.dev/) vía [Expo](https://expo.dev/)
- **Enrutamiento**: Expo Router
- **Persistencia Local**: SQLite (sincronización offline)
- **Cámara & Multimedia**: Expo Camera & ImagePicker
- **Mapas**: React Native Maps
- **Gestión del Estado**: Zustand

## 🧩 Funcionalidades Destacadas

- **Gestión Offline-First**: En caso de ausencia de conectividad a Internet, los reportes (incluyendo imágenes capturadas) se encolan utilizando una base de datos local embebida (SQLite). Se sincronizan de forma transparente una vez restaurada la red o tras la reanudación de sesión.
- **Autenticación Resiliente**: Implementación de un ciclo de vida robusto utilizando interceptores Axios. Si un Access Token expira estando en el campo, el interceptor intercambia el Refresh Token e intenta la petición fotográfica nuevamente de manera automática.
- **Reporte Guiado**: UI/UX centrada en la rápida localización geoespacial y etiquetado automático mediante la vinculación de coordenadas de precisión obtenidas del GPS del dispositivo móvil.

## 📋 Requisitos Previos

- **Node.js** v18 o superior.
- CLI de **Expo** instalado globalmente.
- Dispositivo Android/iOS físico o emulador con capacidades de Google Play Services configuradas.

## ⚙️ Configuración del Entorno

1. Renombrar o copiar el ejemplo de entorno:
   ```bash
   cp .env.example .env
   ```
2. Asegurar que `EXPO_PUBLIC_API_URL` contenga la IP local de desarrollo (por ejemplo `http://192.168.0.x:4500`) o bien la URL de red en caso de usar un túnel tipo ngrok. El simulador móvil no soporta `localhost` como sinónimo de la máquina local.

## 🛠️ Instalación y Pruebas

1. Instalar dependencias mediante npm:
   ```bash
   npm install
   ```
2. Iniciar Expo localmente (opcionalmente con `--clear` si se modificaron dependencias pesadas):
   ```bash
   npm run start
   ```
3. Utilizar la App **Expo Go** para escanear el código QR que se mostrará en la terminal, o presionar `a` para emular directamente en Android.

## 📦 Despliegue en la Nube (EAS Build)

El proyecto está configurado para empaquetarse de manera remota con los servicios de **EAS Cloud**:
```bash
eas build --profile preview --platform android
```
Esto permite obtener los instaladores finales (APK/AAB) de manera agnóstica sin requerir Android Studio configurado de manera pesada en entornos locales.
