// public/js/utils/errorHandler.js
// 에러 처리 유틸리티

/**
 * 에러를 처리하고 사용자 친화적 메시지로 변환
 * @param {object} error - 원본 에러 객체
 * @param {string} defaultMessage - 기본 에러 메시지
 * @param {object} customMessages - 커스텀 에러 메시지 매핑 (선택)
 * @returns {object} 가공된 에러 객체
 */
function handleServiceError(error, defaultMessage = '요청에 실패했습니다.', customMessages = {}) {
    let userMessage = defaultMessage;

    // 커스텀 메시지 확인
    if (customMessages[error.status]) {
        const statusMessages = customMessages[error.status];
        
        // 특정 에러 메시지가 있는 경우 (객체 형태)
        if (typeof statusMessages === 'object' && error.message) {
            userMessage = statusMessages[error.message] || statusMessages['default'] || defaultMessage;
        } 
        // 상태 코드에 대한 단일 메시지인 경우 (문자열 형태)
        else if (typeof statusMessages === 'string') {
            userMessage = statusMessages;
        }
    }

    return {
        status: error.status,
        message: userMessage,
        originalMessage: error.message
    };
}

export { handleServiceError };