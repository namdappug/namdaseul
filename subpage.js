/* ===============================
   ONEPAGE + MENU + ARROW + MODAL
=============================== */

const wrap = document.getElementById("wrap");
const firstSection = document.getElementById("firstSection");

/* ===============================
   DETAIL MODAL (이벤트 위임)
=============================== */
const detailModal = document.getElementById("detailModal");
const detailBody  = document.getElementById("detailBody");

(function initDetailModal(){
  if (!detailModal || !detailBody) {
    console.warn("[Modal] detailModal/detailBody가 없습니다. HTML에 모달 마크업 확인!");
    return;
  }

  const closeBtn = detailModal.querySelector(".detail-close");
  const dim      = detailModal.querySelector(".detail-dim");
  let lastFocusedEl = null;

  function openDetailModal(src){
    lastFocusedEl = document.activeElement;

    detailBody.innerHTML = "";
    const img = document.createElement("img");
    img.src = src;
    img.alt = "상세 이미지";
    detailBody.appendChild(img);

    detailModal.classList.add("is-open");
    detailModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-lock");

    // ✅ 항상 위에서부터 시작
    detailBody.scrollTop = 0;

    closeBtn && closeBtn.focus();
  }

  function closeDetailModal(){
    detailModal.classList.remove("is-open");
    detailModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-lock");
    detailBody.innerHTML = "";
    if(lastFocusedEl) lastFocusedEl.focus();
  }

  // ✅ .modal-open 어디서든 클릭되면 열기 (버튼 여러개도 OK)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".modal-open");
    if (!btn) return;

    e.preventDefault();
    const src = btn.dataset.modalSrc || btn.getAttribute("href");
    if (!src) return;

    openDetailModal(src);
  });

  closeBtn && closeBtn.addEventListener("click", closeDetailModal);
  dim && dim.addEventListener("click", closeDetailModal);

  window.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && detailModal.classList.contains("is-open")){
      closeDetailModal();
    }
  });
})();

/* ===============================
   아래: 기존 원페이지/메뉴 기능
=============================== */
if(!wrap || !firstSection){
  console.warn("[Onepage] wrap 또는 firstSection을 못 찾음. HTML id 확인!");
} else {
  const slides = wrap.querySelectorAll(".section");

  let page = 0;
  const lastPage = slides.length - 1;
  let isAnimating = false;

  // ✅ BACK TO TOP
  const backToTop = document.getElementById("backToTop");

  function getThreshold(){
    return firstSection.offsetTop + firstSection.offsetHeight;
  }

  // ✅ 두 번째 원스크롤(page=1)부터 보여주기
  function updateBackToTop(){
    if(!backToTop) return;
    const threshold = getThreshold();
    const inOnepage = window.scrollY >= threshold - 2;
    const show = inOnepage && page >= 1;   // ✅ 여기 핵심
    backToTop.classList.toggle("is-show", show);
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

  window.addEventListener("wheel",(e)=>{
    // 모달 열려있으면 원페이지 휠 막기(팝업 안 스크롤 우선)
    if (document.body.classList.contains("modal-lock")) return;

    const threshold = getThreshold();
    const currentScroll = window.scrollY;

    // ✅ FIRST SECTION 구간
    if(currentScroll < threshold){
      const nearEnd = currentScroll + window.innerHeight >= threshold - 5;

      if(e.deltaY > 0 && nearEnd){
        e.preventDefault();
        if(isAnimating) return;

        isAnimating = true;
        window.scrollTo({ top: threshold, behavior: "smooth" });
        page = 0;
        wrap.style.transform = "translateY(0)";

        setTimeout(()=>{
          isAnimating = false;
          updateBackToTop(); // page=0이라 숨김 유지
        }, 650);
      }
      return;
    }

    // ✅ ONEPAGE 구간
    e.preventDefault();
    if(isAnimating) return;

    if(e.deltaY > 0){
      if(page < lastPage){
        page++;
        moveSlider();
      }
    }else{
      if(page > 0){
        page--;
        moveSlider();
      }else{
        isAnimating = true;
        window.scrollTo({ top: threshold - window.innerHeight, behavior: "smooth" });
        page = 0;
        wrap.style.transform = "translateY(0)";
        updateBackToTop();

        setTimeout(()=>{ isAnimating = false; }, 650);
      }
    }
  },{ passive:false });

  window.addEventListener("resize",()=>{
    const threshold = getThreshold();
    if(window.scrollY >= threshold){
      window.scrollTo(0, threshold);
      wrap.style.transform = `translateY(${-page * 100}vh)`;
    }
    updateBackToTop();
  });

  /* ===============================
     NAV CLICK (정확히 한 페이지만 이동)
  =============================== */
  const navLinks = document.querySelectorAll(".project-nav a");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // WEBSITE (현재 페이지) → 이동 없음
      if (!link.dataset.page) return;
      if (isAnimating) return;

      isAnimating = true;
      page = Number(link.dataset.page);

      moveSlider();

      setTimeout(() => {
        isAnimating = false;
        updateBackToTop();
      }, 700);
    });
  });

  /* ===============================
     PAGE ARROW CLICK → NEXT PAGE
  =============================== */
  const pageArrow = document.getElementById("pageArrow");

  if(pageArrow){
    pageArrow.addEventListener("click", () => {
      if (isAnimating) return;

      const threshold = getThreshold();

      // 첫 페이지 (1/6)
      if (window.scrollY < threshold) {
        isAnimating = true;
        window.scrollTo({ top: threshold, behavior: "smooth" });
        page = 0;
        wrap.style.transform = `translateY(0)`;

        setTimeout(() => {
          isAnimating = false;
          updateBackToTop();
        }, 650);
        return;
      }

      // 2~5 페이지
      if (page < lastPage) {
        page++;
        moveSlider();
      }
      // 마지막 페이지 (6/6) → 맨 위로
      else {
        resetToTop();
      }
    });
  }

  // ✅ BackToTop 클릭
  if(backToTop){
    backToTop.addEventListener("click", resetToTop);
  }

  // 초기 상태 반영
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
  burgerBtn.addEventListener("click", () => {
    if (document.body.classList.contains("menu-open")) closeMenu();
    else openMenu();
  });
}

menuClose && menuClose.addEventListener("click", closeMenu);
menuOverlay && menuOverlay.addEventListener("click", closeMenu);

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});
