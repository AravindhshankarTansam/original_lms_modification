document.addEventListener('DOMContentLoaded', function() {
  const gridBtn = document.querySelector('#gridViewBtn');
  const listBtn = document.querySelector('#listViewBtn');
  const cardsGrid = document.querySelector('#cardsGrid');

  gridBtn.addEventListener('click', function() {
    cardsGrid.classList.remove('list-view');
    cardsGrid.classList.add('row');
  });

  listBtn.addEventListener('click', function() {
    cardsGrid.classList.remove('row');
    cardsGrid.classList.add('list-view');
  });

  // Handle enroll button clicks
  const enrollButtons = document.querySelectorAll('.btn-enroll');

  enrollButtons.forEach(button => {
    button.addEventListener('click', function() {
      // If already enrolled (button text is "Start"), do nothing
      if (button.textContent.trim().startsWith('Start')) {
        return;
      }

      // Disable button during "enrolling"
      button.disabled = true;

      // Optionally, show loading state or change text temporarily
      button.textContent = 'Enrolling...';

      setTimeout(() => {
        // Show success message
        alert('You are enrolled successfully');

        // Change button text to "Start ▶"
        button.innerHTML = 'Start <div class="plus">▶</div>';

        // Enable button again
        button.disabled = false;
      }, 550); // 550ms delay
    });
  });
});
