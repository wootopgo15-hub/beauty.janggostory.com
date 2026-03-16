const url = 'https://script.google.com/macros/s/AKfycbw7Gb1OX0iXMlyJoBZef443mEpJ6_Z0mVd4biGALRhUWsGNErH90dF9jsYvsd01d8DG/exec';
const data = {
  mode: 'APPEND',
  type: 'GAME_SCORE',
  '참가유형': '센터',
  '이름': '테스트센터',
  '생년월일': '',
  '소속센터': '테스트센터',
  '게임종류': '숫자 기억',
  '점수': 888
};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain;charset=utf-8',
  },
  body: JSON.stringify(data)
})
.then(res => res.text())
.then(text => console.log('Response:', text))
.catch(err => console.error('Error:', err));
