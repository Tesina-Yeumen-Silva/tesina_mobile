import { categoryService } from "@/services/category.service";
import { Category } from "@/models";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const categoryController = {
  getCategoriesAction: async (): Promise<Category[]> => {
    try {
      const cached = await AsyncStorage.getItem("@report_categories");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.log("Error leyendo caché de categorías:", e);
    }

    try {
      const categories = await categoryService.getCategories();
      try {
        await AsyncStorage.setItem(
          "@report_categories",
          JSON.stringify(categories),
        );
      } catch (e) {
        console.log("Error guardando caché de categorías:", e);
      }
      return categories;
    } catch (error) {
      console.log(
        "Error al obtener categorías de la API, retornando vacío:",
        error,
      );
      return [];
    }
  },
};
