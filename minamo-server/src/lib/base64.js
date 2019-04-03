// Convert from normal to web-safe, strip trailing "="s
function webSafe64(base64) {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Convert from web-safe to normal, add trailing "="s
function normal64(base64) {
    return base64.replace(/\-/g, '+').replace(/_/g, '/') + '=='.substring(0, (3*base64.length)%4);
}

export default class {
  static encode(v){
    return webSafe64(btoa(v));
  }
  static decode(v){
    return atob(normal64(v));
  }
}
