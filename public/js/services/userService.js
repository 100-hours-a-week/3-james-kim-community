// public/js/services/userService.js
// 사용자 API 서비스 - 회원가입

import { post } from "../utils/http.js";
import { API_ENDPOINTS } from "../config/api.js";

async function signup(email, password, passwordConfirm, nickname, profileImage) {
    try {
        const requestData = {
            email: email,
            password: password,
            passwordConfirm: passwordConfirm,
            nickname: nickname,
            profileImage: profileImage  // null 가능 (선택사항)
        };

        console.log('회원가입 시도:', { email, nickname });
        
        const result = await post(API_ENDPOINTS.SIGNUP, requestData);
        
        console.log('회원가입 성공:', result);
        return result;

    } catch (error) {
        console.error('회원가입 실패:', error);
        
        let userMessage = '회원가입에 실패했습니다.';
        
        if (error.status === 400) {
            // 백엔드 유효성 검사 실패
            userMessage = error.message || '입력 정보를 확인해주세요.';
        } else if (error.status === 409) {
            // 중복
            userMessage = '이미 사용 중인 이메일 또는 닉네임입니다.';
        } else if (error.status === 500) {
            userMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.status === 0) {
            userMessage = '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.';
        }
        
        throw {
            status: error.status,
            message: userMessage,
            originalMessage: error.message
        };
    }
}

export { signup }; 