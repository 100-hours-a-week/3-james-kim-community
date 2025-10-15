// public/js/utils/validation.js
// 유효성 검사 - 로그인용

function validateEmail(email) {
    // 1. 빈 값 체크
    if (!email || email.trim() === ' ') {
        return {
            isValid: false,
            message: '이메일을 입력해주세요.'
        };
    }

    // 2. 이메일 형식 체크 (정규식)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;;

    if(!emailRegex.test(email)) {
        return {
            isValid: false,
            message: '올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)'
        };
    }

    return {
        isValid: true,
        message: ''
    };
}

function validatePassword(password) {
    // 1. 빈 값 체크
    if (!password || password.trim() === ' ') {
        return {
            isValid: false,
            message: '비밀번호를 입력해주세요.'
        };
    }

    // 2. 길이 체크 (8~20자)
    if (password.length < 8 || password.length > 20) {
        return {
            isValid: false,
            message: '비밀번호는 8자 이상, 20자 이하여야 합니다.'
        };
    }

    // 3. 대문자 포함 체크
    if (!/[A-Z]/.test(password)) {
        return {
            isValid: false,
            message: '비밀번호는 대문자를 최소 1개 포함해야 합니다.'
        };
    }
  
    // 4. 소문자 포함 체크
    if (!/[a-z]/.test(password)) {
        return {
            isValid: false,
            message: '비밀번호는 소문자를 최소 1개 포함해야 합니다.'
        };
    } 
  
    // 5. 숫자 포함 체크
    if (!/[0-9]/.test(password)) {
        return {
            isValid: false,
            message: '비밀번호는 숫자를 최소 1개 포함해야 합니다.'
        };
    }
  
    // 6. 특수문자 포함 체크
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return {
            isValid: false,
            message: '비밀번호는 특수문자를 최소 1개 포함해야 합니다.'
        };
    }

    return {
        isValid: true,
        message: ''
    };
}

export { validateEmail, validatePassword };