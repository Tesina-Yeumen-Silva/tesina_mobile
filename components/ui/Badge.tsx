import React from "react";
import styled from "styled-components/native";

interface BadgeProps {
  text: string;
  color?: string;
  style?: any;
}

export const Badge = ({ text, color = "#9E9E9E", style }: BadgeProps) => {
  return (
    <BadgeContainer badgeColor={color} style={style}>
      <BadgeText>{text}</BadgeText>
    </BadgeContainer>
  );
};

const BadgeContainer = styled.View<{ badgeColor: string }>`
  background-color: ${(props) => props.badgeColor};
  padding: 5px 10px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
`;

const BadgeText = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: bold;
`;
