console.log("✅ course_play.js loaded with lesson locking");

document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector("#lessonVideo");
  const viewer = document.querySelector("#lessonViewer");
  const lessons = document.querySelectorAll(".lesson-item");
  const progressBar = document.querySelector("#progressBar");
  const progressText = document.querySelector("#progressText");

  const STORAGE_KEY = "courseProgress_v7";
  let savedProgress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  let currentLessonIndex = 0;

  const totalLessons = lessons.length;

  // ==== Lock all lessons except first unlocked ====
  function applyLessonLocks() {
    lessons.forEach((lesson, index) => {
      lesson.classList.remove("locked");
      if (index > savedProgress.length) {
        lesson.classList.add("locked");
      }
    });
  }

  applyLessonLocks();

  // ==== Click Handler ====
  lessons.forEach((lesson, index) => {
    lesson.addEventListener("click", () => playLesson(index));
  });

  // ==== Play Lesson ====
function playLesson(index) {
  if (lessons[index].classList.contains("locked")) return;

  currentLessonIndex = index;

  lessons.forEach(l => l.classList.remove("active"));
  lessons[index].classList.add("active");

  const url = lessons[index].dataset.url;
  const type = lessons[index].dataset.type;
  const title = lessons[index].dataset.title;

  document.querySelector(".course-header").textContent = title;

  const isLocalhost =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";

  // ==== VIDEO ====
  if (type === "video" && url.endsWith(".mp4")) {
    viewer.classList.add("d-none");
    video.classList.remove("d-none");
    video.querySelector("source").src = url;
    video.load();
    video.play();
    return;
  }

  // ==== DOCUMENT VIEWER ====
  video.classList.add("d-none");
  viewer.classList.remove("d-none");

  // ---- PPT & PPTX ----
  if (url.endsWith(".ppt") || url.endsWith(".pptx")) {
    const absoluteUrl = url.startsWith("http") ? url : window.location.origin + url;

    if (isLocalhost) {
      // Office Viewer for local
      viewer.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`;
    } else {
      // Google Viewer for production
      viewer.src = `https://docs.google.com/gview?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
    }
    return;
  }

  // ---- PDF ----
  if (url.endsWith(".pdf")) {
    if (isLocalhost) {
      // Browser internal viewer (no download button hidden with toolbar=0)
      viewer.src = url + "#toolbar=0&scrollbar=0";
    } else {
      // Google viewer online
      viewer.src = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return;
  }

  // ---- DOC / DOCX ----
  if (url.endsWith(".doc") || url.endsWith(".docx")) {
    const absoluteUrl = url.startsWith("http") ? url : window.location.origin + url;
    viewer.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`;
    return;
  }

  // Default (images, txt, etc.)
  viewer.src = url;
}



  // ==== Mark Lesson Complete ====
  function markLessonComplete(index) {
  const chapterId = lessons[index].dataset.chapterId;

  fetch(`/courses/mark-complete/${chapterId}/`, {
    method: "POST",
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
    },
  })
  .then(res => res.json())
  .then(() => {
    if (!savedProgress.includes(index)) {
      savedProgress.push(index);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProgress));
      applyLessonLocks(); 
      updateProgress();
    }
  });
}


  // ==== Update Progress Bar ====
  function updateProgress() {
    const percent = Math.round((savedProgress.length / totalLessons) * 100);
    progressBar.style.width = percent + "%";
    progressText.textContent = `${percent}% Completed`;
  }

  updateProgress();

  // ==== Auto continue last unfinished lesson ====
  const resumeIndex = savedProgress.length > 0 ? savedProgress.length : 0;
  playLesson(resumeIndex);
});
