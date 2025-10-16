// public/js/utils/validation.js
// 유효성 검사 - 로그인 + 회원가입용

// 로그인 + 회원가입 공통
function validateEmail(email) {
    // 1. 빈 값 체크
    if (!email || email.trim() === '') {
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

// 로그인 + 회원가입 공통
function validatePassword(password) {
    // 1. 빈 값 체크
    if (!password || password.trim() === '') {
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

// 비밀번호 확인 검증 (회원가입용)
function validatePasswordConfirm(password, passwordConfirm) {
    if (!passwordConfirm || passwordConfirm.trim() === '') {
        return {
            isValid: false,
            message: '비밀번호를 한번 더 입력해주세요.'
        };
    }

    if (password !== passwordConfirm) {
        return {
            isValid: false,
            message: '비밀번호가 일치하지 않습니다.'
        };
    }

    return {
        isValid: true,
        message: ''
    };
}

// 닉네임 검증 (회원가입용)
function validateNickname(nickname) {
    if (!nickname || nickname.trim() === '') {
        return {
            isValid: false,
            message: '닉네임을 입력해주세요.'
        };
    }

    if (nickname.length > 10) {
        return {
            isValid: false,
            message: '닉네임은 최대 10자까지 작성 가능합니다.'
        };
    }

    // 띄어쓰기 검증
    if (/\s/.test(nickname)) {
        return {
            isValid: false,
            message: '띄어쓰기는 불가능합니다.'
        };
    }

    return {
        isValid: true,
        message: ''
    };
}

// 이미지 파일 검증 (회원가입용)
function validateImageFile(file) {
    if (!file) {
        return {
            isValid: true,  // 선택사항
            message: ''
        };
    }

    // 파일 크기 체크 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        return {
            isValid: false,
            message: '이미지 크기는 5MB 이하여야 합니다.'
        };
    }

    // 파일 타입 체크
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            message: '이미지 파일만 업로드 가능합니다. (jpg, jpeg, png)'
        };
    }

    return {
        isValid: true,
        message: ''
    };
}

export { 
    validateEmail,
    validatePassword,
    validatePasswordConfirm,
    validateNickname,
    validateImageFile
};