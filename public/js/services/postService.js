
// public/js/services/postService.js
// 게시글 API 서비스

import { getWithAuth } from "../utils/http.js";
import { API_ENDPOINTS } from "../config/api.js";
import { getAccessToken } from "../utils/storage.js";

/**
 * 게시글 목록 조회 (인피니티 스크롤)
 * @param {number|null} lastSeenId - 마지막으로 본 게시글 ID (없으면 첫 페이지)
 * @param {number} limit - 가져올 게시글 수
 * @returns {Promise} 게시글 목록 + 페이징 정보
 */
async function getPosts(lastSeenId = null, limit = 10) {
    try {
        const token = getAccessToken();

        if (!token) {
            throw new Error('로그인이 필요합니다.');
        }

        // 쿼리 파라미터 구성
        let url = `${API_ENDPOINTS.POSTS}?limit=${limit}`;
        if (lastSeenId) {
            url += `&lastSeenId=${lastSeenId}`;
        }

        console.log('게시글 목록 조회:', url);
        
        const result = await getWithAuth(url, token);
        
        console.log('게시글 목록 조회 성공:', result);
        return result;

    } catch (error) {
        console.error('게시글 목록 조회 실패:', error);
        
        let userMessage = '게시글을 불러올 수 없습니다.';
        
        if (error.status === 401) {
            userMessage = '로그인이 만료되었습니다. 다시 로그인해주세요.';
        } else if (error.status === 500) {
            userMessage = '서버 오류가 발생했습니다.';
        }
        
        throw {
            status: error.status,
            message: userMessage,
            originalMessage: error.message
        };
    }
}

export { getPosts };