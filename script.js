// ブラウザの自動スクロールを無効化（ハッシュ付きで開いた時のガタつき防止）
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// ★魔法の関数：どこへ飛んでも「最高に美しく見える位置」を計算してスクロール
function smoothScrollTo(targetElement) {
    if (!targetElement) return;

    let offset = 0;

    // ターゲットが「FEATURESのバナー」の場合
    if (targetElement.id === 'all-features') {
        const viewportHeight = window.innerHeight;
        const elementHeight = targetElement.offsetHeight;
        offset = (viewportHeight - elementHeight) / 2 + 20;
        if (offset < 60) offset = 80; 
    } 
    // ★追加：ターゲットが「SCENES（use-cases）」の場合
    else if (targetElement.id === 'use-cases') {
        const viewportHeight = window.innerHeight;
        const elementHeight = targetElement.offsetHeight;
        // セクションが短いため、画面のど真ん中より少し「上」に止めることで、
        // 下にある次のセクションのタイトルを画面外に押し出して見えなくする
        offset = (viewportHeight - elementHeight) / 2 + 40;
        if (offset < 0) offset = 0; // 万が一画面より大きい場合の保険
    }
    // ターゲットが「その他のセクション全体」の場合
    else if (targetElement.tagName.toLowerCase() === 'section') {
        offset = 0; // 背景色の切り替わりラインが、画面のトップにピタッと合うようにする
    }
    // それ以外
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

    // タブを押した時は、ボタンが画面上部にちょうど見える位置へスクロール
    const selectorArea = document.querySelector('.style-selector');
    if (selectorArea) {
        const targetPosition = selectorArea.getBoundingClientRect().top + window.pageYOffset - 20;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
};

// 別ページから戻ってきた時のズレと、更新（リロード）時のバグを解消
window.addEventListener('load', () => {
    if (window.location.hash) {
        const hash = window.location.hash;
        const target = document.querySelector(hash);
        if (target) {
            // 画像などの読み込みを待ってから、正確な位置へスクロール
            setTimeout(() => {
                smoothScrollTo(target);
                
                // スクロール完了後、URLから「#」を消去し、リロード時の自動ジャンプを防ぐ
                history.replaceState(null, null, window.location.pathname);
            }, 100);
        }
    }
});

// 以降は通常の処理
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. スライダー処理
    const sliderTrack = document.querySelector(".slider-track");
    const slides = document.querySelectorAll(".slide");
    if (slides.length > 0 && sliderTrack) {
        let currentSlide = 0;
        let slideTimer;
        const slideInterval = 7000; 

        function showSlide(index) {
            currentSlide = index;
            if (currentSlide >= slides.length) currentSlide = 0;
            if (currentSlide < 0) currentSlide = slides.length - 1;
            sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        }

        function nextSlide() { showSlide(currentSlide + 1); }
        function prevSlide() { showSlide(currentSlide - 1); }

        function resetTimer() {
            clearInterval(slideTimer);
            slideTimer = setInterval(nextSlide, slideInterval);
        }
        resetTimer();

        const sliderContainer = document.querySelector(".slider-container");
        let startX = 0;
        sliderContainer.addEventListener("touchstart", (e) => { startX = e.changedTouches[0].screenX; }, {passive: true});
        sliderContainer.addEventListener("touchend", (e) => {
            let endX = e.changedTouches[0].screenX;
            if (startX - endX > 50) { nextSlide(); resetTimer(); } 
            else if (endX - startX > 50) { prevSlide(); resetTimer(); }
        }, {passive: true});
    }

    // 2. スマートヘッダー
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { header.classList.add('header-hidden'); } 
        else { header.classList.remove('header-hidden'); }
    });

    // 3. スクロールアニメーション (Fade-up)
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

    // 4. トップへ戻るボタン
    const btt = document.getElementById('backToTop');
    if (btt) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) btt.classList.add('show');
            else btt.classList.remove('show');
        });
        btt.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
    }

    // 5. スムーススクロール（メニュークリック時）
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