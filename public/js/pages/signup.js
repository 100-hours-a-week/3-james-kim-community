// public/js/pages/signup.js
// 회원가입 페이지 메인 로직

import {
    validateEmail,
    validatePassword,
    validatePasswordConfirm,
    validateNickname,
    validateImageFile
} from "../utils/validation.js";
import { checkEmailDuplicate, checkNicknameDuplicate } from "../services/authService.js";
import { uploadImage } from "../services/imageService.js";
import { signup } from "../services/userService.js";
import { saveLoginData, isLoggedIn } from "../utils/storage.js";
import { initBackButton } from "../components/header.js";  

// DOM 요소 가져오기
const signupForm = document.getElementById('signupForm');
const signupButton = document.getElementById('signupButton');

// 입력 필드
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordConfirmInput = document.getElementById('passwordConfirm');
const nicknameInput = document.getElementById('nickname');
const profileImageInput = document.getElementById('profileImage');

// 에러 메시지
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const passwordConfirmError = document.getElementById('passwordConfirmError');
const nicknameError = document.getElementById('nicknameError');
const imageError = document.getElementById('imageError');

// 파일 선택 관련
const fileSelectButton = document.getElementById('fileSelectButton');
const fileName = document.getElementById('fileName');

let uploadedImageUrl = null;
let isEmailChecked = false;
let isNicknameChecked = false;

// 헤더 컴포넌트 초기화
initBackButton('/index.html');

// 이미 로그인되어 있으면 리다이렉트
if (isLoggedIn()) {
    console.log('이미 로그인되어 있습니다.');
    window.location.href = '/pages/posts.html';
}

// 유효성 검사 및 에러 표시
function showError(input, errorElement, message) {
    errorElement.textContent = message;
    input.classList.add('error');
}

function clearError(input, errorElement) {
    errorElement.textContent = '';
    input.classList.remove('error');
}

function validateField(input, errorElement, validateFn, ...args) {
    const result = validateFn(...args);
    
    if (!result.isValid) {
        showError(input, errorElement, result.message);
        return false;
    }
    
    clearError(input, errorElement);
    return true;
}

async function checkEmailDuplication() {
    const email = emailInput.value.trim();
    if (!email) return;
    
    if (!validateField(emailInput, emailError, validateEmail, email)) return;
    
    try {
        const isAvailable = await checkEmailDuplicate(email);
        
        if (isAvailable) {
            clearError(emailInput, emailError);
            isEmailChecked = true;
        } else {
            showError(emailInput, emailError, '이미 사용 중인 이메일입니다.');
            isEmailChecked = false;
        }
        
        updateSignupButtonState();
    } catch (error) {
        showError(emailInput, emailError, error.message);
        isEmailChecked = false;
    }
}

async function checkNicknameDuplication() {
    const nickname = nicknameInput.value.trim();
    if (!nickname) return;
    
    if (!validateField(nicknameInput, nicknameError, validateNickname, nickname)) return;
    
    try {
        const isAvailable = await checkNicknameDuplicate(nickname);
        
        if (isAvailable) {
            clearError(nicknameInput, nicknameError);
            isNicknameChecked = true;
        } else {
            showError(nicknameInput, nicknameError, '이미 사용 중인 닉네임입니다.');
            isNicknameChecked = false;
        }
        
        updateSignupButtonState();
    } catch (error) {
        showError(nicknameInput, nicknameError, error.message);
        isNicknameChecked = false;
    }
}

// 회원가입 버튼 활성화/비활성화
function updateSignupButtonState() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const passwordConfirm = passwordConfirmInput.value.trim();
    const nickname = nicknameInput.value.trim();
    
    // 모든 필수 필드 입력 + 유효성 검사 + 중복 체크 완료
    const allValid = email && password && passwordConfirm && nickname &&
                     validateEmail(email).isValid && isEmailChecked &&
                     validatePassword(password).isValid &&
                     validatePasswordConfirm(password, passwordConfirm).isValid &&
                     validateNickname(nickname).isValid && isNicknameChecked;
    
    signupButton.disabled = !allValid;
    signupButton.classList.toggle('active', allValid);
}

// 이벤트 리스너 등록
// 이미지 파일 선택
fileSelectButton.addEventListener('click', () => {
    profileImageInput.click();
});

profileImageInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // 파일 유효성 검사
    const result = validateImageFile(file);
    if (!result.isValid) {
        imageError.textContent = result.message;
        return;
    }
    
    imageError.textContent = '';
    fileName.textContent = file.name;
    
    try {
        // 서버에 임시 업로드
        uploadedImageUrl = await uploadImage(file);
        console.log('이미지 업로드 완료:', uploadedImageUrl);
    } catch (error) {
        console.error('이미지 업로드 에러:', error);
        imageError.textContent = error.message;
        fileName.textContent = '선택된 파일 없음';
        uploadedImageUrl = null;
        profileImageInput.value = '';
    }
});

// 이메일 입력
emailInput.addEventListener('input', () => {
    isEmailChecked = false;
    updateSignupButtonState();
});

emailInput.addEventListener('blur', checkEmailDuplication);

// 비밀번호 입력
passwordInput.addEventListener('input', () => {
    updateSignupButtonState();
    if (passwordConfirmInput.value.trim()) {
        validateField(passwordConfirmInput, passwordConfirmError, 
                     validatePasswordConfirm, passwordInput.value, passwordConfirmInput.value);
    }
});

passwordInput.addEventListener('blur', () => {
    if (passwordInput.value.trim()) {
        validateField(passwordInput, passwordError, validatePassword, passwordInput.value);
    }
});

passwordConfirmInput.addEventListener('input', updateSignupButtonState);

passwordConfirmInput.addEventListener('blur', () => {
    if (passwordConfirmInput.value.trim()) {
        validateField(passwordConfirmInput, passwordConfirmError, 
                     validatePasswordConfirm, passwordInput.value, passwordConfirmInput.value);
    }
});

// 닉네임 입력
nicknameInput.addEventListener('input', () => {
    isNicknameChecked = false;
    updateSignupButtonState();
});

nicknameInput.addEventListener('blur', checkNicknameDuplication);

// 회원가입 제출 
signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // 최종 검증
    const isValid = 
        validateField(emailInput, emailError, validateEmail, emailInput.value) && isEmailChecked &&
        validateField(passwordInput, passwordError, validatePassword, passwordInput.value) &&
        validateField(passwordConfirmInput, passwordConfirmError, 
                     validatePasswordConfirm, passwordInput.value, passwordConfirmInput.value) &&
        validateField(nicknameInput, nicknameError, validateNickname, nicknameInput.value) && isNicknameChecked;
    
    if (!isValid) {
        console.log('유효성 검사 실패');
        return;
    }
    
    signupButton.disabled = true;
    signupButton.textContent = '회원가입 중...';
    
    try {
        const result = await signup(
            emailInput.value.trim(),
            passwordInput.value.trim(),
            passwordConfirmInput.value.trim(),
            nicknameInput.value.trim(),
            uploadedImageUrl
        );
        
        console.log('회원가입 성공:', result);
        
        const { accessToken, refreshToken, userId } = result.data;
        saveLoginData(accessToken, refreshToken, userId);
        
        alert('회원가입 성공!');
        window.location.href = '/pages/posts.html';
        
    } catch (error) {
        console.error('회원가입 실패:', error);
        nicknameError.textContent = error.message;
        signupButton.disabled = false;
        signupButton.textContent = '회원 가입';
    }
});

// 초기 상태
signupButton.disabled = true;

console.log('회원가입 페이지 로드 완료');