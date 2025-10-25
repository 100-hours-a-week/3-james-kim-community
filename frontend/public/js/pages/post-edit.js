// public/js/pages/post-edit.js
// 게시글 수정 페이지 메인 로직

import { getPostDetail, updatePost } from '../services/postService.js';
import { uploadImage } from '../services/imageService.js';
import { isLoggedIn, clearLoginData } from '../utils/storage.js';
import { initProfileDropdown } from '../components/profileDropdown.js';
import { initBackButton } from '../components/header.js';

// DOM 요소 가져오기
// 폼 요소
const postEditForm = document.getElementById('postEditForm');
const postTitle = document.getElementById('postTitle');
const postContent = document.getElementById('postContent');
const titleHelperText = document.getElementById('titleHelperText');
const btnSubmit = document.getElementById('btnSubmit');

// 이미지 업로드
const imageInput = document.getElementById('imageInput');
const btnFileSelect = document.getElementById('btnFileSelect');
const fileName = document.getElementById('fileName');

// 기존 이미지 관리
const currentImageArea = document.getElementById('currentImageArea');
const currentImageName = document.getElementById('currentImageName');
const btnRemoveImage = document.getElementById('btnRemoveImage');
const btnRestoreImage = document.getElementById('btnRestoreImage');

// 상태 관리
let currentPostId = null;
let originalData = null;

// 이미지 상태 관리 (3가지 상태)
let originalImageUrl = null;    
let currentImageUrl = null;     
let newUploadedImageUrl = null; 
let imageChanged = false;       

// 로그인 체크
if (!isLoggedIn()) {
    alert('로그인이 필요합니다.');
    window.location.replace('/pages/login.html');
    throw new Error('Unauthorized access');
}

// URL에서 postId 추출
const urlParams = new URLSearchParams(window.location.search);
currentPostId = urlParams.get('postId');

if (!currentPostId) {
    alert('잘못된 접근입니다.');
    window.location.replace('/index.html');
    throw new Error('Invalid post ID');
}

// 뒤로가기 버튼 (커스텀 처리 - 수정 중 확인)
const btnBack = document.getElementById('btnBack');
btnBack.addEventListener('click', () => {
    if (hasChanges()) {
        if (confirm('수정 중인 내용이 사라집니다. 뒤로 가시겠습니까?')) {
            window.location.href = `/pages/post-detail.html?id=${currentPostId}`;
        }
    } else {
        window.location.href = `/pages/post-detail.html?id=${currentPostId}`;
    }
});

// 헤더 컴포넌트 초기화
initBackButton(`/pages/post-detail.html?id=${currentPostId}`);

// 프로필 드롭다운 초기화
initProfileDropdown();

// 기존 게시글 데이터 로드
async function loadPostData() {
    try {
        const postData = await getPostDetail(currentPostId);
        
        // 작성자 권한 확인
        if (!postData.isAuthor) {
            alert('게시글 수정 권한이 없습니다.');
            window.location.replace(`/pages/post-detail.html?id=${currentPostId}`);
            return;
        }
        
        originalData = postData;
        
        // 폼에 기존 데이터 채우기
        postTitle.value = postData.title;
        postContent.value = postData.content;
        titleHelperText.textContent = `${postData.title.length}/26`;
        
        // 기존 이미지가 있으면 표시
        if (postData.imageUrl) {
            originalImageUrl = postData.imageUrl;
            currentImageUrl = postData.imageUrl;
            
            // 파일명 추출
            const imageName = postData.imageUrl.split('/').pop();
            currentImageName.textContent = imageName || '기존 이미지';
            
            // 기존 이미지 영역 표시
            currentImageArea.classList.remove('hidden');
        }
        
        // 버튼 활성화
        checkFormValid();
        
        console.log('게시글 데이터 로드 완료:', postData);
        
    } catch (error) {
        console.error('게시글 데이터 로드 실패:', error);
        
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

// 제목 글자 수 카운터
postTitle.addEventListener('input', () => {
    const length = postTitle.value.length;
    titleHelperText.textContent = `${length}/26`;
    checkFormValid();
});

// 내용 입력 시 유효성 체크
postContent.addEventListener('input', () => {
    checkFormValid();
});

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

// 변경사항 확인
function hasChanges() {
    if (!originalData) return false;
    
    const title = postTitle.value.trim();
    const content = postContent.value.trim();
    
    return title !== originalData.title || 
           content !== originalData.content || 
           imageChanged;
}

// 이미지 파일 선택
btnFileSelect.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    
    // 파일 선택 취소 시 - 아무 동작 안 함
    if (!file) {
        imageInput.value = '';
        return;
    }
    
    // 파일 크기 체크 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('이미지 크기는 5MB 이하만 업로드 가능합니다.');
        imageInput.value = '';
        return;
    }
    
    // 파일 타입 체크
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        alert('JPG, PNG, GIF 형식의 이미지만 업로드 가능합니다.');
        imageInput.value = '';
        return;
    }
    
    // 새 이미지 업로드
    try {
        btnFileSelect.disabled = true;
        btnFileSelect.textContent = '업로드 중...';
        fileName.textContent = '업로드 중...';
        
        // 임시 이미지 업로드
        const uploadedUrl = await uploadImage(file);
        
        // 새 이미지로 교체
        newUploadedImageUrl = uploadedUrl;
        currentImageUrl = uploadedUrl;
        imageChanged = true;
        
        // 파일명 표시 (새 업로드 파일)
        fileName.textContent = file.name;
        
        // 기존 이미지 영역 처리
        if (originalImageUrl) {
            // 기존 이미지가 있었으면 - 복구 버튼 숨기고 삭제 버튼만 표시
            currentImageName.classList.remove('pending-delete');
            btnRemoveImage.classList.add('hidden');
            btnRestoreImage.classList.add('hidden');
        } else {
            // 기존 이미지가 없었으면 - 기존 이미지 영역 숨김
            currentImageArea.classList.add('hidden');
        }
        
        console.log('이미지 업로드 성공:', uploadedUrl);
        
        checkFormValid();
        
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
        fileName.textContent = originalImageUrl ? '파일을 선택하거나 기존 이미지 사용' : '선택된 파일 없음';
        
    } finally {
        btnFileSelect.disabled = false;
        btnFileSelect.textContent = '파일 선택';
        imageInput.value = '';
    }
});

// 기존 이미지 삭제 버튼 (임시 삭제 - 취소 가능)
btnRemoveImage.addEventListener('click', () => {
    // 이미지 삭제 예정 상태로 변경
    currentImageUrl = "";
    imageChanged = true;
    
    // UI 업데이트
    currentImageName.classList.add('pending-delete');
    btnRemoveImage.classList.add('hidden');
    btnRestoreImage.classList.remove('hidden');
    
    // 새 업로드 파일명 초기화
    fileName.textContent = '선택된 파일 없음';
    newUploadedImageUrl = null;
    
    console.log('이미지 삭제 예정 (임시)');
});

// 기존 이미지 복구 버튼 (삭제 취소)
btnRestoreImage.addEventListener('click', () => {
    // 원본 이미지로 복구
    currentImageUrl = originalImageUrl;
    imageChanged = false;
    
    // UI 업데이트
    currentImageName.classList.remove('pending-delete');
    btnRemoveImage.classList.remove('hidden');
    btnRestoreImage.classList.add('hidden');
    
    // 새 업로드 파일명 초기화
    fileName.textContent = '파일을 선택하거나 기존 이미지 사용';
    newUploadedImageUrl = null;
    
    console.log('이미지 삭제 취소 (원본 복구)');
});

// 게시글 수정 제출
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
            // currentImageUrl이 최종 이미지 URL
            // - "" (빈 문자열) = 삭제
            // - "/temp/..." = 새 업로드
            // - "/images/..." = 기존 유지 (변경 없음, 이 경우는 imageChanged가 false)
            updateData.imageUrl = currentImageUrl;
        }
        
        console.log('게시글 수정 요청:', updateData);
        await updatePost(currentPostId, updateData);
        
        console.log('게시글 수정 성공');
        
        window.location.href = `/pages/post-detail.html?id=${currentPostId}`;
        
    } catch (error) {
        console.error('게시글 수정 실패:', error);
        
        // 401 에러 시 로그아웃 처리
        if (error.status === 401) {
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            clearLoginData();
            window.location.replace('/pages/login.html');
            return;
        }
        
        alert(error.message || '게시글 수정에 실패했습니다.');
        
        // 버튼 원래대로
        btnSubmit.disabled = false;
        btnSubmit.textContent = '수정하기';
    }
});

// 페이지 로드 시 기존 데이터 불러오기
loadPostData();

console.log('게시글 수정 페이지 로드 완료');