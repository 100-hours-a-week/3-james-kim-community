// public/js/services/postService.js
// 게시글 API 서비스

import { get, getWithAuth, postWithAuth, patchWithAuth, deleteWithAuth } from "../utils/http.js";
import { API_ENDPOINTS } from "../config/api.js";
import { handleServiceError } from "../utils/errorHandler.js";

/**
 * 게시글 목록 조회 (인피니티 스크롤)
 * @param {number|null} lastSeenId - 마지막으로 본 게시글 ID (없으면 첫 페이지)
 * @param {number} limit - 가져올 게시글 수
 * @returns {Promise} 게시글 목록 + 페이징 정보
 */
async function getPosts(lastSeenId = null, limit = 10) {
    try {
        // 쿼리 파라미터 구성
        let url = `${API_ENDPOINTS.POSTS}?limit=${limit}`;
        if (lastSeenId) {
            url += `&lastSeenId=${lastSeenId}`;
        }

        console.log('게시글 목록 조회:', url);
        
        const result = await get(url);
        
        console.log('게시글 목록 조회 성공:', result);
        
        return result.data;

    } catch (error) {
        console.error('게시글 목록 조회 실패:', error);
        
        throw handleServiceError(error, '게시글을 불러올 수 없습니다.', {
            401: '로그인이 만료되었습니다. 다시 로그인해주세요.',
            500: '서버 오류가 발생했습니다.'
        });
    }
}

// 게시글 상세 조회
async function getPostDetail(postId) {
    try {
        const url = API_ENDPOINTS.POST_DETAIL(postId);
        console.log('게시글 상세 조회:', url);
  
        const result = await getWithAuth(url);
        
        console.log('게시글 상세 조회 성공:', result);
        return result.data;

    } catch (error) {
        console.error('게시글 상세 조회 실패:', error);
        
        throw handleServiceError(error, '게시글을 불러올 수 없습니다.', {
            401: '로그인이 만료되었습니다.',
            404: '존재하지 않는 게시글입니다.',
            500: '서버 오류가 발생했습니다.'
        });
    }
}

// 게시글 작성
async function createPost(postData) {
    try {
        const url = API_ENDPOINTS.POSTS;
        console.log('게시글 작성:', url, postData);
        
        const result = await postWithAuth(url, postData);
        
        console.log('게시글 작성 성공:', result);
        return result.data;

    } catch (error) {
        console.error('게시글 작성 실패:', error);
        
        throw handleServiceError(error, '게시글 작성에 실패했습니다.', {
            401: '로그인이 만료되었습니다.',
            400: error.message || '입력 정보를 확인해주세요.',
            500: '서버 오류가 발생했습니다.'
        });
    }
}

// 게시글 수정
async function updatePost(postId, updateData) {
    try {
        const url = API_ENDPOINTS.POST_DETAIL(postId);
        console.log('게시글 수정:', url, updateData);
        
        const result = await patchWithAuth(url, updateData);
        
        console.log('게시글 수정 성공:', result);
        return result.data;

    } catch (error) {
        console.error('게시글 수정 실패:', error);
        
        throw handleServiceError(error, '게시글 수정에 실패했습니다.', {
            401: '로그인이 만료되었습니다.',
            403: '게시글 수정 권한이 없습니다.',
            404: '존재하지 않는 게시글입니다.',
            400: error.message || '입력 정보를 확인해주세요.'
        });
    }
}

// 게시글 삭제
async function deletePost(postId) {
    try {
        const url = API_ENDPOINTS.POST_DETAIL(postId);
        console.log('게시글 삭제:', url);
        
        await deleteWithAuth(url);
        
        console.log('게시글 삭제 성공');
        return true;

    } catch (error) {
        console.error('게시글 삭제 실패:', error);
        
        throw handleServiceError(error, '게시글 삭제에 실패했습니다.', {
            401: '로그인이 만료되었습니다.',
            403: '게시글 삭제 권한이 없습니다.',
            404: '존재하지 않는 게시글입니다.'
        });
    }
}

// 좋아요 토글 (추가/취소)
async function toggleLike(postId) {
    try {
        const url = API_ENDPOINTS.POST_LIKE(postId);
        console.log('좋아요 토글:', url);
        
        const result = await postWithAuth(url, {});
        
        console.log('좋아요 토글 성공:', result);
        return result.data;

    } catch (error) {
        console.error('좋아요 토글 실패:', error);
        
        throw handleServiceError(error, '좋아요 처리에 실패했습니다.', {
            401: '로그인이 만료되었습니다.',
            404: '존재하지 않는 게시글입니다.',
            500: '서버 오류가 발생했습니다.'
        });
    }
}

export { 
    getPosts, 
    getPostDetail, 
    createPost, 
    updatePost, 
    deletePost,
    toggleLike  
};