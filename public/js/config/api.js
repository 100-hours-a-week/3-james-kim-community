// public/js/config/api.js
// - 백엔드 API 엔드포인트 URL 관리

// API 기본 URL (스프링부트 서버)
const API_BASE_URL = 'http://localhost:8080/api';

// 로그인 API 엔드포인트
const API_ENDPOINTS = {
    // 인증 관련
    LOGIN: `${API_BASE_URL}/auth`,
    CHECK_EMAIL: `${API_BASE_URL}/auth/check-email`,
    CHECK_NICKNAME: `${API_BASE_URL}/auth/check-nickname`,

    // 사용자 관련
    SIGNUP: `${API_BASE_URL}/users`,

    // 이미지 관련
    UPLOAD_IMAGE: `${API_BASE_URL}/images`,

    // 게시글 관련
    POSTS: `${API_BASE_URL}/posts`,
    POST_DETAIL: (postId) => `${API_BASE_URL}/posts/${postsId}`,
};

export { API_BASE_URL, API_ENDPOINTS };