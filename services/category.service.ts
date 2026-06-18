import { api } from "./api";
import { Category } from "../models";

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get("/report-categories");
    return response.data.data;
  },
};
