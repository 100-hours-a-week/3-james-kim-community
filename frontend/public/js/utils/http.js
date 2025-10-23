// public/js/utils/http.js
// HTTP 요청 함수 (fetch)

import { getAccessToken, getRefreshToken, clearLoginData, updateAccessToken } from "./storage.js";
import { API_ENDPOINTS } from "../config/api.js";

// token 상태 관리
let isRefreshing = false; 
let failedRequestsQueue = []; // 갱신 대기 중 요청들

/**
 * Refresh Token으로 Access Token 갱신
 */
async function refreshAccessToken() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        throw new Error('REFRESH_TOKEN_MISSING');
    }

    console.log('Access Token 갱신 시도');

    const response = await fetch(API_ENDPOINTS.TOKEN_REFRESH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({refreshToken}),
    });

    const result = await response.json();

    if (!response.ok) {
        console.error('토큰 갱신 실패:', result.message);

        // Refresh Tocken까지 만료 -> 재로그인 필요
        if (response.status == 401) {
            throw new Error('REFRESH_TOKEN_EXPIRED');
        }

        throw new Error('TOKEN_REFRESH_FAILED');
    }

    const newAccessToken = result.data.accessToken;
    updateAccessToken(newAccessToken);
    console.log('Access Token 갱신 성공');

    return newAccessToken;
}

/**
 * 401 에러 발생 시 토큰 갱신 후 원래 요청 재시도
 * - 토큰 갱신 중이면 대기열 추가
 * - Refresh Token 만료 시 로그아웃 처리
 */
async function handleTokenRefresh(url, options, errorResponse) {
    if (errorResponse.message !== 'token_expired') {
        console.log('토큰 만료가 아닌 401 에러 - 갱신 불가:', errorResponse.message);
        throw errorResponse;
    }

    if (isRefreshing) {
        console.log('토큰 갱신 중 - 대기열에 추가')
        return new Promise((resolve, reject) => {
            failedRequestsQueue.push({resolve, reject, url, options});
        });
    }

    isRefreshing = true;

    try {

        // refresh token으로 갱신 시도
        await refreshAccessToken();

        console.log(`대기 중인 요청 ${failedRequestsQueue.length}개 재시도`);
        failedRequestsQueue.forEach(({ resolve, url, options }) => {
            resolve(request(url, { ...options, _retry: true }));
        });
        failedRequestsQueue = [];
        
        console.log('원래 요청 재시도:', url);
        return request(url, { ...options, _retry: true });

    } catch (error) {
        console.error('토큰 갱신 실패:', error);
        
        // Refresh Token 만료 → 로그아웃 처리
        if (error.message === 'REFRESH_TOKEN_EXPIRED') {
            console.log('Refresh Token 만료 → 로그아웃');
            clearLoginData();
            
            // 대기 중인 요청들 모두 실패 처리
            const loginError = {
                status: 401,
                message: '로그인이 만료되었습니다. 다시 로그인해주세요.',
                needLogin: true
            };
            
            failedRequestsQueue.forEach(({ reject }) => reject(loginError));
            failedRequestsQueue = [];

            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            window.location.replace('/index.html');
            
            throw loginError;
        }
        
        throw error;
    } finally {
        isRefreshing = false;
    }
}

/**
 * 통합 HTTP 요청 함수 - 원래 각각 분리되어 있었으나 공통된 코드가 많아 리팩토링 완료
 * @param {string} url - 요청 URL
 * @param {object} options - 요청 옵션
 * @param {string} options.method - HTTP 메서드 (GET, POST, PUT, PATCH, DELETE)
 * @param {object|FormData} options.body - 요청 바디 (선택)
 * @param {boolean} options.auth - 인증 토큰 포함 여부 (기본: false)
 * @param {boolean} options.isFormData - FormData 여부 (기본: false)
 * @returns {Promise<object>} 응답 데이터
 */
async function request(url, options = {}) {
    try {
        const {
            method = 'GET',
            body = null,
            auth = false,
            isFormData = false,
            _retry = false
        } = options;

        // 1. Headers 설정
        const headers = {};
        
        // FormData가 아닐 때만 Content-Type 설정 (FormData는 브라우저가 자동 설정)
        if (!isFormData && body !== null) {
            headers['Content-Type'] = 'application/json';
        }

        // 인증이 필요한 경우 토큰 추가
        if (auth) {
            const token = getAccessToken();
            if (!token) {
                throw {
                    status: 401,
                    message: '로그인이 필요합니다.',
                    data: null
                };
            }
            headers['Authorization'] = `Bearer ${token}`;
        }

        // 2. Fetch 옵션 구성
        const fetchOptions = {
            method: method,
            headers: headers
        };

        // Body 추가 (GET, HEAD 메서드는 body 없음)
        if (body !== null && method !== 'GET' && method !== 'HEAD') {
            fetchOptions.body = isFormData ? body : JSON.stringify(body);
        }

        // 3. HTTP 요청
        const response = await fetch(url, fetchOptions);

        // 4. 응답 파싱
        const result = await response.json();

        // 5. HTTP 상태 코드 체크
        if (!response.ok) {
            const errorResponse = {
                status: response.status,
                message: result.message || '요청에 실패했습니다.',
                data: result.data
            };

            // 401 에러 && 인증 필요한 요청 && 재시도 아님 → 토큰 갱신 시도
            if (response.status === 401 && auth && !_retry) {
                console.log('401 에러 감지 → 토큰 갱신 프로세스 시작');
                return handleTokenRefresh(url, options, errorResponse);
            }

            // 그 외 에러는 그대로 throw
            throw errorResponse;
        }

        // 6. 성공 응답 반환
        return result;

    } catch (error) {
        console.error('HTTP 요청 실패:', error);

        // 네트워크 에러 처리
        if (!error.status) {
            throw {
                status: 0,
                message: '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.',
                data: null
            };
        }

        // API 에러 그대로 던지기
        throw error;
    }
}

// GET 요청 (인증 불필요 - 회원가입 시 중복체크)
async function get(url) {
    return request(url, { method: 'GET', auth: false });
}

// GET 요청 (인증 필요)
async function getWithAuth(url) {
    return request(url, { method: 'GET', auth: true });
}

// POST 요청 (인증 불필요 - 회원가입)
async function post(url, data) {
    return request(url, { method: 'POST', body: data, auth: false });
}

// POST 요청 (인증 필요)
async function postWithAuth(url, data) {
    return request(url, { method: 'POST', body: data, auth: true });
}

// POST 요청 (FormData, 인증 불필요 - 파일은 독립적) 
async function postFormData(url, formData) {
    return request(url, { 
        method: 'POST', 
        body: formData, 
        auth: false,  
        isFormData: true 
    });
}

// PUT 요청 (인증 필요)
async function putWithAuth(url, data) {
    return request(url, { method: 'PUT', body: data, auth: true });
}

// PATCH 요청 (인증 필요)
async function patchWithAuth(url, data) {
    return request(url, { method: 'PATCH', body: data, auth: true });
}

// DELETE 요청 (인증 필요)
async function deleteWithAuth(url) {
    return request(url, { method: 'DELETE', auth: true });
}

export { 
    request,
    get, 
    getWithAuth,
    post, 
    postWithAuth,
    postFormData,
    putWithAuth,
    patchWithAuth,
    deleteWithAuth 
};