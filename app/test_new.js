import Papa from 'papaparse';
import https from 'https';

const SPEC_URL = 'https://docs.google.com/spreadsheets/d/1yg7mlk3ZEtR0dmYaE1uzbZKfHTW3eJej/gviz/tq?tqx=out:csv&sheet=SPEC';

async function fetchSpec() {
  try {
    const res = await fetch(SPEC_URL);
    console.log('Status Code:', res.status);
    const data = await res.text();
    const results = Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
    });
    
    console.log('Total rows parsed:', results.data.length);
    
    // Log a few rows to see the keys
    if (results.data.length > 0) {
        console.log('Keys in row:', Object.keys(results.data[0]));
        console.log('First row:', results.data[0]);
    }

    const found = results.data.find(row => row['Material']?.trim() === 'ETM00000800');
    console.log('Found ETM00000800:', found);
    
    if (!found) {
        // Try searching with a partial match to see if there's whitespace or hidden characters
        const partial = results.data.find(row => row['Material']?.includes('ETM00000800'));
        console.log('Partial match found:', partial);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

fetchSpec();
