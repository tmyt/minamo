'use strict';

const gutil = require('gulp-util')
    , through = require('through2')

function quote(a){
  return a.map(s => `'${s}'`).join(',');
}

module.exports = function(){
  let input;

  function transform(file, encoding, callback){
    if(file.isNull()){
      this.push(file);
      return callback();
    }
    if(file.isStream()){
      this.emit('error', new gutil.PluginError('gulp-loadjs-generator', 'Streaming is not supported'));
      return callback();
    }
    if(!input){
      input = file;
    }else{
      this.emit('error', new gutil.PluginError('gulp-loadjs-generator', 'File too much'));
    }
    callback();
  }

  function flush(callback){
    let modules = JSON.parse(input.contents.toString('utf8'));
    let packageRepo = {}
    let gen = '';
    for(let i = 0; i < modules.length; ++i){
      let m = require(`./modules/${modules[i]}.js`);
      packageRepo[modules[i]] = m;
      for(let j = 0; j < m.depends.length; ++j){
        if(modules.includes(m.depends[j])) continue;
    	modules.push(m.depends[j]);
      }
    }
    for(let i = 0; i < modules.length; ++i){
      let m = packageRepo[modules[i]];
      // virtual package
      if(m.provides.length == 0) continue;
      // generate code
      let depends = m.depends.length > 0 ? `[${quote(m.depends)}]` : '';
      let loadjs = `loadjs([${quote(m.provides)}], '${modules[i]}');`;
      if(depends === ''){
        gen += loadjs + '\n';
      }else{
        gen += `loadjs.ready(${depends},{success:()=>\{${loadjs}\}\});\n`;
      }
    }
    let output = new gutil.File({
      cwd:  input.cwd,
      base: input.base,
      path: input.base + '.js',
    });
    output.contents = new Buffer(gen);
    this.push(output);
    callback();
  }

  return through.obj(transform, flush);
}
