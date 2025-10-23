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
    scrollAmount = slider.scrollLeft;
    scrollAmount -= panelWidth;
    if (scrollAmount < 0) scrollAmount = slider.scrollWidth - slider.clientWidth;
    slider.scrollTo({ left: scrollAmount, behavior: 'smooth' });
  });

  rightBtn.addEventListener('click', () => {
    scrollAmount = slider.scrollLeft;
    scrollAmount += panelWidth;
    if (scrollAmount > slider.scrollWidth - slider.clientWidth) scrollAmount = 0;
    slider.scrollTo({ left: scrollAmount, behavior: 'smooth' });
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
  if (totalSections <= 1) {
    catalogLeft.style.display = 'block';
    catalogRight.style.display = 'block';
  } else {
    catalogLeft.style.display = currentSection > 0 ? 'block' : 'none';
    catalogRight.style.display = currentSection < totalSections - 1 ? 'block' : 'none';
  }
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

  // slider banner

  document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.flex.space-x-4.overflow-x-auto');
    let isDown = false;
    let startX;
    let scrollLeft;

    // Enable dragging to scroll horizontally
    carousel.addEventListener('mousedown', (e) => {
      isDown = true;
      carousel.classList.add('active');
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
    });
    carousel.addEventListener('mouseleave', () => {
      isDown = false;
      carousel.classList.remove('active');
    });
    carousel.addEventListener('mouseup', () => {
      isDown = false;
      carousel.classList.remove('active');
    });
    carousel.addEventListener('mousemove', (e) => {
      if(!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 2; //scroll-fast
      carousel.scrollLeft = scrollLeft - walk;
    });

    // Optional: Keyboard navigation for accessibility
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        carousel.scrollBy({ left: 200, behavior: 'smooth' });
      }
      if (e.key === 'ArrowLeft') {
        carousel.scrollBy({ left: -200, behavior: 'smooth' });
      }
    });
  });
  
  document.addEventListener('DOMContentLoaded', () => {
  const catalogScroll = document.querySelector('.catalog-scroll');
  const catalogLeft = document.querySelector('.catalog-btn.left-btn');
  const catalogRight = document.querySelector('.catalog-btn.right-btn');
  const catalogCards = document.querySelectorAll('.catalog-card');

  let cardWidth = catalogCards[0].offsetWidth + 20; // card width + gap
  let visibleCount = Math.floor(catalogScroll.offsetWidth / cardWidth);
  let totalSections = Math.ceil(catalogCards.length / visibleCount);
  let currentSection = 0;

  function slideToSection(section) {
    catalogScroll.scrollTo({
      left: section * cardWidth * visibleCount,
      behavior: 'smooth'
    });
    currentSection = section;
  }

  catalogLeft.addEventListener('click', () => {
    slideToSection(Math.max(currentSection - 1, 0));
  });

  catalogRight.addEventListener('click', () => {
    slideToSection(Math.min(currentSection + 1, totalSections - 1));
  });

  // Drag to scroll (optional)
  let isDown = false;
  let startX;
  let scrollLeft;

  catalogScroll.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - catalogScroll.offsetLeft;
    scrollLeft = catalogScroll.scrollLeft;
    catalogScroll.classList.add('active');
  });

  catalogScroll.addEventListener('mouseleave', () => {
    isDown = false;
    catalogScroll.classList.remove('active');
  });

  catalogScroll.addEventListener('mouseup', () => {
    isDown = false;
    catalogScroll.classList.remove('active');
  });

  catalogScroll.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - catalogScroll.offsetLeft;
    const walk = (x - startX) * 2; // scroll speed
    catalogScroll.scrollLeft = scrollLeft - walk;
  });

  // Recalculate on window resize
  window.addEventListener('resize', () => {
    cardWidth = catalogCards[0].offsetWidth + 20;
    visibleCount = Math.floor(catalogScroll.offsetWidth / cardWidth);
    totalSections = Math.ceil(catalogCards.length / visibleCount);
  });
});


  // Auto-slide
  let autoSlide = setInterval(() => {
    index = (index + 1) % total;
    showSlide(index);
  }, 5000);

  leftBtn.addEventListener('click', () => {
    index = (index - 1 + total) % total;
    showSlide(index);
    resetAutoSlide();
  });
  rightBtn.addEventListener('click', () => {
    index = (index + 1) % total;
    showSlide(index);
    resetAutoSlide();
  });

  function resetAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => {
      index = (index + 1) % total;
      showSlide(index);
    }, 5000);
  }

  