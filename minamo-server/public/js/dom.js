function Dom(){
}

Dom.prototype.th = function(text){
  return $('<th></th>').text(text);
}

Dom.prototype.a = function(text, url, onclick){
  return $('<a></a>').text(text).attr('href', url).click(onclick);
}
