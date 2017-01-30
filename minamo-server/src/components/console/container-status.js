'use strict';

export default class ContainerStatus{
  constructor(text){
    this._text = text;
  }
  isRunning(text){
    return this._text === 'running';
  }
  isStopped(text){
    return this._text === 'stopped' || this.isExited();
  }
  isPrepareing(text){
    return this._text === 'prepareing';
  }
  isStopping(text){
    return this._text === 'stopping';
  }
  isExited(text){
    return this._text === 'exited';
  }
  toLabelColor(text){
    if(this.isExited()) return 'primary';
    if(this.isRunning()) return 'success';
    if(this.isPrepareing()) return 'info';
    if(this.isStopping()) return 'warning';
    if(this.isStopped()) return 'danger';
  }
  toString(){
    return this._text;
  }
}
