// ブラウザの自動スクロールを無効化
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

/**
 * スムーススクロール調整関数（ズレ・ダサさ完全解消版）
 */
function smoothScrollTo(targetElement) {
    if (!targetElement) return;

    let offset = 0;

    // 各セクションに設定されているCSSの余白（padding-top）の違いを計算して相殺します
    if (targetElement.id === 'ai-features') {
        // FEATURESセクションは余白が少ないため、ヘッダー分（80px）をしっかり確保する
        offset = 80;
    } else {
        // 他のセクション（SCENES, WORKFLOW等）は最初から100pxの大きな余白があるため、
        // オフセットを引きすぎない（20pxにする）ことで、余白が空きすぎるのを防ぐ
        offset = 20;
    }

    // 最終的なスクロール位置の計算
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// 別ページから戻ってきた際の位置調整（ハッシュがある場合）
window.addEventListener('load', () => {
    if (window.location.hash) {
        const hash = window.location.hash;
        const target = document.querySelector(hash);
        if (target) {
            // ブラウザのデフォルト動作を打ち消すため、少し遅らせて実行
            setTimeout(() => {
                smoothScrollTo(target);
                // URLをスッキリさせる（必要に応じて）
                history.replaceState(null, null, window.location.pathname);
            }, 100);
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. 全画面メインスライダー処理（スマホ＆PC対応）
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
            sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        }

        const nextSlide = () => showSlide(currentSlide + 1);
        const resetTimer = () => { 
            clearInterval(slideTimer); 
            slideTimer = setInterval(nextSlide, slideInterval); 
        };
        resetTimer();

        // スワイプ・ドラッグ処理
        let startX = 0;
        sliderContainer.addEventListener("touchstart", (e) => { 
            startX = e.changedTouches[0].screenX; 
        }, { passive: true });
        
        sliderContainer.addEventListener("touchend", (e) => {
            let diff = startX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) { 
                diff > 0 ? showSlide(currentSlide + 1) : showSlide(currentSlide - 1); 
                resetTimer(); 
            }
        }, { passive: true });

        sliderContainer.addEventListener("mousedown", (e) => { 
            startX = e.pageX; 
        });
        
        sliderContainer.addEventListener("mouseup", (e) => {
            let diff = startX - e.pageX;
            if (Math.abs(diff) > 50) { 
                diff > 0 ? showSlide(currentSlide + 1) : showSlide(currentSlide - 1); 
                resetTimer(); 
            }
        });
    }

    // ==========================================
    // 2. スマートヘッダー（上にスクロールで表示）
    // ==========================================
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;
    
    if (header) {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY <= 80) {
                header.classList.remove('header-hidden');
            } else if (currentScrollY > lastScrollY) {
                header.classList.add('header-hidden');
            } else if (lastScrollY - currentScrollY > 20) {
                header.classList.remove('header-hidden');
            }
            lastScrollY = currentScrollY;
        });
    }

    // ==========================================
    // 3. スクロールアニメーション (Fade-up)
    // ==========================================
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { 
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); 
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

    // ==========================================
    // 4. アンカーリンクのスムーススクロール
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            
            // ロゴクリックなどで href="#" の場合はトップへ
            if (targetId === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault(); 
                smoothScrollTo(targetElement); 
            }
        });
    });
});

/**
 * ワークフローのタブ切り替え
 */
window.switchView = function(targetId, btnElement) {
    document.querySelectorAll('.detail-block').forEach(block => block.classList.remove('active'));
    document.querySelectorAll('.selector-btn').forEach(btn => btn.classList.remove('active'));
    
    const target = document.getElementById(targetId);
    if (target) {
        target.classList.add('active');
    }
    if (btnElement) {
        btnElement.classList.add('active');
    }
};