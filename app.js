// app.js

// 1. Express 모듈 가져오기
const express = require('express');

// 2. Express 앱 생성
const app = express();
const port = 3000;

// 3. 기본 라우트 설정 (선택)
app.get('/', (req, res) => {
    res = resdirect('/index.html');
});

// 4. 서버 시작
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});