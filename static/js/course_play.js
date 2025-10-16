// course_play.js

document.addEventListener("DOMContentLoaded", function () {
  console.log("Course Play Page Loaded");

  // Example: Hook into tab shown event
  const tabEls = document.querySelectorAll('button[data-bs-toggle="tab"]');
  tabEls.forEach(tab => {
    tab.addEventListener("shown.bs.tab", function (e) {
      console.log("Active Tab:", e.target.textContent);
    });
  });

  // Optional: Handle "Start Lesson" button click
  const startBtn = document.querySelector(".btn-start");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      alert("Lesson started!");
    });
  }
});


