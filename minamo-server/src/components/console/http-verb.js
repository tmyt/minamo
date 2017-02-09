'use strict';

export default class HttpVerb {
  static ajax(type, url, data, success, error){
    $.ajax({type, url, data, success, error});
  }

  static get(url, data, success, error){
    HttpVerb.ajax('GET', url, data, success, error);
  }

  static post(url, data, success, error){
    HttpVerb.ajax('POST', url, data, success, error);
  }

  static put(url, data, success, error){
    HttpVerb.ajax('PUT', url, data, success, error);
  }

  static del(url, data, success, error){
    HttpVerb.ajax('DELETE', url, data, success, error);
  }
}
