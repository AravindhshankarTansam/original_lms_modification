document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#moduleForm');
    const moduleTitleInput = form.querySelector('#moduleTitle');
    const topicTitleInput = form.querySelector('#topicTitle');
    const uploadFileType = form.querySelector('#uploadFileType');
    const uploadFile = form.querySelector('#uploadFile');
  
    const uploadDescriptionEditor = new Quill('#uploadDescriptionEditor', {
      theme: 'snow',
    });
  
    const questionTypeSelect = form.querySelector('#questionTypeSelect');
    const questionFieldset = form.querySelector('#questionFieldset');
    const questionText = form.querySelector('#questionText');
    const optionsFieldset = form.querySelector('#optionsFieldset');
    const optionInputs = [
      form.querySelector('#option1Text'),
      form.querySelector('#option2Text'),
      form.querySelector('#option3Text'),
      form.querySelector('#option4Text'),
    ];
  
    const questionDescriptionFieldset = form.querySelector('#questionDescriptionFieldset');
    const questionDescriptionEditor = new Quill('#questionDescriptionEditor', {
      theme: 'snow',
    });
  
    const difficultyFieldset = form.querySelector('#difficultyFieldset');
    const questionDifficulty = form.querySelector('#questionDifficulty');
  
    const existingFileNameP = form.querySelector('#existingFileName');
  
    const savedModulesDropdown = document.querySelector('#savedModulesDropdown');
    const savedTopicsDropdown = document.querySelector('#savedTopicsDropdown');
    const savedDifficultyDropdown = document.querySelector('#savedDifficultyDropdown');
    const clearSavedBtn = document.querySelector('#clearSavedBtn');
  
    // Store modules in localStorage under 'lmsModules'
    let lmsModules = JSON.parse(localStorage.getItem('lmsModules')) || [];
  
    // Initialize UI
    function resetQuestionFields() {
      questionText.value = '';
      optionInputs.forEach(input => (input.value = ''));
      form.querySelectorAll('input[type="checkbox"]').forEach(box => (box.checked = false));
      questionDescriptionEditor.setText('');
    }
  
    // Show/hide question and difficulty fields based on question type
    questionTypeSelect.addEventListener('change', () => {
      if (!questionTypeSelect.value) {
        questionFieldset.style.display = 'none';
        optionsFieldset.style.display = 'none';
        questionDescriptionFieldset.style.display = 'none';
        difficultyFieldset.style.display = 'none';
        return;
      }
  
      questionFieldset.style.display = 'block';
      questionDescriptionFieldset.style.display = 'block';
      difficultyFieldset.style.display = 'block';
      questionDifficulty.value = ''; // Reset difficulty selection
  
      if (questionTypeSelect.value === 'true_false') {
        // Hide options for true/false, optionsFieldset hidden
        optionsFieldset.style.display = 'none';
      } else {
        optionsFieldset.style.display = 'block';
      }
  
      resetQuestionFields();
    });
  
    // Update accepted file types based on uploadFileType
    uploadFileType.addEventListener('change', () => {
      existingFileNameP.textContent = '';
      uploadFile.value = '';
      const type = uploadFileType.value;
      if (type === 'video') {
        uploadFile.accept = 'video/*';
      } else if (type === 'ppt') {
        uploadFile.accept = 'application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation';
      } else if (type === 'pdf') {
        uploadFile.accept = 'application/pdf';
      } else {
        uploadFile.accept = '';
      }
    });
  
    // Show file name when user selects a file
    uploadFile.addEventListener('change', () => {
      if (uploadFile.files.length > 0) {
        existingFileNameP.textContent = `Selected file: ${uploadFile.files[0].name}`;
      } else {
        existingFileNameP.textContent = '';
      }
    });
  
    // Save module data to localStorage
    form.addEventListener('submit', e => {
      e.preventDefault();
  
      // Validation
      if (!moduleTitleInput.value.trim() || !topicTitleInput.value.trim() || !uploadFileType.value || !questionTypeSelect.value || !questionDifficulty.value) {
        alert('Please fill out all required fields including difficulty.');
        return;
      }
  
      // Check at least one correct answer for MCQs
      if (questionTypeSelect.value === 'multiple_choice') {
        const checkedBoxes = Array.from(form.querySelectorAll('input[type="checkbox"]')).filter(cb => cb.checked);
        if (checkedBoxes.length === 0) {
          alert('Please select at least one correct answer.');
          return;
        }
      }
  
      const moduleTitle = moduleTitleInput.value.trim();
      const topicTitle = topicTitleInput.value.trim();
      const uploadType = uploadFileType.value;
  
      // Use uploaded file name or empty string
      let fileName = '';
      if (uploadFile.files.length > 0) {
        fileName = uploadFile.files[0].name;
      }
  
      const uploadDescription = uploadDescriptionEditor.root.innerHTML.trim();
      const questionType = questionTypeSelect.value;
      const difficulty = questionDifficulty.value;
  
      const question = questionText.value.trim();
      const questionDescription = questionDescriptionEditor.root.innerHTML.trim();
  
      // Options
      const options = optionInputs.map(input => input.value.trim());
  
      // Correct answers (for MCQ only)
      const correctAnswers = [];
      if (questionType === 'multiple_choice') {
        form.querySelectorAll('input[type="checkbox"]').forEach((checkbox, idx) => {
          if (checkbox.checked) {
            correctAnswers.push(options[idx]);
          }
        });
      }
  
      // Build module object
      // Check if module exists
      let moduleIndex = lmsModules.findIndex(m => m.moduleTitle.toLowerCase() === moduleTitle.toLowerCase());
  
      // If module exists, update it, else create new
      if (moduleIndex === -1) {
        // New module
        lmsModules.push({
          moduleTitle,
          topics: [],
        });
        moduleIndex = lmsModules.length - 1;
      }
  
      // Find topic index inside module
      let topicIndex = lmsModules[moduleIndex].topics.findIndex(t => t.topicTitle.toLowerCase() === topicTitle.toLowerCase());
  
      const topicData = {
        topicTitle,
        uploadType,
        fileName,
        uploadDescription,
        questionType,
        difficulty,
        question,
        options,
        correctAnswers,
        questionDescription,
      };
  
      if (topicIndex === -1) {
        lmsModules[moduleIndex].topics.push(topicData);
      } else {
        lmsModules[moduleIndex].topics[topicIndex] = topicData;
      }
  
      localStorage.setItem('lmsModules', JSON.stringify(lmsModules));
  
      alert(`Module "${moduleTitle}" with topic "${topicTitle}" saved successfully!`);
  
      // Reset form but keep module title for adding more topics
      topicTitleInput.value = '';
      uploadFileType.value = '';
      uploadFile.value = '';
      existingFileNameP.textContent = '';
      uploadDescriptionEditor.setText('');
      questionTypeSelect.value = '';
      questionDifficulty.value = '';
      questionFieldset.style.display = 'none';
      optionsFieldset.style.display = 'none';
      questionDescriptionFieldset.style.display = 'none';
      difficultyFieldset.style.display = 'none';
      resetQuestionFields();
  
      populateSavedModules();
    });
  
    // Populate saved modules dropdown
    function populateSavedModules() {
      savedModulesDropdown.innerHTML = '<option value="" disabled selected>Saved Modules</option>';
  
      if (lmsModules.length === 0) {
        savedModulesDropdown.disabled = true;
        savedTopicsDropdown.style.display = 'none';
        savedTopicsDropdown.innerHTML = '';
        return;
      }
  
      savedModulesDropdown.disabled = false;
  
      lmsModules.forEach((module, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = module.moduleTitle;
        savedModulesDropdown.appendChild(opt);
      });
  
      savedTopicsDropdown.style.display = 'none';
      savedTopicsDropdown.innerHTML = '';
    }
  
    // Populate topics dropdown based on selected module and difficulty filter
    function populateTopics(moduleIndex, difficultyFilter = '') {
      savedTopicsDropdown.innerHTML = '<option value="" disabled selected>Topics</option>';
      if (moduleIndex === '' || moduleIndex === null) {
        savedTopicsDropdown.style.display = 'none';
        return;
      }
      const module = lmsModules[moduleIndex];
      if (!module || module.topics.length === 0) {
        savedTopicsDropdown.style.display = 'none';
        return;
      }
  
      // Filter topics by difficulty if filter applied
      const filteredTopics = difficultyFilter
        ? module.topics.filter(t => t.difficulty === difficultyFilter)
        : module.topics;
  
      if (filteredTopics.length === 0) {
        savedTopicsDropdown.style.display = 'none';
        return;
      }
  
      filteredTopics.forEach((topic, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = `${topic.topicTitle} [${topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1)}]`;
        savedTopicsDropdown.appendChild(opt);
      });
  
      savedTopicsDropdown.style.display = 'inline-block';
    }
  
    // When a saved module is selected
    savedModulesDropdown.addEventListener('change', e => {
      const moduleIndex = e.target.value;
      const difficultyFilter = savedDifficultyDropdown.value;
      populateTopics(moduleIndex, difficultyFilter);
    });
  
    // When difficulty filter changes for saved topics
    savedDifficultyDropdown.addEventListener('change', () => {
      const moduleIndex = savedModulesDropdown.value;
      const difficultyFilter = savedDifficultyDropdown.value;
      populateTopics(moduleIndex, difficultyFilter);
    });
  
    // When a topic is selected, populate form for editing
    savedTopicsDropdown.addEventListener('change', e => {
      const topicIndex = e.target.value;
      const moduleIndex = savedModulesDropdown.value;
  
      if (!moduleIndex || !topicIndex) return;
  
      const topic = lmsModules[moduleIndex].topics[topicIndex];
  
      // Fill form fields with topic data
      moduleTitleInput.value = lmsModules[moduleIndex].moduleTitle;
      topicTitleInput.value = topic.topicTitle;
      uploadFileType.value = topic.uploadType;
  
      // Update file accept based on upload type
      uploadFileType.dispatchEvent(new Event('change'));
  
      // Display existing file name
      existingFileNameP.textContent = topic.fileName ? `Saved file: ${topic.fileName}` : '';
  
      uploadDescriptionEditor.root.innerHTML = topic.uploadDescription || '';
  
      questionTypeSelect.value = topic.questionType;
      questionTypeSelect.dispatchEvent(new Event('change')); // To show/hide fields based on type
  
      questionDifficulty.value = topic.difficulty;
  
      questionText.value = topic.question;
  
      if (topic.questionType === 'multiple_choice') {
        optionsFieldset.style.display = 'block';
        optionInputs.forEach((input, idx) => (input.value = topic.options[idx] || ''));
        form.querySelectorAll('input[type="checkbox"]').forEach((cb, idx) => {
          cb.checked = topic.correctAnswers.includes(topic.options[idx]);
        });
      } else {
        optionsFieldset.style.display = 'none';
      }
  
      questionDescriptionEditor.root.innerHTML = topic.questionDescription || '';
    });
  
    // Clear saved data from localStorage and UI
    clearSavedBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all saved modules? This action cannot be undone.')) {
        localStorage.removeItem('lmsModules');
        lmsModules = [];
        savedModulesDropdown.innerHTML = '<option value="" disabled selected>Saved Modules</option>';
        savedModulesDropdown.disabled = true;
        savedTopicsDropdown.style.display = 'none';
        savedTopicsDropdown.innerHTML = '';
        savedDifficultyDropdown.value = '';
        alert('All saved data cleared.');
      }
    });
  
    // Initialize dropdowns on page load
    populateSavedModules();
  });