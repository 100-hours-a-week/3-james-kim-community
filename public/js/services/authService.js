// public/js/services/authService.js
// 인증 API 서비스 - 로그인, 중복 체크 API 호출

import { get, post } from "../utils/http.js";
import { API_ENDPOINTS } from "../config/api.js";

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

        let userMessage = '요청에 실패했습니다.';

        // 백엔드 에러 메시지에 따라 한글 변환
        if (error.status === 401) {
            if (error.message === 'invalid_credentials') {
                userMessage = '이메일 또는 비밀번호가 일치하지 않습니다.';
            }
        } else if (error.status === 500) {
            userMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.status === 0) {
            userMessage = '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.';
        }
    
        // 에러를 다시 던짐 (login.js에서 처리)
        throw {
            status: error.status,
            message: userMessage,
            originalMessage: error.message  
        };
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
        
        throw {
            status: error.status,
            message: '이메일 중복 확인에 실패했습니다.',
            originalMessage: error.message
        };
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
        
        throw {
            status: error.status,
            message: '닉네임 중복 확인에 실패했습니다.',
            originalMessage: error.message
        };
    }
}

export { login, checkEmailDuplicate, checkNicknameDuplicate };