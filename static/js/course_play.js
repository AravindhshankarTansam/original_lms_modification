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




document.addEventListener("DOMContentLoaded", function() {
  const chapters = document.querySelectorAll('[data-chapter]');
  
  chapters.forEach((chapter, index) => {
    chapter.addEventListener('change', () => {
      // If this chapter is selected, unlock the next one
      const nextChapter = chapters[index + 1];
      if (nextChapter) {
        const nextBlock = nextChapter.closest('.chapter-block');
        nextChapter.disabled = false;
        nextBlock.classList.remove('locked');
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function() {
  const startBtn = document.getElementById("startLessonBtn");
  const videoContainer = document.getElementById("lessonVideoContainer");
  const video = document.getElementById("lessonVideo");

  startBtn.addEventListener("click", function() {
    // Show the video section
    videoContainer.classList.remove("d-none");

    // Hide the button
    startBtn.classList.add("d-none");

    // Ensure browser allows playback
    video.muted = true;      // ✅ helps with autoplay restriction
    video.play().catch(err => {
      console.warn("Video play was prevented:", err);
    });
  });
});
