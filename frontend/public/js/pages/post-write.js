// public/js/pages/post-write.js
// 게시글 작성 페이지 메인 로직

import { uploadImage } from '../services/imageService.js';
import { createPost } from '../services/postService.js';
import { isLoggedIn, clearLoginData } from '../utils/storage.js';
import { initProfileDropdown } from '../components/profileDropdown.js';
import { renderHeader, initBackButton } from '../components/headerTemplate.js';

// 상태 관리
let uploadedImageUrl = null;

// DOM 요소
// 폼 요소
let postWriteForm;
let postTitle;
let postContent;
let titleHelperText;
let btnSubmit;

// 이미지 업로드
let imageInput;
let btnFileSelect;
let fileName;

// 폼 유효성 검사 및 버튼 활성화/비활성화
function checkFormValid() {
    const title = postTitle.value.trim();
    const content = postContent.value.trim();
    
    const isValid = title.length > 0 && 
                   title.length <= 26 && 
                   content.length > 0;
    
    btnSubmit.disabled = !isValid;
    
    if (isValid) {
        btnSubmit.classList.add('active');
    } else {
        btnSubmit.classList.remove('active');
    }
}

// 이벤트 핸들러
function handleTitleInput() {
    const length = postTitle.value.length;
    titleHelperText.textContent = `${length}/26`;
    checkFormValid();
}

function handleContentInput() {
    checkFormValid();
}

function handleFileSelectClick() {
    imageInput.click();
}

async function handleImageChange(e) {
    const file = e.target.files[0];
    
    // 파일 선택 취소 처리 (파일이 없으면)
    if (!file) {
        fileName.textContent = '선택된 파일 없음';
        uploadedImageUrl = null;
        imageInput.value = '';
        return;
    }
    
    // 파일 크기 체크 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('이미지 크기는 5MB 이하만 업로드 가능합니다.');
        imageInput.value = '';
        fileName.textContent = '선택된 파일 없음';
        uploadedImageUrl = null;
        return;
    }
    
    // 파일 타입 체크
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        alert('JPG, PNG, GIF 형식의 이미지만 업로드 가능합니다.');
        imageInput.value = '';
        fileName.textContent = '선택된 파일 없음';
        uploadedImageUrl = null;
        return;
    }
    
    // 파일명 표시
    fileName.textContent = file.name;
    
    // 이미지 업로드
    try {
        btnFileSelect.disabled = true;
        btnFileSelect.textContent = '업로드 중...';
        
        uploadedImageUrl = await uploadImage(file);
        console.log('이미지 업로드 성공:', uploadedImageUrl);
        
        btnFileSelect.textContent = '파일 선택';
        
    } catch (error) {
        console.error('이미지 업로드 실패:', error);
        
        // 401 에러 시 로그아웃 처리
        if (error.status === 401) {
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            clearLoginData();
            window.location.replace('/pages/login.html');
            return;
        }
        
        alert(error.message || '이미지 업로드에 실패했습니다.');
        imageInput.value = '';
        fileName.textContent = '선택된 파일 없음';
        uploadedImageUrl = null;
    } finally {
        btnFileSelect.disabled = false;
        btnFileSelect.textContent = '파일 선택';
    }
}

async function handleFormSubmit(e) {
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
        
        window.location.href = `/pages/post-detail.html?id=${result.postId}`;
        
    } catch (error) {
        console.error('게시글 작성 실패:', error);
        
        // 401 에러 시 로그아웃 처리
        if (error.status === 401) {
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            clearLoginData();
            window.location.replace('/pages/login.html');
            return;
        }
        
        alert(error.message || '게시글 작성에 실패했습니다.');
        
        // 버튼 원래대로
        btnSubmit.disabled = false;
        btnSubmit.textContent = '완료';
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 제목 글자 수 카운터
    postTitle.addEventListener('input', handleTitleInput);
    
    // 내용 입력 시 유효성 체크
    postContent.addEventListener('input', handleContentInput);
    
    // 이미지 파일 선택
    btnFileSelect.addEventListener('click', handleFileSelectClick);
    imageInput.addEventListener('change', handleImageChange);
    
    // 게시글 작성 제출
    postWriteForm.addEventListener('submit', handleFormSubmit);
}

// 초기화
function init() {
    // 1. 로그인 체크
    if (!isLoggedIn()) {
        alert('로그인이 필요합니다.');
        window.location.replace('/pages/login.html');
        throw new Error('Unauthorized access');
    }
    
    // 2. 헤더 생성
    renderHeader('.mobile-container');
    
    // 3. DOM 요소 가져오기
    postWriteForm = document.getElementById('postWriteForm');
    postTitle = document.getElementById('postTitle');
    postContent = document.getElementById('postContent');
    titleHelperText = document.getElementById('titleHelperText');
    btnSubmit = document.getElementById('btnSubmit');
    
    // 이미지 업로드
    imageInput = document.getElementById('imageInput');
    btnFileSelect = document.getElementById('btnFileSelect');
    fileName = document.getElementById('fileName');
    
    // 4. 헤더 컴포넌트 초기화
    initBackButton('/index.html');
    
    // 5. 프로필 드롭다운 초기화
    initProfileDropdown();
    
    // 6. 이벤트 리스너 설정
    setupEventListeners();
    
    console.log('게시글 작성 페이지 로드 완료');
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);