/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import Colors from "@/constants/Colors";
import styled from "styled-components/native";
import {
  Text as DefaultText,
  TextInput as DefaultTextInput,
  TextInputProps as DefaultTextInputProps,
  View as DefaultView,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];
export type TextInputProps = ThemeProps & DefaultTextInputProps;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function TextInput(props: TextInputProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;

  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  const placeholderColor = useThemeColor(
    { light: "#999", dark: "#666" },
    "text",
  );

  return (
    <DefaultTextInput
      style={[{ color }, style]}
      placeholderTextColor={placeholderColor}
      selectionColor={color}
      {...otherProps}
    />
  );
}

export const ModalOverlay = styled(View)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.65);
  justify-content: flex-end;
`;

export const ModalBottomSheet = styled(View)`
  background-color: ${(props) => props.theme.background || "white"};
  padding: 25px;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  max-height: 85%;
  min-height: 40%;
`;

export const LoaderContainer = styled(View)`
  align-items: center;
  justify-content: center;
  padding: 40px 0;
`;

export const InfoRow = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;
