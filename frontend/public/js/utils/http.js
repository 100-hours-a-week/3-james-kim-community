// public/js/utils/http.js
// HTTP 요청 함수 (세션 기반 인증)

/**
 * 통합 HTTP 요청 함수
 * @param {string} url - 요청 URL
 * @param {object} options - 요청 옵션
 * @param {string} options.method - HTTP 메서드
 * @param {object|FormData} options.body - 요청 바디
 * @param {boolean} options.isFormData - FormData 여부
 * @returns {Promise<object>} 응답 데이터
 */
async function request(url, options = {}) {
    try {
        const {
            method = 'GET',
            body = null,
            isFormData = false
        } = options;

        // 1. Headers 설정
        const headers = {};
        
        // FormData가 아닐 때만 Content-Type 설정
        if (!isFormData && body !== null) {
            headers['Content-Type'] = 'application/json';
        }

        // 2. Fetch 옵션 구성
        const fetchOptions = {
            method: method,
            headers: headers,
            credentials: 'include' // 세션 쿠키 자동 전송
        };

        // Body 추가
        if (body !== null && method !== 'GET' && method !== 'HEAD') {
            fetchOptions.body = isFormData ? body : JSON.stringify(body);
        }

        console.log(`[HTTP 요청] ${method} ${url}`);

        // 3. HTTP 요청
        const response = await fetch(url, fetchOptions);

        // 4. 응답 파싱
        let result;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            result = await response.text();
        }

        // 5. HTTP 상태 코드 체크
        if (!response.ok) {
            console.error(`[HTTP 에러] ${response.status}:`, result);

            const errorResponse = {
                status: response.status,
                message: result.message || '요청에 실패했습니다.',
                data: result.data || null
            };

            // 401 Unauthorized - 세션 만료 또는 미인증
            if (response.status === 401) {
                console.warn('인증 실패 - 로그인 페이지로 이동');
                
                // 로그인 페이지가 아닌 경우에만 리다이렉트
                if (!window.location.pathname.includes('/pages/login.html')) {
                    alert('로그인이 필요합니다.');
                    window.location.href = '/pages/login.html';
                }
            }

            throw errorResponse;
        }

        console.log(`[HTTP 성공] ${method} ${url}`, result);

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

        throw error;
    }
}

// GET 요청 (인증 불필요)
async function get(url) {
    return request(url, { method: 'GET' });
}

// GET 요청 (인증 필요) - 세션 방식에서는 get과 동일하지만 명시적 구분
async function getWithAuth(url) {
    return request(url, { method: 'GET' });
}

// POST 요청 (인증 불필요)
async function post(url, data) {
    return request(url, { method: 'POST', body: data });
}

// POST 요청 (인증 필요)
async function postWithAuth(url, data) {
    return request(url, { method: 'POST', body: data });
}

// POST 요청 (FormData)
async function postFormData(url, formData) {
    return request(url, { 
        method: 'POST', 
        body: formData,
        isFormData: true 
    });
}

// PUT 요청 (인증 필요)
async function putWithAuth(url, data) {
    return request(url, { method: 'PUT', body: data });
}

// PATCH 요청 (인증 필요)
async function patchWithAuth(url, data) {
    return request(url, { method: 'PATCH', body: data });
}

// DELETE 요청 (인증 필요)
async function deleteWithAuth(url) {
    return request(url, { method: 'DELETE' });
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