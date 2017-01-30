export default class ToastUtil{
  static show(title, message, kind){
    if(kind === undefined){ kind = message; message = title; title = ''; }
    toastr[kind](message, title);
  }
}
