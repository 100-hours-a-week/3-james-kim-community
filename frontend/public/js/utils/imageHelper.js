// public/js/utils/imageHelper.js
// 이미지 URL 헬퍼 함수

/**
 * 백엔드 이미지 URL을 완전한 URL로 변환
 * @param {string|null} imageUrl - 백엔드에서 받은 이미지 URL
 * @returns {string} - 완전한 이미지 URL 또는 기본 이미지 경로
 */
export function getImageUrl(imageUrl) {
    const DEFAULT_IMAGE = '/assets/images/default-profile.png';
    
    // 이미지 URL이 없으면 기본 이미지 반환
    if (!imageUrl) {
        return DEFAULT_IMAGE;
    }
    
    // 이미 완전한 URL이면 그대로 반환 (S3 URL 등)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    
    return DEFAULT_IMAGE;
}

// 이미지 로드 실패 시 기본 이미지로 대체
export function handleImageError(imgElement) {
    const DEFAULT_IMAGE = '/assets/images/default-profile.png';
    
    // 무한 루프 방지 - 이미 기본 이미지인 경우
    if (imgElement.src.includes(DEFAULT_IMAGE)) {
        console.warn('기본 이미지도 로드 실패');
        return;
    }
    
    console.warn('이미지 로드 실패, 기본 이미지로 대체:', imgElement.src);
    imgElement.src = DEFAULT_IMAGE;
}