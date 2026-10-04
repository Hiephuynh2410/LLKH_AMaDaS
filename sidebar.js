'use strict';
(() => {
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('mainContent');
  const toggle = document.getElementById('sidebarToggle');
  const close = document.getElementById('sidebarClose');
  const backdrop = document.getElementById('sidebarBackdrop');
  const mobile = window.matchMedia('(max-width: 1100px)');
  if (!sidebar || !main || !toggle || !close || !backdrop) return;
  let desktopCollapsed = false;
  function update() {
    const drawerOpen = mobile.matches && body.classList.contains('sidebar-open');
    const expanded = mobile.matches ? drawerOpen : !desktopCollapsed;
    body.classList.toggle('sidebar-collapsed', !mobile.matches && desktopCollapsed);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? 'Thu gọn menu' : 'Mở menu');
    sidebar.inert = !expanded;
    sidebar.setAttribute('aria-hidden', String(!expanded));
    main.inert = drawerOpen;
    if (drawerOpen) {
      sidebar.setAttribute('role', 'dialog');
      sidebar.setAttribute('aria-modal', 'true');
    } else {
      sidebar.removeAttribute('role');
      sidebar.removeAttribute('aria-modal');
    }
  }
  function closeDrawer(restoreFocus = true) {
    body.classList.remove('sidebar-open');
    update();
    if (restoreFocus) toggle.focus({preventScroll:true});
  }
  toggle.addEventListener('click', () => {
    if (mobile.matches) {
      body.classList.toggle('sidebar-open');
      update();
      if (body.classList.contains('sidebar-open')) close.focus({preventScroll:true});
    } else {
      desktopCollapsed = !desktopCollapsed;
      update();
    }
  });
  close.addEventListener('click', () => closeDrawer());
  backdrop.addEventListener('click', () => closeDrawer());
  sidebar.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!mobile.matches || !link) return;
    closeDrawer(false);
    toggle.focus({preventScroll:true});
  });
  document.addEventListener('keydown', event => {
    if (!mobile.matches || !body.classList.contains('sidebar-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDrawer();
    } else if (event.key === 'Tab') {
      const items = [...sidebar.querySelectorAll('a[href],button:not([disabled]),[tabindex="0"]')]
        .filter(element => element.getClientRects().length > 0);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });
  mobile.addEventListener('change', () => {
    const focusWasInSidebar = sidebar.contains(document.activeElement);
    body.classList.remove('sidebar-open');
    update();
    if (focusWasInSidebar && sidebar.inert) toggle.focus({preventScroll:true});
  });
  update();
})();
