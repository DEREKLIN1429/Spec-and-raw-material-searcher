import https from 'https';

const url = 'https://doc-00-2g-sheets.googleusercontent.com/export/54bogvaave6cua4cdnls17ksc4/6dhckfk2ntgigv3e66rtpl4ic8/1773819745000/109332853791495455149/*/1_SqDVFnw1xRDCH4MhiWg5ZxUcE1UmryuJ4q-0I23x2s?format=csv&gid=0';

https.get(url, (res) => {
  console.log(`${url} -> ${res.statusCode}`);
}).on('error', (e) => {
  console.error(e);
});
