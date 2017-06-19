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
  getArray,
  defaults
} from 'lib/utils.js';

var njBox = (function(undefined, setTimeout, document) {

class njBox {
  constructor(el, options) {//el can be a string, selector/dom/j/jQuery element
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
    this.co = opts;//constructorOptions

    //this allows users to listen init callbacks via .on() on modal instance
    setTimeout(function () {
      that._init();
    }, 0);
  }

  _init() {
    //init only once
    if (this.state && this.state.inited) return;

    var opts = this.co;//constructorOptions
    delete this.co;

    //getDefaultInfo trying to launch as early as possible (even before this init method), but may fail because of missing body tag (if script included in head), so we check it here again
    if (!njBox.g) njBox.g = getDefaultInfo();

    //inner options, current state of app, this.state clears after every hide
    this.state = {
      active: 0
    };

    //inner options, this settings alive throughout the life cycle of the plugin(until destroy)
    this._globals = {};
    this._handlers = {};//all callback functions we used in event listeners lives here
    this.data = {
      optionsPassed: opts
    };

    let o = this.o = $.extend({}, njBox.defaults, opts);
    if (o.jquery) $ = o.jquery;
    this.$ = $;

    this.dom = {
      document: $(document),
      window: $(window),
      html: $(document.documentElement),
      body: $(document.body)
      //... other will be added later
    }

    // initializing addons
    for (var key in njBox.addons) {
      if (njBox.addons.hasOwnProperty(key)) {
        this['_' + key + '_init']();
      }
    }

    //we should have dom element or at least content option for creating item
    if (!o.elem && !o.content) {
      this._e('njBox, no elements (o.elem) or content (o.content) for modal.');
      return;
    }
    if (o.elem) {
      let $elem = $(o.elem);
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

      this.data.optionsGathered = this._gatherData($elem);
      this._cb('options_gathered', this.data.optionsGathered, $elem[0]);

      // if ($elem[0].tagName.toLowerCase() === 'a') {
      //   console.log('link');
      // }


      //extend global options with gathered from dom element
      $.extend(true, this.o, this.data.optionsGathered)
    }
    this._cb('options_setted', o);
    this._options_setted();

    //create popup container dom elements
    this._createDom();

    //create items
    this.items = this._createItems();
 
    //this method calculate show/hide animation durations, because native callbacks buggy
    this._calculateAnimations();

    //add initial click handlers
    this._addClickHandlers();

    this.state.inited = true;
    this._cb('inited');
  }
  
  show(index) {
    this._init();//try to init
    if (index !== undefined) this.state.active = index - 1;

    var o = this.o,
      that = this;

    if (this.state.state !== 'inited') {
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

    //insert wrap
    if (!this._globals.popover) {
      this.dom.container[0].appendChild(this.dom.wrap[0]);
      containerToInsert = this.dom.items[0];
    } else {
      containerToInsert = this.dom.container[0];
    }
    //set event handlers
    this._addListeners();

    this._drawItem(this.items[this.state.active], false, containerToInsert);
    this._cb('inserted')

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
    if (this.state.state !== 'shown') {
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
  position(coordinates) {
    if (!this.state || !this.state.inited) return;
    var o = this.o,
        activeModal = this.items[this.state.active].dom.modal,
        coords,
        state = this.state;

    state.dimensions = this._getContainerSize();

    state.dimensions.modal = this._getDomSize(this.items[this.state.active].dom.modal[0]);

    //position of global wrapper
    if (o.layout === 'absolute') {
      //global wrap positioning
      var scrollTop = this.state.dimensions.containerScrollTop,
        scrollLeft = this.state.dimensions.containerScrollLeft;

      if (scrollTop <= this.state.dimensions.containerMaxScrollTop) {
        this.dom.wrap.css({ 'top': scrollTop + 'px', 'left': scrollLeft + 'px' })
      }

      //backdrop positioning
      this.dom.backdrop.css({ 'width': 'auto', 'height': 'auto' });
      this.dom.backdrop[0].clientHeight;
      this.dom.backdrop.css({
        'width': this.state.dimensions.containerScrollWidth + 'px',
        'height': this.state.dimensions.containerScrollHeight + 'px'
      });
    }

    if(this._globals.popover) this._setMaxHeight(this.items[this.state.active]);

    if(o.coords) coords = getArray(o.coords);

    if(coordinates) coords = getArray(coordinates);

    //post process coordinates
    if (coords[0] === 'center') {//horizontal coordinate
      coords[0] = (state.dimensions.containerWidth - state.dimensions.modal.width) / 2;
    }
    if (coords[1] === 'center') {//vertical coordinate
      coords[1] = (state.dimensions.containerHeight - state.dimensions.modal.height) / 2;
    }

    this.state.coords = coords;

    this._cb('position');

    if(this._globals.popover) {
      if (this.state.coords.length === 2) {
        activeModal.css('left', this.state.coords[0] + "px")
                  .css('top', this.state.coords[1] + "px")
      }
    }

    return this;
  }
  destroy() {
    if (!this.state.inited || this.state.state !== 'inited') {
      this._e('njBox, we can destroy only initialized && hidden modals.');
      return;
    }

    this._removeClickHandlers();


    this.dom.container.removeClass('njb-relative');

    this._cb('destroy');

    this._events =
      this._globals =
      this._handlers =
      this.items =
      this.itemsRaw =
      this.dom =
      this.$ = undefined;
    this.o = {};


    return this;
  }
  update() {
    this.items = this._createItems();

    this._addClickHandlers();

    return this;
  }
  _options_setted() {
    var o = this.o,
        that = this;
    
    if(o.layout === 'popover') {
      that._globals.popover = true
    }

    if (that._globals.popover) {
      o.backdrop = false;
    }
  }
  _getContainerSize() {
    var o = this.o,
        documentElement = document.documentElement,
        documentBody = document.body;

    var d = {}

    if (this.dom.container[0] === this.dom.body[0]) {
      d.containerWidth = documentElement.clientWidth;
      d.containerHeight = documentElement.clientHeight;
      d.containerScrollWidth = Math.max(
        documentBody.scrollWidth, documentElement.scrollWidth,
        documentBody.offsetWidth, documentElement.offsetWidth,
        documentBody.clientWidth, documentElement.clientWidth
      );
      d.containerScrollHeight = Math.max(
        documentBody.scrollHeight, documentElement.scrollHeight,
        documentBody.offsetHeight, documentElement.offsetHeight,
        documentBody.clientHeight, documentElement.clientHeight
      );
      d.containerScrollTop = window.pageYOffset || documentElement.scrollTop || documentBody.scrollTop;
      d.containerScrollLeft = window.pageXOffset || documentElement.scrollLeft || documentBody.scrollLeft;

    } else {
      d.containerWidth = this.dom.container[0].clientWidth;
      d.containerHeight = this.dom.container[0].clientHeight;
      d.containerScrollWidth = this.dom.container[0].scrollWidth;
      d.containerScrollHeight = this.dom.container[0].scrollHeight;
      d.containerScrollTop = this.dom.container[0].scrollTop;
      d.containerScrollLeft = this.dom.container[0].scrollLeft;
    }

    d.containerMaxScrollTop = d.containerScrollHeight - d.containerHeight;

    d.winWidth = window.innerWidth || documentElement.clientWidth || documentBody.clientWidth;
    d.winHeight = window.innerHeight || documentElement.clientHeight || documentBody.clientHeight;

    d.autoheight = (this.dom.container[0] === this.dom.body[0]) ? d.winHeight : d.containerHeight;
    // if(this._o.scrollbarHidden) {
    //  this._o.winWidth -= njBox.g.scrollbarSize;
    // }
    return d;
  }
  _getDomSize(domObject) {
    var rectOriginal = domObject.getBoundingClientRect(),
        rectComputed = this.$.extend({}, rectOriginal);
    
    rectComputed.width = rectComputed.right - rectComputed.left;
    rectComputed.height = rectComputed.bottom - rectComputed.top;
    
    return rectComputed;
  }
  _setMaxHeight(item) {
    let o = this.o;

    if (!o.autoheight || o.autoheight === 'image' && item.type !== 'image') return;

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
  _createItems() {
    var o = this.o;

    this.data.els = this.o.el;
    this.data.items_raw = [this.o];

    this._cb('items_raw', this.data);

    if (o.buttonrole && this.data.els) {
      this.data.els.attr('role', o.buttonrole);
    }

    let items = [];
    for (let i = 0, l = this.data.items_raw.length; i < l; i++) {
      items.push(this._createItem(this.data.items_raw[i], i))
    }
    return items;
  }
  _createItem(item, index) {
    let normalizedItem = this._normalizeItem(item);

    this._createDomForItem(normalizedItem, index);

    return normalizedItem;
  }
  _normalizeItem(item, el) {
    let evaluatedContent;
    if (typeof item.content === 'function') {
      evaluatedContent = item.content.call(this, item);
    } else {
      evaluatedContent = item.content;
    }

    var content = evaluatedContent || this.o.text._missedContent;

    return {
      content: content,
      type: item.type || this._type(content),
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
  _createDomForItem(item, index) {
    var o = this.o,
      dom = item.dom = {},
      modalOuter,
      modal,
      modalFragment = document.createDocumentFragment();

    //main modal wrapper
    dom.modal = modal = $(o.templates.modal);
    modal[0].tabIndex = '-1'
    modal[0].njBox = this;

    dom.modalOuter = modalOuter = $(o.templates.modalOuter);

    if (o.role) modal.attr('role', o.role)
    if (o.label) modal.attr('aria-label', o.label)
    if (o.labelledby) modal.attr('aria-labelledby', o.labelledby)
    if (o.describedby) modal.attr('aria-describedby', o.describedby)

    if (!modal.length) {
      this._e('njBox, error in o.templates.modal');
      return;
    }

    modalOuter[0].appendChild(modal[0]);

    if (item.type === "template") {
      modal.html(item.content)
    } else {
      //insert body
      dom.body = $(o.templates.body);
      if (!dom.body.length) {
        this._e('njBox, error in o.templates.body');
        return;
      }
      //find data-njb-body in item body element
      dom.bodyInput = getItemFromDom(dom.body, 'data-njb-body')

      this._insertItemBodyContent(item);

      modalFragment.appendChild(dom.body[0])

      //insert header
      if (item.header) {
        dom.header = $(o.templates.header);

        if (!dom.header.length) {
          this._e('njBox, error in o.templates.header');
          return;
        }
        //insert header info
        getItemFromDom(dom.header, 'data-njb-header').html(item.header)

        modalFragment.insertBefore(dom.header[0], modalFragment.firstChild)
      }

      //insert footer
      if (item.footer) {
        dom.footer = $(o.templates.footer);

        if (!dom.footer.length) {
          this._e('njBox, error in njBox.templates.footer');
          return;
        }
        //insert footer info
        getItemFromDom(dom.footer, 'data-njb-footer').html(item.footer)

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
    if(this._globals.popover) modal.addClass('njb--popover');

    this._cb('item_domready', item, index);
  }
  _insertItemBodyContent(item) {
    var o = this.o;

    switch (item.type) {
      case 'text':
        'textContent' in item.dom.bodyInput[0] ? item.dom.bodyInput[0].textContent = item.content : item.dom.bodyInput[0].innerText = item.content;
        item.o.status = 'loaded';
        break;
      case 'html':
        item.dom.bodyInput.html(item.content)
        item.o.status = 'loaded';
        break;
      case 'selector':
        this._getItemFromSelector(item);
        item.o.status = 'loaded';
        break;
      case 'image':
        if (o.imgload === 'init') this._insertImage(item);
        break;
      default:
        this._e('njBox, seems that you use wrong type(' + item.type + ') of item.', true);
        item.o.status = 'loaded';
        return;
        break;
    }
  }
  _getItemFromSelector(item) {
    item.o.contentEl = $(item.content);

    if (!item.o.contentEl.length) {
      item.dom.bodyInput.html(item.content)//if we don't find element with this selector
    }
  }
  _createDom() {
    var o = this.o;

    //find container
    this.dom.container = $(o.container);
    if (!this.dom.container.length) {
      this._e('njBox, can\'t find container element. (we use body instead)');
      this.dom.container = this.dom.body;//in case if we have no container element, or wrong selector for container element
    }
    //check if container not relative position
    if (this.dom.container[0] !== this.dom.body[0] && this.dom.container.css('position') === 'static') {
      this.dom.container.addClass('njb-relative');
    }

    //create core elements
    this.dom.wrap = $(o.templates.wrap);
    if (!this.dom.wrap.length) {
      this._e('njBox, smth wrong with o.templates.wrap.');
      return;
    }
    if (o['class']) this.dom.wrap.addClass(o['class']);
    this.dom.wrap[0].njBox = this;
    if (o.zindex) this.dom.wrap.css('zIndex', o.zindex);

    this.dom.items = this.dom.wrap.find('.njb-items');

    //if container custom element(not body), use forcely absolute position
    if (this.dom.container[0] !== this.dom.body[0] && o.layout !== 'popover') o.layout = 'absolute';
    if (o.layout === 'absolute') this.dom.wrap.addClass('njb-absolute');

    //create ui layer
    this.dom.ui = $(o.templates.ui)
    this.dom.wrap[0].appendChild(this.dom.ui[0])

    this.dom.title = $(o.templates.title)
    this.dom.ui[0].appendChild(this.dom.title[0])

    // insert outside close button
    if (o.close === 'outside') {
      this.dom.close = $(o.templates.close)
      this.dom.close.attr('title', o.text.close).attr('aria-label', o.text.close)

      this.dom.ui[0].appendChild(this.dom.close[0])
    }

    // insert invisible, focusable nodes.
    // while this dialog is open, we use these to make sure that focus never
    // leaves modal boundaries
    this.dom.focusCatchFirst = $(o.templates.focusCatcher)
    this.dom.wrap[0].insertBefore(this.dom.focusCatchFirst[0], this.dom.wrap[0].firstChild)

    this.dom.focusCatchLast = $(o.templates.focusCatcher)
    this.dom.wrap[0].appendChild(this.dom.focusCatchLast[0])

    this._cb('domready');
  }
  _drawItem(item, prepend, container) {
    var o = this.o,
        itemToInsert = this._globals.popover ? item.dom.modal[0] : item.dom.modalOuter[0];
    
    this._cb('item_prepare', item);

    //insert content in items, where inserting is delayed to show event
    this._insertDelayedContent(item);

    if (prepend) {
      container.insertBefore(itemToInsert, container.firstChild)
    } else {
      container.appendChild(itemToInsert);
    }

    this._cb('item_inserted', item);
  }
  _insertDelayedContent(item) {
    var that = this,
      o = this.o,
      contentEl;

    if (item.type === 'image' && o.imgload === 'show' && !item.o.imageInserted) {
      this._insertImage(item);
    } else if (item.type === 'selector' && !item.o.contentElInserted) {
      contentEl = item.o.contentEl;

      //try to find element for popup again on every show
      if (!contentEl || !contentEl.length) {
        this._getItemFromSelector(item);
        contentEl = item.o.contentEl;
      }
      if (!contentEl || !contentEl.length) return;

      var style = contentEl[0].style.cssText;
      if (style) item.o.contentElStyle = style;


      var dn = contentEl.css('display') === 'none';
      if (dn) {
        item.o.contentElDisplayNone = true;
        contentEl[0].style.display = 'block';
      }
      item.dom.bodyInput.html('')//clear body for case when first time we can't find contentEl on page
      item.dom.bodyInput[0].appendChild(contentEl[0])
      item.o.contentElInserted = true
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
        this.dom.body[0].appendChild(contentEl[0])
        item.o.contentElInserted = false;
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
  _addClickHandlers() {//initial click handlers
    var o = this.o;

    this._removeClickHandlers();

    this._handlers.elsClick = this._clickHandler();

    if (o.click) {
      if (this.data.els && this.data.els.length) {
        this.data.els.on('click', this._handlers.elsClick)
      }
    }

    if (o.clickels) {
      $(o.clickels).on('click', this._handlers.elsClick);
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

      e.njb_sp = true;//e.njb_stopPropagation

      if (that.state.state !== 'inited') {
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
  _removeClickHandlers() {
    var o = this.o;

    if (this.data.els && this.data.els.length) {
      this.data.els.off('click', this._handlers.elsClick)

      if (o.clickels) $(o.clickels).off('click', this._handlers.elsClick);
    }
  }
  _addListeners() {//all other event handlers
    var o = this.o,
      that = this,
      h = this._handlers,
      popWrap = that._globals.popover ? that.dom.container : that.dom.wrap;

    h.container_resize = function () {
      that.position();
    }
    h.container_scroll = function () {
      that.position();
    }
    h.container_out = function (e) {
      if (e.njb_sp) return;

      var $el = $(e.target),
        // prevent = $el.closest('.njb, [data-njb-close], [data-njb-prev], [data-njb-next]').length;
        prevent = $el.closest('.njb, .njb-ui').length;
      if (prevent) return;

      (e.preventDefault) ? e.preventDefault() : e.returnValue = false;


      if (o.out) {
        if (that._cb('cancel') === false) return;
        that.hide();
      } else {
        that.items[that.state.active].dom.modal.addClass('njb_pulse');
        that._focus_set(that.items[that.state.active]);

        setTimeout(function () {
          that.items[that.state.active].dom.modal.removeClass('njb_pulse');
        }, that._getAnimTime(that.items[that.state.active].dom.modal[0]))
      }
    }
    this.dom.container.on('resize', h.container_resize)
      .on('scroll', h.container_scroll)
      .on('click', h.container_out)

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

    popWrap
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

    this.dom.window
      .on('resize', h.window_resize)
      .on('scroll', h.window_scroll)
      .on('orientationchange', h.window_orientation)


    h.focusCatchFirst = function (e) {
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
    h.focusCatchLast = function (e) {
      that._focus_set(that.items[that.state.active]);
    }

    this.dom.focusCatchFirst.on('focus', h.focusCatchFirst)
    this.dom.focusCatchLast.on('focus', h.focusCatchLast)

    this._cb('listerens_added');
  }
  _removeListeners() {
    var h = this._handlers,
        that = this,
        popWrap = that._globals.popover ? that.dom.container : that.dom.wrap;

    this.dom.container.off('resize', h.container_resize)
      .off('scroll', h.container_scroll)
      .off('click', h.container_out)

    popWrap
      .off('resize', h.wrap_resize)
      .off('scroll', h.wrap_scroll)
      .off('keydown', h.wrap_keydown)
      .undelegate('[data-njb-close]', 'click', h.wrap_close)
      .undelegate('[data-njb-ok]', 'click', h.wrap_ok)
      .undelegate('[data-njb-cancel]', 'click', h.wrap_cancel)


    this.dom.window
      .off('resize', h.window_resize)
      .off('scroll', h.window_scroll)
      .off('orientationchange', h.window_orientation)


    //remove link to all previous handlers
    var elsClick = h.elsClick;
    this._handlers = {
      elsClick: elsClick
    }

    this.dom.focusCatchFirst.off('focus', h.focusCatchFirst)
    this.dom.focusCatchLast.off('focus', h.focusCatchLast)

    this._cb('listeners_removed');
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

      that._preloader('hide', item);

      item.dom.bodyInput.html(o.text.imageError.replace('%url%', item.content));

      that._cb('img_e', item);//img_ready, img_load callbacks
      // rendered();

      item.o.status = 'error';
      item.o.imageInserted = true;
    }
    $img.on('error', item._handlerError).on('abort', item._handlerError);

    // if (item.title) img.title = item.title;
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

      item._handlerImgReady = function () {
        checkShow('ready');
      }
      findImgSize(img, item._handlerImgReady);

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
      item.o.imageInserted = true;

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

          if (this.dom.container[0] === this.dom.body[0]) {//we can insert modal window in any custom element, that's why we need this if
            var sb = (document.documentElement.scrollHeight || document.body.scrollHeight) > document.documentElement.clientHeight;//check for scrollbar existance (we can have no scrollbar on simple short pages)

            //don't add padding to html tag if no scrollbar (simple short page) or popup already opened
            if (!this.dom.container[0].njb_scrollbar && !this.state.scrollbarHidden && (sb || this.dom.html.css('overflowY') === 'scroll' || this.dom.body.css('overflowY') === 'scroll')) {
              //existing of that variable means that other instance of popup hides scrollbar on this element already
              if(!this._globals.popover) this.dom.html.addClass('njb-hideScrollbar');
              this.dom.html.css('paddingRight', parseInt(this.dom.html.css('paddingRight')) + njBox.g.scrollbarSize + 'px');
            }
          } else {
            var sb = (this.dom.container[0].scrollHeight > this.dom.container[0].clientHeight);//check for scrollbar existance on this element

            //don't add padding to container if no scrollbar (simple short page) or popup already opened
            // if (!this.state.scrollbarHidden && (sb || this.dom.container.css('overflowY') === 'scroll')) {

            if(!this._globals.popover) this.dom.container.addClass('njb-hideScrollbar');
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

        if (this.dom.container[0] === this.dom.body[0]) {
          if(!this._globals.popover) this.dom.html.removeClass('njb-hideScrollbar');
          var computedPadding = parseInt(this.dom.html.css('paddingRight')) - njBox.g.scrollbarSize;

          if (computedPadding) {//if greater than 0
            this.dom.html.css('paddingRight', computedPadding + 'px');
          } else {//if padding is 0, remove it from style attribute
            this.dom.html[0].style.paddingRight = '';
          }
        } else {

          if(!this._globals.popover) this.dom.container.removeClass('njb-hideScrollbar');
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
          if (o.backdropassist) this.dom.backdrop.css('transitionDuration', this._globals.animShowDur + 'ms')

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
        if (o.backdropassist) this.dom.backdrop.css('transitionDuration', this._globals.animHideDur + 'ms')

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

    this._globals.animShow = animShow;
    this._globals.animHide = animHide;
    this._globals.animShowDur = animShowDur;
    this._globals.animHideDur = animHideDur;
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
      animShow = this._globals.animShow,
      animHide = this._globals.animHide,
      animShowDur = this._globals.animShowDur,
      animHideDur = this._globals.animHideDur;


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


    if (this.dom.wrap && this.dom.wrap.length) this.dom.wrap[0].parentNode.removeChild(this.dom.wrap[0]);
    if(this._globals.popover) modal[0].parentNode.removeChild(modal[0]);

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
      inited: true,
      state: 'inited',
      active: 0
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
      this.state.state = type;
    }
    //make some stuff on callbacks
    switch (type) {
      case 'hidden':
        this.state.state = 'inited';
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