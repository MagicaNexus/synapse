import { getCentre } from '$pages/centre';
import { getStore } from '$pages/store';

// Disable pressing enter to send a form
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
  }
});

const page = document.body.getAttribute('data-script');
switch (page) {
  case 'home':
    break;
  case 'nos-centres':
    //wait for the page to load
    window.addEventListener('load', getStore);
    break;
    getStore(); // Call getStore function here
    break;
  case 'centre':
    window.addEventListener('load', getCentre);
    break;
}
