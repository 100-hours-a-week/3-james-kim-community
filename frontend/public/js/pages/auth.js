// public/js/pages/auth.js
// 통합 인증 전환 제어 페이지 (로그인/회원가입)

import { validateEmail, validatePassword, validatePasswordConfirm, validateNickname, validateImageFile } from "../utils/validation.js";
import { login, checkEmailDuplicate, checkNicknameDuplicate } from "../services/authService.js";
import { uploadImage } from "../services/imageService.js";
import { signup } from "../services/userService.js";
import { saveLoginData, isLoggedIn } from "../utils/storage.js";

// 이미 로그인되어 있으면 리다이렉트
if (isLoggedIn()) {
    console.log('이미 로그인되어 있습니다.');
    window.location.href = '/pages/posts.html';
}

// ========================================
// 폼 전환 (Sign In <-> Sign Up)
// ========================================
const signUpButton = document.getElementById('sign-up');
const signInButton = document.getElementById('sign-in');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// 회원가입으로 전환
signUpButton.addEventListener('click', () => {
    loginForm.classList.add('none');
    signupForm.classList.remove('none');
});

// 로그인으로 전환
signInButton.addEventListener('click', () => {
    signupForm.classList.add('none');
    loginForm.classList.remove('none');
});

// ========================================
// 로그인 폼 로직 (기존 login.js)
// ========================================
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const loginButton = document.getElementById('loginButton');

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

// 로그인에서는 비밀번호 blur 시 유효성 검사 안함 (회원가입과 달리)
// passwordInput.addEventListener('blur', () => {
//     if (passwordInput.value.trim()) {
//         checkPasswordValidation();
//     }
// });

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
    
        window.location.href = '/pages/posts.html';
    
    } catch (error) {
        console.error('로그인 실패:', error);
        passwordError.textContent = error.message;
        loginButton.disabled = false;
        loginButton.textContent = 'Sign In';
    }
});

// 초기 상태
loginButton.disabled = true;

// ========================================
// 회원가입 폼 로직 (기존 signup.js)
// ========================================
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
        
        const { accessToken, refreshToken, userId } = result.data;
        saveLoginData(accessToken, refreshToken, userId);
        
        window.location.href = '/pages/posts.html';
        
    } catch (error) {
        console.error('회원가입 실패:', error);
        nicknameError.textContent = error.message;
        signupButton.disabled = false;
        signupButton.textContent = '회원가입';
    }
});

// 초기 상태
signupButton.disabled = true;

console.log('통합 인증 페이지 로드 완료');