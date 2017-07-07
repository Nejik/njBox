/*!
 * njBox - v2.0.0
 * nejikrofl@gmail.com
 * Copyright (c) 2017 N.J.
*/
import j from 'lib/j'
//by default we use jQuery, it makes possible to run plugin with jQuery (for low ie support for example)
let $ = window.jQuery || j;

import {
  getDefaultInfo,
  getItemFromDom,
  defaults
} from 'lib/utils.js';

var njBox = (function(undefined, setTimeout, document) {

class njBox {
  constructor(el, options) {
    if (!arguments.length) {
      console.error('njBox, arguments not passed.');
      return;
    }
    let opts,
      that = this;

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

    opts = opts || {};
    that.co = opts;//constructorOptions

    //this allows users to listen init callbacks via .on() on modal instance
    setTimeout(function () {
      that._init();
    }, 0);
  }

  _init() {
    var that = this;
    if (that.state && that.state.inited) return;//init only once

    var opts = that.co;//constructorOptions
    delete that.co;

    //getDefaultInfo trying to launch as early as possible (even before this init method), but may fail because of missing body tag (if script included in head), so we check it here again
    if (!njBox.g) njBox.g = getDefaultInfo();

    //inner options, current state of app, this.state clears after every hide
    that.state = {
      active: 0,
      arguments: {}//here all arguments from public methods are saved (for using in callbacks/events)
    };

    //inner options, this settings alive throughout the life cycle of the plugin(until destroy)
    that._g = {//globals, state that not cleared after every hide
      optionsPassed: opts
    };
    that._handlers = {};//all callback functions we used in event listeners lives here

    var o = that.o = $.extend({}, njBox.defaults, opts);
    if (o.jquery) $ = o.jquery;
    that.$ = $;

    //we should have dom element or at least content option for creating item
    if (!o.elem && !o.content) {
      that._e('njBox, no elements (o.elem) or content (o.content) for modal.');
      return;
    }
    if (o.elem) {
      var $elem = $(o.elem);
      if (!$elem.length) {
        this._e(`njBox, element not found (${o.elem})`);
        return;
      }
      if ($elem.length > 1) $elem = $($elem[0]);
      if ($elem[0].njBox) {
        this._e('njBox, already inited on this element');
        return;
      }
      $elem[0].njBox = this; //prevent multiple initialization on one element

      var optionsGathered = this._g.optionsGathered = this._gatherData($elem);
      this._cb('options_gathered', optionsGathered, $elem[0]);

      //extend global options with gathered from dom element
      $.extend(true, this.o, optionsGathered)
    }
    
    // initializing addons
    for (let key in njBox.addons) {
      if (njBox.addons.hasOwnProperty(key)) {
        this['_' + key + '_init']();
      }
    }

    //create popup container dom elements
    that.dom = that._createDom();
    that._cb('domready', that.dom);

    var containerIsBody = that._g.containerIsBody = that.dom.container[0] === that.dom.body[0];
    //check if container not relative position
    if (!containerIsBody && that.dom.container.css('position') === 'static') {
      that.dom.container.addClass('njb-relative');
    }
    //if container custom element(not body), use forcely absolute position
    if (!containerIsBody && o.layout === 'fixed') {
      o.layout = 'absolute';
      that.dom.wrap.addClass('njb-absolute');
    }
    
    that._g.els = that.o.el;
    that._g.items_raw = [that.o];
    that._cb('items_raw', that._g);

    that.items = that._createItems(that._g.items_raw);
 
    //this method calculate show/hide animation durations, because native callbacks are buggy
    that._g.animation = that._calculateAnimations();

    //add initial click handlers
    that._addClickHandler();
    if (o.buttonrole && that._g.els) that._g.els.attr('role', o.buttonrole);

    that.state.inited = true;
    that._cb('inited');
  }
  show(index) {
    this.state.arguments.show = arguments;
    this._init();//try to init
    if (index !== undefined) this.state.active = index - 1;

    var o = this.o,
      that = this;

    if (this.state.status !== 'inited') {
      this._e('njBox, show, plugin not inited or in not inited state(probably plugin is already visible or destroyed, or smth else..)');
      return;
    }
    if (!this.items.length) {
      this._e('njBox, smth goes wrong, plugin don\'t create any item to show', true);
      return;
    }

    if (this._cb('show') === false) return;//callback show (we can cancel showing popup, if show callback will return false)
    if (!this.state.focused) this.state.focused = document.activeElement;//for case when modal can be opened programmatically

    this.returnValue = null;

    if (!this.dom.container[0].njb_instances) {
      this.dom.container[0].njb_instances = 1;
    } else {
      this.dom.container[0].njb_instances++;
    }
    // this.dom.container.addClass('njb-open');
    
    this._scrollbar('hide');

    this._backdrop('show');
    

    var containerToInsert;
    //insert modal to page
    if (this._g.popover) {
      containerToInsert = this.dom.container[0];
    } else {
      this.dom.container[0].appendChild(this.dom.wrap[0]);
      containerToInsert = this.dom.items[0];
    }

    //set event handlers
    this._addListeners();

    this._drawItem(this.items[this.state.active], false, containerToInsert);
    this._cb('inserted');

    //draw modal on screen

    this.position();

    //force reflow, we need because firefox has troubles with njb element width, while inside autoheighted image
    this.dom.wrap[0].style.display = 'none';
    this.dom.wrap[0].clientHeight;
    this.dom.wrap[0].style.display = 'block';

    this._uiUpdate();
    this._anim('show');
    
    return this;
  }
  hide() {
    this.state.arguments.hide = arguments;
    if (this.state.status !== 'shown') {
      this._e('njBox, hide, we can hide only showed modal (probably animation is still running or plugin destroyed).')
      return;
    }

    if (this._cb('hide') === false) return;//callback hide
    if (this.state.focused) this.state.focused.focus();

    this._backdrop('hide');

    this._removeListeners();

    this._anim('hide');

    return this;
  }
  position() {
    this.state.arguments.position = arguments;

    var that = this,
        o = this.o,
        state = that.state;

    if (!state || !state.inited || (state.status !== 'show' && state.status !== 'shown')) return;
    
    that.state.dimensions = that._getDimensions();

    this._cb('position');

    //position of global wrapper
    if (o.layout === 'absolute') {
      //global wrap positioning
      var scrollTop = this.state.dimensions.container.scrollTop,
        scrollLeft = this.state.dimensions.container.scrollLeft;

      if (scrollTop <= this.state.dimensions.container.scrollTopMax) {
        this.dom.wrap.css({ 'top': scrollTop + 'px', 'left': scrollLeft + 'px' })
      }

      //backdrop positioning
      this.dom.backdrop.css({ 'width': 'auto', 'height': 'auto' });
      this.dom.backdrop[0].clientHeight;
      this.dom.backdrop.css({
        'width': this.state.dimensions.container.scrollWidth + 'px',
        'height': this.state.dimensions.container.scrollHeight + 'px'
      });
    }
    
    this._setMaxHeight(this.items[this.state.active]);
    
    this._cb('positioned');
    return this;
  }
  destroy() {
    this.state.arguments.destroy = arguments;
    if (!this.state.inited || this.state.status !== 'inited') {
      this._e('njBox, we can destroy only initialized && hidden modals.');
      return;
    }

    this._removeClickHandler();


    this.dom.container.removeClass('njb-relative');

    this._cb('destroy');

    this._events =
      this._g =
      this._handlers =
      this.items =
      this.itemsRaw =
      this.dom =
      this.$ = undefined;
    this.o = {};


    return this;
  }
  update() {
    this.state.arguments.update = arguments;
    this.items = this._createItems();

    this._addClickHandler();

    return this;
  }
  _gatherData(el) {
    let o = this.o,
      $el = $(el),
      dataO = $.extend(true, {}, $el.data()),//data original, copy options to separate object, because we want to delete some options during processing, if we do that on native domstrinmap, deleting will also touch html
      dataProcessed = {};//data processed

    if (!$el.length) {
      return dataProcessed;
    }

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
    if ($el.length) {
      dataProcessed.el = $el
    }

    //try to get href from original attributes
    if ($el[0].tagName.toLowerCase() === 'a') {
      var href = $el.attr('href');
      if (href && href !== '#' && href !== '#!' && !(/^(?:javascript)/i).test(href)) {//test href for real info, not placeholder
        dataProcessed.content = href;
      }
    }

    //get title
    if (o.title_attr) {
      var title_attr = $el.attr(o.title_attr);
      if (title_attr) dataProcessed.title = title_attr;
    }

    $.extend(true, dataProcessed, choosePrefixedData(dataO))

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

    // this._cb('data_gathered', dataProcessed, $el[0]);
    return dataProcessed;
  }
  _createItems(itemsRaw) {
    let items = [];
    for (var i = 0, l = itemsRaw.length; i < l; i++) {
      items.push(this._createItem(itemsRaw[i], i))
    }
    return items;
  }
  _createItem(item, index) {
    var that = this,
        o = that.o,
        normalizedItem = that._normalizeItem(item);

    normalizedItem.dom = that._createItemDom(normalizedItem);

    that._insertItemContent({item:normalizedItem, delayed: o.delayed});

    normalizedItem.toInsert = normalizedItem.dom.modalOuter;

    that._cb('item_created', normalizedItem, index);

    return normalizedItem;
  }
  _normalizeItem(item, el) {
    var that = this,
        evaluatedContent;
    
    if (typeof item.content === 'function') {
      evaluatedContent = item.content.call(that, item);
    } else {
      evaluatedContent = item.content;
    }

    var content = evaluatedContent || that.o.text._missedContent;

    return {
      content: content,
      type: item.type || that._type(content),
      header: item.header,
      footer: item.footer,
      title: item.title,
      el: item.el || el,
      o: {
        status: 'inited'
      },
      raw: item
    }
  }
  _type(content) {//detect content type
    var type = 'html';

    if (typeof content === 'object') {
      if ((window.jQuery && content instanceof window.jQuery) || (window.j && content instanceof window.j)) {
        return 'selector';
      }
    } else
      if (/^[#.]\w/.test(content)) {
        return 'selector';
      } else if (/\.(png|jpg|jpeg|gif|tiff|bmp|webp)(\?\S*)?$/i.test(content)) {
        return 'image';
      }


    return type;
  }
  _createItemDom(item) {
    var that = this,
        o = this.o,
        dom = {},
        modalOuter,
        modal,
        modalFragment = document.createDocumentFragment();

    //main modal wrapper
    dom.modal = modal = $(o.templates.modal);
    modal[0].tabIndex = '-1'
    modal[0].njBox = that;

    dom.modalOuter = modalOuter = $(o.templates.modalOuter);

    if (o.role) modal.attr('role', o.role)
    if (o.label) modal.attr('aria-label', o.label)
    if (o.labelledby) modal.attr('aria-labelledby', o.labelledby)
    if (o.describedby) modal.attr('aria-describedby', o.describedby)

    if (!modal.length) {
      that._e('njBox, error in o.templates.modal');
      return;
    }

    modalOuter[0].appendChild(modal[0]);

    if (item.type !== "template") {
      //insert body
      dom.body = $(o.templates.body);
      if (!dom.body.length) {
        that._e('njBox, error in o.templates.body');
        return;
      }
      //find data-njb-body in item body element
      dom.bodyInput = getItemFromDom(dom.body, 'data-njb-body')

      modalFragment.appendChild(dom.body[0])

      //insert header
      if (item.header) {
        dom.header = $(o.templates.header);

        if (!dom.header.length) {
          that._e('njBox, error in o.templates.header');
          return;
        }
        //insert header info
        dom.headerInput = getItemFromDom(dom.header, 'data-njb-header')

        modalFragment.insertBefore(dom.header[0], modalFragment.firstChild)
      }

      //insert footer
      if (item.footer) {
        dom.footer = $(o.templates.footer);

        if (!dom.footer.length) {
          that._e('njBox, error in njBox.templates.footer');
          return;
        }
        //insert footer info
        dom.footerInput = getItemFromDom(dom.footer, 'data-njb-footer')

        modalFragment.appendChild(dom.footer[0])
      }

      //insert close button
      if (o.close === 'inside') {
        dom.close = $(o.templates.close);
        dom.close.attr('title', o.text.close);

        modalFragment.appendChild(dom.close[0]);
      }

      modal[0].appendChild(modalFragment)
    }

    if (item.type === 'image') {
      modal.addClass('njb--image');
    } else {
      modal.addClass('njb--content');
    }

    return dom;
  }
  _insertItemContent(args) {
    var that = this,
        o = that.o,
        {item, delayed} = args,
        dom = item.dom,
        itemType = item.type,
        itemContent = item.content,
        bodyItemToInsert = dom.bodyInput;
    
    function contentAddedCallback() {
      //insert header content
      if (dom.headerInput && item.header) {
        dom.headerInput.html(item.header)
      }
      //insert footer content
      if (dom.footerInput && item.footer) {
        dom.footerInput.html(item.footer)
      }

      item.o.status = 'loaded';
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
          'textContent' in bodyItemToInsert[0] ? bodyItemToInsert[0].textContent = itemContent : bodyItemToInsert[0].innerText = itemContent;
          contentAddedCallback();
          break;
        case 'selector':
          if (!delayed && !item.o.contentInserted) {
            let contentEl = item.o.contentEl = $(item.content);

            if (contentEl.length) {

              item.o.contentElStyle = contentEl[0].style.cssText;

              item.o.contentElDisplayNone = contentEl.css('display') === 'none';
              if (item.o.contentElDisplayNone) {
                contentEl[0].style.display = 'block';
              }

              bodyItemToInsert.html('')//clear element before inserting other dom element. (e.g. body for case when first time we can't find contentEl on page and error text already here)
              bodyItemToInsert[0].appendChild(contentEl[0]);

              item.o.contentInserted = true;
            } else {//if we don't find element with this selector
              bodyItemToInsert.html(item.content)
            }

            contentAddedCallback();
          }
          break;
        case 'image':
          if (!delayed && !item.o.contentInserted) {
            this._insertImage(item, contentAddedCallback);
          }
          break;
      
        default:
          break;
      }
    }
  }
  _insertImage(item, callback) {
    var that = this,
      o = this.o,
      img = document.createElement('img'),
      $img = $(img),
      ready,
      loaded;

    item.o.status = 'loading';
    item.dom.img = $img;

    item._handlerError = function () {
      $img.off('error', item._handlerError).off('abort', item._handlerError);
      delete item._handlerError;

      that._preloader('hide', item);

      item.dom.bodyInput.html(o.text.imageError.replace('%url%', item.content));

      that._cb('img_e', item);//img_ready, img_load callbacks
      // rendered();

      item.o.status = 'error';
      item.o.contentInserted = true;
    }
    $img.on('error', item._handlerError)
        .on('abort', item._handlerError);

    if (item.title) {
      $img.attr('aria-labelledby', 'njb-title')
    }
    img.src = item.content;

    ready = img.width + img.height > 0;
    loaded = img.complete && img.width + img.height > 0;

    if (o.img === 'ready' && ready || o.img === 'load' && loaded) {
      checkShow(true);
    } else {
      this._preloader('show', item);

      findImgSize(img, function () {
        checkShow('ready');
      });

      item._handlerLoad = function () {
        $img.off('load', item._handlerLoad);
        checkShow('load');
      }
      $img.on('load', item._handlerLoad)
    }

    function checkShow(ev) {
      that._cb('item_img_' + ev, item);//img_ready, img_load callbacks

      if (ev !== o.img && ev !== true) return;

      item.o.status = 'loaded';
      that._preloader('hide', item);

      $img.attr('width', 'auto')//for IE <= 10

      //insert content
      item.dom.bodyInput[0].appendChild(img);
      item.o.contentInserted = true;
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
  _createDom() {
    var that = this,
        o = this.o,
        dom = {
          document: $(document),
          window: $(window),
          html: $(document.documentElement),
          body: $(document.body)
        };

    //find container
    dom.container = $(o.container);
    if (!dom.container.length) {
      that._e('njBox, can\'t find container element. (we use body instead)');
      dom.container = dom.body;//in case if we have no container element, or wrong selector for container element
    }
    
    //create core elements
    dom.wrap = $(o.templates.wrap);
    if (!dom.wrap.length) {
      that._e('njBox, smth wrong with o.templates.wrap.');
      return;
    }
    if (o['class']) dom.wrap.addClass(o['class']);
    dom.wrap[0].njBox = that;
    if (o.zindex) dom.wrap.css('zIndex', o.zindex);

    dom.items = dom.wrap.find('.njb-items');

    //create ui layer
    dom.ui = $(o.templates.ui)
    dom.wrap[0].appendChild(dom.ui[0])

    dom.title = $(o.templates.title)
    dom.ui[0].appendChild(dom.title[0])

    // insert outside close button
    if (o.close === 'outside') {
      dom.close = $(o.templates.close)
      dom.close.attr('title', o.text.close).attr('aria-label', o.text.close)

      dom.ui[0].appendChild(dom.close[0])
    }

    // insert invisible, focusable nodes.
    // while this dialog is open, we use these to make sure that focus never
    // leaves modal boundaries
    dom.focusCatchBefore = $(o.templates.focusCatcher)
    dom.wrap[0].insertBefore(dom.focusCatchBefore[0], dom.wrap[0].firstChild)

    dom.focusCatchAfter = $(o.templates.focusCatcher)
    dom.wrap[0].appendChild(dom.focusCatchAfter[0])

    return dom;
  }
  _getPassedOption(optionName) {//this method needs to check if option was passed specifically by user or get from defaults
    if (this._g.optionsGathered[optionName] !== undefined) {
      return this._g.optionsGathered[optionName]
    } else if(this._g.optionsPassed[optionName] !== undefined) {
      return this._g.optionsPassed[optionName]
    }
  }
  _getDimensions() {
    var that = this,
        o = that.o,
        dimensions = {};
    
    dimensions.window = that._getDomSize(that.dom.window[0]);
    dimensions.container = that._getDomSize(this._g.containerIsBody ? that.dom.window[0] : this.dom.container[0])
    dimensions.modal = that._getDomSize(that.items[that.state.active].dom.modal[0]);
    dimensions.clickedEl = that._getDomSize(that.state.clickedEl);

    dimensions.autoheight = (that._g.containerIsBody) ? dimensions.window.height : dimensions.container.height;

    return dimensions;
  }
  _getDomSize(domObject) {
    var isWindow = $.isWindow(domObject),
        rectOriginal,
        rectComputed,
        d = document,
        documentElement = d.documentElement,
        documentBody = d.body;
    
    if (isWindow) {
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
        scrollLeft: window.pageXOffset || documentElement.scrollLeft || documentBody.scrollLeft,
        scrollTop: window.pageYOffset || documentElement.scrollTop || documentBody.scrollTop
      }
    } else {
      rectOriginal = domObject.getBoundingClientRect()
      rectComputed = this.$.extend({}, rectOriginal)
      
      rectComputed.el = domObject;
      rectComputed.width = rectComputed.right - rectComputed.left;
      rectComputed.height = rectComputed.bottom - rectComputed.top;
      rectComputed.scrollWidth = domObject.scrollWidth;
      rectComputed.scrollHeight = domObject.scrollHeight;
      rectComputed.scrollLeft = domObject.scrollLeft;
      rectComputed.scrollTop = domObject.scrollTop;
    }
    rectComputed.scrollLeftMax = rectComputed.scrollWidth - rectComputed.width < 0 ? 0 : rectComputed.scrollWidth - rectComputed.width;
    rectComputed.scrollTopMax = rectComputed.scrollHeight - rectComputed.height < 0 ? 0 : rectComputed.scrollHeight - rectComputed.height;
    
    return rectComputed;
  }
  _setMaxHeight(item) {
    let o = this.o;

    if (!o.autoheight || o.autoheight === 'image' && item.type !== 'image' || this._g.popover) return;

    if (!this.state.autoheightAdded) {
      // this.dom.wrap.addClass('njb-wrap--autoheight');
      (o.autoheight === true) ? this.dom.wrap.addClass('njb-wrap--autoheight-true') : this.dom.wrap.addClass('njb-wrap--autoheight-image')
      this.state.autoheightAdded = true
    }

    let v = item.dom,
      modalMargin = summ(v.modal, 'margin'),
      modalPadding = (summ(v.modal, 'padding') + parseInt(v.modal.css('borderTopWidth')) + parseInt(v.modal.css('borderBottomWidth'))) || 0,

      bodyMargin = summ(v.body, 'margin'),
      bodyPadding = (summ(v.body, 'padding') + parseInt(v.body.css('borderTopWidth')) + parseInt(v.body.css('borderBottomWidth'))) || 0,

      containerHeight = this.state.dimensions.autoheight,

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
  _drawItem(item, prepend, container) {
    var that = this,
        o = that.o,
        itemToInsert = item.toInsert[0];
    
    that._cb('item_prepare', item);

    if (o.delayed) {
      that._insertItemContent({item:that.items[that.state.active], delayed: false});
    }

    if (prepend) {
      container.insertBefore(itemToInsert, container.firstChild)
    } else {
      container.appendChild(itemToInsert);
    }

    that._cb('item_inserted', item);
  }
  
  _removeSelectorItemsElement() {
    var items = this.items,
      item,
      contentEl;

    for (var i = 0, l = items.length; i < l; i++) {
      if (items[i].type === 'selector' && this.o.delayed) {
        item = items[i];
        if (!item.o.contentInserted) continue;

        contentEl = item.o.contentEl;

        if (item.o.contentElDisplayNone) {
          contentEl[0].style.display = 'none'
          item.o.contentElDisplayNone = undefined;
        }
        if (item.o.contentElStyle) {
          contentEl[0].style.cssText = item.o.contentElStyle;
          item.o.contentElStyle = undefined;
        }
        //return selector element to the dom
        this.dom.body[0].appendChild(contentEl[0])
        item.o.contentInserted = false;
      }
    }
  }
  _focus_set(item, first) {
    var o = this.o,
      focusable,
      focusEl;

    if (first) {
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
  _addClickHandler() {//initial click handlers
    var that = this,
        o = this.o,
        handlers = that._handlers;

    that._removeClickHandler();

    handlers.elsClick = that._clickHandler();

    if (o.click) {
      if (that._g.els && that._g.els.length) {
        that._g.els.on('click', handlers.elsClick)
      }
    }

    if (o.clickels) {
      $(o.clickels).on('click', handlers.elsClick);
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

      if (that.state.status !== 'inited') {
        that._e('njBox, show, plugin not inited or in not inited state(probably plugin is already visible or destroyed, or smth else..)');
        return;
      }
      if ($(el).closest('.njb-close-system, .njb-arrow').length) return;//don't remember why it here O_o


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
      if(that.state.clickedEl === e.target || that.state.status !== 'shown') return;
      var $el = $(e.target),
        prevent = $el.closest('.njb, .njb-ui').length;
      if (prevent) return;

      (e.preventDefault) ? e.preventDefault() : e.returnValue = false;


      if (o.out) {
        if (that._cb('cancel') === false) return;
        that.hide();
      } else {
        that.items[that.state.active].dom.modal.addClass('njb--pulse');
        that._focus_set(that.items[that.state.active]);

        setTimeout(function () {
          that.items[that.state.active].dom.modal.removeClass('njb--pulse');
        }, that._getAnimTime(that.items[that.state.active].dom.modal[0]))
      }
    }

    that.dom.container.on('resize', h.container_resize)
                      .on('scroll', h.container_scroll)
    
    that.dom.container.on('click', h.container_out)

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
            if (that._cb('cancel') === false) return;
            that.hide();
          }

          (e.preventDefault) ? e.preventDefault() : e.returnValue = false;
          break;

      }
    }
    h.wrap_close = function (e) {
      (e.preventDefault) ? e.preventDefault() : e.returnValue = false;

      if (that._cb('cancel') === false) return;
      that.hide();
    }
    h.wrap_ok = function (e) {
      (e.preventDefault) ? e.preventDefault() : e.returnValue = false;

      if (that._cb('ok') === false) return;
      that.hide();
    }
    h.wrap_cancel = function (e) {
      (e.preventDefault) ? e.preventDefault() : e.returnValue = false;

      if (that._cb('cancel') === false) return;
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
          that._focus_set(that.items[that.state.active]);
        } else {
          that._focus_set(that.items[that.state.active], true);
        }
      } else {
        that._focus_set(that.items[that.state.active], true);
      }
    }
    h.focusCatchAfter = function (e) {
      that._focus_set(that.items[that.state.active]);
    }

    this.dom.focusCatchBefore.on('focus', h.focusCatchBefore)
    this.dom.focusCatchAfter.on('focus', h.focusCatchAfter)

    this._cb('listeners_added');
  }
  _removeListeners() {
    var h = this._handlers,
        that = this;

    that.dom.container.off('resize', h.container_resize)
      .off('scroll', h.container_scroll)
      .off('click', h.container_out)

    that.dom.wrap
      .off('resize', h.wrap_resize)
      .off('scroll', h.wrap_scroll)
      .off('keydown', h.wrap_keydown)
      .undelegate('[data-njb-close]', 'click', h.wrap_close)
      .undelegate('[data-njb-ok]', 'click', h.wrap_ok)
      .undelegate('[data-njb-cancel]', 'click', h.wrap_cancel)


    that.dom.window
      .off('resize', h.window_resize)
      .off('scroll', h.window_scroll)
      .off('orientationchange', h.window_orientation)


    //remove link to all previous handlers
    var elsClick = h.elsClick;
    this._handlers = {
      elsClick: elsClick
    }

    that.dom.focusCatchBefore.off('focus', h.focusCatchBefore)
    that.dom.focusCatchAfter.off('focus', h.focusCatchAfter)

    this._cb('listeners_removed');
  }

  _preloader(type, item) {
    var o = this.o,
      that = this;

    switch (type) {
      case 'show':
        item.o.preloader = true;
        item.dom.preloader = $(o.templates.preloader)
                              .attr('title', o.text.preloader);

        item.dom.modal.addClass('njb--loading');
        item.dom.bodyInput[0].appendChild(item.dom.preloader[0])
        break;

      case 'hide':
        if (!item.o.preloader) return;

        item.dom.preloader[0].parentElement.removeChild(item.dom.preloader[0]);
        item.dom.modal.removeClass('njb--loading');
        delete item.dom.preloader;
        delete item.o.preloader;

        break;
    }
  }
  _uiUpdate(index) {
    index = index || this.state.active;

    var o = this.o,
      item = this.items[index];

    if (!item) {
      this._e('njBox, can\'t update ui info from item index - ' + index);
      return;
    }

    //set title
    if (item.title) {
      this.dom.ui.addClass('njb-ui--title');
    } else {
      this.dom.ui.removeClass('njb-ui--title');
    }
    this.dom.wrap.find('[data-njb-title]').html(item.title || '')

    if (item.type === 'image') {
      this.dom.wrap.removeClass('njb-wrap--content').addClass('njb-wrap--image');
    } else {
      this.dom.wrap.removeClass('njb-wrap--image').addClass('njb-wrap--content');
    }
  }
















  _scrollbar(type) {
    var o = this.o;
    switch (type) {
      case 'hide':
        if (o.scrollbar === 'hide') {
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
        }
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
        this.dom.backdrop = $(o.templates.backdrop);

        if (this.state.backdropVisible) return;

        if (o.backdrop === true) {
          if (o.backdropassist) this.dom.backdrop.css('transitionDuration', this._g.animation.showDur + 'ms')

          //insert backdrop div
          if (o.layout === 'absolute') this.dom.backdrop.addClass('njb-absolute');
          this.dom.container[0].appendChild(this.dom.backdrop[0]);

          // this.dom.backdrop[0].clientHeight;

          setTimeout(function () {//this prevent page from scrolling in chrome while background transition is working..., also needed as reflow
            that.dom.backdrop.addClass('njb-backdrop--visible');
          }, 0)

          this.state.backdropVisible = true;
        }
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
      show: animShow,
      hide: animHide,
      showDur: animShowDur,
      hideDur: animHideDur
    }
  }
  _getAnimTime(el, property) {//get max animation or transition time
    function _getMaxTransitionDuration(el, property) {//function also can get animation duration
      var $el = $(el),
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
  _anim(type) {
    var o = this.o,
      that = this,
      modal = this.items[this.state.active].dom.modal,
      animShow = this._g.animation.show,
      animHide = this._g.animation.hide,
      animShowDur = this._g.animation.showDur,
      animHideDur = this._g.animation.hideDur;


    switch (type) {
      case 'show':
        this.dom.wrap[0].clientHeight;//fore reflow before applying class
        this.dom.wrap.addClass('njb-wrap--visible');

        if (animShow) {
          if (o.animclass) modal.addClass(o.animclass);

          modal.attr('open', '');
          modal.addClass(animShow);

          setTimeout(shownCallback, animShowDur);
        } else {
          shownCallback();
        }
        break;
      case 'hide':
        modal[0].removeAttribute('open');
        this.dom.wrap.removeClass('njb-wrap--visible')

        if (animHide) {
          if (o.animclass) modal.addClass(o.animclass);
          if (animHide === animShow) modal.addClass('njb-anim-reverse');
          modal.addClass(animHide);

          setTimeout(hiddenCallback, animHideDur)
        } else {
          hiddenCallback();
        }
        break;
    }
    function shownCallback() {
      if (o.animclass) modal.removeClass(o.animclass);
      modal.removeClass(animShow);

      that._cb('shown');
      that._focus_set(that.items[that.state.active]);
    }
    function hiddenCallback() {
      if (o.animclass) modal.removeClass(o.animclass);
      if (animHide === animShow) modal.removeClass('njb-anim-reverse');
      modal.removeClass(animHide);

      that._clear();
      that._cb('hidden');
    }
  }
  _focusPreviousModal() {//because of possibility to open multiple dialogs, we need to proper focus handling when dialogs are closed
    var openedBox = this.dom.body.find('.njb-wrap'),
      openedInstance;

    if (!openedBox.length) return;
    openedInstance = openedBox[openedBox.length - 1].njBox;
    openedInstance._focus_set(openedInstance.items[openedInstance.state.active]);
  }
  _clear() {
    var o = this.o,
        modal = this.items[this.state.active].dom.modal;

    this._cb('clear');

    if (this.dom.container) this.dom.container[0].njb_instances--;
    // if (this.dom.container[0].njb_instances === 0) this.dom.container.removeClass('njb-open');

    if (o['class']) this.dom.wrap.removeClass(o['class']);

    this._scrollbar('show');

    if(this._g.popover) {
      modal[0].parentNode.removeChild(modal[0]);
      modal.css('left','0')
            .css('top','0')
    } else {
      if (this.dom.wrap && this.dom.wrap.length) this.dom.wrap[0].parentNode.removeChild(this.dom.wrap[0]);
    }

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

    this.state = {
      active: 0,
      arguments: {},
      inited: true,
      state: 'inited'
    };

    this._cb('cleared');
  }
  _e(msg, clear) {//_e
    if (!msg) return;

    if (clear) this._clear();
  }
  _cb(type) {//cb - callback
    var o = this.o,
      callbackResult;

    if (type === 'inited' ||
      type === 'show' ||
      type === 'shown' ||
      type === 'hide' ||
      type === 'hidden' ||
      type === 'destroy' ||
      type === 'destroyed'
    ) {
      this.state.status = type;
    }
    //make some stuff on callbacks
    switch (type) {
      case 'hidden':
        this.state.status = 'inited';
        if (o.focusprevious) this._focusPreviousModal();
        break;
    }

    //trigger callbacks

    //trigger on modal instance
    this.trigger.apply(this, arguments);


    //trigger common callback function from options
    var cbArgs = Array.prototype.slice.call(arguments);
    if (o['oncb'] && typeof o['oncb'] === 'function') {
      callbackResult = o['oncb'].apply(this, cbArgs);
    }

    //trigger common global callback on instance
    this.trigger.apply(this, ['cb'].concat(cbArgs));


    //trigger callback from options with "on" prefix (onshow, onhide)
    var clearArgs = Array.prototype.slice.call(arguments, 1);

    if (type === 'ok' || type === 'cancel') {
      let modal = this.items[this.state.active].dom.modal,
        prompt_input = modal.find('[data-njb-return]'),
        prompt_value;
      if (prompt_input.length) prompt_value = prompt_input[0].value || null;

      clearArgs.unshift(prompt_value)
      this.returnValue = prompt_value;
    }

    if (typeof o['on' + type] === 'function') {
      callbackResult = o['on' + type].apply(this, clearArgs);
    }
    return callbackResult;
  }

  //event emitter
  on(event, fct) {
    this._events = this._events || {};
    this._events[event] = this._events[event] || [];
    this._events[event].push(fct);

    return this;
  }
  off(event, fct) {
    this._events = this._events || {};
    if (event in this._events === false) return;
    this._events[event].splice(this._events[event].indexOf(fct), 1);
    return this;
  }
  trigger(event /* , args... */) {
    this._events = this._events || {};
    if (event in this._events === false) return;
    for (var i = 0; i < this._events[event].length; i++) {
      this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    return this;
  }
}
//default checks
if (document.body && !njBox.g) njBox.g = getDefaultInfo();

// njBox.prototype.showModal = njBox.prototype.show;
//global options

//addons
njBox.addons = {}
//default settings
njBox.defaults = defaults;

njBox.addAddon = function (name, addon) {
  njBox.addons[name] = true;

  if (addon.options) $.extend(true, njBox.defaults, addon.options);
  $.extend(njBox.prototype, addon.prototype);
}

//get instance
njBox.get = function (elem) {
  var el = $(elem)[0];

  if (el) {
    return el.njBox || undefined;
  } else {
    return undefined;
  };
}
//autobind functions
njBox.autobind = function () {
  //autobind global
  $(njBox.defaults.autobind).each(function () {
    new njBox({
      elem: $(this)
    })
  }) 
}
if (typeof window !== 'undefined') {//autobind only in browser and on document ready
  $(function () {
    njBox.autobind();
  })
}





















//builtin dialog methods

njBox.alert = function (content, okCb, cancelCb) {
  return new njBox({
    content: function (item) {
      return (
        `<div class="njb__body">
${content || this.o.text._missedContent}
</div>
<div class="njb__footer">
  <button data-njb-ok>${this.o.text.ok}</button>
</div>`);
    },
    type: 'template',
    role: 'alertdialog',
    out: false,
    onok: okCb,
    oncancel: cancelCb
  }).show()
}
njBox.confirm = function (content, okCb, cancelCb) {
  return new njBox({
    content: function (item) {
      return (
        `<div class="njb__body">
${content || this.o.text._missedContent}
</div>
<div class="njb__footer">
  <button data-njb-ok>${this.o.text.ok}</button>
  <button data-njb-cancel>${this.o.text.cancel}</button>
</div>`);
    },
    type: 'template',
    role: 'alertdialog',
    out: false,
    onok: okCb,
    oncancel: cancelCb
  }).show()
}
njBox.prompt = function (content, placeholder, okCb, cancelCb) {
  if (typeof placeholder === 'function') {
    cancelCb = okCb;
    okCb = placeholder;
    placeholder = '';
  }

  return new njBox({
    content: function (item) {
      return (
        `<div class="njb__body">
${content || this.o.text._missedContent}
<div>
  <input data-njb-return type="text" placeholder="${placeholder || ''}" />
</div>
</div>
<div class="njb__footer">
  <button data-njb-ok>${this.o.text.ok}</button>
  <button data-njb-cancel>${this.o.text.cancel}</button>
</div>`);
    },
    type: 'template',
    role: 'alertdialog',
    out: false,
    onok: okCb,
    oncancel: cancelCb
  }).show()
}

return njBox;
})(undefined, setTimeout, document);

export default njBox;