import Papa from 'papaparse';

const SPEC_URL = 'https://docs.google.com/spreadsheets/d/1yg7mlk3ZEtR0dmYaE1uzbZKfHTW3eJej/gviz/tq?tqx=out:csv&sheet=SPEC';
const RUBBER_URL = 'https://docs.google.com/spreadsheets/d/1yg7mlk3ZEtR0dmYaE1uzbZKfHTW3eJej/gviz/tq?tqx=out:csv&sheet=RUBBER';
const RECIPE_URL = 'https://docs.google.com/spreadsheets/d/1_SqDVFnw1xRDCH4MhiWg5ZxUcE1UmryuJ4q-0I23x2s/export?format=csv&gid=0';

export interface RubberData {
  rubberName: string;
  sapCode: string;
  rawMaterial: string;
  rubberNameJ: string;
  rubberNameK: string;
  rubberNameL: string;
}

export interface RecipeItem {
  rubberName: string;
  name: string;
  code: string;
  weight: string;
}

export interface SpecData {
  material: string;
  alternativeText: string;
  longText: string;
  cusionCompound: string;
  treadCompound1: string;
  treadCompound2: string;
}

export async function fetchRubberData(): Promise<RubberData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(RUBBER_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row: any) => ({
          rubberName: row['種類類別']?.trim() || '',
          sapCode: row['SAP ON']?.trim() || '',
          rawMaterial: row['SPC']?.trim() || '',
          rubberNameJ: row['_6']?.trim() || '',
          rubberNameK: row['_7']?.trim() || '',
          rubberNameL: row['_8']?.trim() || '',
        })).filter((item) => item.rubberName || item.sapCode);
        resolve(data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export async function fetchRecipeData(query: string | string[]): Promise<RecipeItem[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(RECIPE_URL, {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as string[][];
        if (rows.length < 4) {
          resolve([]);
          return;
        }

        // Search for material names and codes in the first few rows
        // Usually rows[1] is names, rows[2] is codes
        const materialNames = rows[1] || [];
        const materialCodes = rows[2] || [];
        const headerRow0 = rows[0] || [];
        
        const queries = (Array.isArray(query) ? query : [query])
          .map(q => q.trim().toUpperCase())
          .filter(q => q.length > 0);
        
        if (queries.length === 0) {
          resolve([]);
          return;
        }

        // Find all columns that match the query (for material search)
        const matchingColIndices: number[] = [];
        const maxCols = Math.max(materialNames.length, materialCodes.length, headerRow0.length);
        
        for (let i = 0; i < maxCols; i++) {
          const mName = (materialNames[i] || '').toUpperCase();
          const mCode = (materialCodes[i] || '').toUpperCase();
          const h0 = (headerRow0[i] || '').toUpperCase();
          
          if (queries.some(q => mName.includes(q) || mCode.includes(q) || h0.includes(q))) {
            matchingColIndices.push(i);
          }
        }

        const recipeItems: RecipeItem[] = [];
        const compoundsToIncludeFull = new Set<string>();

        // First pass: Find which compounds match the query directly OR use a matching material
        for (let r = 3; r < rows.length; r++) {
          const row = rows[r];
          const isV = row[0]?.toString().toUpperCase().trim() === 'V' || 
                     row[0]?.toString().trim() === 'Ⅴ';
          if (!isV) continue;

          const rubberName = (row[2] || '').trim();
          const rubberNameUpper = rubberName.toUpperCase();
          
          const isRubberMatch = queries.some(q => rubberNameUpper.includes(q));

          if (isRubberMatch) {
            compoundsToIncludeFull.add(rubberName);
          } else {
            // Check if any matching material is used in this compound
            for (const i of matchingColIndices) {
              const weight = row[i]?.trim();
              if (weight && weight !== '' && weight !== '0') {
                compoundsToIncludeFull.add(rubberName);
                break;
              }
            }
          }
        }

        // Second pass: Include the FULL recipe for all identified compounds
        for (let r = 3; r < rows.length; r++) {
          const row = rows[r];
          const rubberName = (row[2] || '').trim();
          
          if (compoundsToIncludeFull.has(rubberName)) {
            // Start from column 5 (where materials usually start)
            for (let i = 5; i < row.length; i++) {
              const weight = row[i]?.trim();
              if (weight && weight !== '' && weight !== '0') {
                recipeItems.push({
                  rubberName: rubberName,
                  name: materialNames[i]?.trim() || headerRow0[i]?.trim() || 'Unknown',
                  code: materialCodes[i]?.trim() || 'Unknown',
                  weight: weight
                });
              }
            }
          }
        }

        resolve(recipeItems);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}


export async function fetchSpecData(): Promise<SpecData[]> {
  const response = await fetch(SPEC_URL);
  const data = await response.text();
  return new Promise((resolve, reject) => {
    Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data.map((row: any) => ({
          material: row['Material']?.trim() || '',
          alternativeText: row['Alternative Text']?.trim() || '',
          longText: row['Long text']?.trim() || '',
          cusionCompound: row['Cusion Compound']?.trim() || '',
          treadCompound1: row['Tread Compound head 1']?.trim() || '',
          treadCompound2: row['Tread compound haed 2']?.trim() || '',
        })).filter((item) => item.material || item.alternativeText);
        resolve(parsedData);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}
