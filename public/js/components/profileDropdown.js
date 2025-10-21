// public/js/components/profileDropdown.js
// 프로필 드롭다운 메뉴 컴포넌트

import { logout } from '../services/authService.js';
import { clearLoginData } from '../utils/storage.js';
import { getUserInfo } from '../services/userService.js';

// 프로필 드롭다운 메뉴 초기화
export async function initProfileDropdown(options = {}) {
    const {
        profileButtonId = 'profileButton',
        dropdownMenuId = 'dropdownMenu',
        logoutButtonId = 'logoutButton'
    } = options;
    
    const profileButton = document.getElementById(profileButtonId);
    const dropdownMenu = document.getElementById(dropdownMenuId);
    const logoutButton = document.getElementById(logoutButtonId);
    
    if (!profileButton || !dropdownMenu) {
        return;
    }

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
        const DEFAULT_IMAGE = '/assets/images/default-profile.png';
        
        // 이미지 URL 결정
        const imageUrl = userInfo.imageUrl || DEFAULT_IMAGE;
        
        // img 태그인 경우
        if (imageElement.tagName === 'IMG') {
            imageElement.src = imageUrl;
            
            // 무한 루프 방지
            let errorHandled = false;
            imageElement.onerror = () => {
                if (!errorHandled) {
                    errorHandled = true;
                    console.warn('프로필 이미지 로드 실패');
                    // 기본 이미지도 실패하면 placeholder로 교체
                    if (imageElement.src.includes(DEFAULT_IMAGE)) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'profile-placeholder';
                        imageElement.replaceWith(placeholder);
                    } else {
                        imageElement.src = DEFAULT_IMAGE;
                    }
                }
            };
        } 
        // div placeholder인 경우 - img로 교체
        else {
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = '프로필';
            imgElement.className = 'profile-image';
            
            let errorHandled = false;
            imgElement.onerror = () => {
                if (!errorHandled) {
                    errorHandled = true;
                    console.warn('프로필 이미지 로드 실패');
                    // 기본 이미지도 실패하면 원래 placeholder 유지
                    if (imgElement.src.includes(DEFAULT_IMAGE)) {
                        imgElement.replaceWith(imageElement);
                    } else {
                        imgElement.src = DEFAULT_IMAGE;
                    }
                }
            };
            
            imageElement.replaceWith(imgElement);
        }
        
        console.log('프로필 이미지 처리 완료:', imageUrl);
        
    } catch (error) {
        console.error('프로필 이미지 로드 실패:', error);
        
        // 401 에러 시 로그아웃 처리
        if (error.status === 401) {
            clearLoginData();
            alert('로그인이 만료되었습니다.');
            window.location.href = '/index.html';
        }
    }
}