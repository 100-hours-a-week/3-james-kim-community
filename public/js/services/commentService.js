// public/js/services/commentService.js
// 댓글 API 서비스

import { getWithAuth, postWithAuth, putWithAuth, deleteWithAuth } from "../utils/http.js";
import { API_ENDPOINTS } from "../config/api.js";
import { getAccessToken } from "../utils/storage.js";

/**
 * 댓글 목록 조회 (인피니티 스크롤)
 * @param {number} postId - 게시글 ID
 * @param {number|null} lastSeenId - 마지막 댓글 ID
 * @param {number} limit - 페이지당 댓글 수
 * @returns {Promise} 댓글 목록 데이터
 */
async function getComments(postId, lastSeenId = null, limit = 10) {
    try {
        const token = getAccessToken();

        if (!token) {
            throw new Error('로그인이 필요합니다.');
        }

        // 쿼리 파라미터 구성
        let url = `${API_ENDPOINTS.COMMENTS(postId)}?limit=${limit}`;
        if (lastSeenId) {
            url += `&lastSeenId=${lastSeenId}`;
        }

        console.log('댓글 목록 조회:', url);
        
        const result = await getWithAuth(url, token);
        
        console.log('댓글 목록 조회 성공:', result);
        return result.data;

    } catch (error) {
        console.error('댓글 목록 조회 실패:', error);
        
        let userMessage = '댓글을 불러올 수 없습니다.';
        
        if (error.status === 401) {
            userMessage = '로그인이 만료되었습니다.';
        } else if (error.status === 404) {
            userMessage = '존재하지 않는 게시글입니다.';
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

// 댓글 작성
async function createComment(postId, content) {
    try {
        const token = getAccessToken();

        if (!token) {
            throw new Error('로그인이 필요합니다.');
        }

        const url = API_ENDPOINTS.COMMENTS(postId);
        console.log('댓글 작성:', url);
        
        const result = await postWithAuth(url, { content }, token);
        
        console.log('댓글 작성 성공:', result);
        return result.data;

    } catch (error) {
        console.error('댓글 작성 실패:', error);
        
        let userMessage = '댓글 작성에 실패했습니다.';
        
        if (error.status === 401) {
            userMessage = '로그인이 만료되었습니다.';
        } else if (error.status === 404) {
            userMessage = '존재하지 않는 게시글입니다.';
        } else if (error.status === 400) {
            userMessage = '댓글 내용을 입력해주세요.';
        }
        
        throw {
            status: error.status,
            message: userMessage,
            originalMessage: error.message
        };
    }
}

// 댓글 수정
async function updateComment(postId, commentId, content) {
    try {
        const token = getAccessToken();

        if (!token) {
            throw new Error('로그인이 필요합니다.');
        }

        const url = API_ENDPOINTS.COMMENT_DETAIL(postId, commentId);
        console.log('댓글 수정:', url);
        
        const result = await putWithAuth(url, { content }, token);
        
        console.log('댓글 수정 성공');
        return result.data;

    } catch (error) {
        console.error('댓글 수정 실패:', error);
        
        let userMessage = '댓글 수정에 실패했습니다.';
        
        if (error.status === 401) {
            userMessage = '로그인이 만료되었습니다.';
        } else if (error.status === 403) {
            userMessage = '댓글 수정 권한이 없습니다.';
        } else if (error.status === 404) {
            userMessage = '존재하지 않는 댓글입니다.';
        }
        
        throw {
            status: error.status,
            message: userMessage,
            originalMessage: error.message
        };
    }
}

// 댓글 삭제
async function deleteComment(postId, commentId) {
    try {
        const token = getAccessToken();

        if (!token) {
            throw new Error('로그인이 필요합니다.');
        }

        const url = API_ENDPOINTS.COMMENT_DETAIL(postId, commentId);
        console.log('댓글 삭제:', url);
        
        const result = await deleteWithAuth(url, token);
        
        console.log('댓글 삭제 성공');
        return result.data;

    } catch (error) {
        console.error('댓글 삭제 실패:', error);
        
        let userMessage = '댓글 삭제에 실패했습니다.';
        
        if (error.status === 401) {
            userMessage = '로그인이 만료되었습니다.';
        } else if (error.status === 403) {
            userMessage = '댓글 삭제 권한이 없습니다.';
        } else if (error.status === 404) {
            userMessage = '존재하지 않는 댓글입니다.';
        }
        
        throw {
            status: error.status,
            message: userMessage,
            originalMessage: error.message
        };
    }
}

export { getComments, createComment, updateComment, deleteComment };
