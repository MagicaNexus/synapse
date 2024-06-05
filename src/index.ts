document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
  }
});

const page = document.body.getAttribute('data-script');
switch (page) {
  case 'home':
    break;
  case 'centre':
    break;
}
