import https from 'https';

const url = 'https://docs.google.com/spreadsheets/d/1_SqDVFnw1xRDCH4MhiWg5ZxUcE1UmryuJ4q-0I23x2s/export?format=csv&gid=0';

https.get(url, (res) => {
  console.log(`${url} -> ${res.statusCode}`);
  console.log(`Location: ${res.headers.location}`);
}).on('error', (e) => {
  console.error(e);
});
