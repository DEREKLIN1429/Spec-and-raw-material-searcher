async function run() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/1yg7mlk3ZEtR0dmYaE1uzbZKfHTW3eJej/gviz/tq?tqx=out:csv&sheet=SPEC');
  const text = await res.text();
  console.log(text.split('\n')[0]);
}
run();
