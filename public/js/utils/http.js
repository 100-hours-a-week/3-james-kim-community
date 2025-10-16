// public/js/utils/http.js
// HTTP 요청 함수 (fetch)

// GET 요청 (중복 체크)
async function get(url) {
    try {

        // 1. fetch로 GET 요청
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // 2. 응답을 JSON으로 파싱
        const result = await response.json();

        // 3. HTTP 상태 코드 체크
        if (!response.ok) {
            throw {
                status: response.status,
                message: result.message || '요청에 실패했습니다.',
                data: result.data
            };
        }

        return result;

    } catch (error) {

        // 에러 처리
        console.error('HTTP GET 요청 실패:', error);

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

// POST 요청 (로그인, 회원가입)
async function post(url, data) {
    try {

        // 1. fetch로 POST 요청
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),  // JS 객체 -> JSON 문자열
        });

        // 2. 응답을 JSON으로 파싱
        const result = await response.json();

        // 3. HTTP 상태 코드 체크
        if (!response.ok) {
            throw {
                status: response.status,
                message: result.message || '요청에 실패했습니다.',
                data: result.data
            };
        }

        // 성공 (200, 201)
        return result;

    } catch (error) {

        // 에러 처리
        console.error('HTTP POST 요청 실패:', error);

        if (!error.status) {
            throw {
                status: 0,
                message: '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.',
                data: null
            };
        }

        // API 에러 (400, 500 등)
        throw error;
    }
}

// 파일 업로드 (FormData)
async function postFormData(url, formData) {
    try {

        const response = await fetch(url, {
            method: 'POST',
            // FormData는 Content-Type을 자동으로 설정하므로 headers 생략
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: result.message || '요청에 실패했습니다.',
                data: result.data
            };
        }

        return result;

    } catch (error) {

        console.error('HTTP FormData 요청 실패:', error);

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

// GET 요청 (인증 필요 - 헤더 JWT 토큰)
async function getWithAuth(url, token) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                // 로그인한 이후로는 토큰으로 사용자 검증
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: result.message || '요청에 실패했습니다.',
                data: result.data
            };
        }

        return result;

    } catch (error) {
        console.error('HTTP GET (인증) 요청 실패:', error);

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

// POST 요청 (인증 필요 - 헤더 JWT 토큰)
async function postWithAuth(url, data, token) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: result.message || '요청에 실패했습니다.',
                data: result.data
            };
        }

        return result;

    } catch (error) {
        console.error('HTTP POST (인증) 요청 실패:', error);

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

// PUT 요청 (인증 필요 - 헤더 JWT 토큰)
async function putWithAuth(url, data, token) {
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: result.message || '요청에 실패했습니다.',
                data: result.data
            };
        }

        return result;

    } catch (error) {
        console.error('HTTP PUT (인증) 요청 실패:', error);

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

// DELETE 요청 (인증 필요 - 헤더 JWT 토큰)
async function deleteWithAuth(url, token) {
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: result.message || '요청에 실패했습니다.',
                data: result.data
            };
        }

        return result;

    } catch (error) {
        console.error('HTTP DELETE (인증) 요청 실패:', error);

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

export { get, post, postFormData, getWithAuth, postWithAuth, putWithAuth, deleteWithAuth };