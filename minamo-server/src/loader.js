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
  loadCss('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');
});
window.requestAnimationFrame(() => {
  loadCss('https://cdnjs.cloudflare.com/ajax/libs/dropzone/4.3.0/min/dropzone.min.css');
});
