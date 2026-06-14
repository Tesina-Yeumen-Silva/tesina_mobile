export interface ReportMaker {
  id: number;
  latitude: number;
  longitude: number;
  status: string;
  statusColor: string;
}

export interface ReportDetails {
  id: number;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  imageUrl: string | null;
  createdAt: string;
  category: string;
  updatedState: string;
  status: string;
  statusColor: string;
  reporterName: string;
  adhesionsCount: number;
}

export interface CreateReport {
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  isAnonymous: boolean;
  categoryId: number;
  image: string;
}

export interface UserReports {
  id: number;
  address: string;
  createdAt: string;
  categoryName: string;
  stateName: string;
  stateColor: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface PaginatedReportsResponse {
  data: UserReports[];
  meta: PaginationMeta;
}

export interface ReportHistoryItem {
  id: number;
  reportId: number;
  stateId: number;
  observation: string;
  createdAt: string;
  state: {
    id: number;
    name: string;
    color: string;
  };
}

export type ReportHistoryResponse = ReportHistoryItem[];
