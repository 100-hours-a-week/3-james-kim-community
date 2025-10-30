// public/js/pages/signup.js
// 회원가입 폼 로직 

import { validateEmail, validatePassword, validatePasswordConfirm, validateNickname, validateImageFile } from "../utils/validation.js";
import { checkEmailDuplicate, checkNicknameDuplicate } from "../services/authService.js";
import { uploadImage } from "../services/imageService.js";
import { signup } from "../services/userService.js";
import { saveLoginData } from "../utils/storage.js";

// 회원가입 폼 로직 
const signupEmailInput = document.getElementById('signupEmail');
const signupPasswordInput = document.getElementById('signupPassword');
const passwordConfirmInput = document.getElementById('passwordConfirm');
const nicknameInput = document.getElementById('nickname');
const profileImageInput = document.getElementById('profileImage');

const signupEmailError = document.getElementById('signupEmailError');
const signupPasswordError = document.getElementById('signupPasswordError');
const passwordConfirmError = document.getElementById('passwordConfirmError');
const nicknameError = document.getElementById('nicknameError');
const imageError = document.getElementById('imageError');

const fileSelectButton = document.getElementById('fileSelectButton');
const fileName = document.getElementById('fileName');
const signupButton = document.getElementById('signupButton');
const signupForm = document.getElementById('signupForm');

let uploadedImageUrl = null;
let isEmailChecked = false;
let isNicknameChecked = false;

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

// 이메일 중복 체크
async function checkEmailDuplication() {
    const email = signupEmailInput.value.trim();
    if (!email) return;
    
    if (!validateField(signupEmailInput, signupEmailError, validateEmail, email)) return;
    
    try {
        const isAvailable = await checkEmailDuplicate(email);
        
        if (isAvailable) {
            clearError(signupEmailInput, signupEmailError);
            isEmailChecked = true;
        } else {
            showError(signupEmailInput, signupEmailError, '이미 사용 중인 이메일입니다.');
            isEmailChecked = false;
        }
        
        updateSignupButtonState();
    } catch (error) {
        showError(signupEmailInput, signupEmailError, error.message);
        isEmailChecked = false;
    }
}

// 닉네임 중복 체크
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
    const email = signupEmailInput.value.trim();
    const password = signupPasswordInput.value.trim();
    const passwordConfirm = passwordConfirmInput.value.trim();
    const nickname = nicknameInput.value.trim();
    
    const allValid = email && password && passwordConfirm && nickname &&
                     validateEmail(email).isValid && isEmailChecked &&
                     validatePassword(password).isValid &&
                     validatePasswordConfirm(password, passwordConfirm).isValid &&
                     validateNickname(nickname).isValid && isNicknameChecked;
    
    signupButton.disabled = !allValid;
}

// 이미지 파일 선택
fileSelectButton.addEventListener('click', () => {
    profileImageInput.click();
});

profileImageInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];

    if (!file) {
        fileName.textContent = '선택된 파일 없음';
        uploadedImageUrl = null;
        profileImageInput.value = '';
        return;
    }
    
    const result = validateImageFile(file);
    if (!result.isValid) {
        imageError.textContent = result.message;
        return;
    }
    
    imageError.textContent = '';
    fileName.textContent = file.name;
    
    try {
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
signupEmailInput.addEventListener('input', () => {
    isEmailChecked = false;
    updateSignupButtonState();
});

signupEmailInput.addEventListener('blur', checkEmailDuplication);

// 비밀번호 입력
signupPasswordInput.addEventListener('input', () => {
    updateSignupButtonState();
    if (passwordConfirmInput.value.trim()) {
        validateField(passwordConfirmInput, passwordConfirmError, 
                     validatePasswordConfirm, signupPasswordInput.value, passwordConfirmInput.value);
    }
});

signupPasswordInput.addEventListener('blur', () => {
    if (signupPasswordInput.value.trim()) {
        validateField(signupPasswordInput, signupPasswordError, validatePassword, signupPasswordInput.value);
    }
});

passwordConfirmInput.addEventListener('input', updateSignupButtonState);

passwordConfirmInput.addEventListener('blur', () => {
    if (passwordConfirmInput.value.trim()) {
        validateField(passwordConfirmInput, passwordConfirmError, 
                     validatePasswordConfirm, signupPasswordInput.value, passwordConfirmInput.value);
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
    
    const isValid = 
        validateField(signupEmailInput, signupEmailError, validateEmail, signupEmailInput.value) && isEmailChecked &&
        validateField(signupPasswordInput, signupPasswordError, validatePassword, signupPasswordInput.value) &&
        validateField(passwordConfirmInput, passwordConfirmError, 
                     validatePasswordConfirm, signupPasswordInput.value, passwordConfirmInput.value) &&
        validateField(nicknameInput, nicknameError, validateNickname, nicknameInput.value) && isNicknameChecked;
    
    if (!isValid) {
        console.log('유효성 검사 실패');
        return;
    }
    
    signupButton.disabled = true;
    signupButton.textContent = '회원가입 중...';
    
    try {
        const result = await signup(
            signupEmailInput.value.trim(),
            signupPasswordInput.value.trim(),
            passwordConfirmInput.value.trim(),
            nicknameInput.value.trim(),
            uploadedImageUrl
        );
        
        console.log('회원가입 성공:', result);
        
        const { accessToken } = result.data;
        saveLoginData(accessToken);
        
        window.location.href = '/index.html';
        
    } catch (error) {
        console.error('회원가입 실패:', error);
        nicknameError.textContent = error.message;
        signupButton.disabled = false;
        signupButton.textContent = '회원가입';
    }
});

// 초기 상태
signupButton.disabled = true;