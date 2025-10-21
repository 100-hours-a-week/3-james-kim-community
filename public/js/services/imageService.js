// public/js/services/imageService.js
// 이미지 업로드 API 서비스

import { postFormData } from "../utils/http.js";
import { API_ENDPOINTS } from "../config/api.js";
import { handleServiceError } from "../utils/errorHandler.js";

// 이미지 임시 업로드
async function uploadImage(file) {
    try {
        // FormData 생성
        const formData = new FormData();
        formData.append('file', file);

        console.log('이미지 업로드 시도:', file.name);
        
        const result = await postFormData(API_ENDPOINTS.UPLOAD_IMAGE, formData);
        
        console.log('이미지 업로드 성공:', result);

        // result.data.imageUrl: 임시 저장된 이미지 URL
        return result.data.imageUrl;

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