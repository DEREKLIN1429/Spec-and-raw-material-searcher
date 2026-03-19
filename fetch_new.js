import Papa from 'papaparse';
import https from 'https';

const url = 'https://docs.google.com/spreadsheets/d/1_SqDVFnw1xRDCH4MhiWg5ZxUcE1UmryuJ4q-0I23x2s/gviz/tq?tqx=out:csv&gid=0';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    Papa.parse(data, {
      header: false,
      complete: (results) => {
        for(let i=0; i<5; i++) {
          const row = results.data[i];
          const rData = row.map((v, i) => v ? `[${i}]: ${v}` : null).filter(Boolean);
          console.log(`Row ${i} non-empty:`, rData);
        }
      }
    });
  });
});
