'use strict';

export default class ContainerStatus{
  constructor(text){
    this._text = text;
  }
  isRunning(){
    return this._text === 'running';
  }
  isStopped(){
    return this._text === 'stopped' || this.isExited();
  }
  isPrepareing(){
    return this._text === 'prepareing';
  }
  isStopping(){
    return this._text === 'stopping';
  }
  isExited(){
    return this._text === 'exited';
  }
  toLabelColor(){
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
