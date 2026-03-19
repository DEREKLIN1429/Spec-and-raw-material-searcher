import https from 'https';

https.get('https://docs.google.com/spreadsheets/d/1yg7mlk3ZEtR0dmYaE1uzbZKfHTW3eJej/gviz/tq?tqx=out:csv&sheet=RUBBER', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data.split('\n').filter(line => line.includes('7716')).join('\n'));
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
