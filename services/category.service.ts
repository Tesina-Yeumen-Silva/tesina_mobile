import { api } from "./api";
import { Category } from "../models";

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get("/reports/categories");
    return response.data.data;
  },
};
