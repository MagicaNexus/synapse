import { getStore } from '$pages/store';

// Disable pressing enter to send a form
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
  }
});

window.Webflow ||= [];
window.Webflow.push(() => {
  console.log('Webflow loaded');
  console.log('Path:', window.location.pathname);
  switch (window.location.pathname) {
    case '/':
      console.log('Home page');
      break;
    case '/nos-centres':
      getStore();
      break;
  }
});
