import { Dropdown } from "react-native-element-dropdown";
import styled from "styled-components/native";
import { View } from "../Themed";

interface DropdownComponentProps {
  selectedCategory: string | null;
  setselectedCategory: (category: string | null) => void;
}

const data = [
  { label: "Bache / Pozo", value: "1" },
  { label: "Acequia Obstruida", value: "2" },
  { label: "Luminaria Apagada", value: "3" },
  { label: "Semáforo Roto", value: "4" },
  { label: "Residuos / Escombros", value: "5" },
];

const DropdownComponent = ({
  selectedCategory,
  setselectedCategory,
}: DropdownComponentProps) => {
  return (
    <Contianer>
      <StyledDropdown
        data={data}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder="Buscar..."
        searchPlaceholder="buscar..."
        value={selectedCategory}
        onChange={(item) => {
          setselectedCategory(item.value);
        }}
      />
    </Contianer>
  );
};

export default DropdownComponent;

const Contianer = styled(View)`
  width: 100%;
  background-color: transparent;
`;

const StyledDropdown = styled(Dropdown).attrs((props: any) => ({
  placeholderStyle: {
    fontSize: 16,
    color: props.theme.text,
    paddingLeft: 5,
  },
  selectedTextStyle: {
    fontSize: 16,
    fontWeight: "bold",
    color: props.theme.text || "#000",
    paddingLeft: 5,
  },
  containerStyle: {
    borderRadius: 12,
    backgroundColor: props.theme.bg || "#fff",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    borderRadius: 8,
  },
}))`
  height: 50px;
  width: 100%;
  border-style: solid;
  border-color: #4e7ed0;
  border-width: 2px;
  border-radius: 15px;
  background-color: ${(props) => props.theme.background};
  margin-vertical: 10px;
`;
