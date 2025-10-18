// public/js/pages/post-edit.js
// 게시글 수정 페이지 메인 로직

import { getPostDetail, updatePost } from "../services/postService.js";
import { uploadImage } from "../services/imageService.js";
import { isLoggedIn, clearLoginData } from "../utils/storage.js";

// DOM 요소 가져오기
const btnBack = document.getElementById('btnBack');
const profileButton = document.getElementById('profileButton');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutButton = document.getElementById('logoutButton');
const postEditForm = document.getElementById('postEditForm');
const postTitle = document.getElementById('postTitle');
const postContent = document.getElementById('postContent');
const titleHelperText = document.getElementById('titleHelperText');
const btnFileSelect = document.getElementById('btnFileSelect');
const imageInput = document.getElementById('imageInput');
const fileName = document.getElementById('fileName');
const btnSubmit = document.getElementById('btnSubmit');

// 상태 관리 전역 변수
let currentPostId = null;  // 현재 수정 중인 게시글 ID
let originalData = null;   // 원본 게시글 데이터
let currentImageUrl = null;  // 현재 이미지 URL (기존 이미지 or 새 업로드 이미지)
let imageChanged = false;  // 이미지 변경 여부

// 로그인 체크
if (!isLoggedIn()) {
    alert('로그인이 필요합니다.');
    window.location.href = '/index.html';
}

// URL에서 postId 추출
const urlParams = new URLSearchParams(window.location.search);
currentPostId = urlParams.get('postId');

if (!currentPostId) {
    alert('잘못된 접근입니다.');
    window.location.href = '/pages/posts.html';
}

/**
 * 기존 게시글 데이터 로드
 */
async function loadPostData() {
    try {
        const postData = await getPostDetail(currentPostId);
        
        // 작성자 권한 확인
        if (!postData.isAuthor) {
            alert('게시글 수정 권한이 없습니다.');
            window.location.href = `/pages/post-detail.html?id=${currentPostId}`;
            return;
        }
        
        originalData = postData;
        
        // 폼에 기존 데이터 채우기
        postTitle.value = postData.title;
        postContent.value = postData.content;
        titleHelperText.textContent = `${postData.title.length}/26`;
        
        // 기존 이미지가 있으면 표시
        if (postData.imageUrl) {
            currentImageUrl = postData.imageUrl;
            // 파일명 추출 (URL에서 마지막 부분)
            const imageName = postData.imageUrl.split('/').pop();
            fileName.textContent = imageName || '기존 이미지';
        }
        
        // 버튼 활성화 (기존 데이터가 있으므로)
        checkFormValid();
        
        console.log('게시글 데이터 로드 완료:', postData);
        
    } catch (error) {
        console.error('게시글 데이터 로드 실패:', error);
        alert(error.message || '게시글을 불러올 수 없습니다.');
        window.location.href = '/pages/posts.html';
    }
}

/**
 * 헤더 이벤트
 */
btnBack.addEventListener('click', () => {
    if (hasChanges()) {
        if (confirm('수정 중인 내용이 사라집니다. 뒤로 가시겠습니까?')) {
            window.location.href = `/pages/post-detail.html?id=${currentPostId}`;
        }
    } else {
        window.location.href = `/pages/post-detail.html?id=${currentPostId}`;
    }
});

profileButton.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('hidden');
});

document.addEventListener('click', () => {
    dropdownMenu.classList.add('hidden');
});

logoutButton.addEventListener('click', () => {
    if (confirm('로그아웃 하시겠습니까?')) {
        clearLoginData();
        alert('로그아웃되었습니다.');
        window.location.href = '/index.html';
    }
});

/**
 * 제목 글자 수 표시
 */
postTitle.addEventListener('input', () => {
    const length = postTitle.value.length;
    titleHelperText.textContent = `${length}/26`;
    checkFormValid();
});

/**
 * 내용 입력 시 유효성 검사
 */
postContent.addEventListener('input', () => {
    checkFormValid();
});

/**
 * 폼 유효성 검사 및 변경 사항 확인
 */
function checkFormValid() {
    const isTitleValid = postTitle.value.trim().length > 0;
    const isContentValid = postContent.value.trim().length > 0;
    const changed = hasChanges();
    
    if (isTitleValid && isContentValid && changed) {
        btnSubmit.disabled = false;
        btnSubmit.classList.add('active');
    } else {
        btnSubmit.disabled = true;
        btnSubmit.classList.remove('active');
    }
}

/**
 * 변경 사항이 있는지 확인
 */
function hasChanges() {
    if (!originalData) {
        return false;
    }
    
    const titleChanged = postTitle.value.trim() !== originalData.title;
    const contentChanged = postContent.value.trim() !== originalData.content;
    
    return titleChanged || contentChanged || imageChanged;
}

/**
 * 이미지 업로드 버튼 클릭
 */
btnFileSelect.addEventListener('click', () => {
    imageInput.click();
});

/**
 * 이미지 파일 선택
 */
imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    
    if (!file) {
        // 파일 선택 취소 시 - 이미지 완전 삭제
        currentImageUrl = "";  // 빈 문자열 = 이미지 삭제 요청
        imageChanged = true;
        fileName.textContent = '선택된 파일 없음';
        imageInput.value = '';
        checkFormValid();
        return;
    }
    
    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        imageInput.value = '';
        
        // 기존 이미지로 복구
        if (originalData && originalData.imageUrl) {
            currentImageUrl = originalData.imageUrl;
            const imageName = originalData.imageUrl.split('/').pop();
            fileName.textContent = imageName || '기존 이미지';
            imageChanged = false;
        } else {
            fileName.textContent = '선택된 파일 없음';
        }
        return;
    }
    
    // 파일 크기 검증 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('이미지 파일은 5MB 이하만 업로드 가능합니다.');
        imageInput.value = '';
        
        // 기존 이미지로 복구
        if (originalData && originalData.imageUrl) {
            currentImageUrl = originalData.imageUrl;
            const imageName = originalData.imageUrl.split('/').pop();
            fileName.textContent = imageName || '기존 이미지';
            imageChanged = false;
        } else {
            fileName.textContent = '선택된 파일 없음';
        }
        return;
    }
    
    try {
        // 로딩 표시
        btnFileSelect.disabled = true;
        btnFileSelect.textContent = '업로드 중...';
        fileName.textContent = '업로드 중...';
        
        // 임시 이미지 업로드
        const imageUrl = await uploadImage(file);
        currentImageUrl = imageUrl;
        imageChanged = true;
        
        // 파일명 표시
        fileName.textContent = file.name;
        
        console.log('이미지 업로드 성공:', currentImageUrl);
        
        // 버튼 상태 업데이트
        checkFormValid();
        
    } catch (error) {
        console.error('이미지 업로드 실패:', error);
        alert(error.message || '이미지 업로드에 실패했습니다.');
        imageInput.value = '';
        
        // 기존 이미지로 복구
        if (originalData && originalData.imageUrl) {
            currentImageUrl = originalData.imageUrl;
            const imageName = originalData.imageUrl.split('/').pop();
            fileName.textContent = imageName || '기존 이미지';
            imageChanged = false;
        } else {
            fileName.textContent = '선택된 파일 없음';
        }
    } finally {
        btnFileSelect.disabled = false;
        btnFileSelect.textContent = '파일 선택';
    }
});

/**
 * 게시글 수정 제출
 */
postEditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = postTitle.value.trim();
    const content = postContent.value.trim();
    
    if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
    }
    
    if (title.length > 26) {
        alert('제목은 최대 26자까지 작성 가능합니다.');
        return;
    }
    
    if (!hasChanges()) {
        alert('수정된 내용이 없습니다.');
        return;
    }
    
    try {
        // 로딩 상태
        btnSubmit.disabled = true;
        btnSubmit.textContent = '수정 중...';
        
        // 수정 요청 데이터 구성
        const updateData = {};
        
        // 제목 변경 확인
        if (title !== originalData.title) {
            updateData.title = title;
        }
        
        // 내용 변경 확인
        if (content !== originalData.content) {
            updateData.content = content;
        }
        
        // 이미지 변경 확인
        if (imageChanged) {
            updateData.imageUrl = currentImageUrl;  // "" (삭제) 또는 "/temp/..." (교체)
        }
        
        console.log('게시글 수정 요청:', updateData);
        await updatePost(currentPostId, updateData);
        
        console.log('게시글 수정 성공');
        
        // 수정된 게시글 상세 페이지로 이동
        alert('게시글이 수정되었습니다.');
        window.location.href = `/pages/post-detail.html?id=${currentPostId}`;
        
    } catch (error) {
        console.error('게시글 수정 실패:', error);
        alert(error.message || '게시글 수정에 실패했습니다.');
        
        // 버튼 원래대로
        btnSubmit.disabled = false;
        btnSubmit.textContent = '수정하기';
    }
});

// 페이지 로드 시 기존 데이터 불러오기
loadPostData();

console.log('게시글 수정 페이지 로드 완료');