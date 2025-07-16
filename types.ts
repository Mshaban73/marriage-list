
export interface Item {
  id: number;
  description: string;
  value: number;
}

export interface SavedList {
  id: string;
  savedAt: string;
  groomName: string;
  groomId: string;
  groomAddress: string;
  brideName: string;
  brideId: string;
  brideAddress: string;
  witness1Name: string;
  witness2Name: string;
  items: Item[];
  totalValue: number;
}
