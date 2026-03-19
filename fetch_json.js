import https from 'https';

const url = 'https://docs.google.com/spreadsheets/d/1_SqDVFnw1xRDCH4MhiWg5ZxUcE1UmryuJ4q-0I23x2s/gviz/tq?tqx=out:json&gid=0';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    // The response is wrapped in a function call: google.visualization.Query.setResponse({...})
    const jsonStr = data.substring(data.indexOf('{'), data.lastIndexOf('}') + 1);
    const json = JSON.parse(jsonStr);
    
    // Print the column labels (which are usually from row 1)
    console.log('Cols:', json.table.cols.map((c, i) => `[${i}]: ${c.label}`).filter(c => c !== '[]: '));
    
    // Print the first 3 rows
    for(let i=0; i<3; i++) {
      const row = json.table.rows[i];
      const rData = row.c.map((v, i) => v && v.v ? `[${i}]: ${v.v}` : null).filter(Boolean);
      console.log(`Row ${i} non-empty:`, rData);
    }
  });
});
