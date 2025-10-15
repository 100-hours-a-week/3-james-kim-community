// public/js/config/api.js
// - 백엔드 API 엔드포인트 URL 관리

// API 기본 URL (스프링부트 서버)
const API_BASE_URL = 'http://localhost:8080/api';

// 로그인 API 엔드포인트
const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth`,
};

export { API_BASE_URL, API_ENDPOINTS };