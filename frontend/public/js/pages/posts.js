// public/js/pages/posts.js
// 게시글 목록 페이지 메인 로직

import { getPosts } from '../services/postService.js';
import { isLoggedIn, clearLoginData } from '../utils/storage.js';
import { initProfileDropdown } from '../components/profileDropdown.js'; 
import { getImageUrl, handleImageError } from '../utils/imageHelper.js';
import { showLoginPrompt } from '../components/loginPromptModal.js';

// DOM 요소 가져오기
const postsList = document.getElementById('postsList');
const loadingIndicator = document.getElementById('loadingIndicator');
const noMorePosts = document.getElementById('noMorePosts');
const writeButton = document.getElementById('writeButton');

// 상태 관리
let lastSeenId = null;
let hasNext = true;
let isLoading = false;
const userLoggedIn = isLoggedIn(); // 로그인 여부 확인

// 프로필 드롭다운 초기화 (로그인 상태에 따라)
initProfileDropdown({ isGuest: !userLoggedIn });

// 게시글 목록 로드
async function loadPosts() {
    if (isLoading || !hasNext) {
        return;
    }
    
    try {
        isLoading = true;
        loadingIndicator.classList.remove('hidden');
        
        // API 호출
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
        
        // 401 에러 시 로그아웃 처리 (로그인한 사용자만)
        if (error.status === 401 && userLoggedIn) {
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            clearLoginData();
            window.location.replace('/pages/login.html');
            return;
        }
        
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
    
    // 게시글 클릭 이벤트
    li.addEventListener('click', () => {
        // 비로그인 사용자는 로그인 유도 모달 표시
        if (!userLoggedIn) {
            showLoginPrompt('게시글을 보려면<br>로그인이 필요합니다.');
            return;
        }
        
        // 로그인 사용자는 상세 페이지로 이동
        window.location.href = `/pages/post-detail.html?id=${post.postId}`;
    });
    
    return li;
}

// 게시글 작성 버튼
writeButton.addEventListener('click', () => {
    // 비로그인 사용자는 로그인 유도 모달 표시
    if (!userLoggedIn) {
        showLoginPrompt('게시글을 작성하려면<br>로그인이 필요합니다.');
        return;
    }
    
    // 로그인 사용자는 작성 페이지로 이동
    window.location.href = '/pages/post-write.html';
});

// 인피니티 스크롤 (Intersection Observer 사용)
// 스크롤 감시용 sentinel 요소 생성
const sentinel = document.createElement('div');
sentinel.id = 'scroll-sentinel';
sentinel.style.height = '1px';
sentinel.style.visibility = 'hidden';

// sentinel을 loadingIndicator 바로 앞에 삽입
loadingIndicator.parentNode.insertBefore(sentinel, loadingIndicator);

// Intersection Observer 생성
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // sentinel이 화면에 보이고, 로딩 중이 아니고, 더 가져올 데이터가 있으면
        if (entry.isIntersecting && !isLoading && hasNext) {
            console.log('📍 Sentinel 감지 - 다음 페이지 로드');
            loadPosts();
        }
    });
}, {
    // 300px 전에 미리 로드 (더 빠른 반응)
    rootMargin: '300px',
    threshold: 0
});

// sentinel 감시 시작
observer.observe(sentinel);

// 초기 로드
loadPosts();

console.log('게시글 목록 페이지 로드 완료', userLoggedIn ? '(로그인)' : '(비로그인)');