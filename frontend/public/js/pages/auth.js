// public/js/pages/auth.js
// 통합 인증 페이지 - 폼 전환만 담당

// ========================================
// 폼 전환 (Sign In <-> Sign Up)
// ========================================
const signUpButton = document.getElementById('sign-up');
const signInButton = document.getElementById('sign-in');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// 회원가입으로 전환
signUpButton.addEventListener('click', async () => {
    loginForm.classList.add('none');
    signupForm.classList.remove('none');
    
    await import('./signup.js');
});

// 로그인으로 전환
signInButton.addEventListener('click', async () => {
    signupForm.classList.add('none');
    loginForm.classList.remove('none');
    
    await import('./login.js');
});

// 초기 로드: 로그인 모듈
(async () => {
    await import('./login.js');
})();

console.log('통합 인증 페이지 로드 완료');