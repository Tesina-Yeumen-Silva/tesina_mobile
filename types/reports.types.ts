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
  address:string
  latitude:number
  longitude:number
  description:string
  isAnonymous:boolean;
  categoryId: number;
  image:string;
}
