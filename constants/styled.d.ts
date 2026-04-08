import "styled-components/native";
import Colors from "./Colors";
type ThemeInterface = typeof Colors.light;

declare module "styled-components/native" {
  export interface DefaultTheme extends ThemeInterface {}
}
