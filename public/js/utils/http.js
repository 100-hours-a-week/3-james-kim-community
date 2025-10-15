// public/js/utils/http.js
// HTTP 요청 함수 (fetch)

// POST 요청 (로그인)
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
        console.error('HTTP 요청 실패:', error);

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

export { post };