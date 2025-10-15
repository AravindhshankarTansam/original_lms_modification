// ============================
// COURSE FORM LOGIC
// ============================
const modulesContainer = document.querySelector("#modulesContainer");
const addModuleBtn = document.querySelector("#addModuleBtn");
const saveBtn = document.querySelector("#saveCourseBtn");
const courseImageInput = document.querySelector("#courseImage");
const imagePreview = document.querySelector("#imagePreview");
const existingImageLink = document.querySelector("#existingImageLink");
const form = document.querySelector("#courseForm");

// Initialize Quill editors
const courseDescriptionEditor = new Quill("#courseDescriptionEditor", { theme: "snow" });
const overviewEditor = new Quill("#overviewEditor", { theme: "snow" });
const requirementsEditor = new Quill("#requirementsEditor", { theme: "snow" });

// ---------------- LOAD COURSES JSON ----------------
let courses = [];
try {
  courses = JSON.parse(document.querySelector("#courses-data").textContent.trim() || "[]");
} catch (e) {
  console.error("Invalid courses-data JSON", e);
}

// ---------------- IMAGE PREVIEW ----------------
courseImageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      imagePreview.src = reader.result;
      imagePreview.classList.remove("d-none");
      existingImageLink.innerHTML = "";
    };
    reader.readAsDataURL(file);
  }
});

// ---------------- RENUMBERING ----------------
function renumberModules() {
  modulesContainer.querySelectorAll(".border.rounded.p-3.mb-3.bg-light").forEach((modDiv, idx) => {
    modDiv.querySelector("h5.fw-bold").textContent = `Module ${idx + 1}`;
    const chaptersContainer = modDiv.querySelector(".chaptersContainer");
    renumberChapters(chaptersContainer);
    const questionsContainer = modDiv.querySelector(".questionsContainer");
    renumberQuestions(questionsContainer);
  });
}

function renumberChapters(chaptersContainer) {
  chaptersContainer.querySelectorAll(".border.p-3.mb-2.rounded.bg-white").forEach((chDiv, idx) => {
    chDiv.querySelector("h6.fw-bold").textContent = `Chapter ${idx + 1}`;
  });
}

function renumberQuestions(questionsContainer) {
  questionsContainer.querySelectorAll(".border.p-3.mb-2.rounded.bg-white").forEach((qDiv, idx) => {
    qDiv.querySelector("h6.fw-bold").textContent = `Question ${idx + 1}`;
  });
}

// ---------------- MODULE / CHAPTER / QUESTION ----------------
function addModule(existing = null) {
  const moduleDiv = document.createElement("div");
  moduleDiv.className = "border rounded p-3 mb-3 bg-light";
  moduleDiv.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="fw-bold">Module 0</h5>
        <button type="button" class="btn btn-sm btn-danger removeModuleBtn">Remove Module</button>
    </div>
    <div class="mb-3">
        <label class="form-label fw-semibold">Module Title</label>
        <input type="text" class="form-control moduleTitle" value="${existing?.title || ""}" required>
    </div>
    <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center">
            <label class="form-label fw-semibold">Chapters</label>
            <button type="button" class="btn btn-outline-primary btn-sm addChapterBtn">+ Add Chapter</button>
        </div>
        <div class="chaptersContainer"></div>
    </div>
    <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center">
            <label class="form-label fw-semibold">Questions</label>
            <button type="button" class="btn btn-outline-secondary btn-sm addQuestionBtn">+ Add Question</button>
        </div>
        <div class="questionsContainer"></div>
    </div>
  `;
  modulesContainer.appendChild(moduleDiv);

  const chaptersContainer = moduleDiv.querySelector(".chaptersContainer");
  const questionsContainer = moduleDiv.querySelector(".questionsContainer");

  moduleDiv.querySelector(".removeModuleBtn").addEventListener("click", () => {
    moduleDiv.remove();
    renumberModules();
  });

  moduleDiv.querySelector(".addChapterBtn").addEventListener("click", () => {
    addChapter(chaptersContainer);
    renumberModules();
  });

  moduleDiv.querySelector(".addQuestionBtn").addEventListener("click", () => {
    addQuestion(questionsContainer);
    renumberModules();
  });

  if (existing?.chapters?.length) existing.chapters.forEach((ch) => addChapter(chaptersContainer, ch));
  else addChapter(chaptersContainer);

  if (existing?.questions?.length) existing.questions.forEach((q) => addQuestion(questionsContainer, q));
  else addQuestion(questionsContainer);

  renumberModules();
}

function addChapter(container, existing = null) {
  const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
  const chDiv = document.createElement("div");
  chDiv.className = "border p-3 mb-2 rounded bg-white";
  chDiv.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="fw-bold">Chapter 0</h6>
        <button type="button" class="btn btn-sm btn-danger removeChapterBtn">Remove</button>
    </div>
    <div class="mb-2">
        <label class="form-label">Chapter Title</label>
        <input type="text" class="form-control chapterTitle" value="${existing?.title || ""}" required>
    </div>
    <div class="mb-2">
        <label class="form-label">Description</label>
        <div class="chapterEditor quill-editor"></div>
    </div>
    <div class="mb-2">
        <label class="form-label">Study Material</label>
        <select class="form-select materialType">
            <option disabled ${!existing?.type ? "selected" : ""}>Select Type</option>
            <option value="video" ${existing?.type === "video" ? "selected" : ""}>Video</option>
            <option value="pdf" ${existing?.type === "pdf" ? "selected" : ""}>PDF</option>
            <option value="ppt" ${existing?.type === "ppt" ? "selected" : ""}>PPT</option>
        </select>
        <input type="file" class="form-control mt-2 materialFile" name="chapter_file_${uniqueId}" accept=".mp4,.pdf,.ppt,.pptx">
        <div class="existingMaterial mt-1"></div>
    </div>
  `;
  container.appendChild(chDiv);

  chDiv._quillInstance = new Quill(chDiv.querySelector(".chapterEditor"), { theme: "snow" });
  if (existing?.desc) chDiv._quillInstance.root.innerHTML = existing.desc;

  const fileURL = existing?.file_url || existing?.file || existing?.material_url || null;
  if (fileURL) {
    chDiv.querySelector(".existingMaterial").innerHTML = `<a href="${fileURL}" target="_blank">View existing ${existing.type}</a>`;
  }

  chDiv.querySelector(".removeChapterBtn").addEventListener("click", () => {
    chDiv.remove();
    renumberModules();
  });

  renumberModules();
}

function addQuestion(container, existing = null) {
  const qDiv = document.createElement("div");
  qDiv.className = "border p-3 mb-2 rounded bg-white";
  qDiv.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="fw-bold">Question 0</h6>
        <button type="button" class="btn btn-sm btn-danger removeQuestionBtn">Remove</button>
    </div>
    <div class="mb-2">
        <label class="form-label">Question Type</label>
        <select class="form-select questionType">
            <option disabled ${!existing?.type ? "selected" : ""}>Select Type</option>
            <option value="mcq" ${existing?.type === "mcq" ? "selected" : ""}>Multiple Choice</option>
            <option value="truefalse" ${existing?.type === "truefalse" ? "selected" : ""}>True / False</option>
            <option value="short" ${existing?.type === "short" ? "selected" : ""}>Short Answer</option>
        </select>
    </div>
    <div class="questionDetails"></div>
  `;
  container.appendChild(qDiv);

  qDiv.querySelector(".removeQuestionBtn").addEventListener("click", () => {
    qDiv.remove();
    renumberModules();
  });

  const typeSelect = qDiv.querySelector(".questionType");
  const detailsDiv = qDiv.querySelector(".questionDetails");

  const populateDetails = (type, existing = null) => {
    detailsDiv.innerHTML = "";
    if (type === "mcq") {
      detailsDiv.innerHTML = `
          <label class="form-label">Question</label>
          <input type="text" class="form-control mb-2 questionText" value="${existing?.qText || ""}">
          <label>Options</label>
          <input type="text" class="form-control mb-1 option1" placeholder="Option 1" value="${existing?.option1 || ""}">
          <input type="text" class="form-control mb-1 option2" placeholder="Option 2" value="${existing?.option2 || ""}">
          <input type="text" class="form-control mb-1 option3" placeholder="Option 3" value="${existing?.option3 || ""}">
          <input type="text" class="form-control mb-1 option4" placeholder="Option 4" value="${existing?.option4 || ""}">
          <input type="text" class="form-control correctAnswer" placeholder="Correct Answer" value="${existing?.cAns || ""}">
      `;
    } else if (type === "truefalse") {
      detailsDiv.innerHTML = `
          <label class="form-label">Statement</label>
          <input type="text" class="form-control mb-2 questionText" value="${existing?.qText || ""}">
          <select class="form-select correctAnswer">
              <option value="True" ${existing?.cAns === "True" ? "selected" : ""}>True</option>
              <option value="False" ${existing?.cAns === "False" ? "selected" : ""}>False</option>
          </select>
      `;
    } else {
      detailsDiv.innerHTML = `
          <label class="form-label">Question</label>
          <input type="text" class="form-control mb-2 questionText" value="${existing?.qText || ""}">
          <input type="text" class="form-control correctAnswer" placeholder="Expected Answer" value="${existing?.cAns || ""}">
      `;
    }
  };

  typeSelect.addEventListener("change", () => populateDetails(typeSelect.value));
  if (existing?.type) populateDetails(existing.type, existing);

  renumberModules();
}

// ---------------- INITIALIZE ----------------
addModuleBtn.addEventListener("click", () => addModule());

// ---------------- AUTO LOAD COURSE ----------------
const urlParts = window.location.pathname.split("/");
const courseIdFromUrl = urlParts.includes("update") ? urlParts[urlParts.indexOf("update") + 1] : null;

if (courseIdFromUrl && courses.length > 0) {
  const course = courses.find((c) => c.id == courseIdFromUrl);
  if (course) {
    document.querySelector("#courseTitle").value = course.title;
    courseDescriptionEditor.root.innerHTML = course.description || "";
    overviewEditor.root.innerHTML = course.overview || "";
    requirementsEditor.root.innerHTML = course.requirements || "";
    document.querySelector("#courseStatus").checked = course.status === "Active";
    document.querySelector("#courseId").value = course.id;

    if (course.image_url) {
      imagePreview.src = course.image_url;
      imagePreview.classList.remove("d-none");
      existingImageLink.innerHTML = `<a href="${course.image_url}" target="_blank">View existing image</a>`;
    }

    modulesContainer.innerHTML = "";
    if (course.modules?.length) course.modules.forEach((m) => addModule(m));
    else addModule();
    saveBtn.textContent = "Update Course";

    form.action = `/courses/update/${course.id}/`;
  }
} else {
  addModule();
  form.action = "/courses/create/";
}

// ---------------- SAVE / UPDATE ----------------
saveBtn.addEventListener("click", () => {
  const modulesData = [];
  modulesContainer.querySelectorAll(".border.rounded.p-3.mb-3.bg-light").forEach((mDiv) => {
    const modTitle = mDiv.querySelector(".moduleTitle").value;
    const chapters = [];
    mDiv.querySelectorAll(".chaptersContainer > .border.p-3.mb-2.rounded.bg-white").forEach((chDiv) => {
      const chTitle = chDiv.querySelector(".chapterTitle").value;
      const desc = chDiv._quillInstance ? chDiv._quillInstance.root.innerHTML : "";
      const type = chDiv.querySelector(".materialType").value || null;
      chapters.push({ title: chTitle, desc, type });
    });

    const questions = [];
    mDiv.querySelectorAll(".questionsContainer > .border.p-3.mb-2.rounded.bg-white").forEach((qDiv) => {
      const type = qDiv.querySelector(".questionType").value;
      const qText = qDiv.querySelector(".questionText")?.value || "";
      const cAns = qDiv.querySelector(".correctAnswer")?.value || "";
      const option1 = qDiv.querySelector(".option1")?.value || "";
      const option2 = qDiv.querySelector(".option2")?.value || "";
      const option3 = qDiv.querySelector(".option3")?.value || "";
      const option4 = qDiv.querySelector(".option4")?.value || "";
      questions.push({ type, qText, cAns, option1, option2, option3, option4 });
    });

    modulesData.push({ title: modTitle, chapters, questions });
  });

  const fd = new FormData(form);
  fd.set("modules_json", JSON.stringify(modulesData));
  fd.set("description", courseDescriptionEditor.root.innerHTML);
  fd.set("overview", overviewEditor.root.innerHTML);
  fd.set("requirements", requirementsEditor.root.innerHTML);
  fd.set("status", document.querySelector("#courseStatus").checked ? "true" : "false");

  fetch(form.action, {
    method: form.method,
    body: fd,
    headers: { "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value },
  })
    .then((res) => {
      if (res.redirected) window.location.href = res.url;
      else return res.text();
    })
    .then((data) => console.log("Course saved", data))
    .catch((err) => console.error(err));
});
