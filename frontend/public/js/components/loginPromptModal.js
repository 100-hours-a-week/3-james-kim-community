// public/js/components/loginPromptModal.js
// 로그인 유도 모달 컴포넌트

// 로그인 유도 모달 표시
export function showLoginPrompt(message = '로그인이 필요한 서비스입니다.') {
    // 기존 모달이 있다면 제거
    const existingModal = document.querySelector('.login-prompt-overlay');
    if (existingModal) {
        existingModal.remove();
    }

    // 모달 생성
    const modalHTML = `
        <div class="login-prompt-overlay" id="loginPromptModal">
            <div class="login-prompt-container">
                <p class="login-prompt-message">${message}</p>
                <button class="btn-login-prompt" id="btnLoginPrompt">
                    로그인하러 가기
                </button>
            </div>
        </div>
    `;

    // body에 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('loginPromptModal');
    const loginButton = document.getElementById('btnLoginPrompt');

    loginButton.addEventListener('click', () => {
        window.location.href = '/pages/login.html';
    });

    // 배경 클릭 시 모달 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeLoginPrompt();
        }
    });

    // ESC 키로 모달 닫기
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeLoginPrompt();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// 로그인 유도 모달 닫기
export function closeLoginPrompt() {
    const modal = document.getElementById('loginPromptModal');
    if (modal) {
        modal.classList.add('hidden');
        setTimeout(() => modal.remove(), 300);
    }
}