// public/js/utils/http.js
// HTTP 요청 함수 (fetch)

import { getAccessToken } from "./storage.js";

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
            isFormData = false
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
            throw {
                status: response.status,
                message: result.message || '요청에 실패했습니다.',
                data: result.data
            };
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