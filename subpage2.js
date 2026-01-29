/* ===============================
   SUBPAGE2 : ONEPAGE + MENU + ARROW + TOP
   - 모달/팝업 없음
   - 꼬임 방지: 상태(page/transform/scroll) 항상 같이 관리
=============================== */

const wrap = document.getElementById("wrap");
const firstSection = document.getElementById("firstSection");
const pageArrow = document.getElementById("pageArrow");
const backToTop = document.getElementById("backToTop");

if(!wrap || !firstSection){
  console.warn("[Subpage2] wrap 또는 firstSection을 못 찾음. HTML id 확인!");
} else {
  const slides = wrap.querySelectorAll(".section");

  let page = 0;
  const lastPage = slides.length - 1;
  let isAnimating = false;

  function getThreshold(){
    return firstSection.offsetTop + firstSection.offsetHeight;
  }

  function updateBackToTop(){
    if(!backToTop) return;
    const inOnepage = window.scrollY >= getThreshold() - 2;
    // ✅ 원페이지 2번째부터 보이기 (page=1부터)
    backToTop.classList.toggle("is-show", inOnepage && page >= 1);
  }

  function goToOnepage(){
    // first-section → 원페이지 진입(항상 page=0)
    const threshold = getThreshold();
    page = 0;
    wrap.style.transform = "translateY(0)";
    window.scrollTo({ top: threshold, behavior: "smooth" });
    setTimeout(updateBackToTop, 30);
  }

  function moveSlider(){
    isAnimating = true;

    const threshold = getThreshold();
    window.scrollTo({ top: threshold, behavior: "auto" });
    wrap.style.transform = `translateY(${-page * 100}vh)`;

    setTimeout(()=>{
      isAnimating = false;
      updateBackToTop();
    }, 650);
  }

  function resetToTop(){
    if(isAnimating) return;
    isAnimating = true;

    page = 0;
    wrap.style.transform = "translateY(0)";
    updateBackToTop(); // 먼저 숨김

    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(()=>{ isAnimating = false; }, 700);
  }

  // ✅ 휠 스크롤 (원본 로직 최대한 유지)
  window.addEventListener("wheel", (e)=>{
    const threshold = getThreshold();
    const currentScroll = window.scrollY;

    // 1) first-section 구간
    if(currentScroll < threshold){
      const nearEnd = currentScroll + window.innerHeight >= threshold - 5;

      // 아래로 내리면 원페이지로 "진입"만
      if(e.deltaY > 0 && nearEnd){
        e.preventDefault();
        if(isAnimating) return;

        isAnimating = true;
        goToOnepage();

        setTimeout(()=>{ isAnimating = false; }, 650);
      }
      return;
    }

    // 2) 원페이지 구간
    e.preventDefault();
    if(isAnimating) return;

    if(e.deltaY > 0){
      if(page < lastPage){
        page++;
        moveSlider();
      }
    } else {
      if(page > 0){
        page--;
        moveSlider();
      } else {
        // 원페이지 첫 화면에서 위로 → first-section 복귀
        isAnimating = true;

        window.scrollTo({
          top: threshold - window.innerHeight,
          behavior: "smooth",
        });

        page = 0;
        wrap.style.transform = "translateY(0)";
        updateBackToTop();

        setTimeout(()=>{ isAnimating = false; }, 650);
      }
    }
  }, { passive:false });

  // 리사이즈 보정
  window.addEventListener("resize", ()=>{
    const threshold = getThreshold();
    if(window.scrollY >= threshold){
      window.scrollTo(0, threshold);
      wrap.style.transform = `translateY(${-page * 100}vh)`;
    }
    updateBackToTop();
  });

  // Top 버튼 클릭
  if(backToTop){
    backToTop.addEventListener("click", resetToTop);
  }

  // 초기 반영
  updateBackToTop();
}

/* ===============================
   HAMBURGER MENU OPEN/CLOSE
=============================== */
const burgerBtn = document.querySelector(".topbar-burger");
const menuOverlay = document.getElementById("menuOverlay");
const menuClose = document.querySelector(".menu-close");

function openMenu(){
  document.body.classList.add("menu-open");
  burgerBtn && burgerBtn.setAttribute("aria-expanded", "true");
  menuOverlay && menuOverlay.setAttribute("aria-hidden", "false");
}

function closeMenu(){
  document.body.classList.remove("menu-open");
  burgerBtn && burgerBtn.setAttribute("aria-expanded", "false");
  menuOverlay && menuOverlay.setAttribute("aria-hidden", "true");
}

if(burgerBtn){
  burgerBtn.addEventListener("click", ()=>{
    if(document.body.classList.contains("menu-open")) closeMenu();
    else openMenu();
  });
}

menuClose && menuClose.addEventListener("click", closeMenu);
menuOverlay && menuOverlay.addEventListener("click", closeMenu);

window.addEventListener("keydown", (e)=>{
  if(e.key === "Escape") closeMenu();
});

