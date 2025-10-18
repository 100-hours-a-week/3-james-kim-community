// public/js/pages/post-write.js
// 게시글 작성 페이지 메인 로직

import { createPost } from "../services/postService.js";
import { uploadImage } from "../services/imageService.js";
import { isLoggedIn, clearLoginData } from "../utils/storage.js";

// DOM 요소 가져오기
const btnBack = document.getElementById('btnBack');
const profileButton = document.getElementById('profileButton');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutButton = document.getElementById('logoutButton');
const postWriteForm = document.getElementById('postWriteForm');
const postTitle = document.getElementById('postTitle');
const postContent = document.getElementById('postContent');
const titleHelperText = document.getElementById('titleHelperText');
const btnFileSelect = document.getElementById('btnFileSelect');
const imageInput = document.getElementById('imageInput');
const fileName = document.getElementById('fileName');
const btnSubmit = document.getElementById('btnSubmit');

// 상태 관리 전역 변수
let uploadedImageUrl = null;  // 업로드된 이미지 URL (/temp/...)

// 로그인 체크
if (!isLoggedIn()) {
    alert('로그인이 필요합니다.');
    window.location.href = '/index.html';
}

/**
 * 헤더 이벤트
 */
btnBack.addEventListener('click', () => {
    if (confirm('작성 중인 내용이 사라집니다. 뒤로 가시겠습니까?')) {
        window.location.href = '/pages/posts.html';
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
 * 폼 유효성 검사
 * - 제목과 내용이 모두 입력되었는지 확인
 */
function checkFormValid() {
    const isTitleValid = postTitle.value.trim().length > 0;
    const isContentValid = postContent.value.trim().length > 0;
    
    if (isTitleValid && isContentValid) {
        btnSubmit.disabled = false;
        btnSubmit.classList.add('active');
    } else {
        btnSubmit.disabled = true;
        btnSubmit.classList.remove('active');
    }
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
        // 파일 선택 취소 시 - 기존 파일 삭제
        uploadedImageUrl = null;
        fileName.textContent = '선택된 파일 없음';
        imageInput.value = '';
        return;
    }
    
    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        imageInput.value = '';
        fileName.textContent = '선택된 파일 없음';
        uploadedImageUrl = null;
        return;
    }
    
    // 파일 크기 검증 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('이미지 파일은 5MB 이하만 업로드 가능합니다.');
        imageInput.value = '';
        fileName.textContent = '선택된 파일 없음';
        uploadedImageUrl = null;
        return;
    }
    
    try {
        // 로딩 표시
        btnFileSelect.disabled = true;
        btnFileSelect.textContent = '업로드 중...';
        fileName.textContent = '업로드 중...';
        
        // 임시 이미지 업로드
        const imageUrl = await uploadImage(file);
        uploadedImageUrl = imageUrl;
        
        // 파일명 표시
        fileName.textContent = file.name;
        
        console.log('이미지 업로드 성공:', uploadedImageUrl);
        
    } catch (error) {
        console.error('이미지 업로드 실패:', error);
        alert(error.message || '이미지 업로드에 실패했습니다.');
        imageInput.value = '';
        fileName.textContent = '선택된 파일 없음';
        uploadedImageUrl = null;
    } finally {
        btnFileSelect.disabled = false;
        btnFileSelect.textContent = '파일 선택';
    }
});

/**
 * 게시글 작성 제출
 */
postWriteForm.addEventListener('submit', async (e) => {
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
    
    try {
        // 로딩 상태
        btnSubmit.disabled = true;
        btnSubmit.textContent = '작성 중...';
        
        // 게시글 작성 API 호출
        const postData = {
            title: title,
            content: content,
            imageUrl: uploadedImageUrl  // null이거나 "/temp/..." 경로
        };
        
        console.log('게시글 작성 요청:', postData);
        const result = await createPost(postData);
        
        console.log('게시글 작성 성공:', result);
        
        // 작성된 게시글 상세 페이지로 이동
        alert('게시글이 작성되었습니다.');
        window.location.href = `/pages/post-detail.html?id=${result.postId}`;
        
    } catch (error) {
        console.error('게시글 작성 실패:', error);
        alert(error.message || '게시글 작성에 실패했습니다.');
        
        // 버튼 원래대로
        btnSubmit.disabled = false;
        btnSubmit.textContent = '완료';
    }
});

console.log('게시글 작성 페이지 로드 완료');