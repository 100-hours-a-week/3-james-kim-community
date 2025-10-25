// public/js/pages/login.js
// 로그인 폼 로직 (원본 그대로)

import { validateEmail, validatePassword } from "../utils/validation.js";
import { login } from "../services/authService.js";
import { saveLoginData } from "../utils/storage.js";

// ========================================
// 로그인 폼 로직 (기존 auth.js에서 그대로 복사)
// ========================================
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const loginButton = document.getElementById('loginButton');
const loginForm = document.getElementById('loginForm');

// 이메일 유효성 검사
function checkEmailValidation() {
    const email = emailInput.value;
    const result = validateEmail(email);
  
    if (!result.isValid) {
        emailError.textContent = result.message;
        emailInput.classList.add('error');
        return false;
    } else {
        emailError.textContent = '';
        emailInput.classList.remove('error');
        return true;
    }
}

// 비밀번호 유효성 검사
function checkPasswordValidation() {
    const password = passwordInput.value;
    const result = validatePassword(password);
  
    if (!result.isValid) {
        passwordError.textContent = result.message;
        passwordInput.classList.add('error');
        return false;
    } else {
        passwordError.textContent = '';
        passwordInput.classList.remove('error');
        return true;
    }
}

// 로그인 버튼 활성화/비활성화
function updateLoginButtonState() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
  
    // 로그인에서는 이메일 형식만 검사, 비밀번호는 입력 여부만 확인
    if (email && password) {
        const isEmailValid = validateEmail(email).isValid;
    
        if (isEmailValid) {
            loginButton.disabled = false;
        } else {
            loginButton.disabled = true;
        }
    } else {
        loginButton.disabled = true;
    }
}

// 이메일 입력 이벤트
emailInput.addEventListener('input', () => {
    updateLoginButtonState();
    // 로그인 실패 에러 메시지 제거 (이메일 재입력 시)
    if (passwordError.textContent) {
        passwordError.textContent = '';
    }
});

emailInput.addEventListener('blur', () => {
    if (emailInput.value.trim()) {
        checkEmailValidation();
    }
});

// 비밀번호 입력 이벤트
passwordInput.addEventListener('input', () => {
    updateLoginButtonState();
    // 로그인 실패 에러 메시지 제거 (비밀번호 재입력 시)
    if (passwordError.textContent) {
        passwordError.textContent = '';
    }
});

// 로그인 폼 제출
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
  
    // 로그인에서는 이메일 형식만 검사 (비밀번호는 형식 검사 안함)
    const isEmailValid = checkEmailValidation();
  
    if (!isEmailValid) {
        console.log('유효성 검사 실패');
        return;
    }
  
    loginButton.disabled = true;
    loginButton.textContent = '로그인 중...';
  
    try {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
    
        console.log('로그인 시도:', email);
        const result = await login(email, password);
    
        console.log('로그인 성공:', result);
    
        const { accessToken, refreshToken, userId } = result.data;
        saveLoginData(accessToken, refreshToken, userId);
    
        window.location.href = '/index.html';
    
    } catch (error) {
        console.error('로그인 실패:', error);
        passwordError.textContent = error.message;
        loginButton.disabled = false;
        loginButton.textContent = 'Sign In';
    }
});

// 초기 상태
loginButton.disabled = true;