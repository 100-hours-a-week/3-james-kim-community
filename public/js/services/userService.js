// public/js/services/userService.js
// 사용자 API 서비스 - 회원가입

import { getWithAuth, patchWithAuth, deleteWithAuth, putWithAuth, post } from "../utils/http.js";
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

// 사용자 정보 조회
async function getUserInfo() {
    try {
        const result = await getWithAuth(API_ENDPOINTS.USER_INFO);

        console.log('사용자 정보 조회 성공:', result);

        return result.data;
    } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        
        let userMessage = '사용자 정보를 불러올 수 없습니다.';
        
        if (error.status === 401) {
            userMessage = '로그인이 만료되었습니다.';
        } else if (error.status === 404) {
            userMessage = '사용자를 찾을 수 없습니다.';
        }
        
        throw {
            status: error.status,
            message: userMessage,
            originalMessage: error.message
        };
    }
}

// 닉네임 중복 체크 (회원정보 수정)
// 본인 현재 닉네임은 중복X
async function checkNicknameForUpdate(nickname) {
    try {
        const url = `${API_ENDPOINTS.CHECK_NICKNAME_UPDATE}?nickname=${encodeURIComponent(nickname)}`;
        const result = await getWithAuth(url);
        
        console.log('닉네임 중복 체크 결과 (수정용):', result);
        
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

// 회원정보 수정
async function updateUserInfo(updateData) {
    try {
        const result = await patchWithAuth(API_ENDPOINTS.USER_UPDATE, updateData);
        
        console.log('회원정보 수정 성공:', result);
        
        return result;
    } catch (error) {
        console.error('회원정보 수정 실패:', error);
        
        let userMessage = '회원정보 수정에 실패했습니다.';
        
        if (error.status === 401) {
            userMessage = '로그인이 만료되었습니다.';
        } else if (error.status === 409) {
            userMessage = '중복된 닉네임입니다.';
        } else if (error.status === 400) {
            userMessage = error.message || '입력 정보를 확인해주세요.';
        }
        
        throw {
            status: error.status,
            message: userMessage,
            originalMessage: error.message
        };
    }
}

// 비밀번호 수정
async function updatePassword(newPassword, newPasswordConfirm) {
    try {        
        const result = await putWithAuth(API_ENDPOINTS.PASSWORD_UPDATE, {
            newPassword,
            newPasswordConfirm
        });
        
        console.log('비밀번호 수정 성공:', result);
        
        return result;
    } catch (error) {
        console.error('비밀번호 수정 실패:', error);
        
        let userMessage = '비밀번호 수정에 실패했습니다.';
        
        if (error.status === 401) {
            userMessage = '로그인이 만료되었습니다.';
        } else if (error.status === 400) {
            userMessage = error.message || '입력 정보를 확인해주세요.';
        }
        
        throw {
            status: error.status,
            message: userMessage,
            originalMessage: error.message
        };
    }
}

// 회원탈퇴
async function deleteUser() {
    try {
        const result = await deleteWithAuth(API_ENDPOINTS.USER_DELETE);
        
        console.log('회원 탈퇴 성공:', result);
        
        return result;

    } catch (error) {
        console.error('회원 탈퇴 실패:', error);
        
        let userMessage = '회원 탈퇴에 실패했습니다.';
        
        if (error.status === 401) {
            userMessage = '로그인이 만료되었습니다.';
        }
        
        throw {
            status: error.status,
            message: userMessage,
            originalMessage: error.message
        };
    }
}

export { 
    signup,
    getUserInfo,
    checkNicknameForUpdate,
    updateUserInfo,
    updatePassword,
    deleteUser
}; 