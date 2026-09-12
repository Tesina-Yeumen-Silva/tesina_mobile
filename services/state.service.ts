import { api } from "./api";

export interface ReportStateItem {
  id: number;
  name: string;
  color: string;
}

export const stateService = {
  getStates: async (): Promise<ReportStateItem[]> => {
    const response = await api.get("/report-states");
    return response.data.data;
  },
};
