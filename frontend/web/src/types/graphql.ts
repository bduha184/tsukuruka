export interface Category {
  id: string;
  name: string;
  icon: string;
  eatingOutCost: number;
}

export interface Recipe {
  id: string;
  url: string;
  title: string | null;
  thumbnailUrl: string | null;
  platform: string | null;
  category: Category | null;
  estimatedCost: number | null;
  eatingOutCost: number | null;
  status: 'SAVED' | 'COOKED' | 'DELETED';
  suggestedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Health {
  status: string;
  database: string;
  timestamp: string;
}
