// app.js

// 1. Express 모듈 가져오기
const express = require('express');
const path = require('path');

// 2. Express 앱 생성
const app = express();
const port = 3000;

// 3. 파일 서빙
app.use(express.static('public'))
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// 4. 기본 라우트 설정 (선택)
app.get('/', (req, res) => {
    res.redirect('/index.html');
});

// 5. 서버 시작
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});