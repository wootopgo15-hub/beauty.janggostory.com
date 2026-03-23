import fetch from 'node-fetch';
async function test() {
  const res = await fetch('https://script.google.com/macros/s/AKfycbw5kGrufoEkT51E0ayzCdChV1-okPCwQJiD3c18OOAnbWK3q-pX7PsHel2697m82GxM/exec', {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'registerVolunteer',
      volunteerName: '테스트',
      phone: '010-9999-9999',
      dateTimes: [{ date: '2026-04-01', time: '10:00' }]
    })
  });
  const text = await res.text();
  console.log(text);
}
test();
