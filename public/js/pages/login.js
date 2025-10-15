// public/js/pages/login.js
// 로그인 페이지 메인 로직

import { validateEmail, validatePassword } from "../utils/validation.js";
import { login } from "../services/authService.js"; 
import { saveLoginData, isLoggedIn } from "../utils/storage.js";

// DOM 요소 가져오기
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const loginButton = document.getElementById('loginButton');
const loginForm = document.getElementById('loginForm');

if (isLoggedIn()) {
    console.log('이미 로그인되어 있습니다.');
    window.location.href = '/pages/posts.html';
}

// 이메일 유효성 검사 및 에러 표시
function checkEmailValidation() {
    const email = emailInput.value;
    const result = validateEmail(email);
  
    if (!result.isValid) {
        // 에러 표시
        emailError.textContent = result.message;
        emailInput.classList.add('error');
        return false;
    } else {
        // 에러 제거
        emailError.textContent = '';
        emailInput.classList.remove('error');
        return true;
    }
}

// 비밀번호 유효성 검사 및 에러 표시
function checkPasswordValidation() {
    const password = passwordInput.value;
    const result = validatePassword(password);
  
    if (!result.isValid) {
        // 에러 표시
        passwordError.textContent = result.message;
        passwordInput.classList.add('error');
        return false;
    } else {
        // 에러 제거
        passwordError.textContent = '';
        passwordInput.classList.remove('error');
        return true;
    }
}

// 로그인 버튼 활성화/비활성화 체크
function updateLoginButtonState() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
  
    // 둘 다 입력되었고, 유효성 검사 통과 시 활성화
    if (email && password) {
        const isEmailValid = validateEmail(email).isValid;
        const isPasswordValid = validatePassword(password).isValid;
    
        if (isEmailValid && isPasswordValid) {
            loginButton.disabled = false;
            loginButton.classList.add('active');
        } else {
            loginButton.disabled = true;
            loginButton.classList.remove('active');
        }
    } else {
        loginButton.disabled = true;
        loginButton.classList.remove('active');
    }
}

// 이벤트 리스너 등록

// 이메일 입력 시
emailInput.addEventListener('input', () => {
    updateLoginButtonState();
});

// 이메일 포커스 아웃 시 (입력 완료 후)
emailInput.addEventListener('blur', () => {
    if (emailInput.value.trim()) {
        checkEmailValidation();
    }
});

// 비밀번호 입력 시
passwordInput.addEventListener('input', () => {
    updateLoginButtonState();
});

// 비밀번호 포커스 아웃 시
passwordInput.addEventListener('blur', () => {
    if (passwordInput.value.trim()) {
        checkPasswordValidation();
    }
});

// 로그인 처리

// 로그인 폼 제출
loginForm.addEventListener('submit', async (event) => {
    // 기본 폼 제출 동작 방지 (페이지 새로고침 방지)
    event.preventDefault();
  
    // 1. 최종 유효성 검사
    const isEmailValid = checkEmailValidation();
    const isPasswordValid = checkPasswordValidation();
  
    if (!isEmailValid || !isPasswordValid) {
        console.log('유효성 검사 실패');
        return;
    }
  
    // 2. 로딩 상태 표시
    loginButton.disabled = true;
    loginButton.textContent = '로그인 중...';
  
    try {
        // 3. 로그인 API 호출
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
    
        console.log('로그인 시도:', email);
        const result = await login(email, password);
    
        // 4. 로그인 성공
        console.log('로그인 성공:', result);
    
        const { accessToken, refreshToken, userId } = result.data;
        saveLoginData(accessToken, refreshToken, userId);
    
        // 5. 게시글 목록 페이지로 이동
        alert('로그인 성공!');
        window.location.href = '/pages/posts.html';
    
    } catch (error) {

        console.error('로그인 실패:', error);
    
        // 에러 메시지 표시 (비밀번호 필드 아래)
        passwordError.textContent = error.message;
    
        // 버튼 원래대로
        loginButton.disabled = false;
        loginButton.textContent = '로그인';
    }
});


// 초기 상태 - 페이지 로드 시 로그인 비활성화
loginButton.disabled = true;

console.log('로그인 페이지 로드 완료');
