// ブラウザの自動スクロールを無効化
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// スムーススクロール制御
function smoothScrollTo(targetElement) {
    if (!targetElement) return;

    let offset = 0;

    if (targetElement.id === 'all-features') {
        const viewportHeight = window.innerHeight;
        const elementHeight = targetElement.offsetHeight;
        offset = (viewportHeight - elementHeight) / 2 + 20;
        if (offset < 60) offset = 80; 
    } 
    else if (targetElement.id === 'use-cases') {
        const viewportHeight = window.innerHeight;
        const elementHeight = targetElement.offsetHeight;
        offset = (viewportHeight - elementHeight) / 2 + 40;
        if (offset < 0) offset = 0;
    }
    else if (targetElement.tagName.toLowerCase() === 'section') {
        offset = 0;
    }
    else {
        offset = 20;
    }

    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ 
        top: targetPosition, 
        behavior: 'smooth' 
    });
}

// タブ切り替え関数（WORKFLOW）
window.switchView = function(targetId, btnElement) {
    document.querySelectorAll('.detail-block').forEach(block => block.classList.remove('active'));
    document.querySelectorAll('.selector-btn').forEach(btn => btn.classList.remove('active'));

    const target = document.getElementById(targetId);
    if (target) target.classList.add('active');
    if (btnElement) btnElement.classList.add('active');

    const selectorArea = document.querySelector('.style-selector');
    if (selectorArea) {
        const targetPosition = selectorArea.getBoundingClientRect().top + window.pageYOffset - 20;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
};

// 別ページから戻ってきた時の位置ズレ防止
window.addEventListener('load', () => {
    if (window.location.hash) {
        const hash = window.location.hash;
        const target = document.querySelector(hash);
        if (target) {
            setTimeout(() => {
                smoothScrollTo(target);
                history.replaceState(null, null, window.location.pathname);
            }, 100);
        }
    }
});

// DOMContentLoaded 以降のメイン処理
document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. 全画面メインスライダー処理（スマホ＆PCスワイプ完全対応）
    // ==========================================
    const sliderTrack = document.querySelector(".slider-track");
    const slides = document.querySelectorAll(".slide");
    const sliderContainer = document.querySelector(".slider-container"); 
    
    if (slides.length > 0 && sliderTrack && sliderContainer) {
        let currentSlide = 0;
        let slideTimer;
        const slideInterval = 7000; 

        function showSlide(index) {
            currentSlide = index;
            if (currentSlide >= slides.length) currentSlide = 0;
            if (currentSlide < 0) currentSlide = slides.length - 1;
            // 全画面（width 100%）なので、そのまま translateX でOK
            sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        }

        function nextSlide() { showSlide(currentSlide + 1); }
        function prevSlide() { showSlide(currentSlide - 1); }

        function resetTimer() {
            clearInterval(slideTimer);
            slideTimer = setInterval(nextSlide, slideInterval);
        }

        resetTimer();

        // --- スマホ（タッチ）＆PC（マウス）両対応のスワイプ処理 ---
        let startX = 0;
        let startY = 0;
        let isDragging = false; 

        // 共通のスワイプ判定・実行関数
        function handleSwipe(startX, startY, endX, endY) {
            const deltaX = startX - endX;
            const deltaY = startY - endY;
            const threshold = 40; // 40px以上引っ張ったら判定

            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
                if (deltaX > 0) {
                    nextSlide(); // 左へ引っ張った（次へ）
                } else {
                    prevSlide(); // 右へ引っ張った（前へ）
                }
                resetTimer(); // 自動再生リセット
            }
        }

        // ▼ スマホ用（タッチイベント）
        sliderContainer.addEventListener("touchstart", (e) => {
            startX = e.changedTouches[0].screenX;
            startY = e.changedTouches[0].screenY;
        }, { passive: true });

        sliderContainer.addEventListener("touchend", (e) => {
            let endX = e.changedTouches[0].screenX;
            let endY = e.changedTouches[0].screenY;
            handleSwipe(startX, startY, endX, endY);
        }, { passive: true });

        // ▼ PC用（マウスイベント）
        sliderContainer.addEventListener("mousedown", (e) => {
            isDragging = true;
            startX = e.pageX;
            startY = e.pageY;
        });

        sliderContainer.addEventListener("mouseup", (e) => {
            if (!isDragging) return;
            isDragging = false;
            let endX = e.pageX;
            let endY = e.pageY;
            handleSwipe(startX, startY, endX, endY);
        });

        // マウスを押したままスライダーの外に出ちゃった時のキャンセル処理
        sliderContainer.addEventListener("mouseleave", () => {
            isDragging = false;
        });

        // PCで画像をドラッグした時に「禁止マーク」や「残像」が出るのを防ぐ
        sliderContainer.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });
    }

    // ==========================================
    // 2. スマートヘッダー（上にスクロールで表示）
    // ==========================================
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;
    let scrolledUpAmount = 0; 

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY <= 80) {
            header.classList.remove('header-hidden');
            scrolledUpAmount = 0;
        } else if (currentScrollY > lastScrollY) {
            header.classList.add('header-hidden');
            scrolledUpAmount = 0; 
        } else {
            scrolledUpAmount += (lastScrollY - currentScrollY);
            if (scrolledUpAmount > 30) {
                header.classList.remove('header-hidden');
            }
        }
        lastScrollY = currentScrollY;
    });

    // ==========================================
    // 3. スクロールアニメーション (Fade-up)
    // ==========================================
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

    // ==========================================
    // 4. トップへ戻るボタン
    // ==========================================
    const btt = document.getElementById('backToTop');
    if (btt) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                btt.classList.add('show');
            } else {
                btt.classList.remove('show');
            }
        });
        btt.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
    }

    // ==========================================
    // 5. スムーススクロール（メニュークリック時）
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault(); 
                smoothScrollTo(targetElement); 
            }
        });
    });
});