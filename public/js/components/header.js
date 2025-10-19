// public/js/components/header.js
// 헤더 컴포넌트 - 뒤로가기 버튼 처리

/**
 * 뒤로가기 버튼 초기화
 * @param {string} backUrl - 뒤로가기 시 이동할 URL (기본값: 없음)
 */
export function initBackButton(backUrl = null) {
    const btnBack = document.getElementById('btnBack');
    
    if (!btnBack) {
        return; // 뒤로가기 버튼이 없는 페이지
    }
    
    btnBack.addEventListener('click', () => {
        if (backUrl) {
            window.location.href = backUrl;
        } else {
            window.history.back();
        }
    });
}