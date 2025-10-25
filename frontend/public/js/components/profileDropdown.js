// public/js/components/profileDropdown.js
// 프로필 드롭다운 메뉴 컴포넌트

import { logout } from '../services/authService.js';
import { clearLoginData } from '../utils/storage.js';
import { getUserInfo } from '../services/userService.js';
import { getImageUrl, handleImageError } from '../utils/imageHelper.js';

/**
 * 프로필 드롭다운 메뉴 초기화
 * @param {object} options - 옵션
 * @param {boolean} options.isGuest - 비로그인 사용자 여부
 */
export async function initProfileDropdown(options = {}) {
    const {
        profileButtonId = 'profileButton',
        dropdownMenuId = 'dropdownMenu',
        logoutButtonId = 'logoutButton',
        isGuest = false
    } = options;
    
    const profileButton = document.getElementById(profileButtonId);
    const dropdownMenu = document.getElementById(dropdownMenuId);
    const logoutButton = document.getElementById(logoutButtonId);
    
    if (!profileButton || !dropdownMenu) {
        return;
    }

    // 비로그인 사용자일 경우
    if (isGuest) {
        setupGuestDropdown(profileButton, dropdownMenu);
        return;
    }

    // 로그인 사용자일 경우
    await setupLoggedInDropdown(profileButton, dropdownMenu, logoutButton);
}

/**
 * 비로그인 사용자용 드롭다운 설정
 */
function setupGuestDropdown(profileButton, dropdownMenu) {
    // 드롭다운 메뉴를 로그인 버튼만 표시하도록 수정
    dropdownMenu.innerHTML = `
        <button class="dropdown-item" id="guestLoginButton">로그인</button>
    `;
    
    // 프로필 버튼 클릭 시 드롭다운 토글
    profileButton.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
    });
    
    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', () => {
        dropdownMenu.classList.add('hidden');
    });
    
    // 로그인 버튼 클릭
    const guestLoginButton = document.getElementById('guestLoginButton');
    if (guestLoginButton) {
        guestLoginButton.addEventListener('click', () => {
            window.location.href = '/pages/login.html';
        });
    }
}

/**
 * 로그인 사용자용 드롭다운 설정
 */
// profileDropdown.js의 setupLoggedInDropdown 함수 수정
async function setupLoggedInDropdown(profileButton, dropdownMenu, logoutButton) {
    // 프로필 이미지 로드
    await loadProfileImage(profileButton);
    
    // 프로필 버튼 클릭 시 드롭다운 토글
    profileButton.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
    });
    
    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', () => {
        dropdownMenu.classList.add('hidden');
    });
    
    // ID로 못 찾으면 class로 찾기
    if (!logoutButton) {
        logoutButton = dropdownMenu.querySelector('.logout-button');
    }
    
    // 로그아웃 버튼
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            await logout();
            clearLoginData();
            window.location.href = '/index.html';
        });
    }
}

/**
 * 프로필 이미지 로드 및 설정
 */
async function loadProfileImage(profileButton) {
    try {
        const userInfo = await getUserInfo();
        
        // profileButton 내부의 이미지 요소 찾기
        let imageElement = profileButton.querySelector('img.profile-image');
        
        if (!imageElement) {
            imageElement = profileButton.querySelector('.profile-placeholder');
        }
        
        if (!imageElement) {
            imageElement = profileButton.querySelector('#profileImage, #profilePlaceholder');
        }
        
        if (!imageElement) {
            console.warn('프로필 이미지 요소를 찾을 수 없습니다.');
            return;
        }
        
        // 기본 이미지 경로 (절대 경로)
        const imageUrl = getImageUrl(userInfo.imageUrl);
        
        // img 태그인 경우
        if (imageElement.tagName === 'IMG') {
            imageElement.src = imageUrl;
    
            // 이미지 로드 실패 처리
            imageElement.addEventListener('error', () => handleImageError(imageElement));
        }
        // div placeholder인 경우 - img로 교체
        else {
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = '프로필';
            imgElement.className = 'profile-image';
    
            // 이미지 로드 실패 처리
            imgElement.addEventListener('error', () => handleImageError(imgElement));
    
            imageElement.replaceWith(imgElement);
        }
        
        console.log('프로필 이미지 처리 완료:', imageUrl);
        
    } catch (error) {
        console.error('프로필 이미지 로드 실패:', error);
        
        // 401 에러 시 로그아웃 처리
        if (error.status === 401) {
            clearLoginData();
            alert('로그인이 만료되었습니다.');
            window.location.href = '/pages/login.html';
        }
    }
}