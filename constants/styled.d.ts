import "styled-components/native";
import Colors from "./Colors"; // Esto asume que Colors.ts está en la misma carpeta

// Aquí le decimos: "Tomá la forma de mi objeto Colors.light"
type ThemeInterface = typeof Colors.light;

declare module "styled-components/native" {
  // Aquí "extendemos" la interfaz original para que incluya tus colores
  export interface DefaultTheme extends ThemeInterface {}
}
