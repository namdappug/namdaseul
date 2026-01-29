/* =========================
   ✅ 기존: slice 리빌
========================== */
const slices = document.querySelectorAll('.slice');

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const index = Array.from(slices).indexOf(entry.target);
      const src = entry.target.getAttribute('src') || '';

      let delay;

      // ✅ images_11은 딜레이 없이 바로
      if (src.includes('images_11')) {
        delay = 0;
      // 기존 images_12 처리
      } else if (src.includes('images_12')) {
        const images11Index = Array.from(slices).findIndex(img =>
          (img.getAttribute('src') || '').includes('images_11')
        );
        delay = images11Index * 80;
      // 나머지는 기존 방식
      } else {
        delay = index * 80;
      }

      entry.target.style.transitionDelay = `${delay}ms`;

      setTimeout(() => {
        requestAnimationFrame(() => {
          entry.target.classList.add('is-in');

          // ✅ images_13_05가 올라올 때 롤링 박스 2개도 같이 리빌
          const wrap = entry.target.closest('.photo-wrap, .images-04-wrap');
          if (wrap) wrap.classList.add('is-in');

          const srcNow = entry.target.getAttribute('src') || '';
          if (srcNow.includes('images_13_05')) {
            const rb1 = document.getElementById('rollingBox');
            const rb2 = document.getElementById('rollingBox2');
            setTimeout(() => {
              if (rb1) rb1.classList.add('is-in');
              if (rb2) rb2.classList.add('is-in');
            }, 150); // ✅ 0.15초 뒤에 따라오게
          }

          // ✅ images_11의 rolling-box는 딜레이 없이 바로
          if (srcNow.includes('images_11')) {
            const images11Wrap = entry.target.closest('.images-11-wrap');
            if (images11Wrap) {
              const rollingBoxes = images11Wrap.querySelectorAll('.rolling-box.reveal-sync');
              rollingBoxes.forEach(box => {
                box.style.transitionDelay = '0s';
                box.classList.add('is-in');
              });
            }
          }
        });
      }, 50);

      io.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: "0px 0px -10% 0px"
});

window.addEventListener('load', () => {
  // images_11은 페이지 로드 시 바로 보이게
  const images11Elements = document.querySelectorAll('.images-11-wrap, .images-11-bg, [src*="images_11"]');
  images11Elements.forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.classList.add('is-in');
  });

  // images_11 영역의 rolling-box는 바로 나타나게
  const images11Wrap = document.querySelector('.images-11-wrap');
  if (images11Wrap) {
    const rollingBoxes = images11Wrap.querySelectorAll('.rolling-box.reveal-sync');
    rollingBoxes.forEach(box => {
      box.style.transitionDelay = '0s';
      box.classList.add('is-in');
    });
  }

  setTimeout(() => {
    slices.forEach(img => {
      const src = img.getAttribute('src') || '';
      if (!src.includes('images_11') && !src.includes('images_12')) {
        io.observe(img);
      }
    });
  }, 100);
});

function createInfiniteCarousel({
  boxId, trackId, prevId, nextId,
  interval = 2500,
  duration = 600
}){
  const box = document.getElementById(boxId);
  const track = document.getElementById(trackId);
  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);

  if (!box || !track || !prevBtn || !nextBtn) return;

  let slides = Array.from(track.children);
  const slideCount = slides.length;

  let idx = 0;
  let timer = null;
  let isAnimating = false;

  // 마지막에 첫 슬라이드 복제
  const firstClone = slides[0].cloneNode(true);
  track.appendChild(firstClone);

  function setTransition(on){
    track.style.transition = on ? `transform ${duration}ms ease` : 'none';
  }

  function moveTo(i, withAnim = true){
    idx = i;
    setTransition(withAnim);
    track.style.transform = `translateX(${-idx * 100}%)`;
  }

  function next(){
    if (isAnimating) return;
    isAnimating = true;
    moveTo(idx + 1, true);
  }

  function prev(){
    if (isAnimating) return;
    isAnimating = true;

    if (idx === 0){
      setTransition(false);
      track.style.transform = `translateX(${-slideCount * 100}%)`; // 복제 위치
      track.offsetHeight;
      moveTo(slideCount - 1, true);
      return;
    }
    moveTo(idx - 1, true);
  }

  track.addEventListener('transitionend', () => {
    if (idx === slideCount){
      setTransition(false);
      idx = 0;
      track.style.transform = `translateX(0%)`;
      track.offsetHeight;
    }
    isAnimating = false;
  });

  function play(){
    stop();
    timer = setInterval(() => next(), interval);
  }
  function stop(){
    if (timer) clearInterval(timer);
    timer = null;
  }

  nextBtn.addEventListener('click', () => { next(); play(); });
  prevBtn.addEventListener('click', () => { prev(); play(); });

  box.addEventListener('mouseenter', stop);
  box.addEventListener('mouseleave', play);

  moveTo(0, false);
  play();
}

/* ✅ 1번(사진 4개) */
createInfiniteCarousel({
  boxId: 'rollingBox',
  trackId: 'rollingTrack',
  prevId: 'rollingPrev',
  nextId: 'rollingNext',
  interval: 4000,
  duration: 600
});

/* ✅ 2번(사진 3개) */
createInfiniteCarousel({
  boxId: 'rollingBox2',
  trackId: 'rollingTrack2',
  prevId: 'rollingPrev2',
  nextId: 'rollingNext2',
  interval: 4000,
  duration: 600
});
