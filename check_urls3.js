import https from 'https';

const url = 'https://docs.google.com/spreadsheets/d/1yg7mlk3ZEtR0dmYaE1uzbZKfHTW3eJej/gviz/tq?tqx=out:csv&sheet=SPEC';

https.get(url, (res) => {
  console.log(`SPEC: ${res.statusCode}`);
});

const url2 = 'https://docs.google.com/spreadsheets/d/1yg7mlk3ZEtR0dmYaE1uzbZKfHTW3eJej/gviz/tq?tqx=out:csv&sheet=RUBBER';

https.get(url2, (res) => {
  console.log(`RUBBER: ${res.statusCode}`);
});

const url3 = 'https://docs.google.com/spreadsheets/d/1_SqDVFnw1xRDCH4MhiWg5ZxUcE1UmryuJ4q-0I23x2s/export?format=csv&gid=0';

https.get(url3, (res) => {
  console.log(`RECIPE: ${res.statusCode}`);
});
