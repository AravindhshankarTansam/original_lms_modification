document.addEventListener('DOMContentLoaded', function() {
  const isMobile = window.innerWidth < 992;

  if (isMobile) {
    // Toggle main dropdown (Explore)
    document.querySelectorAll('.explore-dropdown > .dropdown-toggle').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const dropdownMenu = btn.nextElementSibling;

        // Toggle current main dropdown
        dropdownMenu.classList.toggle('show');

        // Close other main dropdowns (if any)
        document.querySelectorAll('.explore-dropdown .dropdown-menu').forEach(menu => {
          if(menu !== dropdownMenu) menu.classList.remove('show');
        });
      });
    });

    // Toggle submenu (accordion style)
    document.querySelectorAll('.dropdown-submenu > a').forEach(function(element) {
      element.addEventListener('click', function(e) {
        e.preventDefault();
        const submenu = element.nextElementSibling;

        // Close other open submenus
        document.querySelectorAll('.dropdown-submenu .dropdown-menu.show').forEach(menu => {
          if(menu !== submenu) menu.classList.remove('show');
        });

        // Toggle clicked submenu
        submenu.classList.toggle('show');
      });
    });

    // Close dropdowns if click outside
    window.addEventListener('click', function(e){
      if(!e.target.closest('.explore-dropdown')) {
        document.querySelectorAll('.explore-dropdown .dropdown-menu.show').forEach(menu => menu.classList.remove('show'));
      }
    });
  }
});
