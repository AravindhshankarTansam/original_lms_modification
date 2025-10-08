const toggleBtn = document.querySelector("#toggleSidebar");
const sidebar = document.querySelector("#sidebar");
const navbar = document.querySelector("#mainNavbar");
const mainContent = document.querySelector("#mainContent");

if (toggleBtn && sidebar && navbar && mainContent) {
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    navbar.classList.toggle("adjusted");
    mainContent.classList.toggle("adjusted");
  });
}

// === Carousel Logic ===
const track = document.getElementById("carouselTrack");
if (track) {
  // duplicate the cards for seamless looping
  track.innerHTML += track.innerHTML;

  let scrollPosition = 0;
  const speed = 0.5; // pixels per frame
  const trackWidth = track.scrollWidth / 2; // original width (before duplication)
  const cardWidth = track.querySelector(".card")?.offsetWidth || 300; // fallback

  function scrollCarousel() {
    scrollPosition += speed;

    // reset seamlessly when reaching end of original track
    if (scrollPosition >= trackWidth) {
      scrollPosition = 0;
    }

    track.style.transform = `translateX(-${scrollPosition}px)`;
    requestAnimationFrame(scrollCarousel);
  }

  requestAnimationFrame(scrollCarousel);

  // === Arrow Navigation ===
  const leftArrow = document.getElementById("leftArrow");
  const rightArrow = document.getElementById("rightArrow");

  if (leftArrow && rightArrow) {
    leftArrow.addEventListener("click", () => {
      scrollPosition -= cardWidth + 20; // card + gap
      if (scrollPosition < 0) {
        scrollPosition += trackWidth;
      }
    });

    rightArrow.addEventListener("click", () => {
      scrollPosition += cardWidth + 20; // card + gap
      if (scrollPosition >= trackWidth) {
        scrollPosition = 0;
      }
    });
  }
}


// ===== Trend Carousel: dropdowns, nav, drag, indicator =====
(function () {
  const courseBtn = document.getElementById('courseFilterBtn');
  const topicBtn = document.getElementById('topicFilterBtn');
  const courseDd = document.getElementById('courseDropdown');
  const topicDd = document.getElementById('topicDropdown');
  const closeDropdowns = (e) => {
    if (!courseBtn.contains(e.target) && !courseDd.contains(e.target)) courseDd.style.display = 'none';
    if (!topicBtn.contains(e.target) && !topicDd.contains(e.target)) topicDd.style.display = 'none';
  };

  courseBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    courseDd.style.display = courseDd.style.display === 'block' ? 'none' : 'block';
    topicDd.style.display = 'none';
  });
  topicBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    topicDd.style.display = topicDd.style.display === 'block' ? 'none' : 'block';
    courseDd.style.display = 'none';
  });
  document.addEventListener('click', closeDropdowns);

  // handle dropdown selection (placeholder behavior)
  document.querySelectorAll('#courseDropdown li').forEach(li => {
    li.addEventListener('click', () => {
      courseBtn.querySelector('span').innerText = li.innerText;
      courseDd.style.display = 'none';
      // TODO: perform filter action (AJAX or template reload)
    });
  });
  document.querySelectorAll('#topicDropdown li').forEach(li => {
    li.addEventListener('click', () => {
      topicBtn.querySelector('span').innerText = li.innerText;
      topicDd.style.display = 'none';
      // TODO: perform filter action
    });
  });

  // Carousel controls
  const carousel = document.getElementById('trendCarousel');
  const prevBtn = document.querySelector('.carousel-nav.prev');
  const nextBtn = document.querySelector('.carousel-nav.next');
  const indicator = document.getElementById('trendIndicator');
  const segs = indicator?.querySelectorAll('.seg') || [];

  function updateIndicator() {
    if (!carousel) return;
    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
    if (maxScrollLeft <= 0) {
      segs.forEach((s, i) => s.classList.toggle('active', i === 0));
      return;
    }
    const pct = carousel.scrollLeft / maxScrollLeft;
    const index = Math.min(segs.length - 1, Math.round(pct * (segs.length - 1)));
    segs.forEach((s, i) => s.classList.toggle('active', i === index));
  }

  prevBtn?.addEventListener('click', () => {
    if (!carousel) return;
    carousel.scrollBy({ left: -carousel.clientWidth * 0.8, behavior: 'smooth' });
    setTimeout(updateIndicator, 350);
  });

  nextBtn?.addEventListener('click', () => {
    if (!carousel) return;
    carousel.scrollBy({ left: carousel.clientWidth * 0.8, behavior: 'smooth' });
    setTimeout(updateIndicator, 350);
  });

  // drag-to-scroll
  if (carousel) {
    let isDown = false, startX, scrollLeft;
    carousel.addEventListener('mousedown', (e) => {
      isDown = true;
      carousel.classList.add('dragging');
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
    });
    carousel.addEventListener('mouseleave', () => { isDown = false; carousel.classList.remove('dragging'); });
    carousel.addEventListener('mouseup', () => { isDown = false; carousel.classList.remove('dragging'); });
    carousel.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.2;
      carousel.scrollLeft = scrollLeft - walk;
      updateIndicator();
    });

    // touch events for mobile
    let startTouchX = 0, startTouchScroll = 0;
    carousel.addEventListener('touchstart', (e) => {
      startTouchX = e.touches[0].pageX;
      startTouchScroll = carousel.scrollLeft;
    });
    carousel.addEventListener('touchmove', (e) => {
      const dx = e.touches[0].pageX - startTouchX;
      carousel.scrollLeft = startTouchScroll - dx;
      updateIndicator();
    });

    // update indicator on native scroll
    carousel.addEventListener('scroll', updateIndicator);
    // initial indicator state
    updateIndicator();
  }
})();


// scrollable for trending 



// Trending Carousel
(function() {
  const track = document.getElementById('trendingTrack');
  const leftBtn = document.getElementById('trendLeft');
  const rightBtn = document.getElementById('trendRight');

  const items = track.querySelectorAll('.trending-item');
  let index = 0;

  function updateCarousel() {
    const offset = index * track.clientWidth;
    track.style.transform = `translateX(-${offset}px)`;
  }

  leftBtn.addEventListener('click', () => {
    index--;
    if (index < 0) index = items.length - 1;
    updateCarousel();
  });

  rightBtn.addEventListener('click', () => {
    index++;
    if (index >= items.length) index = 0;
    updateCarousel();
  });
})();


(function() {
  const track = document.getElementById('trendingTrack');
  const leftBtn = document.getElementById('trendLeft');
  const rightBtn = document.getElementById('trendRight');
  const dots = document.querySelectorAll('#trendIndicators .dot');

  const items = track.querySelectorAll('.trending-item');
  let index = 0;

  function updateCarousel() {
    const offset = index * track.clientWidth;
    track.style.transform = `translateX(-${offset}px)`;

    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  leftBtn.addEventListener('click', () => {
    index--;
    if (index < 0) index = items.length - 1;
    updateCarousel();
  });

  rightBtn.addEventListener('click', () => {
    index++;
    if (index >= items.length) index = 0;
    updateCarousel();
  });

  // allow clicking on dots to navigate
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      index = i;
      updateCarousel();
    });
  });

  // touch swipe for mobile
  let startX = 0, scrollStart = 0;
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].pageX;
    scrollStart = index;
  });

  track.addEventListener('touchmove', (e) => {
    const dx = e.touches[0].pageX - startX;
    if (dx > 50) {
      index = Math.max(0, scrollStart - 1);
      updateCarousel();
    } else if (dx < -50) {
      index = Math.min(items.length - 1, scrollStart + 1);
      updateCarousel();
    }
  });
})();


// explore more section

document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector("#lavaNav");
  const links = nav.querySelectorAll(".lava-link");
  const animation = nav.querySelector(".animation");
  const content = document.querySelector("#lavaContent");

  const contentMap = {
    curriculum: `
      <h4>Curriculum</h4>
      <p>Welcome to the curriculum! Explore lessons, modules, and learning paths.</p>
    `,
    projects: `
      <h4>Projects</h4>
      <p>Hands-on projects to test your knowledge and gain experience.</p>
    `,
    quizzes: `
      <h4>Quizzes</h4>
      <p>Assess your learning progress with interactive quizzes and exams.</p>
    `,
    certificates: `
      <h4>Certificates</h4>
      <p>Earn certificates upon course completion to showcase your skills.</p>
    `,
    resources: `
      <h4>Resources</h4>
      <p>Download notes, tools, and supplementary materials here.</p>
    `
  };

  function moveAnimation(el) {
    const rect = el.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    animation.style.width = `${rect.width}px`;
    animation.style.left = `${rect.left - navRect.left}px`;
  }

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      const tab = link.getAttribute("data-tab");
      content.innerHTML = contentMap[tab] || "<p>Content not found.</p>";

      moveAnimation(link);
    });
  });

  // Initialize animation on first link
  moveAnimation(nav.querySelector(".lava-link.active"));
});
