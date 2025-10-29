// public/js/pages/change-password.js
// 비밀번호 수정 페이지 메인 로직

import { updatePassword } from "../services/userService.js";
import { logout } from "../services/authService.js";
import { validatePassword } from "../utils/validation.js";
import { initProfileDropdown } from "../components/profileDropdown.js";
import { renderHeader, initBackButton } from '../components/headerTemplate.js';

// 상태 관리
let isPasswordValid = false;
let isPasswordConfirmValid = false;

// DOM 요소
let passwordInput;
let passwordConfirmInput;
let passwordError;
let passwordConfirmError;
let btnSubmit;
let changePasswordForm;
let toastMessage;

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

// 토스트 메시지 표시
function showToast() {
    toastMessage.classList.remove('hidden');
    
    setTimeout(() => {
        toastMessage.classList.add('hidden');
    }, 2000);
}

// 이벤트 핸들러
function handlePasswordInput() {
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

    updateSubmitButtonState();
}

function handlePasswordConfirmInput() {
    checkPasswordMatch();
    updateSubmitButtonState();
}

async function handleFormSubmit(event) {
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
        
        await updatePassword(password, passwordConfirm);
        
        console.log('비밀번호 수정 완료');
        
        showToast();
        
        // 1초 후 로그아웃 처리 및 로그인 페이지로 이동
        setTimeout(async() => {
            await logout();
            alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
            window.location.href = '/pages/login.html';
        }, 1000);
        
    } catch (error) {
        console.error('비밀번호 수정 실패:', error);
        alert(error.message);
        
        btnSubmit.disabled = false;
        btnSubmit.textContent = '수정하기';
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    passwordInput.addEventListener('input', handlePasswordInput);
    
    passwordConfirmInput.addEventListener('input', handlePasswordConfirmInput);
    
    // 폼 제출
    changePasswordForm.addEventListener('submit', handleFormSubmit);
}

// 초기화
function init() {
    
    // 2. 헤더 생성
    renderHeader('.mobile-container');
    
    // 3. DOM 요소 가져오기
    passwordInput = document.getElementById('passwordInput');
    passwordConfirmInput = document.getElementById('passwordConfirmInput');
    passwordError = document.getElementById('passwordError');
    passwordConfirmError = document.getElementById('passwordConfirmError');
    btnSubmit = document.getElementById('btnSubmit');
    changePasswordForm = document.getElementById('changePasswordForm');
    toastMessage = document.getElementById('toastMessage');
    
    // 4. 헤더 컴포넌트 초기화
    initBackButton('/index.html');
    
    // 5. 프로필 드롭다운 초기화
    initProfileDropdown({
        logoutButtonId: 'btnLogout'
    });
    
    // 6. 이벤트 리스너 설정
    setupEventListeners();
    
    console.log('비밀번호 수정 페이지 로드 완료');
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);