import Papa from 'papaparse';

async function main() {
  const url = 'https://docs.google.com/spreadsheets/d/1_SqDVFnw1xRDCH4MhiWg5ZxUcE1UmryuJ4q-0I23x2s/export?format=csv&gid=0';
  const res = await fetch(url);
  const text = await res.text();
  
  Papa.parse(text, {
    header: false,
    complete: (results) => {
      for(let i=0; i<4; i++) {
        const row = results.data[i];
        const rData = row.map((v, i) => v ? `[${i}]: ${v}` : null).filter(Boolean);
        console.log(`Row ${i} non-empty:`, rData);
      }
    }
  });
}

main();
