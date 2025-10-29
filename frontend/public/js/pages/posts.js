// public/js/pages/posts.js
// 게시글 목록 페이지 메인 로직

import { getPosts } from '../services/postService.js';
import { initProfileDropdown } from '../components/profileDropdown.js'; 
import { getImageUrl, handleImageError } from '../utils/imageHelper.js';
import { showLoginPrompt } from '../components/loginPromptModal.js';
import { renderHeader } from '../components/headerTemplate.js';

renderHeader('.mobile-container', { showBackButton: false });

// 상태 관리
let lastSeenId = null;
let hasNext = true;
let isLoading = false;
let userLoggedIn = false;

// DOM 요소
let postsList;
let loadingIndicator;
let noMorePosts;
let writeButton;
let sentinel;
let observer;

// 로그인 상태 확인 함수 -
async function checkLoginStatus() {
    try {
        // 별도의 세션 체크 없이 프로필 API를 조용히 호출
        const response = await fetch('http://localhost:8080/api/users/me', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            userLoggedIn = true;
            console.log('로그인 상태');
        } else {
            userLoggedIn = false;
            console.log('비로그인 상태');
        }
    } catch (error) {
        userLoggedIn = false;
        console.log('비로그인 상태 (에러)');
    }
}

// 게시글 목록 로드
async function loadPosts() {
    if (isLoading || !hasNext) {
        return;
    }
    
    try {
        isLoading = true;
        loadingIndicator.classList.remove('hidden');
        
        const data = await getPosts(lastSeenId, 10);
        
        // 안전성 체크
        if (!data || !data.posts || !Array.isArray(data.posts)) {
            console.error('잘못된 응답 데이터:', data);
            throw new Error('게시글 데이터를 불러올 수 없습니다.');
        }
        
        // 게시글이 하나도 없을 때 처리
        if (data.posts.length === 0 && lastSeenId === null) {
            postsList.innerHTML = '<div class="empty-posts"><p>아직 작성된 게시글이 없습니다.</p></div>';
            hasNext = false;
            return;
        }
        
        // 게시글 카드 렌더링
        data.posts.forEach(post => {
            const postCard = createPostCard(post);
            postsList.appendChild(postCard);
        });
        
        // 페이지네이션 정보 업데이트
        lastSeenId = data.pagination?.lastSeenId || null;
        hasNext = data.pagination?.hasNext || false;
        
        // 더 이상 게시글이 없으면 메시지 표시
        if (!hasNext && data.posts.length > 0) {
            noMorePosts.classList.remove('hidden');
        }
        
    } catch (error) {
        console.error('게시글 목록 로드 실패:', error);
        alert(error.message || '게시글을 불러오는데 실패했습니다.');
        
        // 첫 로딩 실패 시 에러 메시지 표시
        if (lastSeenId === null) {
            postsList.innerHTML = `
                <div class="empty-posts">
                    <p>게시글을 불러올 수 없습니다.</p>
                    <p style="margin-top: 8px; font-size: 14px; color: #999;">
                        ${error.message || '알 수 없는 오류가 발생했습니다.'}
                    </p>
                </div>
            `;
        }
        
    } finally {
        isLoading = false;
        loadingIndicator.classList.add('hidden');
    }
}

// 게시글 카드 생성
function createPostCard(post) {
    const li = document.createElement('li');
    li.className = 'post-card';
    li.dataset.postId = post.postId;
    
    // 작성자 프로필 이미지 URL 변환
    const authorImageSrc = getImageUrl(post.authorProfileImage);
    const authorImageHTML = `<img src="${authorImageSrc}" alt="프로필" class="author-image">`;
    
    // 게시글 카드 HTML
    li.innerHTML = `
        <h3 class="post-title">${post.title}</h3>
        <div class="post-stats">
            <div class="stat-item">
                <span class="stat-label">좋아요</span>
                <span class="stat-value">${post.likeCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">댓글</span>
                <span class="stat-value">${post.commentCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">조회수</span>
                <span class="stat-value">${post.viewCount}</span>
            </div>
        </div>
        <div class="post-author">
            ${authorImageHTML}
            <div class="author-info">
                <span class="author-name">${post.authorNickname}</span>
                <span class="post-date">${post.createdAt}</span>
            </div>
        </div>
    `;

    // 이미지 로드 실패 처리
    const imgElement = li.querySelector('.author-image');
    if (imgElement) {
        imgElement.addEventListener('error', () => handleImageError(imgElement));
    }
    
    li.addEventListener('click', () => {
        handlePostCardClick(post.postId);
    });
    
    return li;
}

// 이벤트 핸들러
function handlePostCardClick(postId) {
    // 비로그인 사용자는 로그인 유도 모달 표시
    if (!userLoggedIn) {
        showLoginPrompt('게시글을 보려면<br>로그인이 필요합니다.');
        return;
    }
    
    // 로그인 사용자는 상세 페이지로 이동
    window.location.href = `/pages/post-detail.html?id=${postId}`;
}

function handleWriteButtonClick() {
    // 비로그인 사용자는 로그인 유도 모달 표시
    if (!userLoggedIn) {
        showLoginPrompt('게시글을 작성하려면<br>로그인이 필요합니다.');
        return;
    }
    
    // 로그인 사용자는 작성 페이지로 이동
    window.location.href = '/pages/post-write.html';
}

function handleIntersection(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting && !isLoading && hasNext) {
            console.log('📍 Sentinel 감지 - 다음 페이지 로드');
            loadPosts();
        }
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
    writeButton.addEventListener('click', handleWriteButtonClick);
    setupInfiniteScroll();
}

// 무한 스크롤 설정
function setupInfiniteScroll() {
    sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    sentinel.style.height = '1px';
    sentinel.style.visibility = 'hidden';
    
    loadingIndicator.parentNode.insertBefore(sentinel, loadingIndicator);
    
    observer = new IntersectionObserver(handleIntersection, {
        rootMargin: '300px',
        threshold: 0
    });
    
    observer.observe(sentinel);
}

// 초기화
async function init() {    
    // 1. DOM 요소 가져오기
    postsList = document.getElementById('postsList');
    loadingIndicator = document.getElementById('loadingIndicator');
    noMorePosts = document.getElementById('noMorePosts');
    writeButton = document.getElementById('writeButton');
    
    // 2. 로그인 상태 확인 (조용히 - 리다이렉트 없음)
    await checkLoginStatus();
    
    // 3. 프로필 드롭다운 초기화
    initProfileDropdown({ isGuest: !userLoggedIn });
    
    // 4. 이벤트 리스너 설정
    setupEventListeners();
    
    // 5. 초기 게시글 로드
    await loadPosts();
    
    console.log('게시글 목록 페이지 로드 완료', userLoggedIn ? '(로그인)' : '(비로그인)');
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);