import 'xterm/dist/xterm.css';
import 'toastr/toastr.scss';
function loadCss(uri){
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = uri;
  link.type = 'text/css';
  document.body.appendChild(link);
}
window.requestAnimationFrame(() => {
  loadCss('https://use.fontawesome.com/releases/v5.9.0/css/all.css');
});
window.requestAnimationFrame(() => {
  loadCss('https://cdnjs.cloudflare.com/ajax/libs/dropzone/4.3.0/min/dropzone.min.css');
});
