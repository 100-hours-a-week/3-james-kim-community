// public/js/services/imageService.js

import { API_ENDPOINTS } from "../config/api.js";
import { handleServiceError } from "../utils/errorHandler.js";

// Lambda는 인증 불필요하므로 postFormData 대신 fetch 직접 사용
async function uploadImage(file) {
    try {
        console.log('이미지 업로드 시도:', file.name);
        
        const formData = new FormData();
        formData.append('image', file);  
        
        // Lambda로 직접 전송 (Authorization 헤더 없음)
        const response = await fetch(API_ENDPOINTS.UPLOAD_IMAGE, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '이미지 업로드에 실패했습니다.');
        }
        
        const result = await response.json();
        
        console.log('이미지 업로드 성공:', result);
        
        if (!result.success || !result.imageUrl) {
            throw new Error('이미지 URL을 받지 못했습니다.');
        }
        
        return result.imageUrl;  // CloudFront URL
        
    } catch (error) {
        console.error('이미지 업로드 실패:', error);
        
        throw handleServiceError(error, '이미지 업로드에 실패했습니다.', {
            400: '올바른 이미지 파일이 아닙니다.',
            413: '이미지 파일이 너무 큽니다. (최대 5MB)',
            500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
    }
}

export { uploadImage };