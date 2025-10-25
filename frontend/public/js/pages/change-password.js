// public/js/pages/change-password.js
// 비밀번호 수정 페이지 메인 로직

import { updatePassword } from "../services/userService.js";
import { logout } from "../services/authService.js";
import { isLoggedIn, clearLoginData } from "../utils/storage.js";
import { validatePassword } from "../utils/validation.js";
import { initProfileDropdown } from "../components/profileDropdown.js";
import { renderHeader, initBackButton } from '../components/headerTemplate.js';

renderHeader('.mobile-container');

// DOM 요소 가져오기
const passwordInput = document.getElementById('passwordInput');
const passwordConfirmInput = document.getElementById('passwordConfirmInput');
const passwordError = document.getElementById('passwordError');
const passwordConfirmError = document.getElementById('passwordConfirmError');
const btnSubmit = document.getElementById('btnSubmit');
const changePasswordForm = document.getElementById('changePasswordForm');
const toastMessage = document.getElementById('toastMessage');

// 상태 관리 전역 변수
let isPasswordValid = false;
let isPasswordConfirmValid = false;

// 로그인 체크
if (!isLoggedIn()) {
    alert('로그인이 필요합니다.');
    window.location.href = '/pages/login.html';
}

// 헤더 컴포넌트 초기화
initBackButton('/index.html');

// 프로필 드롭다운 초기화
initProfileDropdown({
    logoutButtonId: 'btnLogout'
});

// 비밀번호 입력 이벤트
passwordInput.addEventListener('input', () => {
    const password = passwordInput.value.trim();

    // 비밀번호 검증
    const passwordValidation = validatePassword(password);

    if (!passwordValidation.isValid) {
        passwordError.textContent = passwordValidation.message;
        passwordError.classList.remove('hidden');
        isPasswordValid = false;
    } else {
        passwordError.classList.add('hidden');
        isPasswordValid = true;
    }
    
    // 비밀번호 확인 필드가 이미 입력되어 있으면 재검증
    if (passwordConfirmInput.value) {
        checkPasswordMatch();
    }

    // 버튼 상태 업데이트
    updateSubmitButtonState();
});

// 비밀번호 확인 입력 이벤트
passwordConfirmInput.addEventListener('input', () => {
    checkPasswordMatch();
    updateSubmitButtonState();
});

// 비밀번호 확인 검증 함수
function checkPasswordMatch() {
    const password = passwordInput.value.trim();
    const passwordConfirm = passwordConfirmInput.value.trim();
    
    if (!passwordConfirm) {
        passwordConfirmError.classList.add('hidden');
        isPasswordConfirmValid = false;
        return;
    }
    
    if (password !== passwordConfirm) {
        passwordConfirmError.textContent = '비밀번호가 일치하지 않습니다.';
        passwordConfirmError.classList.remove('hidden');
        isPasswordConfirmValid = false;
    } else {
        passwordConfirmError.classList.add('hidden');
        isPasswordConfirmValid = true;
    }
}

// 수정하기 버튼 상태 업데이트
function updateSubmitButtonState() {
    btnSubmit.disabled = !(isPasswordValid && isPasswordConfirmValid);
}

// 폼 제출 이벤트
changePasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const password = passwordInput.value.trim();
    const passwordConfirm = passwordConfirmInput.value.trim();
    
    // 최종 검증
    if (!password || !passwordConfirm) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    if (!isPasswordValid) {
        passwordError.textContent = '유효한 비밀번호를 입력해주세요.';
        return;
    }
    
    if (password !== passwordConfirm) {
        passwordConfirmError.textContent = '비밀번호가 일치하지 않습니다.';
        passwordConfirmError.classList.remove('hidden');
        return;
    }
    
    // 로딩 상태
    btnSubmit.disabled = true;
    btnSubmit.textContent = '수정 중...';
    
    try {
        console.log('비밀번호 수정 요청');
        
        // userService의 updatePassword는 이미 두 파라미터를 받도록 구현되어 있음
        await updatePassword(password, passwordConfirm);
        
        console.log('비밀번호 수정 완료');
        
        // 토스트 메시지 표시
        showToast();
        
        // 1초 후 로그아웃 처리 및 로그인 페이지로 이동
        setTimeout(async() => {
            await logout();  
            clearLoginData();
            window.location.href = '/pages/login.html';
        }, 1000);
        
    } catch (error) {
        console.error('비밀번호 수정 실패:', error);
        alert(error.message);
        
        if (error.status === 401) {
            clearLoginData();
            window.location.href = '/pages/login.html';
        }
        
        btnSubmit.disabled = false;
        btnSubmit.textContent = '수정하기';
    }
});

// 토스트 메시지 표시
function showToast() {
    toastMessage.classList.remove('hidden');
    
    setTimeout(() => {
        toastMessage.classList.add('hidden');
    }, 2000);
}

console.log('비밀번호 수정 페이지 로드 완료');