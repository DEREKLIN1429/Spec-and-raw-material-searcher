import https from 'https';

https.get('https://docs.google.com/spreadsheets/d/1yg7mlk3ZEtR0dmYaE1uzbZKfHTW3eJej/gviz/tq?tqx=out:csv&sheet=SPEC', {
  headers: {
    'Origin': 'http://localhost:3000'
  }
}, (res) => {
  console.log('Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
});
