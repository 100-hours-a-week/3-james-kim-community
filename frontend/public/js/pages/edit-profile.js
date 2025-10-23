// public/js/pages/edit-profile.js
// 회원정보 수정 페이지 메인 로직

import { getUserInfo, checkNicknameForUpdate, updateUserInfo, deleteUser } from "../services/userService.js";
import { uploadImage } from "../services/imageService.js";
import { isLoggedIn, clearLoginData } from "../utils/storage.js";
import { validateNickname } from "../utils/validation.js";
import { initBackButton } from "../components/header.js";
import { initProfileDropdown } from "../components/profileDropdown.js";
import { getImageUrl, handleImageError } from '../utils/imageHelper.js';

// DOM 요소 가져오기
const profileImagePlaceholder = document.getElementById('profileImagePlaceholder');
const profileImageContainer = document.getElementById('profileImageContainer');
const btnChangeImage = document.getElementById('btnChangeImage');
const imageInput = document.getElementById('imageInput');

const emailDisplay = document.getElementById('emailDisplay');
const nicknameInput = document.getElementById('nicknameInput');
const nicknameError = document.getElementById('nicknameError');
const btnSubmit = document.getElementById('btnSubmit');
const editProfileForm = document.getElementById('editProfileForm');
const btnWithdrawal = document.getElementById('btnWithdrawal');
const withdrawalModal = document.getElementById('withdrawalModal');
const btnCancelWithdrawal = document.getElementById('btnCancelWithdrawal');
const btnConfirmWithdrawal = document.getElementById('btnConfirmWithdrawal');
const toastMessage = document.getElementById('toastMessage');

// 상태 관리 전역 변수
let originalUserData = null;      
let originalImageUrl = null;       // 원본 이미지 URL (백엔드 상대 경로)
let uploadedImageUrl = null;       // 새로 업로드한 이미지 URL (백엔드 상대 경로)
let isNicknameValid = true;  
let isNicknameChecked = true;

// 로그인 체크
if (!isLoggedIn()) {
    alert('로그인이 필요합니다.');
    window.location.replace('/index.html');
    throw new Error('Unauthorized access');
}

// 헤더 컴포넌트 초기화
initBackButton('/pages/posts.html');

// 프로필 드롭다운 초기화
initProfileDropdown({
    logoutButtonId: 'btnLogout'
});

// 사용자 정보 로드 및 화면 초기화
async function loadUserInfo() {
    try {
        console.log('사용자 정보 로드 시작');
        
        const userInfo = await getUserInfo();
        
        console.log('사용자 정보:', userInfo);
        
        // 원본 데이터 저장
        originalUserData = {
            email: userInfo.email,
            nickname: userInfo.nickname,
            imageUrl: userInfo.imageUrl  
        };
        
        originalImageUrl = userInfo.imageUrl;
        
        // 화면에 표시
        emailDisplay.textContent = userInfo.email;
        nicknameInput.value = userInfo.nickname;
        
        // 프로필 이미지 표시
        displayProfileImage(userInfo.imageUrl);
        
        console.log('사용자 정보 로드 완료');
        
    } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        alert(error.message);
        
        if (error.status === 401) {
            clearLoginData();
            window.location.href = '/index.html';
        }
    }
}

// 프로필 이미지 표시
function displayProfileImage(imageUrl) {
    const fullImageUrl = getImageUrl(imageUrl);
    
    // 기존 이미지 요소 찾기 또는 생성
    let imgElement = profileImageContainer.querySelector('.profile-image');
    
    if (!imgElement) {
        imgElement = document.createElement('img');
        imgElement.className = 'profile-image';
        imgElement.alt = '프로필 이미지';
        
        // 이미지 로드 실패 처리
        imgElement.addEventListener('error', () => handleImageError(imgElement));
        
        // placeholder 숨기고 이미지 추가
        profileImagePlaceholder.style.display = 'none';
        profileImageContainer.appendChild(imgElement);
    }
    
    // 이미지 src 설정
    imgElement.src = fullImageUrl;
    
    console.log('프로필 이미지 표시:', fullImageUrl);
}

// 프로필 이미지 변경 버튼 클릭
btnChangeImage.addEventListener('click', () => {
    imageInput.click();
});

// 프로필 이미지 파일 선택
imageInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        imageInput.value = '';
        return;
    }
    
    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        imageInput.value = '';
        return;
    }
    
    try {
        console.log('이미지 업로드 시작:', file.name);
        
        const uploadedUrl = await uploadImage(file);
        
        console.log('이미지 업로드 성공 (백엔드 경로):', uploadedUrl);
        
        uploadedImageUrl = uploadedUrl;
        
        displayProfileImage(uploadedUrl);
        
        // 수정 버튼 상태 업데이트
        updateSubmitButtonState();
        
    } catch (error) {
        console.error('이미지 업로드 실패:', error);
        
        // 401 에러 시 로그아웃 처리
        if (error.status === 401) {
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            clearLoginData();
            window.location.replace('/index.html');
            return;
        }
        
        alert(error.message);
        imageInput.value = '';
    }
});

// 닉네임 입력 이벤트
nicknameInput.addEventListener('input', () => {
    // 닉네임 변경 시 중복 체크 초기화
    isNicknameChecked = false;
    nicknameError.textContent = '';
    
    // 수정 버튼 상태 업데이트
    updateSubmitButtonState();
});

// 닉네임 포커스 아웃 이벤트 (유효성 검사 + 중복 체크)
nicknameInput.addEventListener('blur', async () => {
    const nickname = nicknameInput.value.trim();
    
    // 빈 값이면 검사하지 않음
    if (!nickname) {
        nicknameError.textContent = '닉네임을 입력해주세요.';
        isNicknameValid = false;
        isNicknameChecked = false;
        updateSubmitButtonState();
        return;
    }
    
    // 1. 유효성 검사
    const validation = validateNickname(nickname);
    
    if (!validation.isValid) {
        nicknameError.textContent = validation.message;
        isNicknameValid = false;
        isNicknameChecked = false;
        updateSubmitButtonState();
        return;
    }
    
    // 2. 원본 닉네임과 같으면 중복 체크 안 함
    if (nickname === originalUserData.nickname) {
        nicknameError.textContent = '';
        isNicknameValid = true;
        isNicknameChecked = true;
        updateSubmitButtonState();
        return;
    }
    
    // 3. 중복 체크
    try {
        const isAvailable = await checkNicknameForUpdate(nickname);
        
        if (isAvailable) {
            nicknameError.textContent = '';
            isNicknameValid = true;
            isNicknameChecked = true;
        } else {
            nicknameError.textContent = '중복된 닉네임입니다.';
            isNicknameValid = false;
            isNicknameChecked = false;
        }
        
        updateSubmitButtonState();
        
    } catch (error) {
        console.error('닉네임 중복 체크 실패:', error);
        nicknameError.textContent = error.message;
        isNicknameValid = false;
        isNicknameChecked = false;
        updateSubmitButtonState();
    }
});

/**
 *  수정 버튼 활성화 상태 업데이트
 * - 닉네임이 변경되었거나 이미지가 변경되었을 때만 활성화
 * - 닉네임이 유효하고 중복 체크를 통과해야 함
 */
function updateSubmitButtonState() {
    const nickname = nicknameInput.value.trim();
    
    // 변경 사항 확인
    const isNicknameChanged = nickname !== originalUserData.nickname;
    const isImageChanged = uploadedImageUrl !== null;
    
    console.log('변경 사항:', { isNicknameChanged, isImageChanged, isNicknameValid, isNicknameChecked });
    
    // 닉네임이 변경되었는데 유효하지 않거나 중복 체크를 안 했으면 비활성화
    if (isNicknameChanged && (!isNicknameValid || !isNicknameChecked)) {
        btnSubmit.disabled = true;
        btnSubmit.classList.remove('active');
        return;
    }
    
    // 닉네임 또는 이미지 중 하나라도 변경되면 활성화
    if (isNicknameChanged || isImageChanged) {
        btnSubmit.disabled = false;
        btnSubmit.classList.add('active');
    } else {
        btnSubmit.disabled = true;
        btnSubmit.classList.remove('active');
    }
}

// 회원정보 수정 폼 제출
editProfileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // 최종 유효성 검사
    const nickname = nicknameInput.value.trim();
    
    if (!nickname) {
        nicknameError.textContent = '닉네임을 입력해주세요.';
        return;
    }
    
    // 닉네임이 변경되었는데 중복 체크를 안 했으면 제출 불가
    if (nickname !== originalUserData.nickname && !isNicknameChecked) {
        nicknameError.textContent = '닉네임 중복 확인이 필요합니다.';
        return;
    }
    
    // 변경 사항 확인
    const isNicknameChanged = nickname !== originalUserData.nickname;
    const isImageChanged = uploadedImageUrl !== null;
    
    if (!isNicknameChanged && !isImageChanged) {
        alert('수정할 내용이 없습니다.');
        return;
    }
    
    // 로딩 상태
    btnSubmit.disabled = true;
    btnSubmit.textContent = '수정 중...';
    
    try {
        const updateData = {};
        
        if (isNicknameChanged) {
            updateData.nickname = nickname;
        }
        
        // 이미지 변경 시 백엔드 상대 경로 전송
        if (isImageChanged) {
            updateData.imageUrl = uploadedImageUrl;  // "/temp/abc.jpg"
        }
        
        console.log('회원정보 수정 요청:', updateData);
        
        await updateUserInfo(updateData);
        
        console.log('회원정보 수정 완료');
        
        // 토스트 메시지 표시s
        showToast();
        
        // 원본 데이터 업데이트
        if (isNicknameChanged) {
            originalUserData.nickname = nickname;
        }
        if (isImageChanged) {
            originalUserData.imageUrl = uploadedImageUrl;
            originalImageUrl = uploadedImageUrl;
            uploadedImageUrl = null;  // 초기화
        }
        
        btnSubmit.textContent = '수정하기';
        updateSubmitButtonState();
        
    } catch (error) {
        console.error('회원정보 수정 실패:', error);
        alert(error.message);
        
        if (error.status === 401) {
            clearLoginData();
            window.location.href = '/index.html';
        }
        
        btnSubmit.disabled = false;
        btnSubmit.textContent = '수정하기';
    }
});

// 토스트 메시지 표시
function showToast() {
    toastMessage.classList.remove('hidden');
    
    setTimeout(() => {
        toastMessage.classList.add('hidden');
    }, 2000);
}

// 회원탈퇴 버튼 클릭
btnWithdrawal.addEventListener('click', () => {
    withdrawalModal.classList.remove('hidden');
});

// 회원탈퇴 모달 취소
btnCancelWithdrawal.addEventListener('click', () => {
    withdrawalModal.classList.add('hidden');
});

// 회원탈퇴 모달 확인
btnConfirmWithdrawal.addEventListener('click', async () => {
    // 모달 닫기
    withdrawalModal.classList.add('hidden');
    
    try {
        console.log('회원 탈퇴 요청');
        
        await deleteUser();
        
        console.log('회원 탈퇴 완료');
        
        clearLoginData();
        
        alert('회원 탈퇴가 완료되었습니다.');
        
        window.location.href = '/index.html';
        
    } catch (error) {
        console.error('회원 탈퇴 실패:', error);
        alert(error.message);
        
        if (error.status === 401) {
            clearLoginData();
            window.location.href = '/index.html';
        }
    }
});

// 모달 외부 클릭 시 닫기
withdrawalModal.addEventListener('click', (event) => {
    if (event.target === withdrawalModal) {
        withdrawalModal.classList.add('hidden');
    }
});

// 페이지 로드 시 사용자 정보 로드
loadUserInfo();

console.log('회원정보 수정 페이지 로드 완료');