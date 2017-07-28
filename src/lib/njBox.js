import njBox_base from './njBox_base.js'

import {
  getDefaultInfo,
  isPlainObject,
  defaults,
  text
} from 'lib/utils.js';

import j from 'lib/j'

//use jquery if avaliable
let $;
if(window.$ || window.jQuery) {
  $ = window.$ || window.jQuery
} else {
  $ = j;
}

class njBox extends njBox_base {
  constructor(el, options) {
    console.log('constructor extended');
    if (!arguments.length) {
      console.error('njBox, arguments not passed.');
      return;
    }
    var opts;

    if (!options && el) {//if we have only one argument
      if (isPlainObject(el)) {//if this argument is plain object, it is options
        opts = el;
      } else {//if it's not options, it is dom/j/jQuery element or selector
        opts = { elem: el }
      }
    } else {//if we have two arguments
      opts = options;
      opts.elem = el;
    }
    super(opts);
    this.initialization();
  }
  initialization() {
    console.log('initialization');
    this.on('init', function() {
      this._defaults = njBox.defaults;
      this._text = njBox.text;
      //get environment infod, getDefaultInfo trying to launch as early as possible (even before this init method), but may fail because of missing body tag (if script included in head), so we check it init again
      if (!njBox.g) njBox.g = getDefaultInfo();

      this._handlers = {};//all callback functions we used in event listeners lives here
    })
    this.on('options_setted', function(o) {
      //set default settings
      var o = this.o = Object.assign({}, this._defaults, o)

      this._g.insertWrap = true;//should we insert all dom stuff with ui? No if popover)
      
      if (o.jquery) $ = this.$ = o.jquery;

      console.log('options_setted');
    })
  }
}
njBox.defaults = defaults;
njBox.text = text;
//get environment infod, getDefaultInfo trying to launch as early as possible (even before this init method), but may fail because of missing body tag (if script included in head), so we check it init again
if (document.body && !njBox.g) njBox.g = getDefaultInfo();

//get instance
njBox.get = function (elem) {
  var el = $(elem)[0];

  if (el) {
    return el.njBox || undefined;
  } else {
    return undefined;
  };
}
//todo smth with jquery here
// njBox.autobind = function (selector) {
//   //autobind global
//   $(selector).each(function () {
//     new njBox({
//       elem: $(this)
//     })
//   }) 
// }
// if (typeof window !== 'undefined') {//autobind only in browser and on document ready
//   $(function () {
//     njBox.autobind(njBox.defaults.autobind);
//   })
// }

window.t = new njBox('.test', {backdrop:false, content:'content1'})
console.log('instance', t);