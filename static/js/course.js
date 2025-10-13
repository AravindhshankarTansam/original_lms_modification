// Example for toggling grid/list view buttons (no real effect here, for demo only)

document.addEventListener('DOMContentLoaded', function() {
  const gridBtn = document.getElementById('gridViewBtn');
  const listBtn = document.getElementById('listViewBtn');
  const cardsGrid = document.getElementById('cardsGrid');

  gridBtn.addEventListener('click', function() {
    cardsGrid.classList.remove('list-view');
    cardsGrid.classList.add('row');
  });

  listBtn.addEventListener('click', function() {
    cardsGrid.classList.remove('row');
    cardsGrid.classList.add('list-view');
  });
});
    