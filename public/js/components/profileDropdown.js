// public/js/components/profileDropdown.js
// 프로필 드롭다운 메뉴 컴포넌트

import { clearLoginData } from '../utils/storage.js';

/**
 * 프로필 드롭다운 메뉴 초기화
 * @param {Object} options - 옵션
 * @param {string} options.profileButtonId - 프로필 버튼 ID (기본: 'profileButton')
 * @param {string} options.dropdownMenuId - 드롭다운 메뉴 ID (기본: 'dropdownMenu')
 * @param {string} options.logoutButtonId - 로그아웃 버튼 ID (기본: 'logoutButton')
 */
export function initProfileDropdown(options = {}) {
    const {
        profileButtonId = 'profileButton',
        dropdownMenuId = 'dropdownMenu',
        logoutButtonId = 'logoutButton'
    } = options;
    
    const profileButton = document.getElementById(profileButtonId);
    const dropdownMenu = document.getElementById(dropdownMenuId);
    const logoutButton = document.getElementById(logoutButtonId);
    
    if (!profileButton || !dropdownMenu) {
        return; // 프로필 메뉴가 없는 페이지
    }
    
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
        logoutButton.addEventListener('click', () => {
            if (confirm('로그아웃 하시겠습니까?')) {
                clearLoginData();
                alert('로그아웃되었습니다.');
                window.location.href = '/index.html';
            }
        });
    }
}