const modulesContainer = document.querySelector("#modulesContainer");
const addModuleBtn = document.querySelector("#addModuleBtn");
const saveBtn = document.querySelector("#saveCourseBtn");
const courseImageInput = document.querySelector("#courseImage");
const imagePreview = document.querySelector("#imagePreview");
const existingImageLink = document.querySelector("#existingImageLink");
const form = document.querySelector("#courseForm");

// Metadata elements
const totalHoursEl = document.querySelector("#totalHours");
const lecturesCountEl = document.querySelector("#lecturesCount");
const courseLevelEl = document.querySelector("#courseLevel");
const courseBadgeEl = document.querySelector("#courseBadge");
const lastUpdatedEl = document.querySelector("#lastUpdated");
const courseRatingEl = document.querySelector("#courseRating");
const reviewCountEl = document.querySelector("#reviewCount");

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

// ---------------- SELECT2 ----------------
document.addEventListener("DOMContentLoaded", () => {
    if (window.jQuery && $.fn.select2) {
        $('#category').select2({
            placeholder: "Select Category",
            allowClear: true,
            width: '100%'
        });
    }
});

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

function showExistingCourseImage(url) {
    if (!url) return;
    imagePreview.src = url;
    imagePreview.classList.remove("d-none");
    existingImageLink.innerHTML = "";
}

// ---------------- METADATA UPDATES ----------------
function updateCourseMetadata() {
  let totalHours = 0;
  let totalLectures = 0;

  modulesContainer.querySelectorAll(".border.rounded.p-3.mb-3.bg-light").forEach(modDiv => {
    const chapters = modDiv.querySelectorAll(".chaptersContainer > .border.p-3.mb-2.rounded.bg-white");
    totalLectures += chapters.length;

    chapters.forEach(chDiv => {
      const hoursInput = chDiv.querySelector(".chapterHours");
      if (hoursInput) totalHours += parseFloat(hoursInput.value || 0);
    });
  });

  totalHoursEl.textContent = totalHours.toFixed(1);
  lecturesCountEl.textContent = totalLectures;

  updateBadge();
  updateLastUpdated();
}

function updateBadge() {
  const hours = parseFloat(totalHoursEl.textContent);
  const level = courseLevelEl.value;

  if (hours > 10 && level === "Advanced") courseBadgeEl.textContent = "Pro";
  else if (hours > 5) courseBadgeEl.textContent = "Intermediate";
  else courseBadgeEl.textContent = "Beginner";
}

function updateLastUpdated(dateStr = null) {
  if (dateStr) lastUpdatedEl.textContent = dateStr;
  else lastUpdatedEl.textContent = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

function updateRating(reviews = []) {
  if (!reviews.length) return;
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  courseRatingEl.textContent = avgRating.toFixed(1);
  reviewCountEl.textContent = reviews.length;
}

// ---------------- RENUMBER MODULES / CHAPTERS / QUESTIONS ----------------
function renumberModules() {
  modulesContainer.querySelectorAll(".border.rounded.p-3.mb-3.bg-light").forEach((modDiv, idx) => {
    modDiv.querySelector("h5.fw-bold").textContent = `Module ${idx + 1}`;
    renumberChapters(modDiv.querySelector(".chaptersContainer"));
    renumberQuestions(modDiv.querySelector(".questionsContainer"));
  });
  updateCourseMetadata();
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

// ---------------- MODULE / CHAPTER / QUESTION FUNCTIONS ----------------
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

  if (existing?.chapters?.length) existing.chapters.forEach(ch => addChapter(chaptersContainer, ch));
  else addChapter(chaptersContainer);

  if (existing?.questions?.length) existing.questions.forEach(q => addQuestion(questionsContainer, q));
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
            <label class="form-label">Duration (hrs)</label>
            <input type="number" step="0.1" min="0" class="form-control chapterHours" value="${existing?.hours || 1}">
        </div>
        <div class="mb-2">
            <label class="form-label">Description</label>
            <div class="chapterEditor quill-editor"></div>
        </div>
        <div class="mb-2">
            <label class="form-label">Study Material</label>
            <select class="form-select materialType">
                <option value="" disabled ${!existing?.type ? "selected" : ""}>Select Type</option>
                <option value="video" ${existing?.type === "video" ? "selected" : ""}>Video</option>
                <option value="pdf" ${existing?.type === "pdf" ? "selected" : ""}>PDF</option>
                <option value="ppt" ${existing?.type === "ppt" ? "selected" : ""}>PPT</option>
            </select>
            <input type="file" class="form-control mt-2 materialFile" name="chapter_file_${uniqueId}" accept=".mp4,.pdf,.ppt,.pptx,.jpg,.png,.jpeg">
            <div class="existingMaterial mt-1"></div>
        </div>
    `;
    container.appendChild(chDiv);

    // ------------------- Quill editor -------------------
    chDiv._quillInstance = new Quill(chDiv.querySelector(".chapterEditor"), { theme: "snow" });
    if (existing?.desc) chDiv._quillInstance.root.innerHTML = existing.desc;

    // ------------------- Update metadata on hours change -------------------
    const hoursInput = chDiv.querySelector(".chapterHours");
    hoursInput.addEventListener("input", updateCourseMetadata);

    // ------------------- File preview logic -------------------
    const previewDiv = chDiv.querySelector(".existingMaterial");
    const fileInput = chDiv.querySelector(".materialFile");

    // Helper to show file preview
    function showExistingFile(previewDiv, fileUrl, type) {
        previewDiv.innerHTML = "";
        if (!fileUrl) return;

        if (type === "video") {
            const video = document.createElement("video");
            video.src = fileUrl;
            video.controls = true;
            video.style.maxWidth = "300px";
            previewDiv.appendChild(video);
        } else if (type === "pdf") {
            const link = document.createElement("a");
            link.href = fileUrl;
            link.target = "_blank";
            link.innerHTML = `<i class="bi bi-file-earmark-pdf-fill text-danger fs-2"></i> ${fileUrl.split("/").pop()}`;
            link.classList.add("d-flex", "align-items-center", "gap-2");
            previewDiv.appendChild(link);
        } else if (type === "ppt" || type === "pptx") {
            const link = document.createElement("a");
            link.href = fileUrl;
            link.target = "_blank";
            link.innerHTML = `<i class="bi bi-file-earmark-ppt-fill text-warning fs-2"></i> ${fileUrl.split("/").pop()}`;
            link.classList.add("d-flex", "align-items-center", "gap-2");
            previewDiv.appendChild(link);
        } else if (type === "image") {
            const img = document.createElement("img");
            img.src = fileUrl;
            img.style.maxWidth = "300px";
            img.classList.add("img-thumbnail");
            previewDiv.appendChild(img);
        } else {
            const div = document.createElement("div");
            div.textContent = fileUrl.split("/").pop();
            previewDiv.appendChild(div);
        }
    }

    // Show existing file if present
    const existingLink = existing?.file_url || "";
    const type = existing?.type || "";
    if (existingLink && type) {
        showExistingFile(previewDiv, existingLink, type);
    }

    // Update preview on new file selection
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;

        const fileType = file.type.startsWith("video/") ? "video"
                        : file.type === "application/pdf" ? "pdf"
                        : file.type.includes("presentation") ? "ppt"
                        : file.type.startsWith("image/") ? "image"
                        : "other";

        showExistingFile(previewDiv, URL.createObjectURL(file), fileType);
    });

    // ------------------- Remove chapter -------------------
    chDiv.querySelector(".removeChapterBtn").addEventListener("click", () => {
        chDiv.remove();
        renumberModules();
    });

    renumberModules();
}

// ---------------- QUESTION LOGIC ----------------
function addQuestion(container, existing = null) {
  // same as your current logic
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

// AUTO LOAD COURSE
const urlParts = window.location.pathname.split("/");
const courseIdFromUrl = urlParts.includes("update") ? urlParts[urlParts.indexOf("update") + 1] : null;

if (courseIdFromUrl && courses.length > 0) {
  const course = courses.find(c => c.id == courseIdFromUrl);
  if (course) {
    document.querySelector("#courseTitle").value = course.title;
    courseDescriptionEditor.root.innerHTML = course.description || "";
    overviewEditor.root.innerHTML = course.overview || "";
    requirementsEditor.root.innerHTML = course.requirements || "";
    document.querySelector("#courseStatus").checked = course.status === "Active";
    document.querySelector("#courseId").value = course.id;
    if (course.image_url) showExistingCourseImage(course.image_url);
    modulesContainer.innerHTML = "";
    if (course.modules?.length) course.modules.forEach(m => addModule(m));
    else addModule();
    saveBtn.textContent = "Update Course";
    form.action = `/courses/update/${course.id}/`;

    // Update metadata
    if (course.total_hours) totalHoursEl.textContent = course.total_hours;
    if (course.lectures_count) lecturesCountEl.textContent = course.lectures_count;
    if (course.level) courseLevelEl.value = course.level;
    if (course.badge) courseBadgeEl.textContent = course.badge;
    if (course.last_updated) lastUpdatedEl.textContent = course.last_updated;
    if (course.reviews) updateRating(course.reviews);
  }
} else {
  addModule();
  form.action = "/courses/create/";
}

// SAVE / UPDATE COURSE FORM
saveBtn.addEventListener("click", () => {
  const modulesData = [];
  const fd = new FormData(form);

  modulesContainer.querySelectorAll(".border.rounded.p-3.mb-3.bg-light").forEach((mDiv, mIdx) => {
    const modTitle = mDiv.querySelector(".moduleTitle").value;
    const chapters = [];
    mDiv.querySelectorAll(".chaptersContainer > .border.p-3.mb-2.rounded.bg-white").forEach((chDiv, cIdx) => {
      const chTitle = chDiv.querySelector(".chapterTitle").value;
      const desc = chDiv._quillInstance ? chDiv._quillInstance.root.innerHTML : "";
      const type = chDiv.querySelector(".materialType").value || "";
      const hours = parseFloat(chDiv.querySelector(".chapterHours")?.value || 0);
      const existingLink = chDiv.querySelector(".existingMaterial a")?.href || "";

      const fileInput = chDiv.querySelector(".materialFile");
      if (fileInput && fileInput.files && fileInput.files[0]) {
        fd.append(`material_${mIdx}_${cIdx}`, fileInput.files[0]);
        chapters.push({ title: chTitle, desc, type, hours, file_url: existingLink });
      } else {
        chapters.push({ title: chTitle, desc, type, hours, file_url: existingLink });
      }
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

  fd.set("modules_json", JSON.stringify(modulesData));
  fd.set("description", courseDescriptionEditor.root.innerHTML);
  fd.set("overview", overviewEditor.root.innerHTML);
  fd.set("requirements", requirementsEditor.root.innerHTML);
  fd.set("status", document.querySelector("#courseStatus").checked ? "true" : "false");

  // Update metadata in FormData
  fd.set("total_hours", totalHoursEl.textContent);
  fd.set("lectures_count", lecturesCountEl.textContent);
  fd.set("level", courseLevelEl.value);
  fd.set("badge", courseBadgeEl.textContent);
  fd.set("last_updated", lastUpdatedEl.textContent);

  fetch(form.action, {
    method: form.method,
    body: fd,
    headers: { "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value },
  })
    .then(res => { if (res.redirected) window.location.href = res.url; else return res.text(); })
    .catch(err => console.error(err));
});

// ---------------- DOWNLOAD COURSE AS PDF ----------------
// (kept unchanged — omitted here for brevity if you prefer, but in your file leave as-is)
const downloadBtn = document.querySelector("#downloadCourseBtn");
downloadBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 40;
  let y = 50;

  const title = document.querySelector("#courseTitle").value;
  const courseImg = imagePreview.src;
  const overview = overviewEditor.root.innerText.trim();
  const requirements = requirementsEditor.root.innerText.trim();

  const toc = [];
  const addNewLine = (lines = 1) => {
    y += 15 * lines;
    if (y > 750) { 
      pdf.addPage(); 
      y = 50; 
    }
  };

  // ======================
  // 1. Title Page
  // ======================
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.text(title, pageWidth / 2, y, { align: "center" });
  addNewLine(3);

  if (courseImg) {
    try {
      const imgProps = pdf.getImageProperties(courseImg);
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      pdf.addImage(courseImg, 'PNG', margin, y, imgWidth, imgHeight);
      y += imgHeight + 20;
    } catch (e) {
      console.warn("Error adding image to PDF", e);
    }
  }

  if (overview) {
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Overview:", margin, y);
    addNewLine(2);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(overview, margin, y, { maxWidth: pageWidth - margin * 2 });
    addNewLine(overview.split("\n").length + 1);
  }

  if (requirements) {
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Requirements:", margin, y);
    addNewLine(2);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(requirements, margin, y, { maxWidth: pageWidth - margin * 2 });
    addNewLine(requirements.split("\n").length + 1);
  }

  // ======================
  // 2. Reserve TOC page
  // ======================
  pdf.addPage(); // page 2 will be TOC
  const tocPageNumber = pdf.getCurrentPageInfo().pageNumber;

  // ======================
  // 3. Modules and Content
  // ======================
  modulesContainer.querySelectorAll(".border.rounded.p-3.mb-3.bg-light").forEach((modDiv, modIdx) => {
    pdf.addPage(); // start a new page for each module
    y = 50;
    const modTitle = modDiv.querySelector(".moduleTitle").value;
    const modulePage = pdf.getCurrentPageInfo().pageNumber;

    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Module ${modIdx + 1}: ${modTitle}`, margin, y);
    addNewLine(2);

    toc.push({ title: `Module ${modIdx + 1}: ${modTitle}`, page: modulePage });

    // Chapters
    const chapters = modDiv.querySelectorAll(".chaptersContainer > .border.p-3.mb-2.rounded.bg-white");
    chapters.forEach((chDiv, chIdx) => {
        const chTitle = chDiv.querySelector(".chapterTitle").value;
        const desc = chDiv._quillInstance ? chDiv._quillInstance.root.innerText : "";
        const type = chDiv.querySelector(".materialType").value;

        // DB path stored in the anchor href
        const dbPath = chDiv.querySelector(".existingMaterial a")?.getAttribute("href") || "";

        const chapterPage = pdf.getCurrentPageInfo().pageNumber;

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(`Chapter ${chIdx + 1}: ${chTitle}`, margin + 20, y);
        addNewLine(1);

        toc.push({ title: `  Chapter ${chIdx + 1}: ${chTitle}`, page: chapterPage });

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");

        if (type.toLowerCase() === "video") {
          pdf.text(`Video`, margin + 30, y);
          addNewLine(1);

          
          if (dbPath) {
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 255);
            pdf.text(`DB Path: ${dbPath}`, margin + 30, y);
            pdf.setTextColor(0, 0, 0);
            addNewLine(2);
          }
        } else {
          pdf.text(desc, margin + 30, y, { maxWidth: pageWidth - margin * 2 - 30 });
          addNewLine(3);
        }
      });
    // Questions
    const questions = modDiv.querySelectorAll(".questionsContainer > .border.p-3.mb-2.rounded.bg-white");
    questions.forEach((qDiv, qIdx) => {
      const type = qDiv.querySelector(".questionType").value;
      const qText = qDiv.querySelector(".questionText")?.value || "";
      const cAns = qDiv.querySelector(".correctAnswer")?.value || "";

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Q${qIdx + 1} [${type}]: ${qText}`, margin + 30, y);
      addNewLine(1);
      pdf.text(`Answer: ${cAns}`, margin + 50, y);
      addNewLine(2);
    });
  });

  // ======================
  // 4. Generate TOC on reserved page
  // ======================
  pdf.setPage(tocPageNumber);
  y = 50;
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("Table of Contents", pageWidth / 2, y, { align: "center" });
  addNewLine(3);

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  toc.forEach((entry) => {
    pdf.text(entry.title, margin, y);
    pdf.text(`${entry.page}`, pageWidth - margin, y, { align: "right" });
    addNewLine(1.5);
  });

  pdf.setPage(1); // return to title page
  pdf.save(`${title}.pdf`);
});
// Pre-select categories
const categorySelect = document.querySelector("#courseCategory");
if (categorySelect && course.category_name?.length) {
  Array.from(categorySelect.options).forEach(opt => {
    if (course.category_name.includes(opt.text)) { // opt.text or opt.value depending on select
      opt.selected = true;
    }
  });
}
