import { RawMaterial, MaterialCategory } from './types';

export const MOCK_MATERIALS: RawMaterial[] = [
  {
    id: '1',
    name: 'Aluminum 6061-T6',
    category: MaterialCategory.METALS,
    quantity: 1250,
    unit: 'kg',
    unitPrice: 2.45,
    supplier: 'AluTech Solutions',
    lastUpdated: '2026-03-15T10:30:00Z',
    specifications: {
      purity: '99.5%',
      density: '2.70 g/cm³',
      grade: 'Aerospace'
    },
    description: 'High-strength aluminum alloy with good corrosion resistance and weldability.'
  },
  {
    id: '2',
    name: 'Polypropylene (PP)',
    category: MaterialCategory.POLYMERS,
    quantity: 450,
    unit: 'kg',
    unitPrice: 1.15,
    supplier: 'Polymer Global',
    lastUpdated: '2026-03-18T14:20:00Z',
    specifications: {
      grade: 'Injection Molding',
      density: '0.90 g/cm³'
    },
    description: 'Thermoplastic polymer used in a wide variety of applications.'
  },
  {
    id: '3',
    name: 'Titanium Grade 5',
    category: MaterialCategory.METALS,
    quantity: 85,
    unit: 'kg',
    unitPrice: 45.00,
    supplier: 'Titan Forge',
    lastUpdated: '2026-03-10T09:15:00Z',
    specifications: {
      purity: '90%',
      grade: 'Medical'
    },
    description: 'Alpha-beta titanium alloy with high strength and excellent corrosion resistance.'
  },
  {
    id: '4',
    name: 'Silicon Carbide',
    category: MaterialCategory.CERAMICS,
    quantity: 200,
    unit: 'kg',
    unitPrice: 12.50,
    supplier: 'CeraMax Industries',
    lastUpdated: '2026-03-12T16:45:00Z',
    specifications: {
      purity: '98%',
      grade: 'Abrasive'
    },
    description: 'Extremely hard, synthetically produced crystalline compound of silicon and carbon.'
  }
];
