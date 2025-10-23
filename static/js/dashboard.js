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
    const carousel = document.getElementById('courseCarousel');
    const btnPrev = document.getElementById('carouselPrev');
    const btnNext = document.getElementById('carouselNext');
    const scrollAmount = 300;

    // Left/right button scrolling
    btnPrev.addEventListener('click', () => {
      carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    btnNext.addEventListener('click', () => {
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Drag to scroll
    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      carousel.classList.add('active');
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
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 2; // Adjust drag speed
      carousel.scrollLeft = scrollLeft - walk;
    });

    // Optional: Keyboard navigation
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft') {
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    });
  });


  const featuredSlider = document.querySelector('.featured-slider');
  const featuredCards = document.querySelectorAll('.featured-card');
  const leftBtn = document.querySelector('.featured-slider-wrapper .left-btn');
  const rightBtn = document.querySelector('.featured-slider-wrapper .right-btn');

  let index = 0;
  const total = featuredCards.length;

  function showSlide(i) {
    featuredSlider.style.transform = `translateX(-${i * (100 / total)}%)`;
  }

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