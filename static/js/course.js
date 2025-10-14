document.addEventListener('DOMContentLoaded', function() {
  const gridBtn = document.querySelector('#gridViewBtn');
  const listBtn = document.querySelector('#listViewBtn');
  const cardsGrid = document.querySelector('#cardsGrid');

  gridBtn.addEventListener('click', function() {
    cardsGrid.classList.remove('list-view');
    cardsGrid.classList.add('row');
  });

  listBtn.addEventListener('click', function() {
    cardsGrid.classList.remove('row');
    cardsGrid.classList.add('list-view');
  });

  const enrollButtons = document.querySelectorAll('.btn-enroll');
  const enrollToastEl = document.getElementById('enrollToast');
  const toast = new bootstrap.Toast(enrollToastEl);

  enrollButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      const isStart = button.textContent.trim().startsWith('Start');

      if (isStart) {
        const url = button.getAttribute('data-url');
        if (url) {
          window.location.href = url; // 👈 Redirect to course_play
        }
        return;
      }

      button.disabled = true;
      button.textContent = 'Enrolling...';

      setTimeout(() => {
        toast.show();

        // Change text to "Start ▶" and re-enable button
        button.innerHTML = 'Start <div class="plus">▶</div>';
        button.disabled = false;
      }, 550);
    });
  });
});


// course.js
document.addEventListener("DOMContentLoaded", function () {
  const enrollButtons = document.querySelectorAll(".btn-enroll");

  enrollButtons.forEach(button => {
    button.addEventListener("click", function () {
      if (button.disabled) return;

      const courseId = button.getAttribute("data-course-id");
      if (!courseId) {
        console.error("Missing course ID");
        return;
      }

      button.disabled = true;
      button.innerHTML = "Enrolling...";

      setTimeout(() => {
        // Update button to "Start" and enable it
        button.innerHTML = 'Start <div class="plus">▶</div>';
        button.classList.remove("btn-enroll");
        button.classList.add("btn-start");
        button.disabled = false;

        // Redirect to course play page on next click
        button.addEventListener("click", function () {
          window.location.href = `/course/${courseId}/`;
        }, { once: true }); // only run once
      }, 550);
    });
  });
});

// to back button

document.addEventListener('DOMContentLoaded', function() {
  const backBtn = document.querySelector('.back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      history.back();
    });
  }
});

// search field in topbar


document.addEventListener('DOMContentLoaded', function() {
  const searchIcon = document.getElementById('searchIcon');
  const searchInput = document.getElementById('searchInput');
  const cardsGrid = document.getElementById('cardsGrid');
  const noCoursesMessage = document.getElementById('noCoursesMessage');
  const courseCards = cardsGrid.querySelectorAll('.course-card');

  // Toggle search input visibility when clicking search icon
  searchIcon.addEventListener('click', () => {
    if (searchInput.style.display === 'none') {
      searchInput.style.display = 'block';
      searchInput.focus();
    } else {
      searchInput.value = '';
      filterCourses('');
      searchInput.style.display = 'none';
    }
  });

  // Filter function
  function filterCourses(query) {
    const q = query.trim().toLowerCase();
    let visibleCount = 0;

    courseCards.forEach(card => {
      // Find the course title inside this card
      const titleElem = card.querySelector('.course-title');
      const titleText = titleElem ? titleElem.textContent.toLowerCase() : '';

      if (titleText.includes(q)) {
        card.parentElement.style.display = ''; // show column div (col-6 etc)
        visibleCount++;
      } else {
        card.parentElement.style.display = 'none';
      }
    });

    // Show or hide "no courses" message
    noCoursesMessage.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  // Listen to input event on search box
  searchInput.addEventListener('input', (e) => {
    filterCourses(e.target.value);
  });

  // Also, existing code you have for enroll buttons, grid/list toggle, etc...
});
