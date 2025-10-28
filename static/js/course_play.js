console.log("✅ course_play.js is loaded and running");

document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector("#lessonVideo");
  const viewer = document.querySelector("#lessonViewer");
  const lessons = document.querySelectorAll(".lesson-item");
  const progressBar = document.querySelector("#progressBar");
  const progressText = document.querySelector("#progressText");

  const STORAGE_KEY = "courseProgress_v4";
  let savedProgress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  let currentLessonIndex = 0;

  const totalLessons = lessons.length;

  // === INITIAL SETUP ===
  lessons.forEach((lesson, index) => {
    const checkbox = lesson.querySelector(".lesson-check");

    if (savedProgress.includes(index)) {
      lesson.classList.add("completed");
      checkbox.checked = true;
    }

    lesson.addEventListener("click", () => {
      playLesson(index);
    });
  });

  // === PLAY LESSON ===
  function playLesson(index) {
    const lesson = lessons[index];
    if (!lesson) return;

    const url = lesson.dataset.url;
    const type = lesson.dataset.type;
    const title = lesson.dataset.title;
    const checkbox = lesson.querySelector(".lesson-check");

    currentLessonIndex = index;

    // Highlight current lesson
    lessons.forEach(l => l.classList.remove("active"));
    lesson.classList.add("active");

    // Update title in player area (optional: add your selector if needed)
    const header = document.querySelector(".course-header");
    if (header) header.textContent = title;

    // Show correct player type
    if (type === "video" && url.endsWith(".mp4")) {
      viewer.classList.add("d-none");
      video.classList.remove("d-none");
      video.querySelector("source").src = url;
      video.load();
      video.play();
    } else if (["pdf", "ppt"].includes(type)) {
      video.classList.add("d-none");
      viewer.classList.remove("d-none");
      viewer.src = url;
    } else {
      viewer.classList.add("d-none");
      video.classList.remove("d-none");
      video.querySelector("source").src = lesson.dataset.url;
      video.load();
    }

    checkbox.disabled = false;
  }

  // === MARK LESSON COMPLETE ===
  function markLessonComplete(index) {
    const lesson = lessons[index];
    if (!lesson) return;
    const checkbox = lesson.querySelector(".lesson-check");

    lesson.classList.add("completed");
    checkbox.checked = true;

    if (!savedProgress.includes(index)) {
      savedProgress.push(index);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProgress));
    }
    updateProgress();
  }

  // === UPDATE PROGRESS BAR ===
  function updateProgress() {
    const completed = savedProgress.length;
    const percent = Math.round((completed / totalLessons) * 100);
    progressBar.style.width = percent + "%";
    progressText.textContent = `${percent}% Completed`;
  }

  updateProgress();

  // === AUTO MOVE TO NEXT LESSON ===
  video.addEventListener("ended", () => {
    markLessonComplete(currentLessonIndex);

    const nextLesson = lessons[currentLessonIndex + 1];
    if (nextLesson) {
      setTimeout(() => {
        playLesson(currentLessonIndex + 1);
        nextLesson.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 1200);
    } else {
      showCompletionMessage();
    }
  });

  // === SHOW COURSE COMPLETION ===
  function showCompletionMessage() {
    const container = document.querySelector(".video-container");
    if (!container.querySelector(".course-complete")) {
      const msg = document.createElement("div");
      msg.className = "course-complete text-center p-4 text-success fw-bold";
      msg.textContent = "🎉 Congratulations! You’ve completed this course!";
      container.appendChild(msg);
    }
  }

  // === RESTORE LAST LESSON ===
  if (savedProgress.length > 0) {
    const lastIndex = Math.max(...savedProgress);
    const nextLesson = lessons[lastIndex + 1] || lessons[lastIndex];
    playLesson(Array.from(lessons).indexOf(nextLesson));
  } else {
    playLesson(0);
  }
});
