document.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.getElementById("resetFilters");

  resetBtn.addEventListener("click", () => {
    // Reset all select dropdowns to their first (default) option
    const selects = document.querySelectorAll(".filter-group select");
    selects.forEach(select => {
      select.selectedIndex = 0; // sets it back to the first option
    });

    // Clear search input
    const searchInput = document.querySelector(".search-input");
    if (searchInput) searchInput.value = "";

    console.log("Filters reset!");
  });
});
