// public/js/utils/storage.js
// 토큰 관리용

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken'
};

// 로그인 정보 저장 (토큰 + 사용자 ID)
function saveLoginData(accessToken) {
    try {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        console.log('로그인 정보 저장 완료');
    } catch (error) {
        console.error('로그인 정보 저장 실패:', error);
        throw new Error('로그인 정보를 저장할 수 없습니다.');
    }
}

function getAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
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
        console.log('로그인 정보 삭제 완료');
    } catch (error) {
        console.error('로그인 정보 삭제 실패:', error);
    }
}

export {
    saveLoginData,
    getAccessToken,
    isLoggedIn,
    updateAccessToken,
    clearLoginData,
};
