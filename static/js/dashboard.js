document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.main-content-slider');
  const leftBtn = document.querySelector('.left-btn');
  const rightBtn = document.querySelector('.right-btn');
  const panels = document.querySelectorAll('.panel');

  const panelWidth = panels[0].offsetWidth + 20; // 20px for gap
  let scrollAmount = 0;

  // Auto scroll
  function autoSlide() {
    scrollAmount += 0.5; // scroll speed
    if (scrollAmount >= slider.scrollWidth - slider.clientWidth) {
      scrollAmount = 0; // reset loop
    }
    slider.scrollLeft = scrollAmount;
    requestAnimationFrame(autoSlide);
  }
  autoSlide();

  // Manual arrows
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
