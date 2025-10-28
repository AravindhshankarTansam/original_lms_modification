console.log("✅ course_play.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector("#lessonVideo");
  const viewer = document.querySelector("#lessonViewer");
  const lessons = document.querySelectorAll(".lesson-item");
  const progressBar = document.querySelector("#progressBar");
  const progressText = document.querySelector("#progressText");

  const STORAGE_KEY = "courseProgress_v6";
  let savedProgress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  let currentLessonIndex = 0;

  const totalLessons = lessons.length;

  // Setup lesson click behavior
  lessons.forEach((lesson, index) => {
    lesson.addEventListener("click", () => playLesson(index));
  });

  // Play Selected Lesson
  function playLesson(index) {
    const lesson = lessons[index];
    if (!lesson) return;

    const url = lesson.dataset.url;
    const type = lesson.dataset.type;
    const title = lesson.dataset.title;

    currentLessonIndex = index;

    lessons.forEach(l => l.classList.remove("active"));
    lesson.classList.add("active");

    const header = document.querySelector(".course-header");
    if (header) header.textContent = title;

    if (type === "video" && url.endsWith(".mp4")) {
      viewer.classList.add("d-none");
      video.classList.remove("d-none");
      video.querySelector("source").src = url;
      video.load();
      video.play();
    } else {
      video.classList.add("d-none");
      viewer.classList.remove("d-none");
      viewer.src = url;
    }
  }

  // Mark Lesson Complete (No strike text)
  function markLessonComplete(index) {
    if (!savedProgress.includes(index)) {
      savedProgress.push(index);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProgress));
    }
    updateProgress();
    showSuccessPopup("Lesson Completed ✅");
  }

  // Update Progress Bar
  function updateProgress() {
    const percent = Math.round((savedProgress.length / totalLessons) * 100);
    progressBar.style.width = percent + "%";
    progressText.textContent = `${percent}% Completed`;
  }

  updateProgress();

  // Auto Next Lesson
  if (video) {
    video.addEventListener("ended", () => {
      markLessonComplete(currentLessonIndex);

      const nextLesson = lessons[currentLessonIndex + 1];
      if (nextLesson) {
        setTimeout(() => playLesson(currentLessonIndex + 1), 1000);
      } else {
        setTimeout(() => showSuccessPopup("🎉 You completed this course!", true), 1000);
      }
    });
  }

  // Success Popup
  function showSuccessPopup(message, final = false) {
    const popup = document.createElement("div");
    popup.className = "lesson-popup";
    popup.innerHTML = `<div>${message}</div>`;
    document.body.appendChild(popup);

    setTimeout(() => {
      popup.classList.add("show");
    }, 50);

    setTimeout(() => {
      popup.classList.remove("show");
      setTimeout(() => popup.remove(), 400);

      if (final) {
        // redirect or show certificate - tell me what you want here
        console.log("Course finished!");
      }
    }, 2000);
  }

  // Continue last lesson automatically
  const lastIndex = savedProgress.length > 0 ? Math.max(...savedProgress) : 0;
  playLesson(lastIndex);
});
