(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("njBox", [], factory);
	else if(typeof exports === 'object')
		exports["njBox"] = factory();
	else
		root["njBox"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*!
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * njBox - v2.0.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * nejikrofl@gmail.com
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) 2017 N.J.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */


var _j = __webpack_require__(1);

var _j2 = _interopRequireDefault(_j);

var _utils = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//by default we use jQuery, it makes possible to run plugin with jQuery (low ie support for example)
var $ = window.jQuery || _j2.default;

var njBox = function () {
  function njBox(el, options) {
    _classCallCheck(this, njBox);

    //el can be a string, selector/dom/j/jQuery element
    if (!arguments.length) {
      console.error('njBox, arguments not passed.');
      return;
    }
    var opts = void 0;

    if (!options && el) {
      //if we have only one argument
      if ($.isPlainObject(el)) {
        //if this argument is plain object, it is options
        opts = el;
      } else {
        //if it's not options, it is dom/j/jQuery element or selector
        opts = { elem: el };
      }
    } else {
      //if we have two arguments
      opts = options;
      opts.elem = el;
    }

    opts = opts || {};

    this._init(opts);
  }

  _createClass(njBox, [{
    key: '_init',
    value: function _init(opts) {
      //getDefaultInfo trying to launch as early as possible (even before this init method), but may fail because of missing body tag (if script included in head), so we check it here again
      if (!njBox.g) njBox.g = (0, _utils.getDefaultInfo)();

      this.active = 0;

      //inner options, current state of app, this.state clears after every hide
      this.state = {};

      //inner options, this settings alive throughout the life cycle of the plugin(until destroy)
      this._globals = {};
      this._handlers = {}; //all callback functions we used in event listeners lives here

      this._globals.passedOptions = opts;
      var o = this.o = $.extend({}, njBox.defaults, opts);
      if (o.jquery) $ = o.jquery;

      this.v = {
        document: $(document),
        window: $(window),
        html: $(document.documentElement),
        body: $(document.body)

        //... other will be added later
      };

      //we should have dom element or at least content option for creating item
      if (!o.elem && !o.content) {
        this._error('njBox, no elements (o.elem) or content (o.content) for modal.');
        return;
      }
      if (o.elem) {
        var $elem = $(o.elem);
        if (!$elem.length) {
          this._error('njBox, element not found (' + o.elem + ')');
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
        $.extend(true, this.o, this._globals.gatheredOptions);

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
  }, {
    key: 'show',
    value: function show(index) {
      if (index) this.active = parseInt(index); //index uses in gallery

      var o = this.o;

      if (this.state.state !== 'inited') {
        this._error('njBox, show, plugin not inited or in not inited state(probably plugin is already visible or destroyed, or smth else..)');
        return;
      }
      if (!this.items.length) {
        this._error('njBox, smth goes wrong, plugin don\'t create any item to show', true);
        return;
      }

      if (this._cb('show') === false) return; //callback show (we can cancel showing popup, if show callback will return false)
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

      //force reflow, we need because firefox has troubles with njb element width, while inside autoheighted image
      this.v.wrap[0].style.display = 'none';
      this.v.wrap[0].clientHeight;
      this.v.wrap[0].style.display = 'block';

      this._anim('show');

      return this;
    }
  }, {
    key: 'hide',
    value: function hide() {
      if (this.state.state !== 'shown') {
        this._error('njBox, hide, we can hide only showed modal (probably animation is still running or plugin destroyed).');
        return;
      }

      var o = this.o,
          h = this._handlers;

      if (this._cb('hide') === false) return; //callback hide
      if (this.state.clickedEl) this.state.clickedEl.focus();

      this._backdrop('hide');

      this._removeEventsHandlers();

      this._anim('hide');

      return this;
    }
  }, {
    key: 'position',
    value: function position() {
      if (!this.state.inited) return;

      var o = this.o;

      this._getContainerSize();

      //position of global wrapper
      if (o.position === 'absolute') {
        //global wrap positioning
        var scrollTop = this.state.dimensions.containerScrollTop,
            scrollLeft = this.state.dimensions.containerScrollLeft;

        if (scrollTop <= this.state.dimensions.containerMaxScrollTop) {
          this.v.wrap.css({ 'top': scrollTop + 'px', 'left': scrollLeft + 'px' });
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
  }, {
    key: 'destroy',
    value: function destroy() {
      if (!this.state.inited || this.state.state !== 'inited') {
        this._error('njBox, we can destroy only initialized && hidden modals.');
        return;
      }

      if (this.els && this.els.length) {
        this.els.off('click', this._handlers.elsClick);

        if (this.o.clickels) {
          $(this.o.clickels).off('click', this._handlers.elsClick);
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
  }, {
    key: '_getContainerSize',
    value: function _getContainerSize() {
      var o = this.o;

      var d = this.state.dimensions = {};

      if (this.v.container[0] === this.v.body[0]) {
        d.containerWidth = document.documentElement.clientWidth;
        d.containerHeight = document.documentElement.clientHeight;
        d.containerScrollWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, document.body.offsetWidth, document.documentElement.offsetWidth, document.body.clientWidth, document.documentElement.clientWidth);
        d.containerScrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight);
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

      d.autoheight = this.v.container[0] === this.v.body[0] ? d.winHeight : d.containerHeight;
      // if(this._o.scrollbarHidden) {
      //  this._o.winWidth -= njBox.g.scrollbarSize;
      // }
    }
  }, {
    key: '_setMaxHeight',
    value: function _setMaxHeight(item) {
      var o = this.o;

      if (!o.autoheight || o.autoheight === 'image' && item.type !== 'image') return;

      if (!this.state.autoheightAdded) {
        this.v.wrap.addClass('njb-autoheight');
        o.autoheight === true ? this.v.wrap.addClass('njb-autoheight--true') : this.v.wrap.addClass('njb-autoheight--image');
        this.state.autoheightAdded = true;
      }

      var v = item.dom,
          modalMargin = summ(v.modal, 'margin'),
          modalPadding = summ(v.modal, 'padding') + parseInt(v.modal.css('borderTopWidth')) + parseInt(v.modal.css('borderBottomWidth')) || 0,
          bodyMargin = summ(v.body, 'margin'),
          bodyPadding = summ(v.body, 'padding') + parseInt(v.body.css('borderTopWidth')) + parseInt(v.body.css('borderBottomWidth')) || 0,
          containerHeight = this.state.dimensions.autoheight,
          height = containerHeight,
          bodyBorderBox = v.body.css('boxSizing') === 'border-box';

      function summ(el, prop) {
        return parseInt(el.css(prop + 'Top')) + parseInt(el.css(prop + 'Bottom')) || 0;
      }

      var headerHeight = 0,
          footerHeight = 0;

      v.header && v.header.length ? headerHeight = v.header[0].scrollHeight + (parseInt(v.header.css('borderTopWidth')) + parseInt(v.header.css('borderBottomWidth'))) || 0 : 0;
      v.footer && v.footer.length ? footerHeight = v.footer[0].scrollHeight + (parseInt(v.footer.css('borderTopWidth')) + parseInt(v.footer.css('borderBottomWidth'))) || 0 : 0;

      height = containerHeight - modalMargin - modalPadding - bodyMargin - headerHeight - footerHeight;

      if (!bodyBorderBox) height -= bodyPadding;

      if (item.type === 'image') {
        var autoheightImg = containerHeight - modalMargin - modalPadding - bodyMargin - bodyPadding - headerHeight - footerHeight;

        if (v.img) v.img.css('maxHeight', autoheightImg + 'px');
      } else {
        v.body.css('maxHeight', height + 'px');
      }
    }
    //return array with raw options gathered from items from which gallery/modal will be created, this method will be replaced in gallery addon

  }, {
    key: '_createRawItems',
    value: function _createRawItems() {
      return [this.o];
    }
    //gather dom elements from which we will create modal window/gallery, this method will be replaced in gallery addon

  }, {
    key: '_gatherElements',
    value: function _gatherElements() {
      return this.o.el;
    }
  }, {
    key: '_gatherData',
    value: function _gatherData(el) {
      var o = this.o,
          $el = $(el),
          dataO = $el.data(),
          //data original
      dataProcessed = {}; //data processed

      if (!$el.length) {
        return dataProcessed;
      }

      if (dataO.njbOptions) {
        try {
          dataProcessed = $.parseJSON(dataO.njbOptions);
          delete dataO.njbOptions;
        } catch (e) {
          this._error('njBox, fail to parse options from njb-options');
          return;
        }
      }
      if ($el.length) {
        dataProcessed.el = $el;
      }

      //try to get href from original attributes
      if ($el[0].tagName.toLowerCase() === 'a') {
        var href = $el.attr('href');
        if (href && href !== '#' && href !== '#!' && !/^(?:javascript)/i.test(href)) {
          //test href for real info, not placeholder
          dataProcessed.content = href;
        }
      }

      //get title
      if (o.title_attr) {
        var title_attr = $el.attr(o.title_attr);
        if (title_attr) dataProcessed.title = title_attr;
      }

      $.extend(true, dataProcessed, choosePrefixedData(dataO));

      function choosePrefixedData(data) {
        var prefixedData = {};

        for (var p in data) {
          //use only data properties with njb prefix
          if (data.hasOwnProperty(p) && /^njb[A-Z]+/.test(p)) {
            var shortName = p.match(/^njb(.*)/)[1],
                shortNameLowerCase = shortName.charAt(0).toLowerCase() + shortName.slice(1);

            prefixedData[shortNameLowerCase] = transformType(data[p]);
          }
        }

        return prefixedData;
      }

      function transformType(val) {
        //transform string from data attributes to boolean and number
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
  }, {
    key: '_createItems',
    value: function _createItems(els) {
      var items = [];
      for (var i = 0, l = els.length; i < l; i++) {
        items.push(this._createItem(els[i]));
      }
      return items;
    }
  }, {
    key: '_createItem',
    value: function _createItem(item) {
      var normalizedItem = this._normalizeItem(item);

      this._createDomForItem(normalizedItem);

      return normalizedItem;
    }
  }, {
    key: '_normalizeItem',
    value: function _normalizeItem(item, el) {
      var evaluatedContent = void 0;
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
      };
    }
  }, {
    key: '_type',
    value: function _type(content) {
      //detect content type
      var type = 'html';

      if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object') {
        if (window.jQuery && content instanceof window.jQuery || window.j && content instanceof window.j) {
          return 'selector';
        }
      } else if (/^[#.]\w/.test(content)) {
        return 'selector';
      } else if (/\.(png|jpg|jpeg|gif|tiff|bmp|webp)(\?\S*)?$/i.test(content)) {
        return 'image';
      }

      return type;
    }
  }, {
    key: '_createDomForItem',
    value: function _createDomForItem(item) {
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

        modalFragment.appendChild(dom.body[0]);

        //insert header
        if (item.header) {
          dom.header = $(o.templates.header);

          if (!dom.header.length) {
            this._error('njBox, error in o.templates.header');
            return;
          }
          //insert header info
          var headerInput = dom.header[0].getAttribute('data-njb-header') !== null ? headerInput = dom.header : headerInput = dom.header.find('[data-njb-header]');
          headerInput[0].innerHTML = item.header;

          modalFragment.insertBefore(dom.header[0], modalFragment.firstChild);
        }

        //insert footer
        if (item.footer) {
          dom.footer = $(o.templates.footer);

          if (!dom.footer.length) {
            this._error('njBox, error in njBox.templates.footer');
            return;
          }
          //insert footer info
          var footerInput = dom.footer[0].getAttribute('data-njb-footer') !== null ? footerInput = dom.footer : footerInput = dom.footer.find('[data-njb-footer]');
          footerInput[0].innerHTML = item.footer;

          modalFragment.appendChild(dom.footer[0]);
        }

        //insert close button
        if (o.close === 'inside') {
          dom.close = $(o.templates.close);
          dom.close[0].setAttribute('title', o.text.close);

          modalFragment.appendChild(dom.close[0]);
        }

        dom.modal[0].appendChild(modalFragment);
      }

      this._cb('item_domready', item);
    }
  }, {
    key: '_insertItemBodyContent',
    value: function _insertItemBodyContent(item) {
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
      if (item.type === 'image') {
        item.dom.modal.addClass('njb--image');
      } else {
        item.dom.modal.addClass('njb--content');
      }
    }
  }, {
    key: '_getItemFromSelector',
    value: function _getItemFromSelector(item) {
      item.o.contentEl = $(item.content);

      if (!item.o.contentEl.length) {
        item.dom.body[0].innerHTML = item.content; //if we don't find element with this selector
      }
    }
  }, {
    key: '_insertImage',
    value: function _insertImage(item) {
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

        that._cb('img_error', item); //img_ready, img_load callbacks
        // rendered();

        item.o.status = 'error';
        item.o.imageInserted = true;
      };
      $img.on('error', item._handlerError).on('abort', item._handlerError);

      if (item.title) img.title = item.title;
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
        };
        $img.on('njb_ready', item._handlerImgReady);
        findImgSize(img);

        item._handlerLoad = function () {
          $img.off('load', item._handlerLoad);
          checkShow('load');
        };
        $img.on('load', item._handlerLoad);
      }

      function checkShow(ev) {
        that._cb('item_img_' + ev, item); //img_ready, img_load callbacks

        if (ev !== o.img && ev !== true) return;

        item.o.status = 'loaded';
        that._preloader('hide', item);

        $img.attr('width', 'auto'); //for IE <= 10

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
            njbSetInterval = function njbSetInterval(delay) {
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
  }, {
    key: '_createDom',
    value: function _createDom() {
      var o = this.o;

      //find container
      this.v.container = $(o.container);
      if (!this.v.container.length) {
        this._error('njBox, can\'t find container element. (we use body instead)');
        this.v.container = this.v.body; //in case if we have no container element, or wrong selector for container element
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
  }, {
    key: '_drawItem',
    value: function _drawItem(index) {
      var o = this.o,
          item = this.items[index];

      if (!item) {
        this._error('njBox, we have no item with this index - ' + index, true);
        return;
      }

      this._cb('item_prepare', item);

      //insert content in slides, where inserting is delayed to show event
      this._insertDelayedContent();

      this.v.items[0].appendChild(item.dom.modalOuter[0]);

      this._cb('item_inserted', item);
    }
  }, {
    key: '_insertDelayedContent',
    value: function _insertDelayedContent() {
      var that = this,
          o = this.o,
          items = this.items,
          item,
          contentEl;

      for (var i = 0, l = items.length; i < l; i++) {
        item = items[i];

        if (item.type === 'image' && o.imgload === 'show') {
          if (item.o.imageInserted) {
            continue;
          }
          this._insertImage(item);
        } else if (item.type === 'selector') {
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
          item.dom.body[0].innerHTML = ''; //clear body for case when first time we can't find contentEl on page
          item.dom.body[0].appendChild(contentEl[0]);
          item.o.contentElInserted = true;
        }
      }
    }
  }, {
    key: '_removeSelectorItemsElement',
    value: function _removeSelectorItemsElement() {
      var items = this.items,
          item,
          contentEl;

      for (var i = 0, l = items.length; i < l; i++) {
        if (items[i].type === 'selector') {
          item = items[i];
          if (!item.o.contentElInserted) continue;

          contentEl = item.o.contentEl;

          if (item.o.contentElDisplayNone) {
            contentEl[0].style.display = 'none';
            item.o.contentElDisplayNone = undefined;
          }
          if (item.o.contentElStyle) {
            contentEl[0].style.cssText = item.o.contentElStyle;
            item.o.contentElStyle = undefined;
          }
          //return selector element to the dom
          this.v.body[0].appendChild(contentEl[0]);
          item.o.contentElInserted = false;
        }
      }
    }
  }, {
    key: '_setFocusInPopup',
    value: function _setFocusInPopup(item, initialFocus) {
      var o = this.o,
          focusElement;

      if (initialFocus) {
        focusElement = item.dom.modal.find('[autofocus]');

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
      } else if (o.close === "outside") {
        //then try to focus close buttons
        this.v.close[0].focus();
      } else if (o.close === "inside" && item.dom.close) {
        //if type:"template" is used we have no close button here
        item.dom.close[0].focus();
      } else {
        //if no, focus popup itself
        item.dom.modal[0].focus();
      }
    }
  }, {
    key: '_setClickHandlers',
    value: function _setClickHandlers() {
      //initial click handlers
      var o = this.o;

      if (!o.click) return;

      if (this.els && this.els.length) {
        this._handlers.elsClick = this._clickHandler();
        this.els.off('click', this._handlers.elsClick).on('click', this._handlers.elsClick);

        if (o.clickels) {
          $(o.clickels).off('click', this._handlers.elsClick).on('click', this._handlers.elsClick);
        }
      }
    }
  }, {
    key: '_clickHandler',
    value: function _clickHandler() {
      //this method creates closure with modal instance
      var o = this.o,
          that = this;

      return function (e) {
        var el = this;

        if (e.originalEvent) e = e.originalEvent; //work with original event

        if ('which' in e && (e.which !== 1 || e.which === 1 && e.ctrlKey && e.shiftKey)) return; //handle only left button click without key modificators
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        if (that.state.state !== 'inited') {
          that._error('njBox, show, plugin not inited or in not inited state(probably plugin is already visible or destroyed, or smth else..)');
          return;
        }
        if ($(el).closest('.njb-close-system, .njb-arrow').length) return; //don't remember why it here O_o


        that.state.clickedEvent = e;
        that.state.clickedEl = el;

        that.show();
      };
    }
  }, {
    key: '_setEventsHandlers',
    value: function _setEventsHandlers() {
      //all other event handlers
      var o = this.o,
          that = this,
          h = this._handlers;

      h.container_resize = function () {
        that.position();
      };
      h.container_scroll = function () {
        that.position();
      };
      this.v.container.on('resize', h.container_resize).on('scroll', h.container_scroll);

      h.wrap_out = function (e) {
        var $el = $(e.target),
            prevent = $el.closest('.njb, [data-njb-close]').length;
        if (prevent) return;

        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        if (o.out) {
          if (that._cb('cancel') === false) return;
          that.hide();
        } else {
          that.items[that.active].dom.modal.addClass('njb_pulse');
          that._setFocusInPopup(this.items[this.active]);

          setTimeout(function () {
            that.items[that.active].dom.modal.removeClass('njb_pulse');
          }, that._getAnimTime(that.items[that.active].dom.modal[0]));
        }
      };
      h.wrap_resize = function () {
        // that.position();
      };
      h.wrap_scroll = function (e) {
        // that.position();
      };
      h.wrap_keydown = function (e) {
        that._cb('keydown', e);

        switch (e.which) {
          case 27:
            //esc
            if (o.esc) {
              if (that._cb('cancel') === false) return;
              that.hide();
            }

            e.preventDefault ? e.preventDefault() : e.returnValue = false;
            break;
        }
      };
      h.wrap_close = function (e) {
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        if (that._cb('cancel') === false) return;
        that.hide();
      };
      h.wrap_ok = function (e) {
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        if (that._cb('ok') === false) return;
        that.hide();
      };
      h.wrap_cancel = function (e) {
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        if (that._cb('cancel') === false) return;
        that.hide();
      };

      this.v.wrap.on('click', h.wrap_out).on('resize', h.wrap_resize).on('scroll', h.wrap_scroll).on('keydown', h.wrap_keydown).delegate('[data-njb-close]', 'click', h.wrap_close).delegate('[data-njb-ok]', 'click', h.wrap_ok).delegate('[data-njb-cancel]', 'click', h.wrap_cancel);

      h.window_resize = function (e) {
        that.position();
      };
      h.window_scroll = function (e) {
        that.position();
      };
      h.window_orientation = function (e) {
        that.position();
      };

      this.v.window.on('resize', h.window_resize).on('scroll', h.window_scroll).on('orientationchange', h.window_orientation);

      h.focusCatch = function (e) {
        that._setFocusInPopup(that.items[that.active]);
      };
      this.v.focusCatcher.on('focus', h.focusCatch);

      this._cb('events_setted');
    }
  }, {
    key: '_removeEventsHandlers',
    value: function _removeEventsHandlers() {
      var h = this._handlers;

      this.v.container.off('resize', h.container_resize).off('scroll', h.container_scroll);

      this.v.wrap.off('click', h.wrap_out).off('resize', h.wrap_resize).off('scroll', h.wrap_scroll).off('keydown', h.wrap_keydown).undelegate('[data-njb-close]', 'click', h.wrap_close).undelegate('[data-njb-ok]', 'click', h.wrap_ok).undelegate('[data-njb-cancel]', 'click', h.wrap_cancel);

      this.v.window.off('resize', h.window_resize).off('scroll', h.window_scroll).off('orientationchange', h.window_orientation);

      //remove link to all previous handlers
      var elsClick = h.elsClick;
      this._handlers = {
        elsClick: elsClick
      };

      this.v.focusCatcher.off('focus', h.focusCatch);

      this._cb('events_removed');
    }
  }, {
    key: '_preloader',
    value: function _preloader(type, item) {
      var o = this.o,
          that = this;

      switch (type) {
        case 'show':
          item.o.preloader = true;
          item.dom.preloader = $(o.templates.preloader);
          item.dom.preloader.attr('title', o.text.preloader);

          item.dom.modal.addClass('njb--loading');
          item.dom.body[0].appendChild(item.dom.preloader[0]);
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
  }, {
    key: '_scrollbar',
    value: function _scrollbar(type) {
      var o = this.o;
      switch (type) {
        case 'hide':
          if (o.scrollbar === 'hide') {
            if (this.state.scrollbarHidden) return;

            if (this.v.container[0] === this.v.body[0]) {
              //we can insert modal window in any custom element, that's why we need this if
              var sb = (document.documentElement.scrollHeight || document.body.scrollHeight) > document.documentElement.clientHeight; //check for scrollbar existance (we can have no scrollbar on simple short pages)

              //don't add padding to html tag if no scrollbar (simple short page) or popup already opened
              if (!this.v.container[0].njb_scrollbar && !this.state.scrollbarHidden && (sb || this.v.html.css('overflowY') === 'scroll' || this.v.body.css('overflowY') === 'scroll')) {
                //existing of that variable means that other instance of popup hides scrollbar on this element already
                this.v.html.addClass('njb-hideScrollbar');
                this.v.html.css('paddingRight', parseInt(this.v.html.css('paddingRight')) + njBox.g.scrollbarSize + 'px');
              }
            } else {
              var sb = this.v.container[0].scrollHeight > this.v.container[0].clientHeight; //check for scrollbar existance on this element

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
            this.v.container[0].njb_scrollbar ? this.v.container[0].njb_scrollbar++ : this.v.container[0].njb_scrollbar = 1;
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

            if (computedPadding) {
              //if greater than 0
              this.v.html.css('paddingRight', computedPadding + 'px');
            } else {
              //if padding is 0, remove it from style attribute
              this.v.html[0].style.paddingRight = '';
            }
          } else {

            this.v.container.removeClass('njb-hideScrollbar');
            var computedPadding = parseInt(this.v.container.css('paddingRight')) - njBox.g.scrollbarSize;

            if (computedPadding) {
              //if greater than 0
              this.v.container.css('paddingRight', computedPadding + 'px');
            } else {
              //if padding is 0, remove it from style attribute
              this.v.container[0].style.paddingRight = '';
            }
          }

          delete this.state.scrollbarHidden;

          break;
      }
    }
  }, {
    key: '_backdrop',
    value: function _backdrop(type) {
      var o = this.o,
          that = this;

      switch (type) {
        case 'show':
          this.v.backdrop = $(o.templates.backdrop);

          if (this.state.backdropVisible) return;

          if (o.backdrop === true) {
            if (o.backdropassist) this.v.backdrop.css('transitionDuration', this._globals.animShowDur + 'ms');

            //insert backdrop div
            if (o.position === 'absolute') this.v.backdrop.addClass('njb-absolute');
            this.v.container[0].appendChild(this.v.backdrop[0]);

            // this.v.backdrop[0].clientHeight;

            setTimeout(function () {
              //this prevent page from scrolling in chrome while background transition is working..., also needed as reflow
              that.v.backdrop.addClass('njb-visible');
            }, 0);

            this.state.backdropVisible = true;
          }
          break;

        case 'hide':
          if (!this.state.backdropVisible) return;
          if (o.backdropassist) this.v.backdrop.css('transitionDuration', this._globals.animHideDur + 'ms');

          this.v.backdrop.removeClass('njb-visible');

          setTimeout(function () {
            that.v.backdrop[0].parentNode.removeChild(that.v.backdrop[0]);
            if (o.backdropassist) that.v.backdrop[0].style.cssText = '';
            delete that.state.backdropVisible;
          }, that._getAnimTime(that.v.backdrop[0]));
          break;
      }
    }
  }, {
    key: '_calculateAnimations',
    value: function _calculateAnimations() {
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
        tmp[1] ? animHide = tmp[1] : animHide = tmp[0];
      }

      //get animation durations from options
      if (o.duration) {
        o.duration = o.duration.toString();

        tmp = o.duration.split(' ');
        animShowDur = tmp[0];
        tmp[1] ? animHideDur = tmp[1] : animHideDur = tmp[0];
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
  }, {
    key: '_getAnimTime',
    value: function _getAnimTime(el, property) {
      //get max animation or transition time
      return this._getMaxTransitionDuration(el, 'animation') || this._getMaxTransitionDuration(el, 'transition');
    }
  }, {
    key: '_getMaxTransitionDuration',
    value: function _getMaxTransitionDuration(el, property) {
      //method also can get animation duration
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
        durArr[i] = durArr[i].indexOf("ms") > -1 ? parseFloat(durArr[i]) : parseFloat(durArr[i]) * 1000;
      }

      //make array with delays
      if (!del || del === undefined) del = '0s';
      delArr = del.split(', ');
      for (var i = 0, l = delArr.length; i < l; i++) {
        delArr[i] = delArr[i].indexOf("ms") > -1 ? parseFloat(delArr[i]) : parseFloat(delArr[i]) * 1000;
      }

      //make array with duration+delays
      for (var i = 0, l = durArr.length; i < l; i++) {
        transitions[i] = durArr[i] + delArr[i];
      }

      return Math.max.apply(Math, transitions);
    }
  }, {
    key: '_anim',
    value: function _anim(type, nocallback) {
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
          this.v.wrap.removeClass('njb-visible');

          if (animHide) {

            if (o.animclass) modal.addClass(o.animclass);
            if (animHide === animShow) modal.addClass('njb-anim-reverse');
            modal.addClass(animHide);

            setTimeout(hiddenCallback, animHideDur);
          } else {
            hiddenCallback();
          }
          break;
      }
      function shownCallback() {
        if (o.animclass) modal.removeClass(o.animclass);
        modal.removeClass(animShow);

        if (!nocallback) that._cb('shown');
        that._setFocusInPopup(that.items[that.active], true);
      }
      function hiddenCallback() {
        if (o.animclass) modal.removeClass(o.animclass);
        if (animHide === animShow) modal.removeClass('njb-anim-reverse');
        modal.removeClass(animHide);

        that._clear();
        if (!nocallback) that._cb('hidden');
        that.state.state = 'inited';
      }
    }
  }, {
    key: '_clear',
    value: function _clear() {
      var o = this.o;

      if (this.v.container) this.v.container[0].njb_instances--;
      if (this.v.container[0].njb_instances === 0) this.v.container.removeClass('njb-open');

      if (o['class']) this.v.wrap.removeClass(o['class']);

      this._scrollbar('show');

      if (this.v.wrap && this.v.wrap.length) this.v.wrap[0].parentNode.removeChild(this.v.wrap[0]);

      this._removeSelectorItemsElement();

      this.active = 0;

      if (this.v.items && this.v.items.length) empty(this.v.items[0]); //we can't use innerHTML="" here, for IE(even 11) we need remove method

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
  }, {
    key: '_error',
    value: function _error(msg, clear) {
      if (!msg) return;

      if (clear) this._clear();

      console.error(msg);
    }
  }, {
    key: '_cb',
    value: function _cb(type) {
      //cb - callback
      var o = this.o,
          callbackResult;

      if (type === 'inited' || type === 'show' || type === 'shown' || type === 'hide' || type === 'hidden' || type === 'change' || type === 'changed' || type === 'destroy' || type === 'destroyed') {
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
        var modal = this.items[this.active].dom.modal,
            prompt_input = modal.find('[data-njb-return]'),
            prompt_value = void 0;
        if (prompt_input.length) prompt_value = prompt_input[0].value || null;

        clearArgs.unshift(prompt_value);
        this.returnValue = prompt_value;
      }

      if (typeof o['on' + type] === 'function') {
        callbackResult = o['on' + type].apply(this, clearArgs);
      }
      return callbackResult;
    }

    //event emitter

  }, {
    key: 'on',
    value: function on(event, fct) {
      this._events = this._events || {};
      this._events[event] = this._events[event] || [];
      this._events[event].push(fct);
      return this;
    }
  }, {
    key: 'off',
    value: function off(event, fct) {
      this._events = this._events || {};
      if (event in this._events === false) return;
      this._events[event].splice(this._events[event].indexOf(fct), 1);
      return this;
    }
  }, {
    key: 'trigger',
    value: function trigger(event /* , args... */) {
      this._events = this._events || {};
      if (event in this._events === false) return;
      for (var i = 0; i < this._events[event].length; i++) {
        this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
      }
      return this;
    }
  }]);

  return njBox;
}();
//default checks


if (document.body && !njBox.g) njBox.g = (0, _utils.getDefaultInfo)();

// njBox.prototype.showModal = njBox.prototype.show;
//global options

//addons
njBox.a = {};
//default settings
njBox.defaults = _utils.defaults;

njBox.get = function (elem) {
  var el = $(elem)[0];

  if (el) {
    return el.njBox || null;
  } else {
    return null;
  };
};
//autobind functions
njBox.autobind = function () {
  $(njBox.defaults.autobind).each(function () {
    if (this.njBox) {
      console.error('njBox, already inited on this element');
      return;
    }
    new njBox({
      elem: $(this)
    });
  });
};
if (typeof window !== 'undefined') {
  //autobind only in browser and on document ready
  $(function () {
    njBox.autobind();
  });
}

njBox.alert = function (_content, okCb, cancelCb) {
  return new njBox({
    content: function content(rawitem) {
      return '<div class="njb__body">\n                                    ' + (_content || this.o.text._missedContent) + '\n                                  </div>\n                                  <div class="njb__footer">\n                                    <button data-njb-ok>' + this.o.text.ok + '</button>\n                                  </div>';
    },
    type: 'template',
    out: false,
    onok: okCb,
    oncancel: cancelCb
  }).show();
};
njBox.confirm = function (_content2, okCb, cancelCb) {
  return new njBox({
    content: function content(rawitem) {
      return '<div class="njb__body">\n                                    ' + (_content2 || this.o.text._missedContent) + '\n                                  </div>\n                                  <div class="njb__footer">\n                                    <button data-njb-ok>' + this.o.text.ok + '</button>\n                                    <button data-njb-cancel>' + this.o.text.cancel + '</button>\n                                  </div>';
    },
    type: 'template',
    out: false,
    onok: okCb,
    oncancel: cancelCb
  }).show();
};
njBox.prompt = function (_content3, placeholder, okCb, cancelCb) {
  if (typeof placeholder === 'function') {
    cancelCb = okCb;
    okCb = placeholder;
    placeholder = '';
  }

  return new njBox({
    content: function content(rawitem) {
      return '<div class="njb__body">\n                                    ' + (_content3 || this.o.text._missedContent) + '\n                                    <div>\n                                      <input data-njb-return type="text" placeholder="' + (placeholder || '') + '" />\n                                    </div>\n                                  </div>\n                                  <div class="njb__footer">\n                                    <button data-njb-ok>' + this.o.text.ok + '</button>\n                                    <button data-njb-cancel>' + this.o.text.cancel + '</button>\n                                  </div>';
    },
    type: 'template',
    out: false,
    onok: okCb,
    oncancel: cancelCb
  }).show();
};

exports.default = njBox;
module.exports = exports['default'];

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//syntax sugar like jquery

//you can't create elements with this function
var j = function j(selector) {
    selector = selector || '';
    return new j.fn.init(selector);
};
// if(!window.$) window.$ = window.j;

j.match = function (el, selector) {
    if (el === document) el = document.documentElement;

    var matchesSelector = el.matches || el.matchesSelector || el.oMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.msMatchesSelector;

    return matchesSelector.call(el, selector);
};
j.fn = j.prototype;
j.fn.init = function (selector) {
    var query;

    if (typeof selector === 'string' && selector.length > 0) {
        //detect html input
        if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">") {
            j.str2dom ? query = j.str2dom(selector) : query = [];
        } else {
            query = document.querySelectorAll(selector);
        }
    } else if (selector instanceof Array || selector instanceof NodeList || selector instanceof HTMLCollection || selector instanceof j) {
        query = selector;
    } else if (selector.nodeType || window.Node && selector instanceof Node || selector == selector.window || (typeof selector === 'undefined' ? 'undefined' : _typeof(selector)) === 'object') {
        query = [selector];
    } else if (typeof selector === 'function') {
        query = [document];
        document.addEventListener("DOMContentLoaded", selector);
    } else {
        query = [];
    }

    //save selector length
    this.length = query.length;

    for (var i = 0, l = this.length; i < l; i++) {
        this[i] = query[i];
    }

    // Return as object
    return this;
};
j.fn.init.prototype = j.fn; //maked for using instenceOf operator(example: j('#test') instanceOf j)
j.fn.each = function (callback) {
    for (var i = 0, l = this.length; i < l; i++) {
        if (callback.call(this[i], i, this[i]) === false) break;
    }
    return this;
};

j.str2dom = function (html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.childNodes;
};
//extend function from jQuery
j.isArray = function (a) {
    return j.type(a) === "array";
};
j.isFunction = function (a) {
    return j.type(a) == "function";
};
j.isPlainObject = function (f) {
    var b,
        c = {},
        a = {}.hasOwnProperty;if (!f || j.type(f) !== "object" || f.nodeType || j.isWindow(f)) {
        return false;
    }try {
        if (f.constructor && !a.call(f, "constructor") && !a.call(f.constructor.prototype, "isPrototypeOf")) {
            return false;
        }
    } catch (d) {
        return false;
    }if (c.ownLast) {
        for (b in f) {
            return a.call(f, b);
        }
    }for (b in f) {}return b === undefined || a.call(f, b);
};
j.isWindow = function (a) {
    return a != null && a == a.window;
};
j.type = function (c) {
    var a = a = { "[object Array]": "array", "[object Boolean]": "boolean", "[object Date]": "date", "[object Error]": "error", "[object Function]": "function", "[object Number]": "number", "[object Object]": "object", "[object RegExp]": "regexp", "[object String]": "string" },
        b = a.toString;if (c == null) {
        return c + "";
    }return (typeof c === 'undefined' ? 'undefined' : _typeof(c)) === "object" || typeof c === "function" ? a[b.call(c)] || "object" : typeof c === 'undefined' ? 'undefined' : _typeof(c);
};
//for extend function we need: j.isArray, j.isFunction, j.isPlainObject, j.isWindow, j.type
j.extend = function () {
    var src,
        copyIsArray,
        copy,
        name,
        options,
        clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if (typeof target === "boolean") {
        deep = target;

        // skip the boolean and the target
        target = arguments[i] || {};
        i++;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== "object" && !j.isFunction(target)) {
        target = {};
    }

    // extend jQuery itself if only one argument is passed
    if (i === length) {
        target = this;
        i--;
    }

    for (; i < length; i++) {
        // Only deal with non-null/undefined values
        if ((options = arguments[i]) != null) {
            // Extend the base object
            for (name in options) {
                src = target[name];
                copy = options[name];

                // Prevent never-ending loop
                if (target === copy) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if (deep && copy && (j.isPlainObject(copy) || (copyIsArray = j.isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && j.isArray(src) ? src : [];
                    } else {
                        clone = src && j.isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[name] = j.extend(deep, clone, copy);

                    // Don't bring in undefined values
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
};
j.inArray = function (element, array, i) {
    return array == null ? -1 : array.indexOf(element, i);
};

//only in get mode
j.fn.attr = function (name) {
    return this[0].getAttribute(name);
};
j.fn.find = function (selector) {
    var newArray = [],
        tq; //temporary query

    this.each(function (i) {
        tq = Array.prototype.slice.call(this.querySelectorAll(selector), '');
        if (tq.length) {
            newArray = newArray.concat(tq);
        }
    });
    return j(newArray);
};
j.fn.on = function (type, fn) {
    return this.each(function () {
        this.addEventListener(type, fn, false);
    });
};
j.fn.off = function (type, fn) {
    return this.each(function () {
        this.removeEventListener(type, fn);
    });
};
j.fn.delegate = function (selector, type, fn) {
    return this.each(function (i) {
        var parent = this;

        if (!this._events) this._events = {};
        if (!this._events[type]) this._events[type] = [];

        var cb = function cb(e) {
            var target = e && e.target || window.event.srcElement,
                path = e.path; //only in chrome for now... 18.12.2015

            if (!path) {
                path = [];
                var node = target;
                while (node) {
                    path.push(node);
                    node = node.parentNode;
                }
            }
            // e.path = path;

            for (var i = 0, l = path.length; i < l; i++) {
                if (path[i] === parent) break; //don't check all dom
                if (path[i] !== document && j.match(path[i], selector)) {
                    fn.call(path[i], e);
                    break; //if we find needed el, don't need to check all other dom elements
                }
            }
        };
        cb.fn = fn;

        this.addEventListener(type, cb, false);

        this._events[type].push(cb);
    });
};
j.fn.undelegate = function (selector, type, fn) {
    if (!fn) {
        fn = type;
        type = selector;
    }

    return this.each(function (i) {
        var events = this._events,
            types = this._events[type];
        if (!events || !types) return;

        for (var i = 0, l = types.length; i < l; i++) {
            if (fn === types[i].fn) {
                this.removeEventListener(type, types[i]);
                delete types[i].fn;
                types.splice(i, 1);
                break;
            }
        }
        if (!types.length) delete events[type];

        //check if we have any empty event containers
        var emptyEvents = true;
        for (var prop in events) {
            if (events.hasOwnProperty(prop)) {
                emptyEvents = false;
                break;
            }
        }
        if (emptyEvents) delete this._events;
    });
};
j.fn.trigger = j.fn.triggerHandler = function (type, data) {
    return this.each(function (i) {
        var event = new CustomEvent(type, { 'detail': data || null });
        this.dispatchEvent(event);
    });
};
//only in get mode
j.fn.data = function (type, fn) {
    return this[0].dataset;
};
j.parseJSON = function (json) {
    return JSON.parse(json);
};
j.fn.css = function (prop, value) {
    var that = this;
    if (!prop) return;

    if (prop == 'float') prop = 'styleFloat';

    function prefixed(prop) {
        //select proper prefix
        var vendorProp,
            supportedProp,
            prefix,
            prefixes = ["Webkit", "Moz", "O", "ms"],
            capProp = prop.charAt(0).toUpperCase() + prop.slice(1),
            // Capitalize first character of the prop to test vendor prefix
        div = that[0];

        if (prop in div.style) {
            supportedProp = prop; // Browser supports standard CSS property name
        } else {
            for (var i = 0; i < prefixes.length; i++) {
                // Otherwise test support for vendor-prefixed property names
                vendorProp = prefixes[i] + capProp;

                if (vendorProp in div.style) {
                    prefix = prefixes[i];
                    supportedProp = vendorProp;
                    break;
                } else {
                    vendorProp = undefined;
                }
            }
        }

        return supportedProp;
    }

    if ((typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) === 'object') {
        return this.each(function () {
            for (var key in prop) {
                this.style[prefixed(key)] = prop[key];
            }
        });
    } else {
        if (value) {
            return this.each(function () {
                this.style[prefixed(prop)] = value;
            });
        } else {
            return getComputedStyle(this[0], null)[prefixed(prop)] || undefined;
        }
    }
};
j.fn.hasClass = function (classname) {
    return this[0].classList.contains(classname);
};
j.fn.addClass = function (classes) {
    var arr = classes.split(' ');

    return this.each(function () {
        for (var i = 0, l = arr.length; i < l; i++) {
            this.classList.add(arr[i]);
        }
    });
};
j.fn.removeClass = function (classes) {
    var arr = classes.split(' ');

    return this.each(function (i) {
        for (var i = 0, l = arr.length; i < l; i++) {
            this.classList.remove(arr[i]);
        }
    });
};
// for closest we need j.inArray
j.fn.closest = function (selector) {
    var closestArr = [],
        parent;

    for (var i = 0, l = this.length; i < l; i++) {
        if (j.match(this[i], selector)) {
            closestArr.push(this[i]);
        } else {
            parent = this[i].parentNode;
            if (parent === document) parent = document.documentElement;

            while (parent && parent.tagName !== 'HTML') {
                if (j.match(parent, selector) && j.inArray(parent, closestArr) === -1) closestArr.push(parent);
                parent = parent.parentNode;
            }
        }
    }

    return j(closestArr);
};

exports.default = j;
module.exports = exports['default'];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getDefaultInfo = getDefaultInfo;
function getDefaultInfo() {
	var options = {};

	//calculate scrollbar width
	var scrollDiv = document.createElement("div");
	scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -99px;';
	document.body.appendChild(scrollDiv);
	options.scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth || 0;
	document.body.removeChild(scrollDiv);
	//end calculate scrollbar width

	//detect features

	//ie8 and below
	options.oldIE = !!(document.all && !document.addEventListener);

	//touch interface
	options.touch = 'ontouchstart' in window;

	//detect css3 support
	var h = options;

	h.nativeDialogSupport = !!document.createElement('dialog').showModal;
	h.transition = styleSupport('transition');
	h.transitionDuration = styleSupport('transitionDuration');
	h.transform = styleSupport('transform');
	h.animation = styleSupport('animation');

	function styleSupport(prop) {
		var vendorProp,
		    supportedProp,
		    prefix,
		    prefixes = ["Webkit", "Moz", "O", "ms"],
		    capProp = prop.charAt(0).toUpperCase() + prop.slice(1),
		    // Capitalize first character of the prop to test vendor prefix
		div = document.createElement("div");

		document.body.insertBefore(div, null);

		if (prop in div.style) {
			supportedProp = prop; // Browser supports standard CSS property name
			prefix = null;
		} else {
			for (var i = 0; i < prefixes.length; i++) {
				// Otherwise test support for vendor-prefixed property names
				vendorProp = prefixes[i] + capProp;

				if (vendorProp in div.style) {
					prefix = prefixes[i];
					break;
				} else {
					vendorProp = undefined;
				}
			}
		}

		var support = {
			js: supportedProp || vendorProp,
			css: writePrefixes(prop, prefix)
		};

		if (prop === 'transform') {
			//detect transform3d
			if (div.style[support.js] !== undefined) {
				div.style[support.js] = "translate3d(1px,1px,1px)";
				var has3d = window.getComputedStyle(div)[support.js];
			}
			support['3d'] = has3d !== undefined && has3d.length > 0 && has3d !== "none";
		}

		document.body.removeChild(div);
		return support;
	}

	function writePrefixes(prop, prefix) {
		//make prop camelCase
		prop = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

		if (prefix === null) {
			return prop;
		}

		var ourPrefix = void 0;
		switch (prefix) {
			case 'Webkit':
				ourPrefix = '-webkit-' + prop;
				break;
			case 'Moz':
				ourPrefix = '-moz-' + prop;
				break;
			case 'ms':
				ourPrefix = '-ms-' + prop;
				break;
			case 'O':
				ourPrefix = '-o-' + prop;
				break;
		}
		return ourPrefix;
	}
	//end of CSS3 support

	return options;
}

var defaults = exports.defaults = {
	elem: '', //(selector || dom\jQuery element) dom element for triggering modal (it should be single elements, if plugin will found here few elements, instance of gallery will be created)
	container: 'body', //(selector) appends modal to specific element
	position: 'fixed', //(fixed || absolute), how popup will be positioned. For most cases fixed is good, but when we insert popup inside element, not document, absolute position sets automatically
	click: true, //(boolean) should we set click handler on element(o.elem)?
	clickels: '', //(selector || dom\jQuery element) additional elements that can trigger same modal window (very often on landing pages you need few links to open one modal window)

	backdrop: true, //(boolean) should we show backdrop? true - show backdrop for every popup
	backdropassist: true, //(boolean) if true, animation durations of modal will automatically sets to backdrop to be in sync
	scrollbar: 'hide', //(show || hide) should we hide scrollbar from page?
	out: true, //(boolean) click outside modal will close it, false also adds fancy animation when somebody tries to close modal with outside click
	esc: true, //(boolean) close modal when esc button pressed?
	close: 'outside', //(inside || outside || boolean false) add close button inside or outside popup or don't add at all
	autoheight: 'image', //(boolean || image) should we set maximum height of modal? if image is selected, only images will be autoheighted

	autofocus: '', //(boolean false, selector) set focus to element, after modal is shown, if false, no autofocus elements inside, otherwise focus selected element

	//gallery
	img: 'ready', //(load || ready) we should wait until img will fully loaded or show as soon as size will be known (ready is useful for progressive images)
	imgload: 'show', //(init || show) should we load gallery images on init(before dialog open) or on open 


	// selector:          '',//(selector) child items selector, for gallery elements. Can be used o.selector OR o.delegate
	// delegate:          '',//(selector) child items selector, for gallery elements. Can be used o.selector OR o.delegate. If delegate used instead of selector, gallery items will be gathered dynamically before show

	// arrows:            'outside',//(inside || outside || boolean false) add navigation arrows inside or outside popup or don't add at all

	// title:             false,//(string || boolean false) title for first slide if we call it via js
	// title_attr:        'title',//(string || boolean false) attribute from which we gather title for slide (used in galleries)

	// start:             false,//(number) slide number, from which we should start
	// loop:              true,//(boolean), show first image when call next on last slide and vice versa. Requires three or more images. If there are less than 4 slides, option will be set to false automatically.
	// imgclick:          true,//(boolean) should we change slide if user clicks on image?
	// preload:           '3 3',//(boolean false || string) space separated string with 2 numbers, how much images we should preload before  and after active slide


	content: undefined, //(string) content for modal
	_missedContent: 'njBox plugin: meow, put some content here...', //this string uses, when slide have no content
	type: '', //(html || selector || text || template) type of content, if selector used, whole element will be inserted in modal. Template simila to html, but template inserted without .njb__body tag, directly to .njb
	header: undefined, //(html) html that will be added as modal header (for first slide)
	footer: undefined, //(html) html that will be added as modal footer (for first slide)

	// we need quotes here because of ie8..
	'class': false, //(string) classnames(separated with space) that will be added to modal wrapper, you can use it for styling
	zindex: false, //(boolean false || number) zindex that will be set on modal, probably not a good idea to use this option, set it in css and use o.class instead

	anim: 'scale', //(false || string) name of animation, or string with space separated 2 names of show/hide animation
	animclass: 'animated', //(string) additional class that will be added to modal window during animation (can be used for animate.css or other css animation libraries)
	duration: 'auto', //(string || number || auto) duration of animations, or string with space separated 2 durations of show/hide animation. You can set 'auto 100' if you want to set only duration for hide. It should be used when problems with auto detection (but I have not seen this problem ^^)

	templates: {
		wrap: '<div class="njb-wrap"><div class="njb-items"></div></div>',
		backdrop: '<div class="njb-backdrop"></div>',
		modalOuter: '<div class="njb-outer" data-njb-outer></div>',
		modal: '<aside class="njb" tabindex="-1"></aside>',
		body: '<div class="njb__body" data-njb-body></div>',
		header: '<header class="njb__header" data-njb-header></header>',
		footer: '<footer class="njb__footer" data-njb-footer></footer>',
		close: '<button type="button" class="njb-close-system" data-njb-close>×</button>',
		focusCatcher: '<a href="#!" class="njb-focus-catch">This link is just focus catcher of modal window, link do nothing.</a>',

		//todo, in gallery
		preloader: '<div class="njb-preloader"><div class="njb-preloader__inner"><div class="njb-preloader__bar1"></div><div class="njb-preloader__bar2"></div><div class="njb-preloader__bar3"></div></div></div>'
		// ui:          '<div class="njb-ui"><div class="njb-ui-title-outer"><div class="njb-ui-title-inner" data-njb-title></div></div></div>',
		// count:       '<div class="njb-ui-count"><span data-njb-current></span> / <span data-njb-total></span></div>',
		// prev:        '<button type="button" class="njb-arrow njb-prev" data-njb-prev></button>',
		// next:        '<button type="button" class="njb-arrow njb-next" data-njb-next></button>'
	},

	text: {
		_missedContent: 'njBox plugin: meow, put some content here...', //text for case, when slide have no content
		// preloader:    'Loading...',//title on preloader element

		imageError: '<a href="%url%">This image</a> can not be loaded.',
		// ajaxError:    'Smth goes wrong, ajax failed or ajax timeout (:',

		// current:      'Current slide',
		// total:        'Total slides',
		close: 'Close (Esc)', //title on close button
		// prev:         'Previous (Left arrow key)',//prev slide button title
		// next:         'Next (Right arrow key)'//next slide button title

		ok: 'Ok', //text on 'ok' button when dialog modal(alert, prompt, confirm) or in any other custom type
		cancel: 'Cancel', //text on 'cancel' button when dialog modal(alert, prompt, confirm) or in any other custom type
		placeholder: '' //placeholder for prompt input

	},

	_focusable: 'a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]', //(selector) this elements we will try to focus in popup shown after custom o.focus
	jquery: undefined, //link to jquery (for modules)
	autobind: '[data-toggle~="box"], [data-toggle~="modal"]' //(selector) selector that will be used for autobind (can be used only with changing global default properties) Set it after njBox.js is inserted njBox.defaults.autobind = '.myAutoBindSelector'
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ })
/******/ ]);
});