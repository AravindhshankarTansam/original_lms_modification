document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("lessonVideo");
  const lessons = document.querySelectorAll(".lesson-item");
  const chapters = document.querySelectorAll(".chapter-block");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const quizContainer = document.getElementById("quizContainer");
  const videoContainer = document.querySelector(".video-container");

  const STORAGE_KEY = "courseProgress_v4"; // Increment this if course structure changes
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
      checkbox.disabled = false;
      const parentChapter = lesson.closest(".chapter-block");
      if (parentChapter) parentChapter.classList.remove("locked");
    } else if (lesson.classList.contains("locked")) {
      checkbox.disabled = true;
    }

    // === LESSON CLICK ===
    lesson.addEventListener("click", () => {
      if (lesson.classList.contains("locked")) return;

      currentLessonIndex = index;

      // --- Handle Quiz Lessons ---
      if (lesson.classList.contains("quiz-item")) {
        showQuiz(lesson);
        return;
      }

      // --- Handle Media Lessons ---
      const videoSrc = lesson.getAttribute("data-video");
      const pdfSrc = lesson.getAttribute("data-pdf");
      const pptSrc = lesson.getAttribute("data-ppt");

      const viewer = document.getElementById("lessonViewer");

      // If it's a video
      if (videoSrc) {
        quizContainer.classList.add("d-none");
        viewer.classList.add("d-none");
        videoContainer.classList.remove("d-none");

        const source = video.querySelector("source");
        if (source.src !== videoSrc) {
          source.src = videoSrc;
          video.load();
        }

        video.play();
      } 
      // If it's a PDF or PPT
      else if (pdfSrc || pptSrc) {
        videoContainer.classList.add("d-none");
        quizContainer.classList.add("d-none");
        viewer.classList.remove("d-none");
        viewer.src = pdfSrc || pptSrc;
        markLessonComplete(index);
      }
    });
  });

  // === UNLOCK FIRST INCOMPLETE LESSON ===
  const firstIncomplete = Array.from(lessons).find((_, i) => !savedProgress.includes(i)) || lessons[0];
  if (firstIncomplete) {
    firstIncomplete.classList.remove("locked");
    const checkbox = firstIncomplete.querySelector(".lesson-check");
    if (checkbox) checkbox.disabled = false;
    const parentChapter = firstIncomplete.closest(".chapter-block");
    if (parentChapter) parentChapter.classList.remove("locked");
  }

  // === PROGRESS BAR ===
  function updateProgress() {
    const completed = savedProgress.length;
    const percent = Math.round((completed / totalLessons) * 100);
    progressBar.style.width = percent + "%";
    progressText.textContent = `${percent}% Completed`;
  }
  updateProgress();

  // === MARK LESSON COMPLETE ===
  function markLessonComplete(index) {
    const lesson = lessons[index];
    if (!lesson) return;

    const checkbox = lesson.querySelector(".lesson-check");
    lesson.classList.add("completed");
    if (checkbox) {
      checkbox.checked = true;
      checkbox.disabled = false;
    }

    if (!savedProgress.includes(index)) {
      savedProgress.push(index);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProgress));
    }

    updateProgress();
  }

  // === CHECK MODULE COMPLETION ===
  function checkModuleCompletion() {
    chapters.forEach((chapter, i) => {
      const lessonsInChapter = chapter.querySelectorAll(".lesson-item");
      const allCompleted = Array.from(lessonsInChapter).every((l) =>
        l.classList.contains("completed")
      );

      const quizItem = document.querySelector(`.quiz-item[data-quiz="${i + 1}"]`);
      const quizCompleted = quizItem && quizItem.classList.contains("completed");

      const nextChapter = chapters[i + 1];
      if (allCompleted && quizCompleted && nextChapter) {
        nextChapter.classList.remove("locked");
        const firstLesson = nextChapter.querySelector(".lesson-item");
        if (firstLesson) {
          firstLesson.classList.remove("locked");
          const checkbox = firstLesson.querySelector(".lesson-check");
          if (checkbox) checkbox.disabled = false;
        }
      }
    });
  }

  // === VIDEO END HANDLER ===
  video.addEventListener("ended", () => {
    const lesson = lessons[currentLessonIndex];
    if (!lesson) return;

    if (!lesson.classList.contains("completed")) {
      markLessonComplete(currentLessonIndex);
    }

    // Unlock and move to next lesson
    const nextLesson = lessons[currentLessonIndex + 1];
    if (nextLesson) {
      nextLesson.classList.remove("locked");
      const checkbox = nextLesson.querySelector(".lesson-check");
      if (checkbox) checkbox.disabled = false;

      const nextParent = nextLesson.closest(".chapter-block");
      if (nextParent) nextParent.classList.remove("locked");

      // If quiz is next, show it automatically
      if (nextLesson.classList.contains("quiz-item")) {
        showQuiz(nextLesson);
        return;
      }
    }

    checkModuleCompletion();
  });

  // === RESTORE LAST WATCHED VIDEO ===
  if (savedProgress.length > 0) {
    const lastIndex = Math.max(...savedProgress);
    const nextLesson = lessons[lastIndex + 1] || lessons[lastIndex];
    if (nextLesson && nextLesson.getAttribute("data-video")) {
      const source = video.querySelector("source");
      source.src = nextLesson.getAttribute("data-video");
      video.load();
    }
  }

  // === QUIZ HANDLER ===
  function showQuiz(quizLesson) {
    videoContainer.classList.add("d-none");
    quizContainer.classList.remove("d-none");

    const quizTitle = document.getElementById("quizTitle");
    const quizQuestion = document.getElementById("quizQuestion");
    const quizOptions = document.getElementById("quizOptions");
    const quizProgress = document.getElementById("quizProgress");

    // Dummy quiz data (replace with Django context later)
    const quizData = [
      {
        question: "What does SQL stand for?",
        options: ["Structured Query Language", "Simple Query Logic", "Strong Query Loop"],
        correct: 0,
      },
      {
        question: "Which one is a relational database?",
        options: ["MySQL", "HTML", "CSS"],
        correct: 0,
      },
    ];

    let currentQ = 0;

    function loadQuestion() {
      const q = quizData[currentQ];
      quizTitle.textContent = quizLesson.textContent.trim();
      quizQuestion.textContent = q.question;
      quizProgress.textContent = `Question ${currentQ + 1} of ${quizData.length}`;
      quizOptions.innerHTML = "";

      q.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline-primary w-100 mb-2";
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(i);
        quizOptions.appendChild(btn);
      });
    }

    function checkAnswer(selected) {
      const q = quizData[currentQ];
      const correct = selected === q.correct;

      if (correct) alert("✅ Correct!");
      else alert("❌ Incorrect!");

      currentQ++;
      if (currentQ < quizData.length) {
        loadQuestion();
      } else {
        alert("🎉 Quiz Completed!");
        quizLesson.classList.add("completed");
        const checkbox = quizLesson.querySelector(".lesson-check");
        if (checkbox) {
          checkbox.checked = true;
          checkbox.disabled = false;
        }

        if (!savedProgress.includes(currentLessonIndex)) {
          savedProgress.push(currentLessonIndex);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProgress));
        }

        quizContainer.classList.add("d-none");
        videoContainer.classList.remove("d-none");

        updateProgress();
        checkModuleCompletion();
      }
    }

    loadQuestion();
  }

  // === MENU OPTIONS (Picture-in-Picture & Speed Control) ===
  const menuButton = document.getElementById("menuButton");
  const menuDropdown = document.getElementById("menuDropdown");
  const pipMode = document.getElementById("pipMode");
  const speedSelect = document.getElementById("speedSelect");

  menuButton.addEventListener("click", () => {
    menuDropdown.classList.toggle("d-none");
  });

  pipMode.addEventListener("click", async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await video.requestPictureInPicture();
    }
  });

  speedSelect.addEventListener("change", (e) => {
    video.playbackRate = parseFloat(e.target.value);
  });
});
