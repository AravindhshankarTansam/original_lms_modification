document.addEventListener('DOMContentLoaded', () => {
  /* ---------- MAIN SLIDER ---------- */
  const slider = document.querySelector('.main-content-slider');
  const leftBtn = document.querySelector('.left-btn');
  const rightBtn = document.querySelector('.right-btn');
  const panels = document.querySelectorAll('.panel');
  const panelWidth = panels[0].offsetWidth + 20;
  let scrollAmount = 0;

  function autoSlide() {
    scrollAmount += 0.5;
    if (scrollAmount >= slider.scrollWidth - slider.clientWidth) {
      scrollAmount = 0;
    }
    slider.scrollLeft = scrollAmount;
    requestAnimationFrame(autoSlide);
  }
  autoSlide();

  leftBtn.addEventListener('click', () => {
    scrollAmount -= panelWidth;
    if (scrollAmount < 0) scrollAmount = slider.scrollWidth - slider.clientWidth;
    slider.scrollLeft = scrollAmount;
  });

  rightBtn.addEventListener('click', () => {
    scrollAmount += panelWidth;
    if (scrollAmount > slider.scrollWidth - slider.clientWidth) scrollAmount = 0;
    slider.scrollLeft = scrollAmount;
  });

  /* ---------- CATALOG CAROUSEL ---------- */
  const catalogScroll = document.querySelector('.catalog-scroll');
  const catalogLeft = document.querySelector('.catalog-btn.left-btn');
  const catalogRight = document.querySelector('.catalog-btn.right-btn');
  const catalogDotsContainer = document.querySelector('.catalog-dots');
  const catalogCards = document.querySelectorAll('.catalog-card');

  const cardWidth = catalogCards[0].offsetWidth + 20;
  const visibleCount = Math.floor(catalogScroll.offsetWidth / cardWidth);
  const totalSections = Math.ceil(catalogCards.length / visibleCount);

  let currentSection = 0;

  // Create dots
  catalogDotsContainer.innerHTML = '';
  for (let i = 0; i < totalSections; i++) {
    const dot = document.createElement('span');
    dot.textContent = '●';
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    catalogDotsContainer.appendChild(dot);
  }

  const dots = document.querySelectorAll('.catalog-dots .dot');

  function updateDots() {
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSection);
    });
  }

  function updateArrowVisibility() {
    catalogLeft.style.display = currentSection > 0 ? 'block' : 'none';
    catalogRight.style.display = currentSection < totalSections - 1 ? 'block' : 'none';
  }

  catalogLeft.addEventListener('click', () => {
    currentSection = Math.max(currentSection - 1, 0);
    catalogScroll.scrollTo({
      left: currentSection * (cardWidth * visibleCount),
      behavior: 'smooth'
    });
    updateDots();
    updateArrowVisibility();
  });

  catalogRight.addEventListener('click', () => {
    currentSection = Math.min(currentSection + 1, totalSections - 1);
    catalogScroll.scrollTo({
      left: currentSection * (cardWidth * visibleCount),
      behavior: 'smooth'
    });
    updateDots();
    updateArrowVisibility();
  });

  // Update dots and arrows on manual scroll
  catalogScroll.addEventListener('scroll', () => {
    const scrollLeft = catalogScroll.scrollLeft;
    const section = Math.round(scrollLeft / (cardWidth * visibleCount));
    if (section !== currentSection) {
      currentSection = section;
      updateDots();
      updateArrowVisibility();
    }
  });

  // Initial arrow visibility
  updateArrowVisibility();
});
