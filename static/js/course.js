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

