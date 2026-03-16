const url = 'https://script.google.com/macros/s/AKfycbw7Gb1OX0iXMlyJoBZef443mEpJ6_Z0mVd4biGALRhUWsGNErH90dF9jsYvsd01d8DG/exec';
const data = {
  mode: 'APPEND',
  type: 'GAME_SCORE',
  '참가유형': '개인',
  '이름': '테스트유저2',
  '생년월일': '20000101',
  '소속센터': '테스트센터',
  '게임종류': '숫자 기억',
  '점수': 777
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
