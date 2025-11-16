// public/js/config/api.js
// 백엔드 API 엔드포인트 URL 관리

// API 기본 URL (스프링부트 서버)
const API_BASE_URL = '/api';

// API Gateway URL (환경변수 또는 설정 파일에서 관리)
// 실제 배포 시 Lambda API Gateway URL로 변경 필요
const API_GATEWAY_URL = 'https://community-alb-641604100.ap-northeast-2.elb.amazonaws.com';

// 로그인 API 엔드포인트
const API_ENDPOINTS = {
    // 인증 관련
    LOGIN: `${API_BASE_URL}/auth`,
    LOGOUT: `${API_BASE_URL}/auth`,
    TOKEN_REFRESH: `${API_BASE_URL}/auth/refresh`,
    CHECK_EMAIL: `${API_BASE_URL}/auth/check-email`,
    CHECK_NICKNAME: `${API_BASE_URL}/auth/check-nickname`,

    // 사용자 관련
    SIGNUP: `${API_BASE_URL}/users`,
    USER_INFO: `${API_BASE_URL}/users/me`,
    USER_UPDATE: `${API_BASE_URL}/users`,
    USER_DELETE: `${API_BASE_URL}/users`,
    PASSWORD_UPDATE: `${API_BASE_URL}/users/password`,
    CHECK_NICKNAME_UPDATE: `${API_BASE_URL}/users/check-nickname`,

    // 이미지 관련
    UPLOAD_IMAGE: `${API_GATEWAY_URL}/images/upload`,

    // 게시글 관련
    POSTS: `${API_BASE_URL}/posts`,
    POST_DETAIL: (postId) => `${API_BASE_URL}/posts/${postId}`,
    POST_DELETE: (postId) => `${API_BASE_URL}/posts/${postId}`,
    POST_LIKE: (postId) => `${API_BASE_URL}/posts/${postId}/like`,

    // 댓글 관련
    COMMENTS: (postId) => `${API_BASE_URL}/posts/${postId}/comments`,
    COMMENT_DETAIL: (postId, commentId) => `${API_BASE_URL}/posts/${postId}/comments/${commentId}`,

};

export { API_BASE_URL, API_ENDPOINTS, BACKEND_BASE_URL };