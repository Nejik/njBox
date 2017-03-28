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
    //getDefaultInfo trying to launch as early as possible (even before this init method), but may fail because of missing body tag (if script included in head), so we check it here again
    if (!njBox.g) njBox.g = getDefaultInfo();


    //inner options, current state of app, this.state clears after every hide
    this.state = {
      active: 0
    };

    //inner options, this settings alive throughout the life cycle of the plugin(until destroy)
    this._globals = {

    }
    this._handlers = {};//all callback functions we used in event listeners lives here

    this._globals.passedOptions = opts;
    let o = this.o = $.extend({}, njBox.defaults, opts);
    if (o.jquery) $ = o.jquery;

    this.dom = {
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


      //gather dom elements from which we will create modal window/gallery
      this.els = this._gatherElements(o.gallery);
    }
    this._postProcessOptions();

    if (this.state.gallery) {
      this.dom.prev = $(o.templates.prev);
      this.dom.prev[0].setAttribute('title', o.text.prev);
      this.dom.next = $(o.templates.next)
      this.dom.next[0].setAttribute('title', o.text.next);
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
    var o = this.o,
      that = this;

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

    that.state.active = this._detectIndexForOpen(index);

    if (!this.dom.container[0].njb_instances) {
      this.dom.container[0].njb_instances = 1;
    } else {
      this.dom.container[0].njb_instances++;
    }
    this.dom.container.addClass('njb-open');

    this._scrollbar('hide');

    this._backdrop('show');

    //insert wrap
    this.dom.container[0].appendChild(this.dom.wrap[0]);

    //set event handlers
    this._setEventsHandlers();

    //draw modal on screen
    this._drawItem(this.state.active);
    if (that.state.gallery) {
      this._setItemsOrder(this.state.active);
      this._drawItemSiblings();
    }

    this.position();

    //force reflow, we need because firefox has troubles with njb element width, while inside autoheighted image
    this.dom.wrap[0].style.display = 'none';
    this.dom.wrap[0].clientHeight;
    this.dom.wrap[0].style.display = 'block';

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

    //we need autoheight for every slide in gallery
    if (this.state.gallery) {
      for (var index = 0; index < this.state.itemsOrder.length; index++) {
        if (this.state.itemsOrder[index] !== null) this._setMaxHeight(this.items[this.state.itemsOrder[index]]);
      }
    } else {
      this._setMaxHeight(this.items[this.state.active]);
    }

    this._cb('position');

    return this;
  }
  prev() {
    this._changeItem(this.state.active - 1, 'prev');

    return this;
  }
  next() {
    this._changeItem(this.state.active + 1, 'next');

    return this;
  }
  goTo(index) {
    index = index - 1;//inside gallery we have index -1, because slides starts from 0

    if (typeof index !== 'number') {
      this._error('njBox, wrong index argument in goTo method.')
      return;
    }

    if (this.state.state === 'inited' || this.state.state === 'show') {
      this.state.active = index;
      return;
    } else if (this.state.state !== 'shown'
      || index === this.state.active
      || index < 0
      || index > this.items.length - 1
    ) {
      this._error('njBox, wrong index in goTo method.')
      return this;
    }

    var dir = (index > this.state.active) ? 'next' : 'prev';

    //the most desired cases when we should call prev/next slides :)
    if (dir === 'next' && index === this.state.active + 1) {
      this.next();
    } else if (dir === 'prev' && index === this.state.active - 1) {
      this.prev();
    }
    //if it is not simple prev/next, so we need to recreate slides
    else {
      //remove siblings
      this.items[this.state.itemsOrder[0]].dom.modalOuter[0].parentNode.removeChild(this.items[this.state.itemsOrder[0]].dom.modalOuter[0]);
      this.items[this.state.itemsOrder[2]].dom.modalOuter[0].parentNode.removeChild(this.items[this.state.itemsOrder[2]].dom.modalOuter[0]);
      //clear position of siblings
      this.items[this.state.itemsOrder[0]].dom.modalOuter[0].style.cssText = '';
      this.items[this.state.itemsOrder[2]].dom.modalOuter[0].style.cssText = '';

      switch (dir) {
        case 'next':
          // set new state
          this.state.itemsOrder[0] = null;
          this.state.itemsOrder[2] = index;

          //draw new slides
          this._drawItemSiblings();

          this._changeItem(index, 'next')
          break;
        case 'prev':
          // set new state
          this.state.itemsOrder[0] = index;
          this.state.itemsOrder[2] = null;

          //draw new slides
          this._drawItemSiblings();

          //animation to new slide
          this._changeItem(index, 'prev')
          break;
      }
    }




    return this;
  }
  destroy() {
    if (!this.state.inited || this.state.state !== 'inited') {
      this._error('njBox, we can destroy only initialized && hidden modals.');
      return;
    }

    this._removeClickHandlers();


    this.dom.container.removeClass('njb-relative');

    this._globals = undefined;
    this._handlers = undefined;
    this.els = undefined;
    this.items = undefined;
    this.v = undefined;
    this.o = {};

    this._cb('destroyed');

    return this;
  }
  update() {
    //gather dom elements from which we will create modal window/gallery
    this.els = this._gatherElements(this.o.gallery);
    this.items = this._createItems(this._createRawItems());

    // this._removeClickHandlers();
    this._setClickHandlers();

    return this;
  }


  _getContainerSize() {
    var o = this.o;

    var d = this.state.dimensions = {}


    if (this.dom.container[0] === this.dom.body[0]) {
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
      d.containerWidth = this.dom.container[0].clientWidth;
      d.containerHeight = this.dom.container[0].clientHeight;
      d.containerScrollWidth = this.dom.container[0].scrollWidth;
      d.containerScrollHeight = this.dom.container[0].scrollHeight;
      d.containerScrollTop = this.dom.container[0].scrollTop;
      d.containerScrollLeft = this.dom.container[0].scrollLeft;
    }

    d.containerMaxScrollTop = d.containerScrollHeight - d.containerHeight;

    // d.winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    d.winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    d.autoheight = (this.dom.container[0] === this.dom.body[0]) ? d.winHeight : d.containerHeight;
    // if(this._o.scrollbarHidden) {
    //  this._o.winWidth -= njBox.g.scrollbarSize;
    // }
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
  //return array with raw options gathered from items from which modal window/gallery will be created
  _createRawItems() {
    var o = this.o,
      that = this;
    if (this.state.gallery) {
      //we don't use methods such as Array.map because we want to support old browsers
      var rawItems = [];
      for (var index = 0; index < this.els.length; index++) {
        var element = this.els[index];
        rawItems.push(this._gatherData(element))
      }

      return rawItems;

    } else {
      return [this.o];
    }
  }
  //gather dom elements from which we will create modal window/gallery
  _gatherElements(selector) {
    var o = this.o;

    if (selector) {
      return this.o.el.find(selector);
    } else {
      return this.o.el;
    }
  }
  _postProcessOptions() {
    var o = this.o;
    if (o.gallery) this.state.gallery = true;
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
      items.push(this._createItem(els[i], i))
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
  _createDomForItem(item, index) {
    var o = this.o,
      dom = item.dom = {},
      modalFragment = document.createDocumentFragment();

    dom.modalOuter = $(o.templates.modalOuter);
    dom.modalOuter[0].njBox = this;
    if (this.state.gallery) dom.modalOuter[0].setAttribute('data-njb-index', index);

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
    if (item.type === 'image') {
      item.dom.modal.addClass('njb--image');
    } else {
      item.dom.modal.addClass('njb--content');
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
        if (o.imgload === 'init') this._insertImage(item);
        break;
      default:
        this._error('njBox, seems that you use wrong type(' + item.type + ') of item.', true);
        item.o.status = 'loaded';
        return;
        break;
    }
  }
  _getItemFromSelector(item) {
    item.o.contentEl = $(item.content);

    if (!item.o.contentEl.length) {
      item.dom.body[0].innerHTML = item.content;//if we don't find element with this selector
    }
  }
  _createDom() {
    var o = this.o;

    //find container
    this.dom.container = $(o.container);
    if (!this.dom.container.length) {
      this._error('njBox, can\'t find container element. (we use body instead)');
      this.dom.container = this.dom.body;//in case if we have no container element, or wrong selector for container element
    }
    //check if container not relative position
    if (this.dom.container[0] !== this.dom.body[0] && this.dom.container.css('position') === 'static') {
      this.dom.container.addClass('njb-relative');
    }

    //create core elements
    this.dom.wrap = $(o.templates.wrap);
    if (!this.dom.wrap.length) {
      this._error('njBox, smth wrong with o.templates.wrap.');
      return;
    }
    if (o['class']) this.dom.wrap.addClass(o['class']);
    this.dom.wrap[0].njBox = this;
    if (o.zindex) this.dom.wrap.css('zIndex', o.zindex);

    this.dom.items = this.dom.wrap.find('.njb-items');

    //if container custom element(not body), use forcely absolute position
    if (this.dom.container[0] !== this.dom.body[0]) o.position = 'absolute';
    if (o.position === 'absolute') this.dom.wrap.addClass('njb-absolute');

    //create ui layer
    this.dom.ui = $(o.templates.ui)
    if (!o.loop) this.dom.ui.addClass('njb-ui--no-loop');
    this.dom.wrap[0].appendChild(this.dom.ui[0])

    this.dom.title = $(o.templates.title)
    this.dom.ui[0].appendChild(this.dom.title[0])

    if (this.state.gallery) {
      this.dom.ui_count = $(o.templates.count)
      this.dom.ui[0].appendChild(this.dom.ui_count[0])

      this.dom.ui_current = this.dom.ui_count.find('[data-njb-current]')
      this.dom.ui_current[0].setAttribute('title', o.text.current)
      this.dom.ui_total = this.dom.ui_count.find('[data-njb-total]')
      this.dom.ui_total[0].setAttribute('title', o.text.total)

      if (o.arrows && !this.state.arrowsInserted && this.state.gallery) {
        if (this.dom.next[0]) this.dom.ui[0].appendChild(this.dom.next[0]);
        if (this.dom.prev[0]) this.dom.ui[0].appendChild(this.dom.prev[0]);
        this.state.arrowsInserted = true;
      }
    }

    // insert outside close button
    if (o.close === 'outside') {
      this.dom.close = $(o.templates.close);
      this.dom.close[0].setAttribute('title', o.text.close);

      this.dom.ui[0].appendChild(this.dom.close[0]);
    }

    this.dom.focusCatcher = $(o.templates.focusCatcher);
    this.dom.ui[0].appendChild(this.dom.focusCatcher[0]);
  }
  _drawItem(index, prepend) {
    var o = this.o,
      item = this.items[index];

    if (!item) {
      this._error('njBox, we have no item with this index - ' + index, true);
      return;
    }

    this._cb('item_prepare', item);

    //insert content in items, where inserting is delayed to show event
    this._insertDelayedContent(item);

    if (prepend) {
      this.dom.items[0].insertBefore(item.dom.modalOuter[0], this.dom.items[0].firstChild)
    } else {
      this.dom.items[0].appendChild(item.dom.modalOuter[0]);
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
      item.dom.body[0].innerHTML = '';//clear body for case when first time we can't find contentEl on page
      item.dom.body[0].appendChild(contentEl[0]);
      item.o.contentElInserted = true;
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
  _setFocusInPopup(item, initialFocus) {
    var o = this.o,
      focusElement;

    if (initialFocus) {
      focusElement = item.dom.modal.find('[autofocus]')

      if (!focusElement.length && o.autofocus) {
        focusElement = item.dom.modal.find(o.autofocus);
      }
    }

    if (!focusElement || !focusElement.length) {
      focusElement = item.dom.modal.find(this.o._focusable);
    }

    //first try to focus elements inside modal
    if (focusElement && focusElement.length) {
      focusElement[0].focus();
    } else
      /*if (this.state.gallery) {
        this.dom.next[0].focus()
      } else*/
      if (o.close === "outside") {//then try to focus close buttons
        this.dom.close[0].focus()
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
      this.els.off('click', this._handlers.elsClick);
      if (o.clickels) $(o.clickels).off('click', this._handlers.elsClick);


      this._handlers.elsClick = this._clickHandler();
      this.els.on('click', this._handlers.elsClick)
      if (o.clickels) $(o.clickels).on('click', this._handlers.elsClick);
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
  _removeClickHandlers() {
    if (this.els && this.els.length) {
      this.els.off('click', this._handlers.elsClick)

      if (this.o.clickels) {
        $(this.o.clickels).off('click', this._handlers.elsClick)
      }
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
    this.dom.container.on('resize', h.container_resize)
      .on('scroll', h.container_scroll)


    h.wrap_out = function (e) {
      var $el = $(e.target),
        prevent = $el.closest('.njb, [data-njb-close], [data-njb-prev], [data-njb-next]').length;
      if (prevent) return;

      (e.preventDefault) ? e.preventDefault() : e.returnValue = false;


      if (o.out) {
        if (that._cb('cancel') === false) return;
        that.hide();
      } else {
        that.items[that.state.active].dom.modal.addClass('njb_pulse');
        that._setFocusInPopup(that.items[that.state.active]);

        setTimeout(function () {
          that.items[that.state.active].dom.modal.removeClass('njb_pulse');
        }, that._getAnimTime(that.items[that.state.active].dom.modal[0]))
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
        case 37://left arrow
          that.prev();
          e.preventDefault();
          break;
        case 39://right arrow
          that.next();
          e.preventDefault();
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
    h.wrap_prev = function (e) {
      that.prev();
      e.preventDefault();
    }
    h.wrap_next = function (e) {
      that.next();
      e.preventDefault();
    }


    this.dom.wrap.on('click', h.wrap_out)
      .on('resize', h.wrap_resize)
      .on('scroll', h.wrap_scroll)
      .on('keydown', h.wrap_keydown)
      .delegate('[data-njb-close]', 'click', h.wrap_close)
      .delegate('[data-njb-ok]', 'click', h.wrap_ok)
      .delegate('[data-njb-cancel]', 'click', h.wrap_cancel)
      .delegate('[data-njb-prev]', 'click', h.wrap_prev)
      .delegate('[data-njb-next]', 'click', h.wrap_next)


    h.window_resize = function (e) {
      that.position();
    }
    h.window_scroll = function (e) {
      that.position();
    }
    h.window_orientation = function (e) {
      that.position();
    }

    this.dom.window.on('resize', h.window_resize)
      .on('scroll', h.window_scroll)
      .on('orientationchange', h.window_orientation)


    h.focusCatch = function (e) {
      that._setFocusInPopup(that.items[that.state.active]);
    }
    this.dom.focusCatcher.on('focus', h.focusCatch)

    this._cb('events_setted');
  }
  _removeEventsHandlers() {
    var h = this._handlers;

    this.dom.container.off('resize', h.container_resize)
      .off('scroll', h.container_scroll);

    this.dom.wrap.off('click', h.wrap_out)
      .off('resize', h.wrap_resize)
      .off('scroll', h.wrap_scroll)
      .off('keydown', h.wrap_keydown)
      .undelegate('[data-njb-close]', 'click', h.wrap_close)
      .undelegate('[data-njb-ok]', 'click', h.wrap_ok)
      .undelegate('[data-njb-cancel]', 'click', h.wrap_cancel)
      .undelegate('[data-njb-prev]', 'click', h.wrap_prev)
      .undelegate('[data-njb-next]', 'click', h.wrap_next)

    this.dom.window.off('resize', h.window_resize)
      .off('scroll', h.window_scroll)
      .off('orientationchange', h.window_orientation)


    //remove link to all previous handlers
    var elsClick = h.elsClick;
    this._handlers = {
      elsClick: elsClick
    }

    this.dom.focusCatcher.off('focus', h.focusCatch)

    this._cb('events_removed');
  }


  //gallery methods
  _detectIndexForOpen(indexFromShow) {
    var o = this.o,
      that = this,
      index = this.state.active || 0;

    if (indexFromShow) {//first we check if index we have as argument in show method
      index = indexFromShow - 1;
    } else if (this.state.gallery && o.start - 1 && this.items[o.start - 1]) {//then we check o.start option
      index = o.start - 1;
    }
    //if we have clicked element, take index from it
    if (this.state.gallery && this.els && this.els.length && that.state.clickedEl) {
      this.els.each(function (i, el) {
        if (that.state.clickedEl === el) {
          index = i;
          return;
        }
      })
    }

    return index;
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

      item.dom.body[0].innerHTML = o.text.imageError.replace('%url%', item.content);

      that._cb('img_error', item);//img_ready, img_load callbacks
      // rendered();

      item.o.status = 'error';
      item.o.imageInserted = true;
    }
    $img.on('error', item._handlerError).on('abort', item._handlerError);

    // if (item.title) img.title = item.title;
    img.src = item.content;

    ready = img.width + img.height > 0;
    loaded = img.complete && img.width + img.height > 0;

    if (o.img === 'ready' && ready || o.img === 'load' && loaded) {
      checkShow(true);
    } else {
      this._preloader('show', item);

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
      that._preloader('hide', item);

      $img.attr('width', 'auto')//for IE <= 10

      //insert content
      item.dom.body[0].appendChild(img);
      item.o.imageInserted = true;

      //animation after image loading
      //todo add custom image animation, don't use global popup animation
      // if(ev === 'load') that._anim('show', true)
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
  _setItemsOrder(currentIndex) {
    this.state.itemsOrder = this._getItemsOrder(currentIndex);
  }
  _getItemsOrder(currentIndex) {
    var o = this.o,
      prev = currentIndex - 1,
      next = currentIndex + 1;

    if (o.loop && this.items.length > 2) {
      if (prev === -1) prev = this.items.length - 1;
      if (next === this.items.length) next = 0;
    }
    if (!this.items[prev]) prev = null;
    if (!this.items[next]) next = null;

    return [prev, currentIndex, next];
  }
  _preload() {
    var o = this.o,
      that = this;

    if (!o.preload || this.state.state !== 'shown') return;//we should start preloading only after show animation is finished, because loading images makes animation glitchy

    var temp = o.preload.split(' '),
      prev = parseInt(temp[0]),
      prevState = this._getItemsOrder(this.state.itemsOrder[0])[0],
      next = parseInt(temp[1]),
      nextState = this._getItemsOrder(this.state.itemsOrder[2])[2];

    //load next
    while (next--) {
      preload.call(this, nextState);
      nextState = this._getItemsOrder(nextState)[2];
    }

    //load previous
    while (prev--) {
      preload.call(this, prevState);
      prevState = this._getItemsOrder(prevState)[0]
    }

    function preload(index) {
      if (index === null) return;
      var item = this.items[index],
        content = item.content;

      if (item.o.status !== 'loading' && item.o.status !== 'loaded' && item.type === 'image') document.createElement('img').src = content;
    }
  }
  _drawItemSiblings() {
    var o = this.o,
      that = this;

    if (typeof this.state.itemsOrder[0] === 'number') {
      this._moveItem(this.items[this.state.itemsOrder[0]], -110, '%');
      this._drawItem(this.state.itemsOrder[0], true);
    }
    if (typeof this.state.itemsOrder[2] === 'number') {
      this._moveItem(this.items[this.state.itemsOrder[2]], 110, '%');
      this._drawItem(this.state.itemsOrder[2]);
    }
    this.position();
    this._preload()
  }
  _moveItem(item, value, unit) {
    unit = unit || 'px';

    //detect translate property
    if (njBox.g.transform['3d']) {
      item.dom.modalOuter[0].style.cssText = njBox.g.transform.css + ': translate3d(' + (value + unit) + ',0,0)'
    } else if (njBox.g.transform['css']) {
      item.dom.modalOuter[0].style.cssText = njBox.g.transform.css + ': translateX(' + (value + unit) + ')'
    } else {
      item.dom.modalOuter[0].style.cssText = 'left:' + (value + unit)
    }
  }
  _changeItem(nextIndex, dir) {
    if (this.items.length === 1 || nextIndex === this.state.active || this.state.itemChanging) return;

    var o = this.o,
      that = this;

    if (!this.items[nextIndex]) {
      if (o.loop && this.items.length > 2) {
        if (dir === 'next' && nextIndex === this.items.length) {
          nextIndex = 0;
        } else if (dir === 'prev' && nextIndex === -1) {
          nextIndex = this.items.length - 1;
        } else {
          return;
        }
      } else {
        return;
      }
    }

    this.state.direction = dir;

    this.state.itemChanging = true;//we can't change slide during current changing
    this.state.itemsOrder_backup = this.state.itemsOrder.slice();//copy current state

    this.state.active = nextIndex;
    this._cb('change', nextIndex);

    this._setItemsOrder(nextIndex);



    switch (dir) {
      case 'prev':
        this.items[this.state.itemsOrder_backup[0]].dom.body[0].style.verticalAlign = 'middle';//hack for FireFox at least 42.0. When we changing max-height on image it not trigger changing width on parent inline-block element, this hack triggers it

        this._moveItem(this.items[this.state.itemsOrder_backup[1]], 110, '%');
        this._moveItem(this.items[this.state.itemsOrder_backup[0]], 0, '%');
        break;
      case 'next':
        this.items[this.state.itemsOrder_backup[2]].dom.body[0].style.verticalAlign = 'middle';//hack for FireFox at least 42.0. When we changing max-height on image it not trigger changing width on parent inline-block element, this hack triggers it

        this._moveItem(this.items[this.state.itemsOrder_backup[1]], -110, '%');
        this._moveItem(this.items[this.state.itemsOrder_backup[2]], 0, '%');
        break;
    }

    setTimeout(function () {
      if (that.state.state !== 'shown') {
        that.state.itemChanging = false;
        return;//case when we hide modal when slide is changing
      }
      //remove slide that was active before changing
      removeSlide(that.items[that.state.itemsOrder_backup[1]]);

      //remove third slide
      var thirdItem = (dir === 'prev') ? that.state.itemsOrder_backup[2] : that.state.itemsOrder_backup[0];
      if (that.items[thirdItem]) removeSlide(that.items[thirdItem]);//we should check if such slide exist, because it can be null, when o.loop is false

      delete that.state.itemsOrder_backup;

      that._setItemsOrder(that.state.active);
      that._drawItemSiblings();
      that._setFocusInPopup(that.items[that.state.active]);
      that.state.itemChanging = false;
      that._cb('changed', that.state.active);

    }, this._getAnimTime(this.items[this.state.itemsOrder[1]].dom.modalOuter));

    function removeSlide(item) {
      item.dom.modalOuter[0].parentNode.removeChild(item.dom.modalOuter[0])
      item.dom.modalOuter[0].style.cssText = '';
    }
  }
  _preloader(type, item) {
    var o = this.o,
      that = this;

    switch (type) {
      case 'show':
        item.o.preloader = true;
        item.dom.preloader = $(o.templates.preloader)
        item.dom.preloader.attr('title', o.text.preloader);

        item.dom.modal.addClass('njb--loading');
        item.dom.body[0].appendChild(item.dom.preloader[0])
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

    if (!item) this._error('njBox, can\'t update ui info from item index - ' + index);

    //set title
    if (item.title) {
      this.dom.ui.removeClass('njb-ui--no-title');
    } else {
      this.dom.ui.addClass('njb-ui--no-title');
    }
    this.dom.wrap.find('[data-njb-title]').html(item.title || '')


    //set item counts
    this.dom.wrap.find('[data-njb-current]').html(index + 1 || '')//+1 because indexes are zero-based
    this.dom.wrap.find('[data-njb-total]').html(this.items.length || '')

    //arrow classes
    if (index === 0) {
      this.dom.ui.addClass('njb-ui--first');
    } else {
      this.dom.ui.removeClass('njb-ui--first');
    }

    if (index === this.items.length - 1) {
      this.dom.ui.addClass('njb-ui--last');
    } else {
      this.dom.ui.removeClass('njb-ui--last');
    }

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
          this.dom.container[0].njb_scrollbar = null;
        }

        if (this.dom.container[0] === this.dom.body[0]) {
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
          if (o.backdropassist) this.dom.backdrop.css('transitionDuration', this._globals.animShowDur + 'ms')

          //insert backdrop div
          if (o.position === 'absolute') this.dom.backdrop.addClass('njb-absolute');
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
  _anim(type, nocallback) {
    var o = this.o,
      that = this,
      modalOuter = this.items[this.state.active].dom.modalOuter,
      modal = this.items[this.state.active].dom.modal,
      animShow = this._globals.animShow,
      animHide = this._globals.animHide,
      animShowDur = this._globals.animShowDur,
      animHideDur = this._globals.animHideDur;


    switch (type) {
      case 'show':
        this.dom.wrap.addClass('njb-wrap--visible');

        if (animShow) {
          if (o.animclass) modal.addClass(o.animclass);

          modal.addClass(animShow);

          setTimeout(shownCallback, animShowDur);
        } else {
          shownCallback();
        }
        break;
      case 'hide':
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

      if (!nocallback) that._cb('shown');
      that._setFocusInPopup(that.items[that.state.active], true);
    }
    function hiddenCallback() {
      if (o.animclass) modal.removeClass(o.animclass);
      if (animHide === animShow) modal.removeClass('njb-anim-reverse');
      modal.removeClass(animHide);

      that._clear();
      if (!nocallback) that._cb('hidden');
    }
  }
  _focusPreviousModal() {//because of possibility to open multiple dialogs, we need to proper focus handling when dialogs are closed
    var openedBox = this.dom.body.find('.njb-wrap'),
      openedInstance;

    if (!openedBox.length) return;
    openedInstance = openedBox[openedBox.length - 1].njBox;
    openedInstance._setFocusInPopup(openedInstance.items[openedInstance.state.active]);
  }
  _clear() {
    var o = this.o;

    if (this.dom.container) this.dom.container[0].njb_instances--;
    if (this.dom.container[0].njb_instances === 0) this.dom.container.removeClass('njb-open');

    if (o['class']) this.dom.wrap.removeClass(o['class']);

    this._scrollbar('show');


    if (this.dom.wrap && this.dom.wrap.length) this.dom.wrap[0].parentNode.removeChild(this.dom.wrap[0]);

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

    var origGalleryState = this.state.gallery;
    this.state = {
      inited: true,
      state: 'inited',
      active: 0,
      gallery: origGalleryState
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
      type === 'destroy' ||
      type === 'destroyed'
    ) {
      this.state.state = type;
    }
    //make some stuff on callbacks
    switch (type) {
      case 'show':
        this._uiUpdate();
        break;
      case 'shown':
        if (this.state.gallery) this._preload();
        break;
      case 'hidden':
        this.state.state = 'inited';
        this._focusPreviousModal();
        break;
      case 'change':
        this._uiUpdate()
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