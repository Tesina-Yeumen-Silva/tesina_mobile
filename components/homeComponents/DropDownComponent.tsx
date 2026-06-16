import { Dropdown } from "react-native-element-dropdown";
import styled, { useTheme } from "styled-components/native";
import { View } from "../Themed";
import { useEffect, useState } from "react";
import { categoryService } from "@/services/category.service";
import { ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DropdownComponentProps {
  selectedCategory: string | null;
  setselectedCategory: (category: string | null) => void;
}

interface DropdownItem {
  label: string;
  value: string;
}

const DropdownComponent = ({
  selectedCategory,
  setselectedCategory,
}: DropdownComponentProps) => {
  const [data, setData] = useState<DropdownItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);

        const cachedCategories =
          await AsyncStorage.getItem("@report_categories");
        if (cachedCategories) {
          setData(JSON.parse(cachedCategories));
          setIsLoading(false);
        }

        const categoriesFromDB = await categoryService.getCategories();
        const formattedData = categoriesFromDB.map((cat: any) => ({
          label: cat.name,
          value: String(cat.id),
        }));

        setData(formattedData);
        await AsyncStorage.setItem(
          "@report_categories",
          JSON.stringify(formattedData),
        );
      } catch (error) {
        console.log(
          "Aviso: No se pudieron traer categorías nuevas, usando la caché.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);
  return (
    <Contianer>
      {isLoading ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <StyledDropdown
          data={data}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Seleccionar categoría..."
          value={selectedCategory}
          onChange={(item: DropdownItem) => {
            setselectedCategory(item.value);
          }}
          disable={isLoading}
          placeholderStyle={{
            fontSize: 16,
            color: theme.text,
            paddingLeft: 5,
          }}
          selectedTextStyle={{
            fontSize: 16,
            color: theme.text,
            paddingLeft: 5,
          }}
          containerStyle={{
            borderRadius: 12,
            backgroundColor: theme.background,
          }}
          itemTextStyle={{
            color: theme.text,
          }}
        />
      )}
    </Contianer>
  );
};

export default DropdownComponent;

const Contianer = styled(View)`
  width: 100%;
  background-color: transparent;
`;

const StyledDropdown = styled(Dropdown)`
  height: 50px;
  width: 100%;
  border-style: solid;
  border-color: #4e7ed0;
  border-width: 2px;
  border-radius: 15px;
  background-color: ${(props) => props.theme.background};
  margin-vertical: 10px;
`;
