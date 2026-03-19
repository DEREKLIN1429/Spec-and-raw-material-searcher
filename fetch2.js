import https from 'https';
import Papa from 'papaparse';

function fetchCsv(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        Papa.parse(data, {
          header: true,
          complete: (results) => resolve(results.data),
          error: (err) => reject(err)
        });
      });
    }).on('error', reject);
  });
}

async function main() {
  const spec = await fetchCsv('https://docs.google.com/spreadsheets/d/1yg7mlk3ZEtR0dmYaE1uzbZKfHTW3eJej/gviz/tq?tqx=out:csv&sheet=SPEC');
  const rubber = await fetchCsv('https://docs.google.com/spreadsheets/d/1yg7mlk3ZEtR0dmYaE1uzbZKfHTW3eJej/gviz/tq?tqx=out:csv&sheet=RUBBER');
  
  console.log('SPEC columns:', Object.keys(spec[0]));
  console.log('RUBBER columns:', Object.keys(rubber[0]));
  
  console.log('SPEC sample:', spec[0]);
  console.log('RUBBER sample:', rubber[0]);
}

main();
