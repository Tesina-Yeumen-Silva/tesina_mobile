import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import styled, { useTheme } from 'styled-components/native';

const Wrapper = styled.TouchableOpacity`
  position: absolute;
  top: 50px;
  left: 20px;
  z-index: 10;
  padding: 10px;
`;

export const BackButton = () => {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Wrapper onPress={() => router.back()}> 
      <MaterialIcons name="arrow-back" size={28} color={theme.text} />
    </Wrapper>
  );
};