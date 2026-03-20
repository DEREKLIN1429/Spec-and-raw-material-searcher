async function run() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/1_SqDVFnw1xRDCH4MhiWg5ZxUcE1UmryuJ4q-0I23x2s/export?format=csv&gid=0');
  const text = await res.text();
  console.log(text.split('\n').filter(l => l.includes('DFA0021FL') || l.includes('DIERIIA196_01')).join('\n'));
}
run();
