// public/js/services/authService.js
// 인증 API 서비스 - 로그인, 중복 체크 API 호출

import { get, post, deleteWithAuth } from "../utils/http.js";
import { API_ENDPOINTS } from "../config/api.js";
import { handleServiceError } from "../utils/errorHandler.js";

async function login(email, password) {
    try {
        // API 호출
        const result = await post(API_ENDPOINTS.LOGIN, {
            email: email,
            password: password
        });

        console.log('로그인 API 성공:', result);
        return result;
    } catch (error) {

        // 에러 처리
        console.error('로그인 API 실패:', error);

        throw handleServiceError(error, '요청에 실패했습니다.', {
            401: {
                'invalid_credentials': '이메일 또는 비밀번호가 일치하지 않습니다.'
            },
            500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            0: '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.'
        });
    }
}

async function checkEmailDuplicate(email) {
    try {
        const url = `${API_ENDPOINTS.CHECK_EMAIL}?email=${encodeURIComponent(email)}`;
        const result = await get(url);
        
        console.log('이메일 중복 체크 결과:', result);

        return result.data.available;
        
    } catch (error) {
        console.error('이메일 중복 체크 실패:', error);
        
        // 409 Conflict는 중복을 의미
        if (error.status === 409) {
            return false;  
        }
        
        throw handleServiceError(error, '이메일 중복 확인에 실패했습니다.');
    }
}

async function checkNicknameDuplicate(nickname) {
    try {
        const url = `${API_ENDPOINTS.CHECK_NICKNAME}?nickname=${encodeURIComponent(nickname)}`;
        const result = await get(url);
        
        console.log('닉네임 중복 체크 결과:', result);

        return result.data.available;
        
    } catch (error) {
        console.error('닉네임 중복 체크 실패:', error);
        
        // 409 Conflict는 중복을 의미
        if (error.status === 409) {
            return false; 
        }
        
        throw handleServiceError(error, '닉네임 중복 확인에 실패했습니다.');
    }
}

async function logout() {
    try {
        await deleteWithAuth(API_ENDPOINTS.LOGOUT);
        console.log('서버 로그아웃 성공');
    } catch (error) {
        console.error('서버 로그아웃 실패:', error);
        // 서버 로그아웃 실패해도 클라이언트는 로그아웃 처리
    }
}

export { login, checkEmailDuplicate, checkNicknameDuplicate, logout };