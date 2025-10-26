// public/js/components/headerTemplate.js
// 공통 레이아웃.html js로 주입

// 공통 레이아웃.html 생성
export function createHeader(options = {}) {
    const {
        showBackButton = true,
        showProfile = true
    } = options;

    return `
        <header class="page-header">
            ${showBackButton ? `
                <!-- 뒤로가기 버튼 -->
                <button class="btn-back" id="btnBack" aria-label="뒤로가기">
                    <span class="icon-back">&lt;</span>
                </button>
            ` : ''}

            <!-- 페이지 타이틀 (통일) -->
            <h1 class="header-title">와글와글 커뮤니티</h1>

            ${showProfile ? `
                <!-- 프로필 메뉴 드롭다운 -->
                <div class="profile-menu">
                    <button class="profile-button" id="profileButton" aria-label="프로필 메뉴">
                        <!-- 기본 프로필 이미지 -->
                        <img src="/assets/images/default-profile.png" 
                             alt="프로필" 
                             class="profile-image"
                             id="profilePlaceholder">
                    </button>
                    
                    <!-- 드롭다운 메뉴 -->
                    <div class="dropdown-menu hidden" id="dropdownMenu">
                        <a href="/pages/edit-profile.html" class="dropdown-item">회원정보수정</a>
                        <a href="/pages/change-password.html" class="dropdown-item">비밀번호수정</a>
                        <button class="dropdown-item logout-button" id="logoutButton">로그아웃</button>
                    </div>
                </div>
            ` : ''}
        </header>
    `;
}

/**
 * 헤더를 특정 요소에 렌더링
 * @param {string} selector - 헤더를 삽입할 요소의 CSS 셀렉터 (기본값: '.mobile-container')
 * @param {Object} options - 옵션 (createHeader와 동일)
 */
export function renderHeader(selector = '.mobile-container', options = {}) {
    const container = document.querySelector(selector);
    if (!container) {
        console.error(`헤더 컨테이너를 찾을 수 없습니다: ${selector}`);
        return;
    }
    
    const headerHTML = createHeader(options);
    container.insertAdjacentHTML('afterbegin', headerHTML);
}

// 뒤로가기 버튼 초기화
export function initBackButton(backUrl = null) {
    const btnBack = document.getElementById('btnBack');
    
    if (!btnBack) {
        return; // 뒤로가기 버튼이 없는 페이지
    }
    
    btnBack.addEventListener('click', () => {
        if (backUrl) {
            window.location.href = backUrl;
        } else {
            window.history.back();
        }
    });
}