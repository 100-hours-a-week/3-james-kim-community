// public/js/utils/storage.js
// 토큰 관리용

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_ID: 'userId',
};

// 로그인 정보 저장 (토큰 + 사용자 ID)
function saveLoginData(accessToken, refreshToken, userId) {
    try {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER_ID, userId.toString());
    
        console.log('로그인 정보 저장 완료');
    } catch (error) {
        console.error('로그인 정보 저장 실패:', error);
        throw new Error('로그인 정보를 저장할 수 없습니다.');
    }
}

function getAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

function getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

function getUserId() {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    return userId ? parseInt(userId, 10) : null;
}

function isLoggedIn() {
    const accessToken = getAccessToken();
    return accessToken !== null && accessToken !== '';
}

// accessToken 갱신
function updateAccessToken(newAccessToken) {
    try {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
        console.log("Access Token 갱신 완료");
    } catch (error) {
        console.log("Access Token 갱신 실패", error);
        throw new Error("Access Token을 갱신할 수 없습니다.");
    }
}

// 로그아웃 (모든 로그인 정보 삭제)
function clearLoginData() {
    try {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_ID);
    
        console.log('로그인 정보 삭제 완료');
    } catch (error) {
        console.error('로그인 정보 삭제 실패:', error);
    }
}

export {
    saveLoginData,
    getAccessToken,
    getRefreshToken,
    getUserId,
    isLoggedIn,
    updateAccessToken,
    clearLoginData,
};
