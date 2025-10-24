// document.addEventListener("DOMContentLoaded", function () {
//   console.log("Course Play Page Loaded");

//   // Tab logging
//   const tabEls = document.querySelectorAll('button[data-bs-toggle="tab"]');
//   tabEls.forEach(tab => {
//     tab.addEventListener("shown.bs.tab", function (e) {
//       console.log("Active Tab:", e.target.textContent);
//     });
//   });

//   // Start button handler
//   const startBtn = document.querySelector(".btn-start");
//   if (startBtn) {
//     startBtn.addEventListener("click", () => {
//       alert("Lesson started!");
//     });
//   }

//   // Chapter selection logic
//   const chapters = document.querySelectorAll('input[name="chapter"]');
//   const videoElement = document.getElementById("lessonVideo");

//   // Map chapter number to video file names matching your static files
//   const chapterVideos = {
//     1: "network_segmentation_intro.mp4",
//     2: "access_control.mp4",
//     3: "", // No video for chapter 3, so skip video update
//     4: "advanced_threats.mp4"
//   };

//   chapters.forEach((chapter, index) => {
//     chapter.addEventListener('change', () => {
//       if (chapter.checked) {
//         const chapterNum = chapter.getAttribute('data-chapter');
//         console.log(`Chapter ${chapterNum} selected`);

//         // Change video source only if there is a video for the chapter
//         const videoFile = chapterVideos[chapterNum];
//         if (videoFile) {
//           videoElement.pause();
//           videoElement.currentTime = 0;
//           videoElement.querySelector("source").src = `/static/videos/${videoFile}`;
//           videoElement.load();
//           videoElement.play();
//         } else {
//           console.log(`No video for chapter ${chapterNum}`);
//         }

//         // Unlock next chapter if exists
//         const nextChapter = chapters[index + 1];
//         if (nextChapter) {
//           const nextBlock = nextChapter.closest('.chapter-block');
//           nextChapter.disabled = false;
//           nextBlock.classList.remove('locked');
//         }
//       }
//     });
//   });
// });



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


// document.addEventListener("DOMContentLoaded", function () {
//   const video = document.getElementById("lessonVideo");
//   const menuButton = document.getElementById("menuButton");
//   const menuDropdown = document.getElementById("menuDropdown");
//   const pipMode = document.getElementById("pipMode");
//   const speedSelect = document.getElementById("speedSelect");

//   // Toggle dropdown visibility
//   menuButton.addEventListener("click", (e) => {
//     e.stopPropagation();
//     menuDropdown.classList.toggle("d-none");
//   });

//   // Close menu when clicking outside
//   document.addEventListener("click", (e) => {
//     if (!menuButton.contains(e.target) && !menuDropdown.contains(e.target)) {
//       menuDropdown.classList.add("d-none");
//     }
//   });

//   // Picture-in-Picture toggle
//   pipMode.addEventListener("click", async () => {
//     try {
//       if (document.pictureInPictureElement) {
//         await document.exitPictureInPicture();
//       } else {
//         await video.requestPictureInPicture();
//       }
//     } catch (err) {
//       console.error("PiP not supported:", err);
//     }
//     menuDropdown.classList.add("d-none");
//   });

//   // Playback speed control
//   speedSelect.addEventListener("change", () => {
//     video.playbackRate = parseFloat(speedSelect.value);
//   });

//   // === LESSON UNLOCK LOGIC ===
//   const lessons = document.querySelectorAll(".lesson-item");

//   lessons.forEach((lesson, index) => {
//     lesson.addEventListener("click", () => {
//       const videoSrc = lesson.getAttribute("data-video");
//       if (videoSrc) {
//         video.pause();
//         video.currentTime = 0;
//         video.querySelector("source").src = `/static/videos/${videoSrc}`;
//         video.load();
//         video.play();
//       }

//       // Mark lesson as completed after video ends
//       video.onended = function () {
//         const nextLesson = lessons[index + 1];
//         if (nextLesson && nextLesson.classList.contains("locked")) {
//           nextLesson.classList.remove("locked");
//         }
//       };
//     });
//   });
//   // --- Chapter logic (unlock next, change video) ---
//   const chapters = document.querySelectorAll('input[name="chapter"]');
//   const chapterVideos = {
//     1: "network_segmentation_intro.mp4",
//     2: "access_control.mp4",
//     4: "advanced_threats.mp4"
//   };

//   chapters.forEach((chapter, index) => {
//     chapter.addEventListener('change', () => {
//       const chapterNum = chapter.getAttribute('data-chapter');
//       const videoFile = chapterVideos[chapterNum];
//       if (videoFile) {
//         video.pause();
//         video.currentTime = 0;
//         video.querySelector("source").src = `/static/videos/${videoFile}`;
//         video.load();
//         video.play();
//       }

//       const nextChapter = chapters[index + 1];
//       if (nextChapter) {
//         const nextBlock = nextChapter.closest('.chapter-block');
//         nextChapter.disabled = false;
//         nextBlock.classList.remove('locked');
//       }
//     });
//   });
// });

document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("lessonVideo");
  const lessons = document.querySelectorAll(".lesson-item");
  const chapters = document.querySelectorAll(".chapter-block");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const STORAGE_KEY = "courseProgress_v2"; // new version to reset older cache

  let savedProgress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const totalLessons = lessons.length;
  let currentLessonIndex = 0;

  // === INITIALIZE LESSON STATES ===
  lessons.forEach((lesson, index) => {
    const checkbox = lesson.querySelector(".lesson-check");

    // Restore completed lessons
    if (savedProgress.includes(index)) {
      lesson.classList.add("completed");
      checkbox.checked = true;
      lesson.classList.remove("locked");
      checkbox.disabled = false;

      const parentChapter = lesson.closest(".chapter-block");
      if (parentChapter) parentChapter.classList.remove("locked");
    } else if (lesson.classList.contains("locked")) {
      checkbox.disabled = true;
    }

    // Lesson click
    lesson.addEventListener("click", () => {
      if (lesson.classList.contains("locked")) return;

      currentLessonIndex = index;
      const videoSrc = lesson.getAttribute("data-video");
      if (!videoSrc) return;

      const source = video.querySelector("source");
      if (!source.src.endsWith(videoSrc)) {
        source.src = `/static/videos/${videoSrc}`;
        video.load();
      }
      video.play();
    });
  });

  // === UNLOCK FIRST AVAILABLE LESSON ===
  const firstIncomplete = lessons.find((_, i) => !savedProgress.includes(i)) || lessons[0];
  firstIncomplete.classList.remove("locked");
  firstIncomplete.querySelector(".lesson-check").disabled = false;
  const parentChapter = firstIncomplete.closest(".chapter-block");
  if (parentChapter) parentChapter.classList.remove("locked");

  // === PROGRESS BAR UPDATE ===
  function updateProgress() {
    const completed = savedProgress.length;
    const percent = Math.round((completed / totalLessons) * 100);
    progressBar.style.width = percent + "%";
    progressText.textContent = `${percent}% Completed`;
  }
  updateProgress();

  // === VIDEO END HANDLER ===
  video.addEventListener("ended", () => {
    const lesson = lessons[currentLessonIndex];
    const checkbox = lesson.querySelector(".lesson-check");

    if (!lesson.classList.contains("completed")) {
      lesson.classList.add("completed");
      checkbox.checked = true;
      checkbox.disabled = false;

      if (!savedProgress.includes(currentLessonIndex)) {
        savedProgress.push(currentLessonIndex);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProgress));
      }

      updateProgress();

      // Unlock next lesson
      const nextLesson = lessons[currentLessonIndex + 1];
      if (nextLesson) {
        nextLesson.classList.remove("locked");
        nextLesson.querySelector(".lesson-check").disabled = false;

        const nextParent = nextLesson.closest(".chapter-block");
        if (nextParent) nextParent.classList.remove("locked");
      }

      // === Check if current module completed ===
      checkModuleCompletion();
    }
  });

  // === FUNCTION: CHECK MODULE COMPLETION ===
  function checkModuleCompletion() {
    chapters.forEach((chapter, i) => {
      const lessonsInChapter = chapter.querySelectorAll(".lesson-item");
      const allCompleted = Array.from(lessonsInChapter).every(l =>
        l.classList.contains("completed")
      );

      const nextChapter = chapters[i + 1];
      if (allCompleted && nextChapter) {
        // Unlock next module
        nextChapter.classList.remove("locked");
        const firstLesson = nextChapter.querySelector(".lesson-item");
        if (firstLesson) {
          firstLesson.classList.remove("locked");
          firstLesson.querySelector(".lesson-check").disabled = false;
        }
      }
    });
  }

  // === RESTORE LAST WATCHED VIDEO ===
  if (savedProgress.length > 0) {
    const lastIndex = Math.max(...savedProgress);
    const nextLesson = lessons[lastIndex + 1] || lessons[lastIndex];
    const videoSrc = nextLesson.getAttribute("data-video");
    if (videoSrc) {
      const source = video.querySelector("source");
      source.src = `/static/videos/${videoSrc}`;
      video.load();
    }
  }

  // Run once on load to ensure modules unlock properly
  checkModuleCompletion();
});
