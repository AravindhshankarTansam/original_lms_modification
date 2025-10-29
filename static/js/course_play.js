console.log("✅ course_play.js loaded with lesson locking and document viewer + progress fixes");

document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector("#lessonVideo");
  const viewer = document.querySelector("#lessonViewer");
  const lessons = document.querySelectorAll(".lesson-item");
  const progressBar = document.querySelector("#progressBar");
  const progressText = document.querySelector("#progressText");
  const markCompleteBtn = document.querySelector("#markCompleteBtn");

  const STORAGE_KEY = "courseProgress_v8";
  let savedProgress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  let currentLessonIndex = 0;
  const totalLessons = lessons.length;

  // ==== Lock Lessons ====
  function applyLessonLocks() {
    lessons.forEach((lesson, index) => {
      lesson.classList.remove("locked");
      // Lock all lessons beyond the next available one
      if (index > Math.max(...savedProgress, -1) + 1) {
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

    // Hide mark complete button by default
    markCompleteBtn.classList.add("d-none");

    // ---- VIDEO ----
    if (type === "video" && url.endsWith(".mp4")) {
      viewer.classList.add("d-none");
      video.classList.remove("d-none");
      video.querySelector("source").src = url;
      video.load();
      video.play();

      // ✅ Auto-complete when video ends
      video.onended = () => markLessonComplete(currentLessonIndex);
      return;
    }

    // ---- DOCUMENT VIEWER ----
    video.classList.add("d-none");
    viewer.classList.remove("d-none");

    const absoluteUrl = url.startsWith("http") ? url : window.location.origin + url;

    // ---- PDF ----
    if (url.endsWith(".pdf")) {
      viewer.src = absoluteUrl + "#toolbar=0&scrollbar=0";

      viewer.onload = () => {
        const pdfWindow = viewer.contentWindow;
        if (!pdfWindow) return;

        pdfWindow.addEventListener("scroll", () => {
          const scrollTop =
            pdfWindow.document.documentElement.scrollTop ||
            pdfWindow.document.body.scrollTop;
          const scrollHeight =
            pdfWindow.document.documentElement.scrollHeight ||
            pdfWindow.document.body.scrollHeight;
          const clientHeight = pdfWindow.innerHeight;

          const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
          if (isAtBottom) {
            console.log("✅ PDF Completed!");
            markLessonComplete(currentLessonIndex);
          }
        });
      };
      return;
    }

    // ---- PPT / PPTX ----
    if (url.endsWith(".ppt") || url.endsWith(".pptx")) {
      if (isLocalhost) {
        viewer.srcdoc = `
          <div style="font-family:sans-serif;padding:2rem;text-align:center;color:#444">
            <h3>📄 PowerPoint Preview Not Available Locally</h3>
            <p>To preview PPT files, please run your server via <b>ngrok</b> or deploy it online.</p>
            <p>File URL: <a href="${absoluteUrl}" target="_blank">${absoluteUrl}</a></p>
          </div>`;
      } else {
        viewer.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`;
      }
      markCompleteBtn.classList.remove("d-none"); // show manual button
      return;
    }

    // ---- DOC / DOCX ----
    if (url.endsWith(".doc") || url.endsWith(".docx")) {
      viewer.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`;
      markCompleteBtn.classList.remove("d-none"); // show manual button
      return;
    }

    // ---- Default (images, text, etc.) ----
    viewer.src = absoluteUrl;
    markCompleteBtn.classList.remove("d-none");
  }

  // ==== Mark Lesson Complete ====
  function markLessonComplete(index) {
    const chapterId = lessons[index].dataset.chapterId;

    // ✅ Update progress immediately
    if (!savedProgress.includes(index)) {
      savedProgress.push(index);
      savedProgress = [...new Set(savedProgress)]; // avoid duplicates
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProgress));
      applyLessonLocks();
      updateProgress();
    }

    // ✅ Sync with backend (optional)
    fetch(`/courses/mark-complete/${chapterId}/`, {
      method: "POST",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    }).catch(err => console.warn("⚠️ Sync failed:", err));
  }

  // ==== Manual “Mark Complete” button ====
  markCompleteBtn.addEventListener("click", () => {
    markLessonComplete(currentLessonIndex);
    markCompleteBtn.classList.add("d-none");
  });

  // ==== Progress Bar ====
  function updateProgress() {
    const uniqueProgress = [...new Set(savedProgress)];
    const percent = Math.round((uniqueProgress.length / totalLessons) * 100);
    progressBar.style.width = percent + "%";
    progressText.textContent = `${percent}% Completed`;
  }
  updateProgress();

  // ==== Resume Last Lesson ====
  const resumeIndex = Math.max(...savedProgress, 0);
  playLesson(resumeIndex);
});
