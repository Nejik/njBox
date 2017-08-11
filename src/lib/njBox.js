/*!
 * njBox - v3.0.0
 * nejikrofl@gmail.com
 * Copyright (c) 2017 N.J.
 * MIT license
*/
import '../css/njBox.css'

import njBox_base from './njBox_base.js'

import {
  getDefaultInfo,
  getItemFromDom,
  defaults,
  templates,
  text
} from './utils.js';

import j from './j'

var njBox = (function(window, undefined, setTimeout, document) {

//use jquery if avaliable
let $ = window.jQuery || window.$ || j;

class njBox extends njBox_base {
  constructor(el, options) {
    if (!arguments.length) {
      console.error('njBox, arguments not passed.');
      return;
    }
    var opts;

    if (!options && el) {//if we have only one argument
      if ($.isPlainObject(el)) {//if this argument is plain object, it is options
        opts = el;
      } else {//if it's not options, it is dom/j/jQuery element or selector
        opts = { elem: el }
      }
    } else {//if we have two arguments
      opts = options;
      opts.elem = el;
    }
    super(opts);
    this._i();
  }
  
  _i() {
    this.on('init', function() {
      this._defaults = njBox.defaults;
      this._templates = njBox.templates;
      this._text = njBox.text;
      //get environment info, getDefaultInfo trying to launch as early as possible (even before this init method), but may fail because of missing body tag (if script included in head), so we check it init again
      if (!njBox.g) njBox.g = getDefaultInfo();

      this._handlers = {};//all callback functions we used in event listeners lives here
    })
    this.on('options_set', function() {
      var that = this,
          o  = that.o;
      //set default settings
      this._g.insertWrap = true;//should we insert all dom stuff with ui? No if popover)
      
      var o = this.o = $.extend({}, this._defaults, o)

      if (o.jquery) $ = o.jquery;
      this.$ = $;

      if (o.elem) {
        var $elem = selectElement(o.elem),
            optionsGathered = this._g.optionsGathered = this._gatherData($elem);
        this._g.els = $elem;
        this._cb('options_gathered', optionsGathered, $elem[0]);

        $.extend(this.o, optionsGathered)
      }

      // initializing addons
      for (let key in njBox.addons) {
        if (njBox.addons.hasOwnProperty(key)) {
          this['_' + key + '_init']();
        }
      }

      this._g.animation = this._calculateAnimations();

      function selectElement(elem) {
        var $elem = $(elem);

        if (!$elem.length) {
          that._e(`njBox, wrong selector or element in o.elem (${elem})`);
          return $elem;
        }
        if ($elem.length > 1) {
          that._e(`njBox found more than one item for current o.elem (${elem}). First was used.`);
          $elem = $($elem[0]);
        }
        if ($elem[0].njBox) {
          that._e(`njBox, already inited on this element (${elem})`);
          return $elem;
        }
        $elem[0].njBox = that; //prevent multiple initialization on one element

        return $elem;
      }
    })
    this.on('dom_create', function() {
      //create popup container dom elements
      this.dom = this._createDom();
      this.dom.insertInto = this.dom.items;

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
    this.on('item_normalized', function(item, itemRaw) {
      if(!item.type) item.type = this._type(item.content)

      item.el = itemRaw.el || undefined;
    })
    this.on('item_create', function(item, index) {
      item.content = item.content || this._text._missedContent;
      item.dom = this._createItemDom(item);
      item.toInsert = item.dom.modalOuter;

      this._insertItemContent({item, delayed: this.o.delayed});
    })
    this.on('inited', function() {
      //add initial click handlers
      this._addClickHandler();
      //todo
      // if (o.buttonrole && this._g.els) this._g.els.attr('role', o.buttonrole);
    })
    this.on('show_prepare', function() {
      var e = this.state.clickedEvent;
      if (e) {
        (e.preventDefault) ? e.preventDefault() : e.returnValue = false;
      }
      
      var wrap = this.dom.wrap;

      if (!this.state.focused) this.state.focused = document.activeElement;//for case when modal can be opened programmatically, with this we can focus element after hiding

      delete this.returnValue;

      if(this.o.scrollbar === 'hide') this._scrollbar('hide');
      
      if(this.o.backdrop) this._backdrop('show');

      //set event handlers
      this._addListeners();

      this._uiUpdate();

      this._cb('dom_insert');
      //insert modal into dom
      if(this._g.insertWrap) {
        this.dom.container.append(wrap);
      }
      this._drawItem({
        item: this._getActive(),
        container: this.dom.insertInto,
        prepend: false
      });
      //force reflow, we need because firefox has troubles with njb element width, while inside autoheighted image
      wrap[0].style.display = 'none';
      wrap[0].clientHeight;
      wrap[0].style.display = 'block';

      this.position();//set all positions
      this._cb('dom_inserted');
    })
    this.on('animation_show', function() {
      var that = this,
          o = that.o,
          modal = that._getActive().dom.modal,
          animShow = this._g.animation.show,
          animShowDur = this._g.animation.showDur;

      this.dom.wrap[0].clientHeight;//fore reflow before applying class
      this.dom.wrap.addClass('njb-wrap--visible');

      if (o.animclass) modal.addClass(o.animclass);
      modal.attr('open', '');

      if (animShow) {
        modal.addClass(animShow);

        that._g.shownCb = setTimeout(() => {
          //check if hiding not initialized while showing animation
          if(that.state.status === 'show') that._shownCb();
        }, animShowDur);
      } else {
        that._shownCb();
      }
    })
    this.on('shown', function() {
      var o = this.o,
          modal = this._getActive().dom.modal;

      if (o.animclass) modal.removeClass(o.animclass);
      if(this._g.animation.show) modal.removeClass(this._g.animation.show);
      modal[0].clientHeight;//reflow
      
      this._set_focus(this.items[this.state.active]);
    })
    this.on('hide_prepare', function() {
      if (this.state.focused) this.state.focused.focus();

      this._backdrop('hide');

      this._removeListeners();
    })
    this.on('animation_hide', function() {
      var that = this,
          o = that.o,
          modal = that._getActive().dom.modal,
          animShow = this._g.animation.show,
          animHide = this._g.animation.hide,
          animHideDur = this._g.animation.hideDur;

      modal[0].removeAttribute('open');
      this.dom.wrap.removeClass('njb-wrap--visible')

      // debugger;
      if (animHide) {
        if (o.animclass) modal.addClass(o.animclass);
        if (animHide === animShow) modal.addClass('njb-anim-reverse');
        modal.addClass(animHide);

        that._g.hiddenCb = setTimeout(() => {
          //check if showing not initialized while hiding animation
          if(that.state.status === 'hide') that._hiddenCb()
        }, animHideDur)
      } else {
        that._hiddenCb();
      }
    })
    this.on('clear', function() {
      var o = this.o,
          modal = this._getActive().dom.modal,
          animShow = this._g.animation.show,
          animHide = this._g.animation.hide;
      
      if (o.animclass) modal.removeClass(o.animclass);
      if (animHide === animShow) modal.removeClass('njb-anim-reverse');
      if(animHide) modal.removeClass(animHide);
      modal[0].clientHeight;//reflow

      this._scrollbar('show');

      if(this._g.insertWrap && this.dom.wrap && this.dom.wrap.length) this.dom.wrap[0].parentNode.removeChild(this.dom.wrap[0]);

      this._removeSelectorItemsElement();

      if (this.dom.items && this.dom.items.length) empty(this.dom.items[0]);//we can't use innerHTML="" here, for IE(even 11) we need remove method

        //clear inline position
      for (var i = 0, l = this.items.length; i < l; i++) {
        this.items[i].dom.modalOuter[0].style.cssText = '';
      }

      function empty(el) {
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }
      }
    })
    this.on('hide', function() {
      if(!this.state.okCb && !this.state.cancelCb) {
        this.returnValue = this._getReturnValue();
        this._cb('cancel', this.returnValue);
      }
    })
    this.on('hidden', function() {
      if (this.o.focusprevious) this._focusPreviousModal();
    })
    this.on('position', function() {
      var dimensions = this.state.dimensions = this._getDimensions();

      //position of global wrapper
      if (this.o.layout === 'absolute') {
        //global wrap positioning
        var scrollTop = dimensions.container.scrollTop,
          scrollLeft = dimensions.container.scrollLeft;

        if (scrollTop <= dimensions.container.scrollTopMax) {
          this.dom.wrap.css({ 'top': scrollTop + 'px', 'left': scrollLeft + 'px' })
        }

        //backdrop positioning
        this.dom.backdrop.css({ 'width': 'auto', 'height': 'auto' });
        this.dom.backdrop[0].clientHeight;
        this.dom.backdrop.css({
          'width': dimensions.container.scrollWidth + 'px',
          'height': dimensions.container.scrollHeight + 'px'
        });
      }

      this._setMaxHeight(this._getActive());
    })
    this.on('destroy', function() {
      this._removeClickHandler();

      this.dom.container.removeClass('njb-relative');
    })
    this.on('destroyed', function() {
      this._defaults = 
      this._handlers = 
      this._templates = 
      this._text = 
      this.$ = {};
    })
  }
  update() {//recreate all slides from this._g.rawItems
    this.state.arguments.update = arguments;
    this.items = this._createItems(this._g.rawItems);

    this._addClickHandler();

    return this;
  }
  _gatherData(el) {
    let o = this.o,
      $el = $(el),
      dataProcessed = {$elem:$el}

    if (!$el.length) {
      return dataProcessed;
    }
    var dataO = $.extend({}, $el.data());//data original, copy options to separate object, because we want to modify some options during processing, if we do that on native domstringmap, deleting will also touch html


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
    if (o.titleattr) {
      var titleattr = $el.attr(o.titleattr);
      if (titleattr) dataProcessed.title = titleattr;
    }

    $.extend(dataProcessed, choosePrefixedData(dataO))

    function choosePrefixedData(data) {
      var prefixedData = {};

      for (var p in data) {//use only data properties with njb prefix
        if (data.hasOwnProperty(p) && /^njb[A-Z]+/.test(p)) {
          var shortName = p.match(/^njb(.*)/)[1],
            shortNameLowerCase = shortName.charAt(0).toLowerCase() + shortName.slice(1);

          prefixedData[shortNameLowerCase] = data[p];
        }
      }

      return prefixedData;
    }

    //transform types from string. We cant do this in choosePrefixedData, because we should also transform data from data-njb-options
    for (var opt in dataProcessed) {
      if (dataProcessed.hasOwnProperty(opt)) {
        dataProcessed[opt] = transformType(dataProcessed[opt])
      }
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

    if (o.autoheight === true) {
      dom.wrap.addClass('njb-wrap--autoheight-true')
    } else if(o.autoheight === 'image') {
      dom.wrap.addClass('njb-wrap--autoheight-image')
    }

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

      // modalFragment.appendChild(dom.body[0])

      //insert header
      if (item.header) {
        dom.header = this._createEl('header');

        //create header dom el
        dom.headerInput = getItemFromDom(dom.header, 'data-njb-header')
        if (!dom.headerInput.length) {
          this._e('njBox, error in o.templates.header');
        }
      }

      //insert footer
      if (item.footer) {
        dom.footer = this._createEl('footer');

        //create footer dom el
        dom.footerInput = getItemFromDom(dom.footer, 'data-njb-footer')
        if (!dom.footerInput.length) {
          this._e('njBox, error in njBox.templates.footer');
        }
      }

      //insert close button
      if (o.close === 'inside') {
        dom.close = this._createEl('close');
        dom.close.attr('title', this._text.close);

        // modalFragment.appendChild(dom.close[0]);
      }

      modal.append(modalFragment)
    }

    if (item.type === 'image') {
      modal.addClass('njb--image');
    } else {
      modal.addClass('njb--content');
    }

    this._repairItemDom(dom)
    return dom;
  }
  _repairItemDom(dom) {
    dom.modal.append(dom.body);
    dom.modal.append(dom.close);
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
      //insert header
      if (dom.headerInput) {
        dom.headerInput.html(item.header)
        dom.modal.prepend(dom.header)
      }
      //insert footer
      if (dom.footerInput) {
        dom.footerInput.html(item.footer)
        dom.modal.append(dom.footer)
      }
      item.state.status = 'loaded';

      that._cb('item_loaded', item);

      if(that.state.status !== 'inited' && that.items && that._getActive() === item) {
        that._cb('item_ready', item);
        
        if(o.delayed) {
          that.position();//needs for delayed items autoheight
        }
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
    callback();
  }
  _insertImage(item, callback) {
    var that = this,
      o = this.o,
      img = document.createElement('img'),
      $img = $(img),
      ready,
      loaded;
    
    if(item.state.status === 'loading') return;//dont do anything, just wait until callbacks are called

    item.state.status = 'loading';
    item.dom.img = $img;

    item._handlerError = function () {
      $img.off('error', item._handlerError).off('abort', item._handlerError);
      delete item._handlerError;

      that._preloader('hide', item);

      item.dom.bodyInput.html(that._text.imageError.replace('%url%', item.content));
      item.dom.modal.removeClass('njb--image').addClass('njb--content')

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
        item.dom.modal.html('')
        item.dom.modal.append(item.dom.preloader)
        break;

      case 'hide':
        if (!item.state.preloader) return;

        item.dom.preloader[0].parentElement.removeChild(item.dom.preloader[0]);
        item.dom.modal.removeClass('njb--loading');
        delete item.dom.preloader;
        delete item.state.preloader;
        this._repairItemDom(item.dom);//we should repair dom, becase in inserting we remove all content from modal

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
  _addListeners() {//all other event handlers
    var o = this.o,
      that = this,
      h = this._handlers;

    h.container_resize = function (e) {
      that.position();
    }
    h.container_scroll = function (e) {
      that.position();
    }
    h.container_out = function (e) {
      //1. dont immidiate hide on clicking calling element
      //2. dont react until full show to disable misclicks
      if(that.state.clickedEl && that.state.clickedEl === e.target || that.state.status !== 'shown') return;

      var $el = $(e.target),
        prevent = $el.closest('.njb, .njb-ui').length;
      if (prevent) return;

      (e.preventDefault) ? e.preventDefault() : e.returnValue = false;


      if (o.out) {
        that.hide();
      } else {
        that._getActive().dom.modal.addClass('njb--pulse');
        that._set_focus(that.items[that.state.active]);

        setTimeout(function () {
          that._getActive().dom.modal.removeClass('njb--pulse');
        }, that._getAnimTime(that._getActive().dom.modal))
      }
    }

    that.dom.container.on('resize', h.container_resize)
                      .on('scroll', h.container_scroll)
    
    that.dom.document.on('click', h.container_out)

    h.wrap_resize = function () {
      that.position();
    }
    h.wrap_scroll = function () {
      that.position();
    }
    h.wrap_keydown = function (e) {
      that._cb('keydown', e);

      switch (e.which) {
        case 27://esc
          if (o.esc) {
            that.hide();
          }

          (e.preventDefault) ? e.preventDefault() : e.returnValue = false;
          break;

      }
    }
    h.wrap_close = function (e) {
      (e.preventDefault) ? e.preventDefault() : e.returnValue = false;

      that.hide();
    }
    h.wrap_ok = function (e) {
      (e.preventDefault) ? e.preventDefault() : e.returnValue = false;

      that.returnValue = that._getReturnValue();

      if (that._cb('ok', that.returnValue) === false) {
        return;
      } else {
        that.state.okCb = true;
      }

      that.hide();
    }
    h.wrap_cancel = function (e) {
      (e.preventDefault) ? e.preventDefault() : e.returnValue = false;

      that.returnValue = that._getReturnValue();

      that._cb('cancel', that.returnValue);
      that.state.cancelCb = true;

      that.hide();
    }

    that.dom.wrap .on('resize', h.wrap_resize)
                  .on('scroll', h.wrap_scroll)
                  .on('keydown', h.wrap_keydown)
                  .delegate('[data-njb-close]', 'click', h.wrap_close)
                  .delegate('[data-njb-ok]', 'click', h.wrap_ok)
                  .delegate('[data-njb-cancel]', 'click', h.wrap_cancel)

    h.window_resize = function () {
      that.position();
    }
    h.window_scroll = function () {
      that.position();
    }
    h.window_orientation = function () {
      that.position();
    }

    that.dom.window.on('resize', h.window_resize)
                    .on('scroll', h.window_scroll)
                    .on('orientationchange', h.window_orientation)

    h.focusCatchBefore = function (e) {
      var related = e.relatedTarget,
        fromUi;

      if (related) {//firefox have no related
        fromUi = !!$(related).closest('.njb-ui').length;
        if (fromUi) {
          that._set_focus(that.items[that.state.active]);
        } else {
          that._set_focus(that.items[that.state.active], true);
        }
      } else {
        that._set_focus(that.items[that.state.active], true);
      }
    }
    h.focusCatchAfter = function (e) {
      that._set_focus(that.items[that.state.active]);
    }

    this.dom.focusCatchBefore.on('focus', h.focusCatchBefore)
    this.dom.focusCatchAfter.on('focus', h.focusCatchAfter)

    this._cb('listeners_added');
  }
  _getReturnValue() {
    let modal = this._getActive().dom.modal,
        prompt_input = modal.find('[data-njb-return]'),
        prompt_value;
    if (prompt_input.length) prompt_value = prompt_input[0].value || "";

    return prompt_value;
  }
  _removeListeners() {
    //we should delete manually each handler, because in handlers object can be other handlers from addons
    var h = this._handlers,
        that = this;

    that.dom.document.off('click', h.container_out)
    delete h.container_out;

    that.dom.container.off('resize', h.container_resize)
      .off('scroll', h.container_scroll)
    delete h.container_resize;
    delete h.container_scroll;
      
    that.dom.wrap
      .off('resize', h.wrap_resize)
      .off('scroll', h.wrap_scroll)
      .off('keydown', h.wrap_keydown)
      .undelegate('[data-njb-close]', 'click', h.wrap_close)
      .undelegate('[data-njb-ok]', 'click', h.wrap_ok)
      .undelegate('[data-njb-cancel]', 'click', h.wrap_cancel)
    delete h.wrap_resize;
    delete h.wrap_scroll;
    delete h.wrap_keydown;
    delete h.wrap_close;
    delete h.wrap_ok;
    delete h.wrap_cancel;


    that.dom.window
      .off('resize', h.window_resize)
      .off('scroll', h.window_scroll)
      .off('orientationchange', h.window_orientation)
    delete h.window_resize;
    delete h.window_scroll;
    delete h.window_orientation;


    that.dom.focusCatchBefore.off('focus', h.focusCatchBefore)
    that.dom.focusCatchAfter.off('focus', h.focusCatchAfter)
    delete h.focusCatchBefore;
    delete h.focusCatchAfter;

    this._cb('listeners_removed');
  }
  _scrollbar(type) {
    var o = this.o;
    switch (type) {
      case 'hide':
        if (this.state.scrollbarHidden) return;

        if (this._g.containerIsBody) {//we can insert modal window in any custom element, that's why we need this if
          var sb = (document.documentElement.scrollHeight || document.body.scrollHeight) > document.documentElement.clientHeight;//check for scrollbar existance (we can have no scrollbar on simple short pages)

          //don't add padding to html tag if no scrollbar (simple short page) or popup already opened
          if (!this.dom.container[0].njb_scrollbar && !this.state.scrollbarHidden && (sb || this.dom.html.css('overflowY') === 'scroll' || this.dom.body.css('overflowY') === 'scroll')) {
            //existing of that variable means that other instance of popup hides scrollbar on this element already
            this.dom.html.addClass('njb-hideScrollbar');
            this.dom.html.css('paddingRight', parseInt(this.dom.html.css('paddingRight')) + njBox.g.scrollbarSize + 'px');
          }
        } else {
          var sb = (this.dom.container[0].scrollHeight > this.dom.container[0].clientHeight);//check for scrollbar existance on this element

          //don't add padding to container if no scrollbar (simple short page) or popup already opened
          // if (!this.state.scrollbarHidden && (sb || this.dom.container.css('overflowY') === 'scroll')) {

          this.dom.container.addClass('njb-hideScrollbar');
          // this.dom.container.css('paddingRight', parseInt(this.dom.container.css('paddingRight')) + njBox.g.scrollbarSize + 'px');

          // }
        }
        this.state.scrollbarHidden = true;

        // if(this.state.scrollbarHidden) {
        //fixes case when we have 2 modals on one container, and after first close, first popup shows scrollbar
        //how many elements hides scrollbar on this element...
        (this.dom.container[0].njb_scrollbar) ? this.dom.container[0].njb_scrollbar++ : this.dom.container[0].njb_scrollbar = 1;
        // }
        
        break;

      case 'show':
        if (!this.state.scrollbarHidden) return;

        if (--this.dom.container[0].njb_scrollbar) {
          delete this.state.scrollbarHidden;
          return;
        } else {
          // ie 7 don't support delete on dom elements
          this.dom.container[0].njb_scrollbar = undefined;
        }

        if (this._g.containerIsBody) {
          this.dom.html.removeClass('njb-hideScrollbar');
          var computedPadding = parseInt(this.dom.html.css('paddingRight')) - njBox.g.scrollbarSize;

          if (computedPadding) {//if greater than 0
            this.dom.html.css('paddingRight', computedPadding + 'px');
          } else {//if padding is 0, remove it from style attribute
            this.dom.html[0].style.paddingRight = '';
          }
        } else {

          this.dom.container.removeClass('njb-hideScrollbar');
          var computedPadding = parseInt(this.dom.container.css('paddingRight')) - njBox.g.scrollbarSize;

          if (computedPadding) {//if greater than 0
            this.dom.container.css('paddingRight', computedPadding + 'px');
          } else {//if padding is 0, remove it from style attribute
            this.dom.container[0].style.paddingRight = ''
          }
        }

        delete this.state.scrollbarHidden;

        break;
    }
  }
  _backdrop(type) {
    var o = this.o,
      that = this;

    switch (type) {
      case 'show':
        this.dom.backdrop = this._createEl('backdrop');

        if (this.state.backdropVisible) return;
        
        if (o.backdropassist) this.dom.backdrop.css('transitionDuration', this._g.animation.showDur + 'ms')

        if (o.layout === 'absolute') this.dom.backdrop.addClass('njb-absolute');
        this.dom.container.append(this.dom.backdrop);

        setTimeout(function () {//this prevent page from scrolling in chrome while background transition is working..., also needed as reflow
          that.dom.backdrop.addClass('njb-backdrop--visible');
        }, 0)

        this.state.backdropVisible = true;
        
        break;

      case 'hide':
        if (!this.state.backdropVisible) return;
        if (o.backdropassist) this.dom.backdrop.css('transitionDuration', this._g.animation.hideDur + 'ms')

        this.dom.backdrop.removeClass('njb-backdrop--visible');

        setTimeout(function () {
          that.dom.backdrop[0].parentNode.removeChild(that.dom.backdrop[0])
          if (o.backdropassist) that.dom.backdrop[0].style.cssText = '';
          delete that.state.backdropVisible;
        }, that._getAnimTime(that.dom.backdrop[0]))
        break;
    }
  }
  _uiUpdate(index = this.state.active) {
    var dom = this.dom,
        o = this.o,
        item = this.items[index];

    if (!item) {
      this._e('njBox, can\'t update ui info from item index - ' + index);
      return;
    }

    //set title
    if (item.title) {
      dom.ui.addClass('njb-ui--title');
    } else {
      dom.ui.removeClass('njb-ui--title');
    }
    dom.wrap.find('[data-njb-title]').html(item.title || '')

    if (item.type === 'image') {
      dom.wrap.removeClass('njb-wrap--content').addClass('njb-wrap--image');
    } else {
      dom.wrap.removeClass('njb-wrap--image').addClass('njb-wrap--content');
    }
  }
  _drawItem(props) {
    var o = this.o,
        {item, container, prepend} = props,
        itemToInsert = item.toInsert;

    if(!item.state.contentInserted && o.delayed && (item.type === 'image' || item.type === 'selector')) {
      this._insertItemContent({item, delayed: false});
    }

    if (prepend) {
      container.prepend(itemToInsert)
    } else {
      container.append(itemToInsert);
    }

    this._cb('item_inserted', item);
    if(item.state.status === 'loaded') this._cb('item_ready', item);
  }
  _set_focus(item, last) {
    var o = this.o,
      focusable,
      focusEl;
    
    if(!o.autofocus) {
      this.dom.wrap[0].focus();
      return;
    }

    if (last) {
      focusable = this.dom.ui.find(this.o._focusable)
      focusable[focusable.length - 1].focus();
      return;
    }
    if (o.autofocus) {
      focusEl = item.dom.modal.find(o.autofocus)[0]
    }
    if (!focusEl) {
      focusEl = item.dom.modal.find('[autofocus]')[0]
    }
    if (!focusEl) {
      focusable = item.dom.modal.find(this.o._focusable)
      focusEl = focusable[0]
    }

    if (focusEl) {
      focusEl.focus();
    }
    //  else if (o.close === "outside") {//then try to focus close buttons
    //   this.dom.close[0].focus()
    // } else if (o.close === "inside" && item.dom.close) {//if type:"template" is used we have no close button here
    //   item.dom.close[0].focus();
    // }
    else {//if no, focus popup itself
      item.dom.modal[0].focus();
    }
  }
  _removeSelectorItemsElement() {
    var items = this.items,
        item,
        contentEl;

    for (var i = 0, l = items.length; i < l; i++) {
      if (items[i].type === 'selector' && this.o.delayed) {
        item = items[i];
        if (!item.state.contentInserted) continue;

        contentEl = item.state.contentEl;

        if (item.state.contentElDisplayNone) {
          contentEl[0].style.display = 'none'
          item.state.contentElDisplayNone = undefined;
        }
        if (item.state.contentElStyle) {
          contentEl[0].style.cssText = item.state.contentElStyle;
          item.state.contentElStyle = undefined;
        }
        //return selector element to the dom
        this.dom.body.append(contentEl)
        item.state.contentInserted = false;
      }
    }
  }
  _getDimensions() {
    var o = this.o,
        dimensions = {};
    
    dimensions.window = this._getDomSize(this.dom.window)
    dimensions.container = this._getDomSize(this._g.containerIsBody ? this.dom.window : this.dom.container)

    if(this.state.clickedEl) dimensions.clickedEl = this._getDomSize(this.state.clickedEl)

    if(o.$elem && o.$elem.length === 1) dimensions.el = this._getDomSize(o.$elem)

    return dimensions;
  }
  _getDomSize(domObject) {
    domObject = $(domObject)[0]
    var objIsWindow = $.isWindow(domObject),
        rectOriginal,
        rectComputed,
        d = document,
        documentElement = d.documentElement,
        documentBody = d.body;
    
    if (objIsWindow) {
      rectComputed = {
        el: domObject,
        left: 0,
        top: 0,
        right: documentElement.clientWidth,
        bottom: documentElement.clientHeight,
        width: documentElement.clientWidth,
        height: documentElement.clientHeight,
        scrollWidth: Math.max(
          documentBody.scrollWidth, documentElement.scrollWidth,
          documentBody.offsetWidth, documentElement.offsetWidth,
          documentBody.clientWidth, documentElement.clientWidth
        ),
        scrollHeight: Math.max(
          documentBody.scrollHeight, documentElement.scrollHeight,
          documentBody.offsetHeight, documentElement.offsetHeight,
          documentBody.clientHeight, documentElement.clientHeight
        ),
        scrollLeft: window.pageXOffset || documentElement.scrollLeft || documentBody.scrollLeft || 0,
        scrollTop: window.pageYOffset || documentElement.scrollTop || documentBody.scrollTop || 0
      }
    } else {
      rectOriginal = domObject.getBoundingClientRect()
      // rectComputed = $.extend({}, rectOriginal)//Object.assign dont work with getBoundingClientRect object...
      rectComputed = {
        el:domObject,
        left: rectOriginal.left,
        top: rectOriginal.top,
        right: rectOriginal.right,
        bottom: rectOriginal.bottom
      }
      
      rectComputed.width = rectComputed.right - rectComputed.left;
      rectComputed.height = rectComputed.bottom - rectComputed.top;
      rectComputed.scrollWidth = domObject.scrollWidth;
      rectComputed.scrollHeight = domObject.scrollHeight;
      rectComputed.scrollLeft = domObject.scrollLeft || 0;
      rectComputed.scrollTop = domObject.scrollTop || 0;
    }
    rectComputed.scrollLeftMax = rectComputed.scrollWidth - rectComputed.width < 0 ? 0 : rectComputed.scrollWidth - rectComputed.width;
    rectComputed.scrollTopMax = rectComputed.scrollHeight - rectComputed.height < 0 ? 0 : rectComputed.scrollHeight - rectComputed.height;
    
    return rectComputed;
  }
  _setMaxHeight(item) {
    let o = this.o,
        dimensions = this.state.dimensions,
        height,
        bodyBorderBox;

    if (!o.autoheight || o.autoheight === 'image' && item.type !== 'image') return;

    let v = item.dom,
      modalMargin = summ(v.modal, 'margin'),
      modalPadding = (summ(v.modal, 'padding') + parseInt(v.modal.css('borderTopWidth')) + parseInt(v.modal.css('borderBottomWidth'))) || 0,

      bodyMargin = summ(v.body, 'margin'),
      bodyPadding = (summ(v.body, 'padding') + parseInt(v.body.css('borderTopWidth')) + parseInt(v.body.css('borderBottomWidth'))) || 0,

      containerHeight = (this._g.containerIsBody) ? dimensions.window.height : dimensions.container.height;

      height = containerHeight,

      bodyBorderBox = v.body.css('boxSizing') === 'border-box';

    function summ(el, prop) {
      return (parseInt(el.css(prop + 'Top')) + parseInt(el.css(prop + 'Bottom'))) || 0;
    }

    let headerHeight = 0,
      footerHeight = 0;
    
    (v.header && v.header.length) ? headerHeight = v.header[0].scrollHeight + (parseInt(v.header.css('borderTopWidth')) + parseInt(v.header.css('borderBottomWidth'))) || 0 : 0;
    (v.footer && v.footer.length) ? footerHeight = v.footer[0].scrollHeight + (parseInt(v.footer.css('borderTopWidth')) + parseInt(v.footer.css('borderBottomWidth'))) || 0 : 0;

    height = containerHeight - modalMargin - modalPadding - bodyMargin - headerHeight - footerHeight;

    if (!bodyBorderBox) height -= bodyPadding;


    if (item.type === 'image') {
      var autoheightImg = containerHeight - modalMargin - modalPadding - bodyMargin - bodyPadding - headerHeight - footerHeight;

      if (v.img) v.img.css('maxHeight', autoheightImg + 'px');
    } else {
      v.body.css('maxHeight', height + 'px');
    }
  }
  _getPassedOption(optionName) {//this method needs to check if option was passed specifically by user or get from defaults
    if (this._g.optionsGathered && this._g.optionsGathered[optionName] !== undefined) {
      return this._g.optionsGathered[optionName]
    } else if(this._g.optionsPassed[optionName] && this._g.optionsPassed[optionName] !== undefined) {
      return this._g.optionsPassed[optionName]
    }
  }
  _focusPreviousModal() {//because of possibility to open multiple dialogs, we need to proper focus handling when dialogs are closed
    var openedBox = this.dom.body.find('.njb-wrap'),
      openedInstance;

    if (!openedBox.length) return;
    openedInstance = openedBox[openedBox.length - 1].njBox;
    openedInstance._set_focus(openedInstance.items[openedInstance.state.active]);
  }
}

njBox.defaults = defaults;
njBox.templates = templates;
njBox.text = text;


//get environment info, getDefaultInfo trying to launch as early as possible (even before this init method), but may fail because of missing body tag (if script included in head), so we check it init again
if (document.body && !njBox.g) njBox.g = getDefaultInfo();


njBox.addons = {}
njBox.addAddon = function(name, addonObj) {
  var {options, templates, text, prototype} = addonObj;
  
  this.addons[name] = addonObj;
  
  if (options) $.extend(this.defaults, options);
  if (templates) $.extend(this.templates, templates);
  if (text) $.extend(this.text, text);
  if (prototype) $.extend(this.prototype, prototype);
}


//get instance
njBox.get = function (elem) {
  var el = $(elem)[0];

  return el && el.njBox || undefined
}
njBox.autobind = function (selector) {
  //autobind global
  $(selector).each(function () {
    new njBox({
      elem: $(this)
    })
  }) 
}
if (typeof window !== 'undefined') {//autobind only in browser and on document ready
  $(function () {
    njBox.autobind(njBox.defaults.autobind);
  })
}

return njBox;
})(window, undefined, setTimeout, document);

export default njBox;