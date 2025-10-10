document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.main-content-slider');
  const leftBtn = document.querySelector('.left-btn');
  const rightBtn = document.querySelector('.right-btn');
  const panels = document.querySelectorAll('.main-content-slider .panel');

  let scrollAmount = 0; // current scroll position
  const speed = 0.5; // pixels per frame
  const panelWidth = panels[0].offsetWidth + 20; // 20px gap

  // --- Auto-scroll ---
  function autoSlide() {
    scrollAmount += speed;
    if (scrollAmount > slider.scrollWidth - slider.clientWidth) {
      scrollAmount = 0; // loop back
    }
    slider.scrollLeft = scrollAmount;
    requestAnimationFrame(autoSlide);
  }
  autoSlide();

  // --- Arrow buttons ---
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
});
