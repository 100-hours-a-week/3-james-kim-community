# 📌 프로젝트명: 와글와글 커뮤니티 (WagleWagle Community)
개인적인 고민부터 개발 이야기까지 자유롭게 소통할 수 있는 커뮤니티 서비스입니다.
본 프로젝트는 Vanilla JavaScript 기반의 프론트엔드 레포지토리로,
초기 화면 설계부터 기능 구현, 백엔드 연동까지 모든 개발 과정을 직접 수행하였습니다.

---


## 📅 개발 인원 및 기간
- 개발 기간 : 2025-09 ~ 2025-11 
- 개발 인원 : 1인 (프론트엔드 & 백엔드 전체 개발)

<br/>
   
## 사용 기술 및 tools
- HTML / CSS, Vanilla JavaScript
- Express.js (정적 리소스 서빙 및 라우팅)

<br/>

## 관련 링크
- [백엔드 레포지토리](https://github.com/100-hours-a-week/3-james-kim-community-BE)
- [서비스 데모영상](https://drive.google.com/file/d/1QRmcLbqeb0l4wt5sW-tfE6V8EwNk_P0A/view?usp=sharing)

<br/>

## 폴더 구조
```
├── app.js                 # Express 서버 진입점
├── package.json
├── package-lock.json
├── Dockerfile
├── .gitignore
├── .dockerignore
└── public
    ├── index.html           # 랜딩 페이지
    ├── pages                # HTML 페이지들
    │   ├── login.html
    │   ├── post-detail.html
    │   ├── post-write.html
    │   ├── post-edit.html
    │   ├── edit-profile.html
    │   └── change-password.html
    ├── js                   # JavaScript 모듈
    │   ├── pages           # 페이지별 로직
    │   │   ├── auth.js
    │   │   ├── login.js
    │   │   ├── signup.js
    │   │   ├── posts.js
    │   │   ├── post-detail.js
    │   │   ├── post-write.js
    │   │   ├── post-edit.js
    │   │   ├── edit-profile.js
    │   │   └── change-password.js
    │   ├── services        # API 통신 레이어
    │   │   ├── authService.js
    │   │   ├── postService.js
    │   │   ├── commentService.js
    │   │   ├── imageService.js
    │   │   └── userService.js
    │   ├── utils           # 공통 유틸리티
    │   │   ├── http.js
    │   │   ├── validation.js
    │   │   ├── storage.js
    │   │   ├── errorHandler.js
    │   │   └── imageHelper.js
    │   └── components      # 재사용 컴포넌트
    │       ├── header.js
    │       ├── api.js
    │       ├── loginPromptModal.js
    │       └── profileDropdown.js
    ├── css                 # 스타일시트
    │   ├── common.css
    │   ├── reset.css
    │   ├── pages
    │   │   ├── auth.css
    │   │   ├── posts.css
    │   │   ├── post-detail.css
    │   │   ├── post-write.css
    │   │   ├── post-edit.css
    │   │   ├── edit-profile.css
    │   │   └── change-password.css
    │   └── components.css
    │       ├── dropdown.js
    │       ├── header.js
    │       ├── loginPromptModal.js
    │       └── modal.js
    └── assets              # 정적 리소스
        └── images
            ├── logo.png
            └── default-profile.png
```

---

## 서비스 화면
| 비로그인 사용자 홈 | 비로그인 사용자 프로필 |로그인 사용자 홈/프로필 |
| ---- | ---- | ---- |
| <img src="https://github.com/user-attachments/assets/a2f4d9b6-e073-458f-bc77-920fe8e8bd57" width="300" height="450" /> | <img src="https://github.com/user-attachments/assets/cd3fbe5a-5e42-4c5e-b4f4-1983eeaf887e" width="300" height="450" /> | <img src="https://github.com/user-attachments/assets/bb8c5795-7a10-447d-a7fb-32803eda2e47" width="300" height="450" /> |


| 로그인 | 회원가입 | 이용약관 |
|-------|----------| ----- |
| <img src="https://github.com/user-attachments/assets/f91db4c6-6cb7-42d9-a9bd-177e4ae14d55" width="300" height="450" /> | <img src="https://github.com/user-attachments/assets/b49fea70-946d-4788-81fc-820020d61376" width="300" height="450" /> | <img src="https://github.com/user-attachments/assets/939b5ffe-6eb9-4848-839c-ffd31bd01d6b" width="300" height="450" /> |

| 게시글 작성 | 게시글 수정 | 게시글 삭제 |
|-------|----------| ----- |
| <img src="https://github.com/user-attachments/assets/58062784-fb2d-4f34-bba0-2a3c45d538d7" width="300" height="450" /> | <img src="https://github.com/user-attachments/assets/d2ac7789-e55c-4e57-be80-2a7f445b634f" width="300" height="450" /> | <img src="https://github.com/user-attachments/assets/10b9a659-5dd5-4243-bd13-356d2d9a2bc0" width="300" height="450" /> |

| 게시글 상세/좋아요 | 댓글 상세 | 댓글 수정/삭제 |
|-------|----------| ----- |
| <img src="https://github.com/user-attachments/assets/78479f4a-9462-4ec8-a68f-7d43a9d6c6cb" width="300" height="450" /> | <img src="https://github.com/user-attachments/assets/07754f72-1476-4760-9916-16e57c75f410" width="300" height="450" /> | <img src="https://github.com/user-attachments/assets/ced37dc5-2bbd-4f88-858d-330b90732df0" width="300" height="450" /> |

| 회원정보수정 | 비밀번호수정 |
| --- |--- |
| <img src="https://github.com/user-attachments/assets/bce37e56-326a-4a16-9239-81c497c2cc9b" width="280" height="450" /> | <img src="https://github.com/user-attachments/assets/e670ac8a-6ee4-4d53-a49e-2f71f624b538" width="280" height="450" /> | 

---

## 주요 기능
- 사용자 인증: JWT 기반 로그인/회원가입, 토큰 관리
- 게시글 관리: 작성, 조회, 수정, 삭제, 좋아요 기능
- 댓글 시스템: 댓글 작성, 수정, 삭제
- 프로필 관리: 프로필 이미지 업로드, 닉네임 변경, 비밀번호 변경

--- 

## 트러블 슈팅
### 1️⃣ 프로젝트 구조화 및 관심사 분리
문제: 초기에는 모든 로직이 HTML 내부 `<script>`에 몰려 있어 유지보수 어려움  
해결:
- 서비스 레이어(`services/`) 도입 → API 로직 분리
- 유틸 모듈(`utils/`) 분리 → 중복 코드 제거
- 페이지별 로직(`pages/`) 생성 → 역할 명확화
- 프론트에서도 백엔드처럼 계층 구조를 적용하여 응집도 향상

<br/>

### 2️⃣ HTML/CSS/JS 로딩 순서 문제
문제: JS가 DOM보다 먼저 실행되어 null reference 발생   
해결: 
- `<script>`를 `<body>` 하단으로 이동
- `DOMContentLoaded` 이벤트 적용
- CSS 먼저 로드하여 FOUC 방지

<br/>

### 3️⃣ API 호출 중복 및 에러 처리 문제
문제: fetch 중복, 토큰 관리 비일관적    
해결:
- http.js 공통 fetch 유틸 구현
- JWT 자동 헤더 적용
- 401 발생 시 자동 로그아웃 처리 로직 통합

<br/>

### 4️⃣ Express.js 사용 이유
문제: 단순 정적 페이지라 Express가 과한가?   
하지만 선택한 이유:
- SSR 확장성 확보
- 미들웨어(CORS, Logging, Compression) 활용 가능
- 라우팅 유연성 우수
- nginx와 조합하여 캐싱 및 배포 구조 최적화 가능

---

## 프로젝트 회고
- Vanilla JS로 기본기 강화: DOM 조작, 이벤트, 비동기 처리의 본질을 깊게 이해
- 실제 배포 환경 경험: nginx + EC2 기반 배포
- 프레임워크의 필요성 체감: 상태 관리, 라우팅, 렌더링 등 프레임워크가 해결해주는 문제를 직접 경험
- 확장 가능한 구조의 중요성 학습: 단순 기능 구현이 아닌 구조적 설계의 중요성 체감
