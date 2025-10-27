document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("lessonVideo");
  const lessons = document.querySelectorAll(".lesson-item");
  const chapters = document.querySelectorAll(".chapter-block");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const quizContainer = document.getElementById("quizContainer");
  const videoContainer = document.querySelector(".video-container");

  const STORAGE_KEY = "courseProgress_v3"; // increment to reset older cache

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

    // Lesson click — play video or load quiz
    lesson.addEventListener("click", () => {
      if (lesson.classList.contains("locked")) return;

      currentLessonIndex = index;

      // Quiz lesson
      if (lesson.classList.contains("quiz-item")) {
        showQuiz(lesson);
        return;
      }

      // Video lesson
      const videoSrc = lesson.getAttribute("data-video");
      if (!videoSrc) return;

      quizContainer.classList.add("d-none");
      videoContainer.classList.remove("d-none");

      const source = video.querySelector("source");
      if (!source.src.endsWith(videoSrc)) {
        source.src = `/static/videos/${videoSrc}`;
        video.load();
      }
      video.play();
    });
  });

  // === UNLOCK FIRST AVAILABLE LESSON ===
  const firstIncomplete = Array.from(lessons).find(
    (_, i) => !savedProgress.includes(i)
  ) || lessons[0];
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

  updateProgress(); // initial render

  // === VIDEO END HANDLER ===
// === VIDEO END HANDLER ===
video.addEventListener("ended", () => {
  const lesson = lessons[currentLessonIndex];
  const checkbox = lesson.querySelector(".lesson-check");

  if (!lesson.classList.contains("completed")) {
    markLessonComplete(currentLessonIndex);
  }

  // Find the next lesson
  const nextLesson = lessons[currentLessonIndex + 1];

  if (nextLesson) {
    // Unlock next lesson
    nextLesson.classList.remove("locked");
    nextLesson.querySelector(".lesson-check").disabled = false;

    const nextParent = nextLesson.closest(".chapter-block");
    if (nextParent) nextParent.classList.remove("locked");

    // ✅ If next is quiz (end of module) → show quiz immediately
    if (nextLesson.classList.contains("quiz-item")) {
      showQuiz(nextLesson);
      return; // prevent auto-playing next video
    }
  }

  // ✅ Otherwise, just continue normally
  checkModuleCompletion();
});

  // === FUNCTION: MARK LESSON COMPLETE ===
  function markLessonComplete(index) {
    const lesson = lessons[index];
    const checkbox = lesson.querySelector(".lesson-check");

    lesson.classList.add("completed");
    checkbox.checked = true;
    checkbox.disabled = false;

    if (!savedProgress.includes(index)) {
      savedProgress.push(index);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProgress));
    }

    updateProgress();
  }

  // === FUNCTION: CHECK MODULE COMPLETION ===
 function checkModuleCompletion() {
  chapters.forEach((chapter, i) => {
    const lessonsInChapter = chapter.querySelectorAll(".lesson-item");
    const allCompleted = Array.from(lessonsInChapter).every(l =>
      l.classList.contains("completed")
    );

    // Only unlock next chapter after quiz is completed
    const quizItem = document.querySelector(`.quiz-item[data-quiz="${i + 1}"]`);
    const quizCompleted = quizItem && quizItem.classList.contains("completed");

    const nextChapter = chapters[i + 1];
    if (allCompleted && quizCompleted && nextChapter) {
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

  checkModuleCompletion();

  // === QUIZ LOGIC ===
  function showQuiz(quizLesson) {
    // Hide video
    videoContainer.classList.add("d-none");
    // Show quiz container
    quizContainer.classList.remove("d-none");

    const quizTitle = document.getElementById("quizTitle");
    const quizQuestion = document.getElementById("quizQuestion");
    const quizOptions = document.getElementById("quizOptions");
    const quizProgress = document.getElementById("quizProgress");

    // Dummy quiz questions (replace with Django data later)
    const quizData = [
      {
        question: "What does SQL stand for?",
        options: ["Structured Query Language", "Simple Query Logic", "Strong Query Loop"],
        correct: 0,
      },
      {
        question: "Which is a database type?",
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
      if (selected === q.correct) {
        alert("✅ Correct!");
      } else {
        alert("❌ Incorrect!");
      }

      currentQ++;
      if (currentQ < quizData.length) {
        loadQuestion();
      } else {
        alert("🎉 Quiz completed!");
        markLessonComplete(currentLessonIndex + 1); // mark quiz as complete
        quizContainer.classList.add("d-none");
        videoContainer.classList.remove("d-none");
        updateProgress();
        checkModuleCompletion();
      }
    }

    loadQuestion();
  }
});
