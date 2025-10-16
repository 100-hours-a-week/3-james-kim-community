// public/js/pages/posts.js
// 게시글 목록 페이지 메인 로직

import { getPosts } from "../services/postService.js";
import { isLoggedIn, clearLoginData, getUserId } from "../utils/storage.js";

// DOM 요소 가져오기
const profileButton = document.getElementById('profileButton');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutButton = document.getElementById('logoutButton');
const writeButton = document.getElementById('writeButton');
const postsList = document.getElementById('postsList');
const loadingIndicator = document.getElementById('loadingIndicator');
const noMorePosts = document.getElementById('noMorePosts');

// 상태 관리 전역 변수
let lastSeenId = null;  // 마지막으로 본 게시글 ID
let hasMore = true;     // 더 불러올 게시글이 있는지
let isLoading = false;  // 현재 로딩 중인지

// 로그인 체크
if (!isLoggedIn()) {
    alert('로그인이 필요합니다.');
    window.location.href = '/index.html';
}

// 프로필 메뉴 드롭다운
profileButton.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('hidden');
});

// 프로필 메뉴 외부 클릭 시 닫기
document.addEventListener('click', () => {
    dropdownMenu.classList.add('hidden');
});

// 로그아웃
logoutButton.addEventListener('click', () => {
    if (confirm('로그아웃 하시겠습니까?')) {
        clearLoginData();
        alert('로그아웃되었습니다.');
        window.location.href = '/index.html';
    }
});

// 게시글 작성 버튼
writeButton.addEventListener('click', () => {
    window.location.href = '/pages/post-write.html';
});

// 게시글 개별 카드 리스트 HTML 동적 생성
function createPostCard(post) {
    const card = document.createElement('article');
    card.className = 'post-card';
    card.dataset.postId = post.postId;
    
    // 날짜 포맷팅 (YYYY-MM-DD HH:mm:ss)
    const dateStr = post.createdAt || '';
    
    card.innerHTML = `
        <h3 class="post-title">${post.title}</h3>
        
        <div class="post-stats">
            <span class="stat-item">
                <span class="stat-label">좋아요</span>
                <span class="stat-value">${post.likeCount || 0}</span>
            </span>
            <span class="stat-item">
                <span class="stat-label">댓글</span>
                <span class="stat-value">${post.commentCount || 0}</span>
            </span>
            <span class="stat-item">
                <span class="stat-label">조회수</span>
                <span class="stat-value">${post.viewCount || 0}</span>
            </span>
        </div>
        
        <div class="post-author">
            <div class="author-image-placeholder"></div>
            <div class="author-info">
                <span class="author-name">${post.authorNickname}</span>
                <span class="post-date">${dateStr}</span>
            </div>
        </div>
    `;
    
    // 카드 클릭 시 상세 페이지로 이동
    card.addEventListener('click', () => {
        window.location.href = `/pages/post-detail.html?id=${post.postId}`;
    });
    
    return card;
}

// 게시글 목록 로드 (게시글 카드 리스트의 모음)
async function loadPosts() {
    if (isLoading || !hasMore) return;
    
    isLoading = true;
    loadingIndicator.classList.remove('hidden');
    
    try {
        // 첫 로딩은 5개, 이후는 10개씩 페이징
        const limit = (lastSeenId === null) ? 5 : 10;
        
        const result = await getPosts(lastSeenId, limit);
        
        const posts = result.data.posts;
        const pagination = result.data.pagination;
        
        // 게시글이 하나도 없으면
        if (posts.length === 0 && lastSeenId === null) {
            postsList.innerHTML = '<div class="empty-posts"><p>게시글이 없습니다.</p></div>';
            hasMore = false;
            return;
        }
        
        // 게시글 카드 추가
        posts.forEach(post => {
            const card = createPostCard(post);
            postsList.appendChild(card);
        });
        
        // 페이징 정보 업데이트
        lastSeenId = pagination.lastSeenId;
        hasMore = pagination.hasNext;
        
        // 더 이상 게시글 없으면 표시
        if (!hasMore) {
            noMorePosts.classList.remove('hidden');
        }
        
    } catch (error) {
        console.error('게시글 로딩 실패:', error);
        
        // 인증 에러면 로그인 페이지로
        if (error.status === 401) {
            alert('로그인이 만료되었습니다.');
            clearLoginData();
            window.location.href = '/index.html';
            return;
        }
        
        alert(error.message);
        
    } finally {
        isLoading = false;
        loadingIndicator.classList.add('hidden');
    }
}

// 인피니티 스크롤링
function handleScroll() {
    // 스크롤이 하단 근처에 도달했는지 체크
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // 하단 200px 이내에 도달하면 다음 게시글 페이징 로드
    if (scrollTop + windowHeight >= documentHeight - 200) {
        loadPosts();
    }
}

// 스크롤 이벤트
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) return;
    
    scrollTimeout = setTimeout(() => {
        handleScroll();
        scrollTimeout = null;
    }, 200);
});

// 초기 로드 ==========
loadPosts();

console.log('게시글 목록 페이지 로드 완료');