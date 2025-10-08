// === Sidebar toggle ===
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

  // This dropdown logic below is replaced by the unified dropdown filter code below
  // So you can remove this old block if you want
})();

// ===== Trending Carousel navigation & dots =====
(function () {
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

// ===== Dropdown filter logic (Unified & corrected) =====
(function () {
  const dropdowns = [
    { btnId: 'courseFilterBtn', listId: 'courseDropdown' },
    { btnId: 'topicFilterBtn', listId: 'topicDropdown' },
    { btnId: 'levelFilterBtn', listId: 'levelDropdown' },
  ];

  function closeAllDropdowns(except = null) {
    dropdowns.forEach(({ btnId, listId }) => {
      const dropdown = document.getElementById(listId);
      const button = document.getElementById(btnId);
      if (listId !== except) {
        if (dropdown) dropdown.style.display = 'none';
        if (button) button.parentElement.classList.remove('open');
      }
    });
  }

  dropdowns.forEach(({ btnId, listId }) => {
    const button = document.getElementById(btnId);
    const dropdown = document.getElementById(listId);

    if (!button || !dropdown) return;

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = dropdown.style.display === 'block';

      closeAllDropdowns(listId);

      if (!isVisible) {
        dropdown.style.display = 'block';
        button.parentElement.classList.add('open');
      } else {
        dropdown.style.display = 'none';
        button.parentElement.classList.remove('open');
      }
    });

    dropdown.querySelectorAll('li').forEach(item => {
      item.addEventListener('click', () => {
        button.querySelector('span').innerText = item.innerText;
        dropdown.style.display = 'none';
        button.parentElement.classList.remove('open');

        // 👉 Add filtering logic here
        console.log(`[${btnId}] selected: ${item.innerText}`);
      });
    });
  });

  // Close dropdown on clicking outside
  document.addEventListener('click', () => {
    closeAllDropdowns();
  });
})();


// ===== Explore More Section =====
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
