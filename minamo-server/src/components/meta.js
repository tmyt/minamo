'use strict';

class MetaMapObject{
  constructor(ns = ''){
    this.Namespace = ns && (ns + ':');
    return new Proxy(this, {
      get: MetaMapObject.get,
      set: MetaMapObject.set,
      has: MetaMapObject.has,
    });
  }
  getTags(){
    return this.MetaCache
      || (this.MetaCache = document.getElementsByTagName('meta'));
  }
  static get(target, name){
    const meta = target.getTags()[`${target.Namespace}${name}`];
    return meta && meta.content;
  }
  static set(){
    return false;
  }
  static has(target, name){
    return !!target.getTags()[`${target.Namespace}${name}`];
  }
}

export default new MetaMapObject('mo');
