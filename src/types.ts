export enum MaterialCategory {
  METALS = "Metals",
  POLYMERS = "Polymers",
  CERAMICS = "Ceramics",
  COMPOSITES = "Composites",
  CHEMICALS = "Chemicals",
  OTHER = "Other"
}

export interface RawMaterial {
  id: string;
  name: string;
  category: MaterialCategory;
  quantity: number;
  unit: string;
  unitPrice: number;
  supplier: string;
  lastUpdated: string;
  specifications: {
    purity?: string;
    density?: string;
    grade?: string;
    [key: string]: string | undefined;
  };
  description: string;
}

export interface MaterialStats {
  totalValue: number;
  lowStockCount: number;
  categoryDistribution: Record<MaterialCategory, number>;
}
