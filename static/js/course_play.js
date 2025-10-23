document.addEventListener("DOMContentLoaded", function () {
  console.log("Course Play Page Loaded");

  // Tab logging
  const tabEls = document.querySelectorAll('button[data-bs-toggle="tab"]');
  tabEls.forEach(tab => {
    tab.addEventListener("shown.bs.tab", function (e) {
      console.log("Active Tab:", e.target.textContent);
    });
  });

  // Start button handler
  const startBtn = document.querySelector(".btn-start");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      alert("Lesson started!");
    });
  }

  // Chapter selection logic
  const chapters = document.querySelectorAll('input[name="chapter"]');
  const videoElement = document.getElementById("lessonVideo");

  // Map chapter number to video file names matching your static files
  const chapterVideos = {
    1: "network_segmentation_intro.mp4",
    2: "access_control.mp4",
    3: "", // No video for chapter 3, so skip video update
    4: "advanced_threats.mp4"
  };

  chapters.forEach((chapter, index) => {
    chapter.addEventListener('change', () => {
      if (chapter.checked) {
        const chapterNum = chapter.getAttribute('data-chapter');
        console.log(`Chapter ${chapterNum} selected`);

        // Change video source only if there is a video for the chapter
        const videoFile = chapterVideos[chapterNum];
        if (videoFile) {
          videoElement.pause();
          videoElement.currentTime = 0;
          videoElement.querySelector("source").src = `/static/videos/${videoFile}`;
          videoElement.load();
          videoElement.play();
        } else {
          console.log(`No video for chapter ${chapterNum}`);
        }

        // Unlock next chapter if exists
        const nextChapter = chapters[index + 1];
        if (nextChapter) {
          const nextBlock = nextChapter.closest('.chapter-block');
          nextChapter.disabled = false;
          nextBlock.classList.remove('locked');
        }
      }
    });
  });
});



// document.addEventListener("DOMContentLoaded", function() {
//   const chapters = document.querySelectorAll('[data-chapter]');
  
//   chapters.forEach((chapter, index) => {
//     chapter.addEventListener('change', () => {
//       // If this chapter is selected, unlock the next one
//       const nextChapter = chapters[index + 1];
//       if (nextChapter) {
//         const nextBlock = nextChapter.closest('.chapter-block');
//         nextChapter.disabled = false;
//         nextBlock.classList.remove('locked');
//       }
//     });
//   });
// });


