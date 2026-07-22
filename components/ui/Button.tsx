import React from "react";
import { ActivityIndicator, TouchableOpacityProps } from "react-native";
import styled from "styled-components/native";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: "primary" | "danger" | "close" | "link";
  isLoading?: boolean;
}

export const Button = ({
  label,
  variant = "primary",
  isLoading = false,
  disabled,
  style,
  ...otherProps
}: ButtonProps) => {
  return (
    <StyledButton
      variant={variant}
      disabled={disabled || isLoading}
      style={style}
      {...otherProps}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variant === "link" ? "#2196f3" : "#ffffff"} />
      ) : (
        <ButtonText variant={variant}>{label}</ButtonText>
      )}
    </StyledButton>
  );
};

const StyledButton = styled.TouchableOpacity<{ variant: string }>`
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  
  ${(props) => {
    const isDark = props.theme.background === "#000" || props.theme.background === "black";
    switch (props.variant) {
      case "danger":
        return `
          background-color: #ff4444;
          padding: 10px 20px;
        `;
      case "close":
        return `
          background-color: ${isDark ? "#2c2c2e" : "#e9e9eb"};
          padding: 15px;
          width: 100%;
        `;
      case "link":
        return `
          background-color: transparent;
          padding: 5px 10px;
        `;
      case "primary":
      default:
        return `
          background-color: #0e9aec;
          padding: 10px 20px;
        `;
    }
  }}
`;

const ButtonText = styled.Text<{ variant: string }>`
  font-weight: bold;
  
  ${(props) => {
    const isDark = props.theme.background === "#000" || props.theme.background === "black";
    switch (props.variant) {
      case "link":
        return `
          color: #2196f3;
          font-size: 12px;
          font-weight: 600;
        `;
      case "close":
        return `
          color: ${isDark ? "#ffffff" : "#000000"};
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 1px;
        `;
      case "danger":
      case "primary":
      default:
        return `
          color: #ffffff;
          font-size: 14px;
        `;
    }
  }}
`;
