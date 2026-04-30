import { Category } from "@/types/category.types";
import { api } from "./axiosInstance";

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/report-categories');
  return response.data.data; 
};