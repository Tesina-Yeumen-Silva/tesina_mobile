import React from "react";
import styled from "styled-components/native";
import { ReportForm } from "@/components/reports/ReportForm";

const ReportScreen = ({ navigation }: any) => {
  return (
    <ScreenContainer>
      <ReportForm
        onSuccess={() => {
          if (navigation) {
            navigation.navigate("index");
          }
        }}
      />
    </ScreenContainer>
  );
};

export default ReportScreen;

const ScreenContainer = styled.View`
  flex: 1;
  background-color: ${(props: any) => props.theme.background || "#F2F2F2"};
`;
