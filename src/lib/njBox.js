import njBox_base from './njBox_base.js'

import {
  getDefaultInfo,
  getItemFromDom,
  isPlainObject,
  defaults,
  templates,
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
    this.on('init', function() {
      this._defaults = njBox.defaults;
      this._templates = njBox.templates;
      this._text = njBox.text;
      //get environment infod, getDefaultInfo trying to launch as early as possible (even before this init method), but may fail because of missing body tag (if script included in head), so we check it init again
      if (!njBox.g) njBox.g = getDefaultInfo();

      this._handlers = {};//all callback functions we used in event listeners lives here
    })
    this.on('options_set', function(o) {
      var that = this,
          o  = that.o;
      //set default settings
      this._g.insertWrap = true;//should we insert all dom stuff with ui? No if popover)
      
      var o = this.o = Object.assign({}, this._defaults, o)

      if (o.jquery) $ = o.jquery;
      this.$ = $;

      if (o.elem) {
        var $elem = selectElement(o.elem),
            optionsGathered = this._g.optionsGathered = this._gatherData($elem);
        this._g.els = $elem;
        this._cb('options_gathered', optionsGathered, $elem[0]);

        Object.assign(this.o, optionsGathered)
      }

      this._g.animation = this._calculateAnimations();
      this._cb('animation_calculated', this._g.animation);

      function selectElement(elem) {
        var $elem = $(elem);

        if (!$elem.length) {
          that._e(`njBox, wrong selector or element in o.elem (${elem})`);
          return;
        }
        if ($elem.length > 1) $elem = $($elem[0]);
        if ($elem[0].njBox) {
          that._e(`njBox, already inited on this element (${elem})`);
          return;
        }
        $elem[0].njBox = that; //prevent multiple initialization on one element

        return $elem;
      }
    })
    this.on('dom_create', function() {
      //create popup container dom elements
      this.dom = this._createDom();
      this.dom.insertInto = this.dom.items;

      this._cb('dom_ready', this.dom);

      var containerIsBody = this._g.containerIsBody = this.dom.container[0] === this.dom.body[0];
      //check if container not relative position
      if (!containerIsBody) {
        if (this.dom.container.css('position') === 'static') {
          this.dom.container.addClass('njb-relative');
        }
        if (o.layout === 'fixed') {
          o.layout = 'absolute';
          this.dom.wrap.addClass('njb-absolute');
        }
      }     
    })
    this.on('inited', function() {
      //add initial click handlers
      this._addClickHandler();
      //todo
      // if (o.buttonrole && this._g.els) this._g.els.attr('role', o.buttonrole);
    })
    this.on('item_normalized', function(item) {
      if(!item.type) item.type = this._type(item.content)
    })
    this.on('item_create', function(item, index) {
      item.dom = this._createItemDom(item);
      item.toInsert = item.dom.modalOuter;

      this._insertItemContent({item, delayed: this.o.delayed});
    })
  }
  _gatherData(el) {
    let o = this.o,
      $el = $(el),
      dataProcessed = {}

    if (!$el.length) {
      return dataProcessed;
    }
    var dataO = Object.assign({}, $el.data());//data original, copy options to separate object, because we want to modify some options during processing, if we do that on native domstringmap, deleting will also touch html


    if (dataO.njbOptions) {
      try {
        dataProcessed = $.parseJSON(dataO.njbOptions);
        delete dataO.njbOptions;
      }
      catch (e) {
        this._e('njBox, fail to parse options from njb-options');
        return;
      }
    }

    //try to get href from original attributes
    if ($el[0].tagName.toLowerCase() === 'a') {
      var href = $el.attr('href');
      if (href && href !== '#' && href !== '#!' && !(/^(?:javascript)/i).test(href)) {//test href for real info, not placeholders
        dataProcessed.content = href;
      }
    }

    //get title
    if (o.title_attr) {
      var title_attr = $el.attr(o.title_attr);
      if (title_attr) dataProcessed.title = title_attr;
    }

    Object.assign(dataProcessed, choosePrefixedData(dataO))

    function choosePrefixedData(data) {
      var prefixedData = {};

      for (var p in data) {//use only data properties with njb prefix
        if (data.hasOwnProperty(p) && /^njb[A-Z]+/.test(p)) {
          var shortName = p.match(/^njb(.*)/)[1],
            shortNameLowerCase = shortName.charAt(0).toLowerCase() + shortName.slice(1);

          prefixedData[shortNameLowerCase] = transformType(data[p]);
        }
      }

      return prefixedData;
    }


    function transformType(val) {//transform string from data attributes to boolean and number
      var hasWhitespace = /\s/.test(val),
          parsedFloat = hasWhitespace ? val : parseFloat(val);

      if (val === 'true') {
        return true;
      } else if (val === 'false') {
        return false;
      } else if (!isNaN(parsedFloat)) {
        return parsedFloat;
      } else {
        return val;
      }
    }

    return dataProcessed;
  }
  _createDom() {
    var o = this.o,
        dom = {
          document: $(document),
          window: $(window),
          html: $(document.documentElement),
          body: $(document.body)
        };

    //find container
    dom.container = $(o.container);
    if (!dom.container.length) {
      this._e('njBox, can\'t find container element. (we use body instead)');
      dom.container = dom.body;//in case if we have no container element, or wrong selector for container element
    }

    //create core elements
    dom.wrap = this._createEl('wrap');
    if (o['class']) dom.wrap.addClass(o['class']);
    dom.wrap[0].tabIndex = -1;
    dom.wrap[0].njBox = this;
    if (o.zindex) dom.wrap.css('zIndex', o.zindex);

    dom.items = dom.wrap.find('.njb-items');

    //create ui layer
    dom.ui = this._createEl('ui')
    dom.wrap.append(dom.ui)

    dom.title = this._createEl('title')
    dom.ui.append(dom.title)

    // insert outside close button
    if (o.close === 'outside') {
      dom.close = this._createEl('close')
      dom.close.attr('title', this._text.close).attr('aria-label', this._text.close)

      dom.ui.append(dom.close)
    }

    // insert invisible, focusable nodes.
    // while this dialog is open, we use them to make sure that focus never
    // leaves modal boundaries
    dom.focusCatchBefore = this._createEl('focusCatcher')
    dom.wrap.prepend(dom.focusCatchBefore)

    dom.focusCatchAfter = this._createEl('focusCatcher')
    dom.wrap.append(dom.focusCatchAfter)

    return dom;
  }
  _createEl(templateName) {
    var template = this._templates[templateName],
        el = $(template);
    
    if(!el.length) console.warn(`njBox, smth wrong with template - ${templateName}.`)
    
    return el;
  }
  _calculateAnimations() {
    var o = this.o,
      animShow,
      animHide,
      animShowDur,
      animHideDur,
      tmp,
      appended = false;

    //get animation names
    if (o.anim) {
      tmp = o.anim.split(' ');
      animShow = tmp[0];
      (tmp[1]) ? animHide = tmp[1] : animHide = tmp[0];
    }

    //get animation durations from options
    if (o.duration) {
      o.duration = o.duration.toString();

      tmp = o.duration.split(' ');
      animShowDur = tmp[0];
      (tmp[1]) ? animHideDur = tmp[1] : animHideDur = tmp[0];
    }

    var div = document.createElement("div");
    div.style.cssText = 'visibility: hidden; position: absolute;';

    //check if we had numbers in anim duration or we should calculate it

    //detect animation duration for show animation
    if ((!animShowDur || animShowDur === 'auto') && animShow) {
      div.className = (o.animclass || '') + ' ' + animShow;
      document.body.appendChild(div);
      appended = true;

      animShowDur = this._getAnimTime(div);
    } else {
      animShowDur = parseInt(animShowDur) || 0;
    }

    //detect animation duration for hide animation
    if ((!animHideDur || animHideDur === 'auto') && animHide) {
      div.className = (o.animclass || '') + ' ' + animHide;
      if (!appended) {
        document.body.appendChild(div);
        appended = true;
      }

      animHideDur = this._getAnimTime(div);
    } else {
      animHideDur = parseInt(animHideDur) || 0;
    }

    if (appended) document.body.removeChild(div);

    return {
      show: animShow || '',
      hide: animHide || '',
      showDur: animShowDur || 0,
      hideDur: animHideDur || 0
    }
  }
  _getAnimTime(el, property) {//get max animation or transition time
    function _getMaxTransitionDuration(el, property) {//function also can get animation duration
      var $el = $(el),
        el = $el[0],
        dur,
        durArr,
        del,
        delArr,
        transitions = [];

      if (!$el.length) return 0;
      if (!property) return 0;

      dur = $el.css(property + 'Duration');
      del = $el.css(property + 'Delay');

      //make array with durations
      if (!dur || dur === undefined) dur = '0s';
      durArr = dur.split(', ');
      for (var i = 0, l = durArr.length; i < l; i++) {
        durArr[i] = (durArr[i].indexOf("ms") > -1) ? parseFloat(durArr[i]) : parseFloat(durArr[i]) * 1000;
      }

      //make array with delays
      if (!del || del === undefined) del = '0s';
      delArr = del.split(', ');
      for (var i = 0, l = delArr.length; i < l; i++) {
        delArr[i] = (delArr[i].indexOf("ms") > -1) ? parseFloat(delArr[i]) : parseFloat(delArr[i]) * 1000;
      }

      //make array with duration+delays
      for (var i = 0, l = durArr.length; i < l; i++) {
        transitions[i] = durArr[i] + delArr[i]
      }

      return Math.max.apply(Math, transitions);
    }

    return _getMaxTransitionDuration(el, 'animation') || _getMaxTransitionDuration(el, 'transition')
  }
  _createItemDom(item) {
    var o = this.o,
        dom = {},
        modalOuter,
        modal,
        modalFragment = document.createDocumentFragment();

    //main modal wrapper
    dom.modal = modal = this._createEl('modal');
    modal[0].tabIndex = '-1'
    modal[0].njBox = this;

    dom.modalOuter = modalOuter = this._createEl('modalOuter')

    if (o.role) modal.attr('role', o.role)
    if (o.label) modal.attr('aria-label', o.label)
    if (o.labelledby) modal.attr('aria-labelledby', o.labelledby)
    if (o.describedby) modal.attr('aria-describedby', o.describedby)

    modalOuter.append(modal);

    if (item.type !== "template") {
      //insert body
      dom.body = this._createEl('body');
      //find data-njb-body in item body element
      dom.bodyInput = getItemFromDom(dom.body, 'data-njb-body')

      modalFragment.appendChild(dom.body[0])

      //insert header
      if (item.header) {
        dom.header = this._createEl('header');

        //insert header info
        dom.headerInput = getItemFromDom(dom.header, 'data-njb-header')
        if (!dom.headerInput.length) {
          this._e('njBox, error in o.templates.header');
        } else {
          modalFragment.insertBefore(dom.header[0], modalFragment.firstChild)
        }
      }

      //insert footer
      if (item.footer) {
        dom.footer = this._createEl('footer');

        //insert footer info
        dom.footerInput = getItemFromDom(dom.footer, 'data-njb-footer')
        if (!dom.footerInput.length) {
          this._e('njBox, error in njBox.templates.footer');
        } else {
          modalFragment.appendChild(dom.footer[0])
        }
      }

      //insert close button
      if (o.close === 'inside') {
        dom.close = this._createEl('close');
        dom.close.attr('title', o.text.close);

        modalFragment.appendChild(dom.close[0]);
      }

      modal.append(modalFragment)
    }

    if (item.type === 'image') {
      modal.addClass('njb--image');
    } else {
      modal.addClass('njb--content');
    }

    return dom;
  }
  _type(content) {//detect content type
    var type = 'html';

    if (typeof content === 'object') {
      if ((window.jQuery && content instanceof window.jQuery) || (window.j && content instanceof window.j)) {
        return 'selector';
      }
    } else if (/^[#.]\w/.test(content)) {
      return 'selector';
    } else if (/\.(png|jpg|jpeg|gif|tiff|bmp|webp)(\?\S*)?$/i.test(content)) {
      return 'image';
    }

    return type;
  }
  _insertItemContent(props) {
    var that = this,
        o = that.o,
        {item, delayed} = props,
        dom = item.dom,
        itemType = item.type,
        itemContent = item.content,
        bodyItemToInsert = dom.bodyInput;

    function contentAddedCallback() {
      //insert header content
      if (dom.headerInput) dom.headerInput.html(item.header)
      //insert footer content
      if (dom.footerInput) dom.footerInput.html(item.footer)
      
      item.state.status = 'loaded';

      that._cb('item_loaded', item);

      if(that.state.status !== 'inited' && that.items && that._getActive() === item) {
        that._cb('item_ready', item);
        that.position();//needs for delayed items autoheight
      }

    }
    if (itemType === 'template') {
      dom.modal.html(itemContent);
    } else {
      switch (itemType) {
        case 'html':
          bodyItemToInsert.html(itemContent);
          contentAddedCallback();
          break;
        case 'text':
          bodyItemToInsert.text(itemContent);
          contentAddedCallback();
          break;
        case 'selector':
          if (!delayed && !item.state.contentInserted) {
            this._insertSelector(item, contentAddedCallback);
          }
          break;
        case 'image':
          if (!delayed && !item.state.contentInserted) {
            this._insertImage(item, contentAddedCallback);
          }
          break;
      
        default:
          break;
      }
    }
  }
  _insertSelector(item, callback) {
    let contentEl = item.state.contentEl = $(item.content),
        bodyItemToInsert = item.dom.bodyInput;

    if (contentEl.length) {
      item.state.contentElStyle = contentEl[0].style.cssText;

      item.state.contentElDisplayNone = contentEl.css('display') === 'none';
      if (item.state.contentElDisplayNone) {
        contentEl[0].style.display = 'block';
      }

      bodyItemToInsert.html('')//clear element before inserting other dom element. (e.g. body for case when first time we can't find contentEl on page and error text already here)
      bodyItemToInsert.append(contentEl);

      item.state.contentInserted = true;
    } else {//if we don't find element with this selector
      bodyItemToInsert.html(item.content)
    }
  }
  _insertImage(item, callback) {
    var that = this,
      o = this.o,
      img = document.createElement('img'),
      $img = $(img),
      ready,
      loaded;

    item.state.status = 'loading';
    item.dom.img = $img;

    item._handlerError = function () {
      $img.off('error', item._handlerError).off('abort', item._handlerError);
      delete item._handlerError;

      that._preloader('hide', item);

      item.dom.bodyInput.html(this._text.imageError.replace('%url%', item.content));

      that._cb('img_e', item);//img_ready, img_load callbacks

      item.state.status = 'error';
      item.state.contentInserted = true;
    }
    $img.on('error', item._handlerError)
        .on('abort', item._handlerError);

    //todo
    // if (item.title) {
    //   $img.attr('aria-labelledby', 'njb-title')
    // }
    img.src = item.content;

    ready = img.width + img.height > 0;
    loaded = img.complete && img.width + img.height > 0;

    if (o.img === 'ready' && ready || o.img === 'load' && loaded) {
      insertImg();
    } else {
      this._preloader('show', item);

      findImgSize(img, function () {
        that._cb('item_img_ready', item);//img_ready callback

        if (o.img === 'ready') {
          insertImg();
        }

      });

      item._handlerLoad = function () {
        $img.off('load', item._handlerLoad);
        that._cb('item_img_load', item);//img_load callback

        if (o.img === 'load') {
          insertImg();
        }
      }
      $img.on('load', item._handlerLoad)
    }

    function insertImg() {
      that._cb('item_img_true', item);//img_ready, img_load callbacks

      that._preloader('hide', item);

      $img.attr('width', 'auto')//for IE <= 10

      //insert content
      item.dom.bodyInput.append(img);
      item.state.contentInserted = true;
      callback();

      //animation after image loading
      //todo add custom image animation, don't use global popup animation
      // if(ev === 'load') that._anim('show', true)
    }
    //helper function for image type
    function findImgSize(img, readyCallback) {
      var counter = 0,
        interval,
        njbSetInterval = function (delay) {
          if (interval) {
            clearInterval(interval);
          }

          interval = setInterval(function () {
            if (img.width > 0) {
              readyCallback();

              clearInterval(interval);
              return;
            }

            if (counter > 200) {
              clearInterval(interval);
            }

            counter++;
            if (counter === 5) {
              njbSetInterval(10);
            } else if (counter === 40) {
              njbSetInterval(50);
            } else if (counter === 100) {
              njbSetInterval(500);
            }
          }, delay);
        };

      njbSetInterval(1);
    }
  }
  _preloader(type, item) {
    var o = this.o;

    switch (type) {
      case 'show':
        item.state.preloader = true;
        item.dom.preloader = this._createEl('preloader')
                              .attr('title', this._text.preloader);

        item.dom.modal.addClass('njb--loading');
        item.dom.bodyInput.append(item.dom.preloader)
        break;

      case 'hide':
        if (!item.state.preloader) return;

        item.dom.preloader[0].parentElement.removeChild(item.dom.preloader[0]);
        item.dom.modal.removeClass('njb--loading');
        delete item.dom.preloader;
        delete item.state.preloader;

        break;
    }
  }
  _addClickHandler() {//initial click handlers
    var o = this.o,
        handlers = this._handlers;

    this._removeClickHandler();

    
    if (o.click) {
      handlers.elsClick = this._clickHandler();

      if (this._g.els && this._g.els.length) {
        this._g.els.on('click', handlers.elsClick)
      }

      if (o.clickels) {
        $(o.clickels).on('click', handlers.elsClick);
      }
    }
  }
  _clickHandler() {
    //this method creates closure with modal instance
    var o = this.o,
      that = this;

    return function (e) {
      var el = this;

      if (e.originalEvent) e = e.originalEvent;//work with original event

      if ('which' in e && (e.which !== 1 || e.which === 1 && e.ctrlKey && e.shiftKey)) return;//handle only left button click without key modificators
      (e.preventDefault) ? e.preventDefault() : e.returnValue = false;

      if ($(el).closest('.njb-close-system, .njb-arrow').length) return;


      that.state.clickedEvent = e;
      that.state.clickedEl = el;
      that.state.focused = el;
      that.show();
    }
  }
  _removeClickHandler() {
    var o = this.o;

    if (this._g.els && this._g.els.length) {
      this._g.els.off('click', this._handlers.elsClick)

      if (o.clickels) $(o.clickels).off('click', this._handlers.elsClick);
    }
  }
  
}
njBox.defaults = defaults;
njBox.templates = templates;
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

window.t = new njBox('.el', {backdrop:false, content:'content1'})
.on('inited', function() {
  // console.log(this);
})