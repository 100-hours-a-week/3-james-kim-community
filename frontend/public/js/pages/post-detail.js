// public/js/pages/post-detail.js
// 게시글 상세 페이지 메인 로직

import { getPostDetail, deletePost, toggleLike } from '../services/postService.js';
import { getComments, createComment, updateComment, deleteComment } from '../services/commentService.js';
import { isLoggedIn, clearLoginData } from '../utils/storage.js';
import { initProfileDropdown } from '../components/profileDropdown.js';  
import { getImageUrl, handleImageError } from '../utils/imageHelper.js';
import { renderHeader, initBackButton } from '../components/headerTemplate.js';

// 상태 관리
let currentPostId = null;
let currentPostData = null;
let commentsLastSeenId = null;
let commentsHasNext = true;
let commentsIsLoading = false;
let selectedCommentId = null;

// DOM 요소
// 게시글
let postTitle;
let authorImage;
let authorName;
let postDate;
let postActions;
let btnEdit;
let btnDelete;
let postImageWrapper;
let postImage;
let postContent;

// 통계
let likeButton;
let likeIcon;
let likeCount;
let viewCount;
let commentCountElement;

// 댓글 입력
let commentTextarea;
let btnCommentSubmit;

// 댓글 목록
let commentsList;
let commentsLoadingElement;
let noMoreComments;

// 모달
let deletePostModal;
let btnCancelDeletePost;
let btnConfirmDeletePost;
let deleteCommentModal;
let btnCancelDeleteComment;
let btnConfirmDeleteComment;

// 무한 스크롤
let commentSentinel;
let commentObserver;

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

    updateLikeButton(data.isLiked);
}

// 좋아요 버튼 상태 업데이트
function updateLikeButton(isLiked) {
    if (isLiked) {
        likeButton.classList.add('liked');
        likeIcon.textContent = '♥';  
    } else {
        likeButton.classList.remove('liked');
        likeIcon.textContent = '♡';  
    }
}

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

// 이벤트 핸들러 - 게시글
async function handleLikeButtonClick(e) {
    e.stopPropagation();
    
    // 연속 클릭 방지
    if (likeButton.disabled) return;
    
    try {
        likeButton.disabled = true;
        
        console.log('좋아요 토글 요청:', currentPostId);
        
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
}

function handleEditButtonClick() {
    window.location.href = `/pages/post-edit.html?postId=${currentPostId}`;
}

function handleDeleteButtonClick() {
    deletePostModal.classList.remove('hidden');
}

function handleCancelDeletePost() {
    deletePostModal.classList.add('hidden');
}

async function handleConfirmDeletePost() {
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
}

// 이벤트 핸들러 - 댓글 입력
function handleCommentInput() {
    const hasContent = commentTextarea.value.trim().length > 0;
    btnCommentSubmit.disabled = !hasContent;
    
    if (hasContent) {
        btnCommentSubmit.classList.add('active');
    } else {
        btnCommentSubmit.classList.remove('active');
    }
}

async function handleCommentSubmit() {
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
        
        // 댓글 목록 새로고침
        commentsList.innerHTML = '';
        commentsLastSeenId = null;
        commentsHasNext = true;
        
        await loadComments();
        
    } catch (error) {
        console.error('댓글 등록 실패:', error);
        
        // 401 에러 시 로그아웃 처리
        if (error.status === 401) {
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            clearLoginData();
            window.location.replace('/pages/login.html');
            return;
        }
        
        alert(error.message || '댓글 등록에 실패했습니다.');
    } finally {
        btnCommentSubmit.disabled = false;
        btnCommentSubmit.textContent = '댓글 등록';
        btnCommentSubmit.classList.remove('active');
    }
}

// 이벤트 핸들러 - 댓글 수정/삭제
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

function handleCommentDelete(commentId) {
    selectedCommentId = commentId;
    deleteCommentModal.classList.remove('hidden');
}

function handleCancelDeleteComment() {
    selectedCommentId = null;
    deleteCommentModal.classList.add('hidden');
}

async function handleConfirmDeleteComment() {
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
}

// 이벤트 핸들러 - 인피니티 스크롤
function handleCommentIntersection(entries) {
    entries.forEach(entry => {
        // sentinel이 화면에 보이고, 로딩 중이 아니고, 더 가져올 댓글이 있으면
        if (entry.isIntersecting && !commentsIsLoading && commentsHasNext) {
            console.log('댓글 Sentinel 감지 - 다음 페이지 로드');
            loadComments();
        }
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 좋아요 버튼
    likeButton.addEventListener('click', handleLikeButtonClick);
    
    // 게시글 수정/삭제
    btnEdit.addEventListener('click', handleEditButtonClick);
    btnDelete.addEventListener('click', handleDeleteButtonClick);
    btnCancelDeletePost.addEventListener('click', handleCancelDeletePost);
    btnConfirmDeletePost.addEventListener('click', handleConfirmDeletePost);
    
    // 댓글 입력
    commentTextarea.addEventListener('input', handleCommentInput);
    btnCommentSubmit.addEventListener('click', handleCommentSubmit);
    
    // 댓글 삭제 모달
    btnCancelDeleteComment.addEventListener('click', handleCancelDeleteComment);
    btnConfirmDeleteComment.addEventListener('click', handleConfirmDeleteComment);
    
    // 인피니티 스크롤 설정
    setupInfiniteScroll();
}

// 인피니티 스크롤 설정
function setupInfiniteScroll() {
    // 댓글 스크롤 감시용 sentinel 요소 생성
    commentSentinel = document.createElement('div');
    commentSentinel.id = 'comment-scroll-sentinel';
    commentSentinel.style.height = '1px';
    commentSentinel.style.visibility = 'hidden';

    commentsLoadingElement.parentNode.insertBefore(commentSentinel, commentsLoadingElement);

    // Intersection Observer 생성
    commentObserver = new IntersectionObserver(handleCommentIntersection, {
        // 300px 전에 미리 로드 (빠른 반응)
        rootMargin: '300px',
        threshold: 0
    });

    // sentinel 감시 시작
    commentObserver.observe(commentSentinel);
}

// 초기화
async function init() {
    // 1. 로그인 체크
    if (!isLoggedIn()) {
        alert('로그인이 필요합니다.');
        window.location.replace('/pages/login.html');
        throw new Error('Unauthorized access');
    }
    
    // 2. URL에서 postId 추출
    const urlParams = new URLSearchParams(window.location.search);
    currentPostId = urlParams.get('id');
    
    if (!currentPostId) {
        alert('잘못된 접근입니다.');
        window.location.replace('/index.html');
        throw new Error('Invalid post ID');
    }
    
    // 3. 헤더 생성
    renderHeader('.mobile-container');
    
    // 4. DOM 요소 가져오기
    // 게시글
    postTitle = document.getElementById('postTitle');
    authorImage = document.getElementById('authorImage');
    authorName = document.getElementById('authorName');
    postDate = document.getElementById('postDate');
    postActions = document.getElementById('postActions');
    btnEdit = document.getElementById('btnEdit');
    btnDelete = document.getElementById('btnDelete');
    postImageWrapper = document.getElementById('postImageWrapper');
    postImage = document.getElementById('postImage');
    postContent = document.getElementById('postContent');
    
    // 통계
    likeButton = document.getElementById('likeButton');
    likeIcon = document.getElementById('likeIcon');
    likeCount = document.getElementById('likeCount');
    viewCount = document.getElementById('viewCount');
    commentCountElement = document.getElementById('commentCount');
    
    // 댓글 입력
    commentTextarea = document.getElementById('commentTextarea');
    btnCommentSubmit = document.getElementById('btnCommentSubmit');
    
    // 댓글 목록
    commentsList = document.getElementById('commentsList');
    commentsLoadingElement = document.getElementById('commentsLoading');
    noMoreComments = document.getElementById('noMoreComments');
    
    // 모달
    deletePostModal = document.getElementById('deletePostModal');
    btnCancelDeletePost = document.getElementById('btnCancelDeletePost');
    btnConfirmDeletePost = document.getElementById('btnConfirmDeletePost');
    deleteCommentModal = document.getElementById('deleteCommentModal');
    btnCancelDeleteComment = document.getElementById('btnCancelDeleteComment');
    btnConfirmDeleteComment = document.getElementById('btnConfirmDeleteComment');
    
    // 5. 헤더 컴포넌트 초기화
    initBackButton('/index.html');
    
    // 6. 프로필 드롭다운 초기화
    initProfileDropdown({
        logoutButtonId: 'btnLogout'  
    });
    
    // 7. 이벤트 리스너 설정
    setupEventListeners();
    
    // 8. 게시글 데이터 로드
    await loadPostDetail();
    
    console.log('게시글 상세 페이지 로드 완료');
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);