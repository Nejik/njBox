/*!
 * njBox - v2.0.0
 * nejikrofl@gmail.com
 * Copyright (c) 2017 N.J.
*/
import j from 'lib/j'
//by default we use jQuery, it makes possible to run plugin with jQuery (low ie support for example)
let $ = window.jQuery || j;

import {
  getDefaultInfo,
  defaults
} from 'lib/utils.js';

class njBox {
  constructor(el, options) {//el can be a string, selector/dom/j/jQuery element
    if (!arguments.length) {
      console.error('njBox, arguments not passed.');
      return;
    }
    let opts;

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

    this._init(opts);
  }

  _init(opts) {
    //run only on first init, because we can't if we will try to do that before any initializations, it maybe a sutiation, where script was injected in head, and we have no even body tag
    if (!njBox.g) njBox.g = getDefaultInfo();

    this.active = 0;

    //inner options, current state of app, this.state clears after every hide
    this.state = {};

    //inner options, this settings alive throughout the life cycle of the plugin(until destroy)
    this._globals = {

    }
    this._handlers = {};//all callback functions we used in event listeners lives here

    this._globals.passedOptions = opts;
    let o = this.o = $.extend({}, njBox.defaults, opts);
    if (o.jquery) $ = o.jquery;

    this.v = {
      document: $(document),
      window: $(window),
      html: $(document.documentElement),
      body: $(document.body)

      //... other will be added later
    }



    //we should have dom element or at least content option for creating item
    if (!o.elem && !o.content) {
      this._error('njBox, no elements (o.elem) or content (o.content) for modal.');
      return;
    }
    if (o.elem) {
      let $elem = $(o.elem);
      if (!$elem.length) {
        this._error(`njBox, element not found (${o.elem})`);
        return;
      }
      if ($elem.length > 1) $elem = $($elem[0]);
      if ($elem[0].njBox) {
        this._error('njBox, already inited on this element');
        return;
      }
      $elem[0].njBox = this; //prevent multiple initialization on one element

      this._globals.gatheredOptions = this._gatherData($elem);

      //extend global options with gathered from dom element
      $.extend(true, this.o, this._globals.gatheredOptions)


      //gather dom elements from which we will create modal window/gallery, this method will be replaced in gallery addon
      this.els = this._gatherElements();
    }

    //create items
    this.items = this._createItems(this._createRawItems());

    //create popup container dom elements
    this._createDom();

    //this method calculate show/hide animation durations, because native callbacks buggy
    this._calculateAnimations();

    //add initial click handlers
    this._setClickHandlers();

    this.state.inited = true;
    this._cb('inited');
  }

  show(index) {
    if (index) this.active = parseInt(index);//index uses in gallery

    var o = this.o;

    if (this.state.state !== 'inited') {
      this._error('njBox, show, plugin not inited or in not inited state(probably plugin is already visible or destroyed, or smth else..)');
      return;
    }
    if (!this.items.length) {
      this._error('njBox, smth goes wrong, plugin don\'t create any item to show', true);
      return;
    }

    if (this._cb('show') === false) return;//callback show (we can cancel showing popup, if show callback will return false)
    this.returnValue = null;

    if (!this.v.container[0].njb_instances) {
      this.v.container[0].njb_instances = 1;
    } else {
      this.v.container[0].njb_instances++;
    }
    this.v.container.addClass('njb-open');

    this._scrollbar('hide');

    this._backdrop('show');

    //set event handlers
    this._setEventsHandlers();

    //insert wrap
    this.v.container[0].appendChild(this.v.wrap[0]);

    //draw modal on screen
    this._drawItem(this.active);

    this.position();

    this._anim('show');

    return this;
  }
  hide() {
    if (this.state.state !== 'shown') {
      this._error('njBox, hide, we can hide only showed modal (probably animation is still running or plugin destroyed).')
      return;
    }

    var o = this.o,
      h = this._handlers;

    if (this._cb('hide') === false) return;//callback hide
    if (this.state.clickedEl) this.state.clickedEl.focus();

    this._backdrop('hide');

    this._removeEventsHandlers();

    this._anim('hide');

    return this;
  }
  position() {
    if (!this.state.inited) return;

    var o = this.o;

    this._getContainerSize();

    //position of global wrapper
    if (o.position === 'absolute') {
      //global wrap positioning
      var scrollTop = this.state.dimensions.containerScrollTop,
        scrollLeft = this.state.dimensions.containerScrollLeft;

      if (scrollTop <= this.state.dimensions.containerMaxScrollTop) {
        this.v.wrap.css({ 'top': scrollTop + 'px', 'left': scrollLeft + 'px' })
      }

      //backdrop positioning
      this.v.backdrop.css({ 'width': 'auto', 'height': 'auto' });
      this.v.backdrop[0].clientHeight;
      this.v.backdrop.css({
        'width': this.state.dimensions.containerScrollWidth + 'px',
        'height': this.state.dimensions.containerScrollHeight + 'px'
      });
    }
    this._setMaxHeight(this.items[this.active]);

    this._cb('position');

    return this;
  }
  destroy() {
    if (!this.state.inited || this.state.state !== 'inited') {
      this._error('njBox, we can destroy only initialized && hidden modals.');
      return;
    }

    if (this.els && this.els.length) {
      this.els.off('click', this._handlers.elsClick)

      if (this.o.clickels) {
        $(this.o.clickels).off('click', this._handlers.elsClick)
      }
    }


    this.v.container.removeClass('njb-relative');

    this._globals = undefined;
    this._handlers = undefined;
    this.els = undefined;
    this.items = undefined;
    this.v = undefined;
    this.o = {};

    this._cb('destroyed');

  }
  _getContainerSize() {
    var o = this.o;

    var d = this.state.dimensions = {}


    if (this.v.container[0] === this.v.body[0]) {
      d.containerWidth = document.documentElement.clientWidth;
      d.containerHeight = document.documentElement.clientHeight;
      d.containerScrollWidth = Math.max(
        document.body.scrollWidth, document.documentElement.scrollWidth,
        document.body.offsetWidth, document.documentElement.offsetWidth,
        document.body.clientWidth, document.documentElement.clientWidth
      );
      d.containerScrollHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
      );
      d.containerScrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      d.containerScrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;

    } else {
      d.containerWidth = this.v.container[0].clientWidth;
      d.containerHeight = this.v.container[0].clientHeight;
      d.containerScrollWidth = this.v.container[0].scrollWidth;
      d.containerScrollHeight = this.v.container[0].scrollHeight;
      d.containerScrollTop = this.v.container[0].scrollTop;
      d.containerScrollLeft = this.v.container[0].scrollLeft;
    }

    d.containerMaxScrollTop = d.containerScrollHeight - d.containerHeight;

    // d.winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    d.winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    d.autoheight = (this.v.container[0] === this.v.body[0]) ? d.winHeight : d.containerHeight;
    // if(this._o.scrollbarHidden) {
    //  this._o.winWidth -= njBox.g.scrollbarSize;
    // }
  }
  _setMaxHeight(item) {
    let o = this.o;

    if (!o.autoheight || o.autoheight === 'image' && item.type !== 'image') return;

    if (!this.state.autoheightAdded) {
      this.v.wrap.addClass('njb-autoheight');
      (o.autoheight === true) ? this.v.wrap.addClass('njb-autoheight--true') : this.v.wrap.addClass('njb-autoheight--image')
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

      if(v.img) v.img.css('maxHeight', autoheightImg + 'px');
    } else {
      v.body.css('maxHeight', height + 'px');
    }
  }
  //return array with raw options gathered from items from which gallery/modal will be created, this method will be replaced in gallery addon
  _createRawItems() {
    return [this.o];
  }
  //gather dom elements from which we will create modal window/gallery, this method will be replaced in gallery addon
  _gatherElements() {
    return this.o.el;
  }
  _gatherData(el) {
    let o = this.o,
      $el = $(el),
      dataO = $el.data(),//data original
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
        this._error('njBox, fail to parse options from njb-options');
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
      var parsedFloat = parseFloat(val);
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

    this._cb('data_gathered', dataProcessed, $el[0]);
    return dataProcessed;
  }
  _createItems(els) {
    let items = [];
    for (let i = 0, l = els.length; i < l; i++) {
      items.push(this._createItem(els[i]))
    }
    return items;
  }
  _createItem(item) {
    let normalizedItem = this._normalizeItem(item);

    this._createDomForItem(normalizedItem);

    return normalizedItem;
  }
  _normalizeItem(item, el) {
    let evaluatedContent;
    if (typeof item.content === 'function') {
      evaluatedContent = item.content.call(this, item);
    } else {
      evaluatedContent = item.content;
    }

    return {
      content: evaluatedContent || this.o.text._missedContent,
      type: item.type || this._type(item.content || this.o.text._missedContent),
      header: item.header,
      footer: item.footer,
      title: item.title,
      el: item.el || el,
      o: {
        status: 'inited'
      }
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
  _createDomForItem(item) {
    var o = this.o,
      dom = item.dom = {},
      modalFragment = document.createDocumentFragment();

    dom.modalOuter = $(o.templates.modalOuter);
    dom.modalOuter[0].njBox = this;

    //main modal wrapper
    dom.modal = $(o.templates.modal);
    dom.modal[0].setAttribute('tabindex', '-1');
    dom.modal[0].njBox = this;
    if (!dom.modal.length) {
      this._error('njBox, error in o.templates.modal');
      return;
    }

    dom.modalOuter[0].appendChild(dom.modal[0]);

    if (item.type === "template") {
      dom.modal[0].innerHTML = item.content;
    } else {
      //insert body
      dom.body = $(o.templates.body);
      if (!dom.body.length) {
        this._error('njBox, error in o.templates.body');
        return;
      }

      this._insertItemBodyContent(item);

      modalFragment.appendChild(dom.body[0])

      //insert header
      if (item.header) {
        dom.header = $(o.templates.header);

        if (!dom.header.length) {
          this._error('njBox, error in o.templates.header');
          return;
        }
        //insert header info
        var headerInput = (dom.header[0].getAttribute('data-njb-header') !== null) ? headerInput = dom.header : headerInput = dom.header.find('[data-njb-header]')
        headerInput[0].innerHTML = item.header;

        modalFragment.insertBefore(dom.header[0], modalFragment.firstChild)
      }

      //insert footer
      if (item.footer) {
        dom.footer = $(o.templates.footer);

        if (!dom.footer.length) {
          this._error('njBox, error in njBox.templates.footer');
          return;
        }
        //insert footer info
        var footerInput = (dom.footer[0].getAttribute('data-njb-footer') !== null) ? footerInput = dom.footer : footerInput = dom.footer.find('[data-njb-footer]')
        footerInput[0].innerHTML = item.footer;

        modalFragment.appendChild(dom.footer[0])
      }

      //insert close button
      if (o.close === 'inside') {
        dom.close = $(o.templates.close);
        dom.close[0].setAttribute('title', o.text.close);

        modalFragment.appendChild(dom.close[0]);
      }

      dom.modal[0].appendChild(modalFragment)
    }

    this._cb('item_domready', item);
  }
  _insertItemBodyContent(item) {
    var o = this.o;

    switch (item.type) {
      case 'text':
        'textContent' in item.dom.body[0] ? item.dom.body[0].textContent = item.content : item.dom.body[0].innerText = item.content;
        item.o.status = 'loaded';
        break;
      case 'html':
        item.dom.body[0].innerHTML = item.content;
        item.o.status = 'loaded';
        break;
      case 'selector':
        this._getItemFromSelector(item);
        item.o.status = 'loaded';
        break;
      case 'image':
        if(o.imgload === 'init') this._insertImage(item);
        break;
      default:
        this._error('njBox, seems that you use wrong type(' + item.type + ') of item.', true);
        item.o.status = 'loaded';
        return;
        break;
    }
    if (item.type === 'image') {
      item.dom.modal.addClass('njb--image');
    } else {
      item.dom.modal.addClass('njb--content');
    }
  }
  _getItemFromSelector(item) {
    item.o.contentEl = $(item.content);

    if (!item.o.contentEl.length) {
      item.dom.body[0].innerHTML = item.content;//if we don't find element with this selector
    }
  }
  _insertImage(item) {
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

      // that._preloader('hide', index);

      item.dom.body[0].innerHTML = o.text.imageError.replace('%url%', item.content);

      that._cb('img_error', item);//img_ready, img_load callbacks
      // rendered();

      item.o.status = 'error';
      item.o.imageInserted = true;
    }
    $img.on('error', item._handlerError).on('abort', item._handlerError);

    if (item.title) img.title = item.title;
    img.src = item.content;

    ready = img.width + img.height > 0;
    loaded = img.complete && img.width + img.height > 0;

    if (o.img === 'ready' && ready || o.img === 'load' && loaded) {
      checkShow(true);
    } else {
      // this._preloader('show', index);

      item._handlerImgReady = function () {
        $img.off('njb_ready', item._handlerImgReady);
        checkShow('ready');
      }
      $img.on('njb_ready', item._handlerImgReady)
      findImgSize(img);

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
      // that._preloader('hide', item);

      $img.attr('width', 'auto')//for IE <= 10

      //insert content
      item.dom.body[0].appendChild(img);
      item.o.imageInserted = true;
    }
    //helper function for image type
    function findImgSize(img) {
      var counter = 0,
        interval,
        njbSetInterval = function (delay) {
          if (interval) {
            clearInterval(interval);
          }

          interval = setInterval(function () {
            if (img.width > 0) {
              $img.triggerHandler('njb_ready');

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
    var o = this.o;

    //find container
    this.v.container = $(o.container);
    if (!this.v.container.length) {
      this._error('njBox, can\'t find container element. (we use body instead)');
      this.v.container = this.v.body;//in case if we have no container element, or wrong selector for container element
    }
    //check if container not relative position
    if (this.v.container[0] !== this.v.body[0] && this.v.container.css('position') === 'static') {
      this.v.container.addClass('njb-relative');
    }

    //create core elements
    this.v.wrap = $(o.templates.wrap);
    if (!this.v.wrap.length) {
      this._error('njBox, smth wrong with o.templates.wrap.');
      return;
    }
    if (o['class']) this.v.wrap.addClass(o['class']);
    this.v.wrap[0].njBox = this;
    if (o.zindex) this.v.wrap.css('zIndex', o.zindex);

    this.v.items = this.v.wrap.find('.njb-items');

    //if container custom element(not body), use forcely absolute position
    if (this.v.container[0] !== this.v.body[0]) o.position = 'absolute';
    if (o.position === 'absolute') this.v.wrap.addClass('njb-absolute');

    // insert outside close button
    if (o.close === 'outside') {
      var closeBtn = this.v.close = $(o.templates.close);
      var closeBtn = closeBtn[0];
      closeBtn.setAttribute('title', o.text.close);

      this.v.wrap[0].appendChild(closeBtn);
    }

    this.v.focusCatcher = $(o.templates.focusCatcher);
    this.v.wrap[0].appendChild(this.v.focusCatcher[0]);
  }
  _drawItem(index) {
    var o = this.o,
      item = this.items[index];

    if (!item) {
      this._error('njBox, we have no item with this index - ' + index, true);
      return;
    }

    this._cb('item_prepare', item);

    //insert index item
    this._insertSelectorElements();
    if(o.imgload === 'show') this._insertImageElements();

    this.v.items[0].appendChild(item.dom.modalOuter[0]);

    this._cb('item_inserted', item);
  }
  _insertSelectorElements() {
    var items = this.items,
      item,
      contentEl;

    for (var i = 0, l = items.length; i < l; i++) {
      if (items[i].type === 'selector') {
        item = items[i];

        if (item.o.contentElInserted) {
          continue;
        }

        contentEl = item.o.contentEl;

        //try to find element for popup again on every show
        if (!contentEl || !contentEl.length) {
          this._getItemFromSelector(item);
          contentEl = item.o.contentEl;
        }
        if (!contentEl || !contentEl.length) continue;

        var style = contentEl[0].style.cssText;
        if (style) item.o.contentElStyle = style;


        var dn = contentEl.css('display') === 'none';
        if (dn) {
          item.o.contentElDisplayNone = true;
          contentEl[0].style.display = 'block';
        }
        item.dom.body[0].innerHTML = '';//clear body for case when first time we can't find contentEl on page
        item.dom.body[0].appendChild(contentEl[0]);
        item.o.contentElInserted = true;
      }
    }
  }
  _insertImageElements() {
    var items = this.items,
      item;

    for (var i = 0, l = items.length; i < l; i++) {
      if (items[i].type === 'image') {
        item = items[i];

        if (item.o.imageInserted) {
          continue;
        }
        
        this._insertImage(item);
      }
    }
  }
  _removeSelectorItemsElement() {
    var items = this.items,
      item,
      contentEl;

    for (var i = 0, l = items.length; i < l; i++) {
      if (items[i].type === 'selector') {
        item = items[i];
        if (!item.o.contentElInserted) continue;

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
        this.v.body[0].appendChild(contentEl[0])
        item.o.contentElInserted = false;
      }
    }
  }
  _setFocusInPopup(item, initialFocus) {
    var o = this.o,
      focusElement;

    if (initialFocus) {
      focusElement = item.dom.modal.find('[autofocus]')

      if (!focusElement && !focusElement.length && o.focus) {
        focusElement = item.dom.modal.find(o.focus);
      }
    }

    if (!focusElement || !focusElement.length) {
      focusElement = item.dom.modal.find(this.o._focusable);
    }

    //first try to focus elements inside modal
    if (focusElement && focusElement.length) {
      focusElement[0].focus();
    } else if (o.close === "outside") {//then try to focus close buttons
      this.v.close[0].focus()
    } else if (o.close === "inside" && item.dom.close) {//if type:"template" is used we have no close button here
      item.dom.close[0].focus();
    } else {//if no, focus popup itself
      item.dom.modal[0].focus();
    }
  }

  _setClickHandlers() {//initial click handlers
    var o = this.o;

    if (!o.click) return;

    if (this.els && this.els.length) {
      this._handlers.elsClick = this._clickHandler();
      this.els.off('click', this._handlers.elsClick).on('click', this._handlers.elsClick)

      if (o.clickels) {
        $(o.clickels).off('click', this._handlers.elsClick).on('click', this._handlers.elsClick)
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

      if (that.state.state !== 'inited') {
        that._error('njBox, show, plugin not inited or in not inited state(probably plugin is already visible or destroyed, or smth else..)');
        return;
      }
      if ($(el).closest('.njb-close-system, .njb-arrow').length) return;//don't remember why it here O_o


      that.state.clickedEvent = e;
      that.state.clickedEl = el;

      that.show();
    }
  }
  _setEventsHandlers() {//all other event handlers
    var o = this.o,
      that = this,
      h = this._handlers;

    h.container_resize = function () {
      that.position();
    }
    h.container_scroll = function () {
      that.position();
    }
    this.v.container.on('resize', h.container_resize)
      .on('scroll', h.container_scroll)


    h.wrap_out = function (e) {
      var $el = $(e.target),
        prevent = $el.closest('.njb, [data-njb-close]').length;
      if (prevent) return;

      (e.preventDefault) ? e.preventDefault() : e.returnValue = false;


      if (o.out) {
        if (that._cb('cancel') === false) return;
        that.hide();
      } else {
        that.items[that.active].dom.modal.addClass('njb_pulse');
        that._setFocusInPopup(this.items[this.active]);

        setTimeout(function () {
          that.items[that.active].dom.modal.removeClass('njb_pulse');
        }, that._getAnimTime(that.items[that.active].dom.modal[0]))
      }


    }
    h.wrap_resize = function () {
      // that.position();
    }
    h.wrap_scroll = function (e) {
      // that.position();
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


    this.v.wrap.on('click', h.wrap_out)
      .on('resize', h.wrap_resize)
      .on('scroll', h.wrap_scroll)
      .on('keydown', h.wrap_keydown)
      .delegate('[data-njb-close]', 'click', h.wrap_close)
      .delegate('[data-njb-ok]', 'click', h.wrap_ok)
      .delegate('[data-njb-cancel]', 'click', h.wrap_cancel)


    h.window_resize = function (e) {
      that.position();
    }
    h.window_scroll = function (e) {
      that.position();
    }
    h.window_orientation = function (e) {
      that.position();
    }

    this.v.window.on('resize', h.window_resize)
      .on('scroll', h.window_scroll)
      .on('orientationchange', h.window_orientation)


    h.focusCatch = function (e) {
      that._setFocusInPopup(that.items[that.active]);
    }
    this.v.focusCatcher.on('focus', h.focusCatch)

    this._cb('events_setted');
  }
  _removeEventsHandlers() {
    var h = this._handlers;

    this.v.container.off('resize', h.container_resize)
      .off('scroll', h.container_scroll);

    this.v.wrap.off('click', h.wrap_out)
      .off('resize', h.wrap_resize)
      .off('scroll', h.wrap_scroll)
      .off('keydown', h.wrap_keydown)
      .undelegate('[data-njb-close]', 'click', h.wrap_close)
      .undelegate('[data-njb-ok]', 'click', h.wrap_ok)
      .undelegate('[data-njb-cancel]', 'click', h.wrap_cancel)

    this.v.window.off('resize', h.window_resize)
      .off('scroll', h.window_scroll)
      .off('orientationchange', h.window_orientation)


    //remove link to all previous handlers
    var elsClick = h.elsClick;
    this._handlers = {
      elsClick: elsClick
    }

    this.v.focusCatcher.off('focus', h.focusCatch)

    this._cb('events_removed');
  }




  _scrollbar(type) {
    var o = this.o;
    switch (type) {
      case 'hide':
        if (o.scrollbar === 'hide') {
          if (this.state.scrollbarHidden) return;

          if (this.v.container[0] === this.v.body[0]) {//we can insert modal window in any custom element, that's why we need this if
            var sb = (document.documentElement.scrollHeight || document.body.scrollHeight) > document.documentElement.clientHeight;//check for scrollbar existance (we can have no scrollbar on simple short pages)

            //don't add padding to html tag if no scrollbar (simple short page) or popup already opened
            if (!this.v.container[0].njb_scrollbar && !this.state.scrollbarHidden && (sb || this.v.html.css('overflowY') === 'scroll' || this.v.body.css('overflowY') === 'scroll')) {
              //existing of that variable means that other instance of popup hides scrollbar on this element already
              this.v.html.addClass('njb-hideScrollbar');
              this.v.html.css('paddingRight', parseInt(this.v.html.css('paddingRight')) + njBox.g.scrollbarSize + 'px');
            }
          } else {
            var sb = (this.v.container[0].scrollHeight > this.v.container[0].clientHeight);//check for scrollbar existance on this element

            //don't add padding to container if no scrollbar (simple short page) or popup already opened
            // if (!this.state.scrollbarHidden && (sb || this.v.container.css('overflowY') === 'scroll')) {

            this.v.container.addClass('njb-hideScrollbar');
            // this.v.container.css('paddingRight', parseInt(this.v.container.css('paddingRight')) + njBox.g.scrollbarSize + 'px');

            // }
          }
          this.state.scrollbarHidden = true;

          // if(this.state.scrollbarHidden) {
          //fixes case when we have 2 modals on one container, and after first close, first popup shows scrollbar
          //how many elements hides scrollbar on this element...
          (this.v.container[0].njb_scrollbar) ? this.v.container[0].njb_scrollbar++ : this.v.container[0].njb_scrollbar = 1;
          // }
        }
        break;

      case 'show':
        if (!this.state.scrollbarHidden) return;

        if (--this.v.container[0].njb_scrollbar) {
          delete this.state.scrollbarHidden;
          return;
        } else {
          // ie 7 don't support delete on dom elements
          this.v.container[0].njb_scrollbar = null;
        }

        if (this.v.container[0] === this.v.body[0]) {
          this.v.html.removeClass('njb-hideScrollbar');
          var computedPadding = parseInt(this.v.html.css('paddingRight')) - njBox.g.scrollbarSize;

          if (computedPadding) {//if greater than 0
            this.v.html.css('paddingRight', computedPadding + 'px');
          } else {//if padding is 0, remove it from style attribute
            this.v.html[0].style.paddingRight = '';
          }
        } else {

          this.v.container.removeClass('njb-hideScrollbar');
          var computedPadding = parseInt(this.v.container.css('paddingRight')) - njBox.g.scrollbarSize;

          if (computedPadding) {//if greater than 0
            this.v.container.css('paddingRight', computedPadding + 'px');
          } else {//if padding is 0, remove it from style attribute
            this.v.container[0].style.paddingRight = ''
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
        this.v.backdrop = $(o.templates.backdrop);

        if (this.state.backdropVisible) return;

        if (o.backdrop === true) {
          if (o.backdropassist) this.v.backdrop.css('transitionDuration', this._globals.animShowDur + 'ms')

          //insert backdrop div
          if (o.position === 'absolute') this.v.backdrop.addClass('njb-absolute');
          this.v.container[0].appendChild(this.v.backdrop[0]);

          // this.v.backdrop[0].clientHeight;

          setTimeout(function () {//this prevent page from scrolling in chrome while background transition is working..., also needed as reflow
            that.v.backdrop.addClass('njb-visible');
          }, 0)

          this.state.backdropVisible = true;
        }
        break;

      case 'hide':
        if (!this.state.backdropVisible) return;
        if (o.backdropassist) this.v.backdrop.css('transitionDuration', this._globals.animHideDur + 'ms')

        this.v.backdrop.removeClass('njb-visible');

        setTimeout(function () {
          that.v.backdrop[0].parentNode.removeChild(that.v.backdrop[0])
          if (o.backdropassist) that.v.backdrop[0].style.cssText = '';
          delete that.state.backdropVisible;
        }, that._getAnimTime(that.v.backdrop[0]))
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

    this._globals.animShow = animShow;
    this._globals.animHide = animHide;
    this._globals.animShowDur = animShowDur;
    this._globals.animHideDur = animHideDur;
  }
  _getAnimTime(el, property) {//get max animation or transition time
    return this._getMaxTransitionDuration(el, 'animation') || this._getMaxTransitionDuration(el, 'transition')
  }
  _getMaxTransitionDuration(el, property) {//method also can get animation duration
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

  _anim(type, callback) {
    var o = this.o,
      that = this,
      modalOuter = this.items[this.active].dom.modalOuter,
      modal = this.items[this.active].dom.modal,
      animShow = this._globals.animShow,
      animHide = this._globals.animHide,
      animShowDur = this._globals.animShowDur,
      animHideDur = this._globals.animHideDur;


    switch (type) {
      case 'show':
        this.v.wrap.addClass('njb-visible');

        if (animShow) {
          if (o.animclass) modal.addClass(o.animclass);

          modal.addClass(animShow);

          setTimeout(shownCallback, animShowDur);
        } else {
          shownCallback();
        }
        break;
      case 'hide':
        this.v.wrap.removeClass('njb-visible')

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
      that._setFocusInPopup(that.items[that.active], true);
    }
    function hiddenCallback() {
      if (o.animclass) modal.removeClass(o.animclass);
      if (animHide === animShow) modal.removeClass('njb-anim-reverse');
      modal.removeClass(animHide);

      that._clear();
      that._cb('hidden');
      that.state.state = 'inited';
    }
  }


  _clear() {
    var o = this.o;

    if (this.v.container) this.v.container[0].njb_instances--;
    if (this.v.container[0].njb_instances === 0) this.v.container.removeClass('njb-open');

    if (o['class']) this.v.wrap.removeClass(o['class']);

    this._scrollbar('show');


    if (this.v.wrap && this.v.wrap.length) this.v.wrap[0].parentNode.removeChild(this.v.wrap[0]);

    this._removeSelectorItemsElement();

    this.active = 0;

    if (this.v.items && this.v.items.length) empty(this.v.items[0]);//we can't use innerHTML="" here, for IE(even 11) we need remove method

    function empty(el) {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
    }
    this.state = {
      inited: true,
      state: 'inited'
    };

    this._cb('clear');
  }
  _error(msg, clear) {
    if (!msg) return;

    if (clear) this._clear();

    console.error(msg);
  }
  _cb(type) {//cb - callback
    var o = this.o,
      callbackResult;

    if (type === 'inited' ||
      type === 'show' ||
      type === 'shown' ||
      type === 'hide' ||
      type === 'hidden' ||
      type === 'change' ||
      type === 'changed' ||
      type === 'destroy' ||
      type === 'destroyed'
    ) {
      this.state.state = type;
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
      let modal = this.items[this.active].dom.modal,
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
njBox.prototype.showModal = njBox.prototype.show;
//global options

//addons
njBox.a = {}
//default settings
njBox.defaults = defaults;

njBox.get = function (elem) {
  var el = $(elem)[0];

  if (el) {
    return el.njBox || null;
  } else {
    return null;
  };
}
//autobind functions
njBox.autobind = function () {
  $(njBox.defaults.autobind).each(function () {
    if (this.njBox) {
      console.error('njBox, already inited on this element')
      return;
    }
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

njBox.alert = function (content, okCb, cancelCb) {
  return new njBox({
    content: function (rawitem) {
      return `<div class="njb__body">
                                    ${content || this.o.text._missedContent}
                                  </div>
                                  <div class="njb__footer">
                                    <button data-njb-ok>${this.o.text.ok}</button>
                                  </div>`;
    },
    type: 'template',
    out: false,
    onok: okCb,
    oncancel: cancelCb
  }).show()
}
njBox.confirm = function (content, okCb, cancelCb) {
  return new njBox({
    content: function (rawitem) {
      return `<div class="njb__body">
                                    ${content || this.o.text._missedContent}
                                  </div>
                                  <div class="njb__footer">
                                    <button data-njb-ok>${this.o.text.ok}</button>
                                    <button data-njb-cancel>${this.o.text.cancel}</button>
                                  </div>`;
    },
    type: 'template',
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
    content: function (rawitem) {
      return `<div class="njb__body">
                                    ${content || this.o.text._missedContent}
                                    <div>
                                      <input data-njb-return type="text" placeholder="${placeholder || ''}" />
                                    </div>
                                  </div>
                                  <div class="njb__footer">
                                    <button data-njb-ok>${this.o.text.ok}</button>
                                    <button data-njb-cancel>${this.o.text.cancel}</button>
                                  </div>`;
    },
    type: 'template',
    out: false,
    onok: okCb,
    oncancel: cancelCb
  }).show()
}

export default njBox;