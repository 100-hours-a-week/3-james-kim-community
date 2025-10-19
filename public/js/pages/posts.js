// public/js/pages/posts.js
// 게시글 목록 페이지 메인 로직

import { getPosts } from '../services/postService.js';
import { isLoggedIn, clearLoginData } from '../utils/storage.js';
import { initProfileDropdown } from '../components/profileDropdown.js'; 

// DOM 요소 가져오기
const postsList = document.getElementById('postsList');
const loadingIndicator = document.getElementById('loadingIndicator');
const noMorePosts = document.getElementById('noMorePosts');
const writeButton = document.getElementById('writeButton');

// 상태 관리
let lastSeenId = null;
let hasNext = true;
let isLoading = false;

// 초기 로그인 체크 및 리다이렉트
function checkLoginStatus() {
    if (!isLoggedIn()) {
        alert('로그인이 필요합니다.');
        window.location.replace('/index.html');
        return false;
    }
    return true;
}

// 즉시 로그인 체크
if (!checkLoginStatus()) {
    // 로그인 안 되어 있으면 여기서 멈춤
    throw new Error('Unauthorized access');
}

// 프로필 드롭다운 초기화
initProfileDropdown();

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
        
        // 401 에러 시 로그아웃 처리
        if (error.status === 401) {
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            clearLoginData();
            window.location.replace('/index.html');
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
    
    // 작성자 프로필 이미지
    const authorImageHTML = post.authorProfileImage
        ? `<img src="${post.authorProfileImage}" alt="프로필" class="author-image">`
        : `<div class="author-image-placeholder"></div>`;
    
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
    
    // 게시글 클릭 이벤트
    li.addEventListener('click', () => {
        window.location.href = `/pages/post-detail.html?id=${post.postId}`;
    });
    
    return li;
}

// 게시글 작성 버튼
writeButton.addEventListener('click', () => {
    window.location.href = '/pages/post-write.html';
});

// 인피니티 스크롤
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // 하단에 가까워지면 다음 페이지 로드
    if (scrollTop + windowHeight >= documentHeight - 200) {
        loadPosts();
    }
});

loadPosts();

console.log('게시글 목록 페이지 로드 완료');