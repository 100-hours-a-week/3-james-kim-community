# 📋 프론트엔드 개발 구현 전 정리 (바닐라 JS)
- 구현에 앞서 기본적으로 필요한 것들과 기본적인 구조를 정리해보고 넘어가기.
- HTML5
- CSS3
- JavaScript

## 기본적인 설정 - 백엔드 API 정보
- Base URL: `http://localhost:8080/api`
- 인증 방식: JWT (Bearer Token)

## 프로젝트 폴더 구조 (큰 틀만)
community-frontend/
- index.html            # 진입점 (로그인 페이지)
- pages/                # 각 페이지들
  - login.html          
- css/
  - common.css          # 공통 스타일
  - components.css      # 재사용 컴포넌트 스타일
  - pages/ ...          # 각 페이지 전용
- js/
  - config/
  - utils/
  - services/
  - components/
  - pages/
- assets/
  - images/               # 이미지 파일들

---

## 전체 페이지 구성 (총 8개 페이지)
1️⃣ 인증 관련 (2개)
- 로그인 페이지 (`pages/login.html`)
- 회원가입 페이지 (`pages/signup.html`)

2️⃣ 게시글 관련 (4개)
- 게시글 목록 페이지 (`pages/posts.html`)
- 게시글 상세 페이지 (`pages/post-detail.html`)
- 게시글 작성 페이지 (`pages/create-post.html`)
- 게시글 수정 페이지 (`pages/edit-post.html`)

3️⃣ 회원정보 관련 (2개)
- 프로필 수정 페이지 (`pages/edit-profile.html`)
- 비밀번호 변경 페이지 (`pages/edit-password.html`)

---

## 공통 UI 컴포넌트 (재사용 할 것들)
### 모달 (Modal)
- 삭제 확인 모달
  - 게시글 / 댓글 삭제 시

### 토스트(Toast) 메시지
- 성공 메시지 "수정 완료" 등
  - 회원정보 / 비밀번호 수정 시

### 드롭다운 (Dropdown)
- 프로필 드롭다운 → 모든 화면 우측 상단
  - 회원 정보 수정
  - 비밀번호 수정
  - 로그아웃
 
### 헤더 (Header)
- 모든 화면 중앙 상단 "커뮤니티 또는 커뮤니티명" 타이틀 표시

--- 

## 페이지별 주요 기능 체크
### 1. 로그인 페이지 (`pages/login.html`)
- 이메일/비밀번호 입력 폼
- 유효성 검사
  - 이메일 형식 체크
  - 비밀번호 8~20자, 대소문자/숫자/특수문자 최소 1개 포함
- 에러 메시지 표시
- 로그인 버튼 활성화/비활성화 (유효성 통과 시 색상 변경)
- API: `POST /api/auth` → 토큰 받아서 저장
- 로그인 성공 시 → 게시글 목록 페이지로 이동
- "회원가입" 버튼 클릭 → 회원가입 페이지로 이동

---

### 2. 회원가입 페이지 (`pages/signup.html`)
- 프로필 이미지 업로드
  - 동그라미 아이콘 클릭 → 파일 선택
  - 이미지 프리뷰 표시
  - 재클릭 시 이미지 삭제 가능
  - `API: POST /api/images` (multipart/form-data)
- 이메일 입력 + 중복 체크
  - 이메일 형식 체크
  - 중복 시 에러 메시지
- 비밀번호 / 비밀번호 확인
  - 유효성 검사
  - 일치 여부 확인
- 닉네임 입력 + 중복 체크
  - 띄어쓰기 불가, 10자 이내
  - 중복 시 에러 메시지
- 회원가입 버튼
  - 모든 유효성 통과 시 활성화
  - API: `POST /api/users`
  - 성공 시 → 로그인 페이지로 이동
- 화면 상단 뒤로가기 버튼 ("<") 클릭 시 → 로그인 페이지로 이동
- "로그인하러 가기" 클릭 시 → 로그인 페이지로 이동

---

### 3. 게시글 목록 페이지 (`pages/posts.html`)
- 우측 상단 프로필 드롭다운
  - 클릭 시 메뉴 펼침 (회원정보 수정, 비밀번호 수정, 로그아웃)
- "게시글 작성" 버튼
  - 호버 시 색상 변경 (ACA0EB → 7F6AEE)
  - 클릭 시 → 게시글 작성 페이지로 이동
- 게시글 개별 카드 리스트
  - 제목 (최대 26자, 초과 시 잘림)
  - 작성자 닉네임 / 프로필 이미지
  - 날짜/시간 (yyyy-mm-dd hh:mm:ss)
  - 좋아요/댓글/조회수 (1k, 10k, 100k 표기)
- 무한 스크롤 (Infinity Scroll)
  - API: `GET /api/posts?lastSeenId=&limit=`
  - 스크롤 하단 도달 시 다음 페이지 로드
- 카드 클릭 시 → 게시글 상세 페이지로 이동

---

### 4. 게시글 상세 페이지 (`pages/post-detail.html`)
- 뒤로가기 버튼 ("<") → 게시글 목록으로
- 게시글 정보 표시
  - 제목, 내용, 이미지, 작성자, 작성일
  - 좋아요/댓글/조회수 (1k, 10k, 100k 표기)
- 수정/삭제 버튼 (작성자만 표시)
  - 수정 클릭 → 게시글 수정 페이지로
  - 삭제 클릭 → 삭제 확인 모달 → API: `DELETE /api/posts/{postId}`
- 좋아요 버튼
  - 클릭 시 색상 구분 (D9D9D9 ↔ ACA0EB)
  - API: `POST /api/posts/{postId}/likes`
- 댓글 목록
  - 무한 스크롤: API: GET `/api/posts/{postId}/comments?lastSeenId=&limit=`
  - 작성자만 수정/삭제 버튼 표시
- 댓글 작성
  - 텍스트 입력 → 등록 버튼 활성화 (ACA0EB → 7F6AEE)
  - API: `POST /api/posts/{postId}/comments`
- 댓글 수정
  - 수정 버튼 클릭 → 입력창에 기존 내용 로드
  - "저장" 버튼 → 수정된 내용으로 로드
  - "취소" 버튼 → 수정하지 않고, 기존 내용 그대로 
  - API: `PATCH /api/posts/{postId}/comments/{commentId}`
- 댓글 삭제
  - 삭제 확인 모달 → API: `DELETE /api/posts/{postId}/comments/{commentId}`

---

### 5. 게시글 작성 페이지 (`pages/create-post.html`)
- 뒤로가기 버튼 ("<") → 게시글 목록으로
- 제목 입력 (최대 26자, 초과 입력 불가)
- 내용 입력 (textarea, LONGTEXT)
- 이미지 업로드
  - 클릭 시 파일 선택
  - API: `POST /api/images`
- 완료 버튼
  - 제목/내용 모두 입력 시 활성화 (ACA0EB → 7F6AEE)
  - API: `POST /api/posts`
  - 성공 시 → 게시글 목록으로 이동
 
--- 

### 6. 게시글 수정 페이지 (`pages/edit-post.html`)
- 뒤로가기 버튼 ("<") → 게시글 상세 페이지로
- 기존 게시글 정보 로드
  - API: GET `/api/posts/{postId}`
- 제목/내용/이미지 수정
  - 이미지 재업로드 가능
- 수정 버튼
  - API: PATCH `/api/posts/{postId}`
  - 성공 시 → 해당 게시글 상세 페이지로 이동

---

### 7. 프로필 수정 페이지 (`pages/edit-profile.html`)
- 뒤로가기 버튼 ("<") → 게시글 목록으로
- 현재 프로필 정보 로드
  - API: `GET /api/users/me`
- 프로필 이미지 변경
  - API: `POST /api/images`
- 닉네임 변경
  - 중복 체크: `GET /api/auth/check-nickname?nickname=`
  - 10자 이내, 띄어쓰기 불가
- 수정하기 버튼
  - API: `PATCH /api/users/me`
  - 성공 시 → "수정 완료" 토스트 메시지
- 회원 탈퇴 버튼
  - 클릭 시 → 탈퇴 확인 모달
  - API: `DELETE /api/users/me`
  - 성공 시 → 로그인 페이지로 이동

---

### 8. 비밀번호 변경 페이지 (`pages/edit-password.html`)
- 비밀번호 / 비밀번호 확인 입력
- 유효성 검사
  - 8~20자, 대소문자/숫자/특수문자 포함
  - 두 입력값 일치 확인
- 수정하기 버튼
  - 유효성 통과 시 활성화 (ACA0EB → 7F6AEE)
  - API: PATCH `/api/users/me/password`
  - 성공 시 → "수정 완료" 토스트 메시지

---

## 구현 순서(큰 틀)
1. feature/login-page           # 가장 먼저 (index.html 역할)
2. feature/signup-page          # 회원가입
3. feature/post-list-page       # 게시글 목록 (메인)
4. feature/post-detail-page     # 게시글 상세 + 댓글
5. feature/create-post-page     # 게시글 작성
6. feature/edit-post-page       # 게시글 수정
7. feature/edit-profile-page    # 프로필 수정
8. feature/edit-password-page   # 비밀번호 변경
