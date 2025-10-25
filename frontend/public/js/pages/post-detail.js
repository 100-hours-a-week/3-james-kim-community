// public/js/pages/post-detail.js
// 게시글 상세 페이지 메인 로직

import { getPostDetail, deletePost, toggleLike } from '../services/postService.js';
import { getComments, createComment, updateComment, deleteComment } from '../services/commentService.js';
import { isLoggedIn, clearLoginData } from '../utils/storage.js';
import { initBackButton } from '../components/header.js';  
import { initProfileDropdown } from '../components/profileDropdown.js';  
import { getImageUrl, handleImageError } from '../utils/imageHelper.js';

// DOM 요소 가져오기
// 게시글
const postTitle = document.getElementById('postTitle');
const authorImage = document.getElementById('authorImage');
const authorName = document.getElementById('authorName');
const postDate = document.getElementById('postDate');
const postActions = document.getElementById('postActions');
const btnEdit = document.getElementById('btnEdit');
const btnDelete = document.getElementById('btnDelete');
const postImageWrapper = document.getElementById('postImageWrapper');
const postImage = document.getElementById('postImage');
const postContent = document.getElementById('postContent');

// 통계
const likeButton = document.getElementById('likeButton');
const likeIcon = document.getElementById('likeIcon');
const likeCount = document.getElementById('likeCount');
const viewCount = document.getElementById('viewCount');
const commentCountElement = document.getElementById('commentCount');

// 댓글 입력
const commentTextarea = document.getElementById('commentTextarea');
const btnCommentSubmit = document.getElementById('btnCommentSubmit');

// 댓글 목록
const commentsList = document.getElementById('commentsList');
const commentsLoadingElement = document.getElementById('commentsLoading');
const noMoreComments = document.getElementById('noMoreComments');

// 모달
const deletePostModal = document.getElementById('deletePostModal');
const btnCancelDeletePost = document.getElementById('btnCancelDeletePost');
const btnConfirmDeletePost = document.getElementById('btnConfirmDeletePost');
const deleteCommentModal = document.getElementById('deleteCommentModal');
const btnCancelDeleteComment = document.getElementById('btnCancelDeleteComment');
const btnConfirmDeleteComment = document.getElementById('btnConfirmDeleteComment');

//상태 관리
let currentPostId = null;
let currentPostData = null;
let commentsLastSeenId = null;
let commentsHasNext = true;
let commentsIsLoading = false;
let selectedCommentId = null;

// 로그인 체크
if (!isLoggedIn()) {
    alert('로그인이 필요합니다.');
    window.location.replace('/pages/login.html');
    throw new Error('Unauthorized access');
}

// URL에서 postId 추출
const urlParams = new URLSearchParams(window.location.search);
currentPostId = urlParams.get('id');

if (!currentPostId) {
    alert('잘못된 접근입니다.');
    window.location.replace('/index.html');
    throw new Error('Invalid post ID');
}

// 헤더 컴포넌트 초기화
initBackButton('/index.html');

// 프로필 드롭다운 초기화
initProfileDropdown({
    logoutButtonId: 'btnLogout'  
});

// 게시글 데이터 로드 및 렌더링
async function loadPostDetail() {
    try {
        currentPostData = await getPostDetail(currentPostId);
        renderPostDetail(currentPostData);
        loadComments();
    } catch (error) {
        console.error('게시글 로드 실패:', error);
        
        // 401 에러 시 로그아웃 처리
        if (error.status === 401) {
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            clearLoginData();
            window.location.replace('/pages/login.html');
            return;
        }
        
        alert(error.message || '게시글을 불러올 수 없습니다.');
        window.location.replace('/index.html');
    }
}

// 게시글 데이터를 화면에 렌더링
function renderPostDetail(data) {
    postTitle.textContent = data.title;
    
    // 게시글 작성자 프로필 이미지
    const authorImageSrc = getImageUrl(data.author.profileImage);

    const authorImg = document.createElement('img');
    authorImg.src = authorImageSrc;
    authorImg.alt = '프로필';
    authorImg.className = 'author-image';
    authorImg.addEventListener('error', () => handleImageError(authorImg));

    authorImage.innerHTML = '';
    authorImage.appendChild(authorImg);
    
    authorName.textContent = data.author.nickname;
    postDate.textContent = data.createdAt;
    
    if (data.isAuthor) {
        postActions.classList.remove('hidden');
    }
    
    if (data.imageUrl) {
        const postImageUrl = getImageUrl(data.imageUrl);
        postImage.src = postImageUrl;
        postImage.addEventListener('error', () => handleImageError(postImage));
        postImageWrapper.classList.remove('hidden');
    }
    
    postContent.textContent = data.content;
    
    likeCount.textContent = data.stats.likeCount;
    viewCount.textContent = data.stats.viewCount;
    commentCountElement.textContent = data.stats.commentCount;

    // 좋아요 상태 표시
    updateLikeButton(data.isLiked);
}

// 좋아요 버튼 상태 업데이트
function updateLikeButton(isLiked) {
    if (isLiked) {
        likeButton.classList.add('liked');
        likeIcon.textContent = '♥';  // 꽉 찬 하트
    } else {
        likeButton.classList.remove('liked');
        likeIcon.textContent = '♡';  // 빈 하트
    }
}

// 좋아요 이벤트 리스너
likeButton.addEventListener('click', async (e) => {
    e.stopPropagation();
    
    // 연속 클릭 방지
    if (likeButton.disabled) return;
    
    try {
        likeButton.disabled = true;
        
        console.log('좋아요 토글 요청:', currentPostId);
        
        // 좋아요 API 호출
        const result = await toggleLike(currentPostId);
        
        console.log('좋아요 토글 성공:', result);
        
        likeCount.textContent = result.likeCount;
        updateLikeButton(result.isLiked);
        
        // 현재 게시글 데이터 업데이트
        if (currentPostData) {
            currentPostData.isLiked = result.isLiked;
            currentPostData.stats.likeCount = result.likeCount;
        }
        
    } catch (error) {
        console.error('좋아요 처리 실패:', error);
        
        // 인증 에러인 경우 로그인 페이지로
        if (error.status === 401) {
            alert(error.message || '로그인이 필요합니다.');
            clearLoginData();
            window.location.replace('/pages/login.html');
            return;
        }
        
        alert(error.message || '좋아요 처리에 실패했습니다.');
    } finally {
        likeButton.disabled = false;
    }
});

// 게시글 수정/삭제
btnEdit.addEventListener('click', () => {
    window.location.href = `/pages/post-edit.html?postId=${currentPostId}`;
});

btnDelete.addEventListener('click', () => {
    deletePostModal.classList.remove('hidden');
});

btnCancelDeletePost.addEventListener('click', () => {
    deletePostModal.classList.add('hidden');
});

btnConfirmDeletePost.addEventListener('click', async () => {
    try {
        await deletePost(currentPostId);
        window.location.href = '/index.html';
    } catch (error) {
        console.error('게시글 삭제 실패:', error);
        
        // 401 에러 시 로그아웃 처리
        if (error.status === 401) {
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            clearLoginData();
            window.location.replace('/pages/login.html');
            return;
        }
        
        alert(error.message || '게시글 삭제에 실패했습니다.');
        deletePostModal.classList.add('hidden');
    }
});

// 댓글 입력
commentTextarea.addEventListener('input', () => {
    const hasContent = commentTextarea.value.trim().length > 0;
    btnCommentSubmit.disabled = !hasContent;
    
    if (hasContent) {
        btnCommentSubmit.classList.add('active');
    } else {
        btnCommentSubmit.classList.remove('active');
    }
});

btnCommentSubmit.addEventListener('click', async () => {
    const content = commentTextarea.value.trim();
    
    if (!content) {
        return;
    }
    
    try {
        btnCommentSubmit.disabled = true;
        btnCommentSubmit.textContent = '등록 중...';
        
        const result = await createComment(currentPostId, content);
        
        commentCountElement.textContent = result.commentsCount;
        commentTextarea.value = '';
        
        commentsLastSeenId = null;
        commentsHasNext = true;
        commentsList.innerHTML = '';
        await loadComments();
        
    } catch (error) {
        console.error('댓글 작성 실패:', error);
        
        // 401 에러 시 로그아웃 처리
        if (error.status === 401) {
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            clearLoginData();
            window.location.replace('/pages/login.html');
            return;
        }
        
        alert(error.message || '댓글 작성에 실패했습니다.');
    } finally {
        btnCommentSubmit.disabled = false;
        btnCommentSubmit.textContent = '댓글 등록';
        btnCommentSubmit.classList.remove('active');
    }
});

// 댓글 목록 로드
async function loadComments() {
    if (commentsIsLoading || !commentsHasNext) {
        return;
    }
    
    try {
        commentsIsLoading = true;
        commentsLoadingElement.classList.remove('hidden');
        
        const data = await getComments(currentPostId, commentsLastSeenId, 10);
        
        // 안전성 체크
        if (!data || !data.comments || !Array.isArray(data.comments)) {
            console.error('잘못된 댓글 응답 데이터:', data);
            throw new Error('댓글 데이터를 불러올 수 없습니다.');
        }
        
        data.comments.forEach(comment => {
            const commentCard = createCommentCard(comment);
            commentsList.appendChild(commentCard);
        });
        
        commentsLastSeenId = data.pagination?.lastSeenId || null;
        commentsHasNext = data.pagination?.hasNext || false;
        
        if (!commentsHasNext && data.comments.length > 0) {
            noMoreComments.classList.remove('hidden');
        }
        
    } catch (error) {
        console.error('댓글 목록 로드 실패:', error);
        
        // 401 에러 시 로그아웃 처리
        if (error.status === 401) {
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            clearLoginData();
            window.location.replace('/pages/login.html');
            return;
        }
        
    } finally {
        commentsIsLoading = false;
        commentsLoadingElement.classList.add('hidden');
    }
}

// 개별 댓글 생성
function createCommentCard(comment) {
    const li = document.createElement('li');
    li.className = 'comment-card';
    li.dataset.commentId = comment.commentId;
    
    // 프로필 이미지 처리
    const profileImageSrc = getImageUrl(comment.authorProfileImage);

    const profileImageHTML = `<img src="${profileImageSrc}" 
                               alt="프로필" 
                               class="comment-author-image">`;
    
    
    const actionsHTML = comment.isAuthor
        ? `
        <div class="comment-actions">
            <button class="btn-comment-action btn-comment-edit">수정</button>
            <button class="btn-comment-action btn-comment-delete">삭제</button>
        </div>
        `
        : '';
    
    li.innerHTML = `
        <div class="comment-header">
            <div class="comment-author">
                ${profileImageHTML}
                <div class="comment-author-details">
                    <span class="comment-author-name">${comment.authorNickname}</span>
                    <span class="comment-date">${comment.createdAt}</span>
                </div>
            </div>
            ${actionsHTML}
        </div>
        <p class="comment-content">${comment.content}</p>
    `;
    
    // 이미지 로드 실패 처리 추가
    const imgElement = li.querySelector('.comment-author-image');
    if (imgElement) {
        imgElement.addEventListener('error', () => handleImageError(imgElement));
    }

    if (comment.isAuthor) {
        const btnCommentEdit = li.querySelector('.btn-comment-edit');
        btnCommentEdit.addEventListener('click', () => handleCommentEdit(comment));
        
        const btnCommentDelete = li.querySelector('.btn-comment-delete');
        btnCommentDelete.addEventListener('click', () => handleCommentDelete(comment.commentId));
    }
    
    return li;
}

// 댓글 수정
function handleCommentEdit(comment) {
    const commentCard = document.querySelector(`[data-comment-id="${comment.commentId}"]`);
    const commentContent = commentCard.querySelector('.comment-content');
    
    if (commentCard.querySelector('.comment-edit-form')) {
        return;
    }
    
    commentContent.style.display = 'none';
    
    const editForm = document.createElement('div');
    editForm.className = 'comment-edit-form';
    editForm.innerHTML = `
        <textarea class="comment-edit-textarea" maxlength="500">${comment.content}</textarea>
        <div class="comment-edit-buttons">
            <button class="btn-comment-cancel">취소</button>
            <button class="btn-comment-save">저장</button>
        </div>
    `;
    
    commentCard.appendChild(editForm);
    
    const textarea = editForm.querySelector('.comment-edit-textarea');
    const btnCancel = editForm.querySelector('.btn-comment-cancel');
    const btnSave = editForm.querySelector('.btn-comment-save');
    
    btnCancel.addEventListener('click', () => {
        editForm.remove();
        commentContent.style.display = 'block';
    });
    
    btnSave.addEventListener('click', async () => {
        const newContent = textarea.value.trim();
        
        if (!newContent) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }
        
        if (newContent === comment.content) {
            editForm.remove();
            commentContent.style.display = 'block';
            return;
        }
        
        try {
            btnSave.disabled = true;
            btnSave.textContent = '저장 중...';
            
            await updateComment(currentPostId, comment.commentId, newContent);
            
            commentContent.textContent = newContent;
            comment.content = newContent;
            commentCard.dataset.comment = JSON.stringify(comment);

            editForm.remove();
            commentContent.style.display = 'block';
            
        } catch (error) {
            console.error('댓글 수정 실패:', error);
            
            // 401 에러 시 로그아웃 처리
            if (error.status === 401) {
                alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                clearLoginData();
                window.location.replace('/pages/login.html');
                return;
            }
            
            alert(error.message || '댓글 수정에 실패했습니다.');
            btnSave.disabled = false;
            btnSave.textContent = '저장';
        }
    });
}

// 댓글 삭제
function handleCommentDelete(commentId) {
    selectedCommentId = commentId;
    deleteCommentModal.classList.remove('hidden');
}

btnCancelDeleteComment.addEventListener('click', () => {
    selectedCommentId = null;
    deleteCommentModal.classList.add('hidden');
});

btnConfirmDeleteComment.addEventListener('click', async () => {
    if (!selectedCommentId) {
        return;
    }
    
    try {
        const result = await deleteComment(currentPostId, selectedCommentId);
        
        commentCountElement.textContent = result.commentsCount;
        
        const commentCard = document.querySelector(`[data-comment-id="${selectedCommentId}"]`);
        if (commentCard) {
            commentCard.remove();
        }
        
    } catch (error) {
        console.error('댓글 삭제 실패:', error);
        
        // 401 에러 시 로그아웃 처리
        if (error.status === 401) {
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            clearLoginData();
            window.location.replace('/pages/login.html');
            return;
        }
        
        alert(error.message || '댓글 삭제에 실패했습니다.');
    } finally {
        selectedCommentId = null;
        deleteCommentModal.classList.add('hidden');
    }
});

// 인피니티 스크롤 
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight >= documentHeight - 200) {
        loadComments();
    }
});

// 페이지 로드
loadPostDetail();

console.log('게시글 상세 페이지 로드 완료');