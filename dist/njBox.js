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
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
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
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

__webpack_require__(1);

var _njBox_base2 = __webpack_require__(2);

var _njBox_base3 = _interopRequireDefault(_njBox_base2);

var _utils = __webpack_require__(3);

var _j = __webpack_require__(4);

var _j2 = _interopRequireDefault(_j);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*!
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * njBox - v3.0.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * nejikrofl@gmail.com
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) 2017 N.J.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * MIT license
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */


var njBox = function (window, undefined, setTimeout, document) {

  //use jquery if avaliable
  var $ = window.jQuery || window.$ || _j2.default;

  var njBox = function (_njBox_base) {
    _inherits(njBox, _njBox_base);

    function njBox(el, options) {
      _classCallCheck(this, njBox);

      if (!arguments.length) {
        console.error('njBox, arguments not passed.');
        return _possibleConstructorReturn(_this);
      }
      var opts;

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

      var _this = _possibleConstructorReturn(this, (njBox.__proto__ || Object.getPrototypeOf(njBox)).call(this, opts));

      _this._i();
      return _this;
    }

    _createClass(njBox, [{
      key: '_i',
      value: function _i() {
        this.on('init', function () {
          this._defaults = njBox.defaults;
          this._templates = njBox.templates;
          this._text = njBox.text;
          //get environment info, getDefaultInfo trying to launch as early as possible (even before this init method), but may fail because of missing body tag (if script included in head), so we check it init again
          if (!njBox.g) njBox.g = (0, _utils.getDefaultInfo)();

          this._handlers = {}; //all callback functions we used in event listeners lives here
        });
        this.on('options_set', function () {
          var that = this,
              o = that.o;
          //set default settings
          this._g.insertWrap = true; //should we insert all dom stuff with ui? No if popover)

          var o = this.o = $.extend({}, this._defaults, o);

          if (o.jquery) $ = o.jquery;
          this.$ = $;

          if (o.elem) {
            var $elem = selectElement(o.elem),
                optionsGathered = this._g.optionsGathered = this._gatherData($elem);
            this._g.els = $elem;
            this._cb('options_gathered', optionsGathered, $elem[0]);

            $.extend(this.o, optionsGathered);
          }

          // initializing addons
          for (var key in njBox.addons) {
            if (njBox.addons.hasOwnProperty(key)) {
              this['_' + key + '_init']();
            }
          }

          this._g.animation = this._calculateAnimations();

          function selectElement(elem) {
            var $elem = $(elem);

            if (!$elem.length) {
              that._e('njBox, wrong selector or element in o.elem (' + elem + ')');
              return $elem;
            }
            if ($elem.length > 1) {
              that._e('njBox found more than one item for current o.elem (' + elem + '). First was used.');
              $elem = $($elem[0]);
            }
            if ($elem[0].njBox) {
              that._e('njBox, already inited on this element (' + elem + ')');
              return $elem;
            }
            $elem[0].njBox = that; //prevent multiple initialization on one element

            return $elem;
          }
        });
        this.on('dom_create', function () {
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
        });
        this.on('item_normalized', function (item, itemRaw) {
          if (!item.type) item.type = this._type(item.content);

          item.el = itemRaw.el || undefined;
        });
        this.on('item_create', function (item, index) {
          item.content = item.content || this._text._missedContent;
          item.dom = this._createItemDom(item);
          item.toInsert = item.dom.modalOuter;

          this._insertItemContent({ item: item, delayed: this.o.delayed });
        });
        this.on('inited', function () {
          //add initial click handlers
          this._addClickHandler();
          //todo
          // if (o.buttonrole && this._g.els) this._g.els.attr('role', o.buttonrole);
        });
        this.on('show_prepare', function () {
          var e = this.state.clickedEvent;
          if (e) {
            if (e.preventDefault) {
              e.preventDefault();
            } else {
              e.returnValue = false;
            }
          }

          var wrap = this.dom.wrap;

          if (!this.state.focused) this.state.focused = document.activeElement; //for case when modal can be opened programmatically, with this we can focus element after hiding

          delete this.returnValue;

          if (this.o.scrollbar === 'hide') this._scrollbar('hide');

          if (this.o.backdrop) this._backdrop('show');

          //set event handlers
          this._addListeners();

          this._uiUpdate();

          this._cb('dom_insert');
          //insert modal into dom
          if (this._g.insertWrap) {
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

          this.position(); //set all positions
          this._cb('dom_inserted');
        });
        this.on('animation_show', function () {
          var that = this,
              o = that.o,
              modal = that._getActive().dom.modal,
              animShow = this._g.animation.show,
              animShowDur = this._g.animation.showDur;

          this.dom.wrap[0].clientHeight; //fore reflow before applying class
          this.dom.wrap.addClass('njb-wrap--visible');

          if (o.animclass) modal.addClass(o.animclass);
          modal.attr('open', '');

          if (animShow) {
            modal.addClass(animShow);

            that._g.shownCb = setTimeout(function () {
              //check if hiding not initialized while showing animation
              if (that.state.status === 'show') that._shownCb();
            }, animShowDur);
          } else {
            that._shownCb();
          }
        });
        this.on('shown', function () {
          var o = this.o,
              modal = this._getActive().dom.modal;

          if (o.animclass) modal.removeClass(o.animclass);
          if (this._g.animation.show) modal.removeClass(this._g.animation.show);
          modal[0].clientHeight; //reflow

          this._set_focus(this.items[this.state.active]);
        });
        this.on('hide_prepare', function () {
          if (this.state.focused) this.state.focused.focus();

          this._backdrop('hide');

          this._removeListeners();
        });
        this.on('animation_hide', function () {
          var that = this,
              o = that.o,
              modal = that._getActive().dom.modal,
              animShow = this._g.animation.show,
              animHide = this._g.animation.hide,
              animHideDur = this._g.animation.hideDur;

          modal[0].removeAttribute('open');
          this.dom.wrap.removeClass('njb-wrap--visible');

          // debugger;
          if (animHide) {
            if (o.animclass) modal.addClass(o.animclass);
            if (animHide === animShow) modal.addClass('njb-anim-reverse');
            modal.addClass(animHide);

            that._g.hiddenCb = setTimeout(function () {
              //check if showing not initialized while hiding animation
              if (that.state.status === 'hide') that._hiddenCb();
            }, animHideDur);
          } else {
            that._hiddenCb();
          }
        });
        this.on('clear', function () {
          var o = this.o,
              modal = this._getActive().dom.modal,
              animShow = this._g.animation.show,
              animHide = this._g.animation.hide;

          if (o.animclass) modal.removeClass(o.animclass);
          if (animHide === animShow) modal.removeClass('njb-anim-reverse');
          if (animHide) modal.removeClass(animHide);
          modal[0].clientHeight; //reflow

          this._scrollbar('show');

          if (this._g.insertWrap && this.dom.wrap && this.dom.wrap.length) this.dom.wrap[0].parentNode.removeChild(this.dom.wrap[0]);

          this._removeSelectorItemsElement();

          if (this.dom.items && this.dom.items.length) empty(this.dom.items[0]); //we can't use innerHTML="" here, for IE(even 11) we need remove method

          //clear inline position
          for (var i = 0, l = this.items.length; i < l; i++) {
            this.items[i].dom.modalOuter[0].style.cssText = '';
          }

          function empty(el) {
            while (el.firstChild) {
              el.removeChild(el.firstChild);
            }
          }
        });
        this.on('hide', function () {
          if (!this.state.okCb && !this.state.cancelCb) {
            this.returnValue = this._getReturnValue();
            this._cb('cancel', this.returnValue);
          }
        });
        this.on('hidden', function () {
          if (this.o.focusprevious) this._focusPreviousModal();
        });
        this.on('position', function () {
          var dimensions = this.state.dimensions = this._getDimensions();

          //position of global wrapper
          if (this.o.layout === 'absolute') {
            //global wrap positioning
            var scrollTop = dimensions.container.scrollTop,
                scrollLeft = dimensions.container.scrollLeft;

            if (scrollTop <= dimensions.container.scrollTopMax) {
              this.dom.wrap.css({ 'top': scrollTop + 'px', 'left': scrollLeft + 'px' });
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
        });
        this.on('destroy', function () {
          this._removeClickHandler();

          this.dom.container.removeClass('njb-relative');
        });
        this.on('destroyed', function () {
          this._defaults = this._handlers = this._templates = this._text = this.$ = {};
        });
      }
    }, {
      key: 'update',
      value: function update() {
        //recreate all slides from this._g.rawItems
        this.state.arguments.update = arguments;
        this.items = this._createItems(this._g.rawItems);

        this._addClickHandler();

        return this;
      }
    }, {
      key: '_gatherData',
      value: function _gatherData(el) {
        var o = this.o,
            $el = $(el),
            dataProcessed = { $elem: $el };

        if (!$el.length) {
          return dataProcessed;
        }
        var dataO = $.extend({}, $el.data()); //data original, copy options to separate object, because we want to modify some options during processing, if we do that on native domstringmap, deleting will also touch html


        if (dataO.njbOptions) {
          try {
            dataProcessed = $.parseJSON(dataO.njbOptions);
            delete dataO.njbOptions;
          } catch (e) {
            this._e('njBox, fail to parse options from njb-options');
            return;
          }
        }

        //try to get href from original attributes
        if ($el[0].tagName.toLowerCase() === 'a') {
          var href = $el.attr('href');
          if (href && href !== '#' && href !== '#!' && !/^(?:javascript)/i.test(href)) {
            //test href for real info, not placeholders
            dataProcessed.content = href;
          }
        }

        //get title
        if (o.titleattr) {
          var titleattr = $el.attr(o.titleattr);
          if (titleattr) dataProcessed.title = titleattr;
        }

        $.extend(dataProcessed, choosePrefixedData(dataO));

        function choosePrefixedData(data) {
          var prefixedData = {};

          for (var p in data) {
            //use only data properties with njb prefix
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
            dataProcessed[opt] = transformType(dataProcessed[opt]);
          }
        }

        function transformType(val) {
          //transform string from data attributes to boolean and number
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
    }, {
      key: '_createDom',
      value: function _createDom() {
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
          dom.container = dom.body; //in case if we have no container element, or wrong selector for container element
        }

        //create core elements
        dom.wrap = this._createEl('wrap');
        if (o['class']) dom.wrap.addClass(o['class']);
        dom.wrap[0].tabIndex = -1;
        dom.wrap[0].njBox = this;
        if (o.zindex) dom.wrap.css('zIndex', o.zindex);

        if (o.autoheight === true) {
          dom.wrap.addClass('njb-wrap--autoheight-true');
        } else if (o.autoheight === 'image') {
          dom.wrap.addClass('njb-wrap--autoheight-image');
        }

        dom.items = dom.wrap.find('.njb-items');

        //create ui layer
        dom.ui = this._createEl('ui');
        dom.wrap.append(dom.ui);

        dom.title = this._createEl('title');
        dom.ui.append(dom.title);

        // insert outside close button
        if (o.close === 'outside') {
          dom.close = this._createEl('close');
          dom.close.attr('title', this._text.close).attr('aria-label', this._text.close);

          dom.ui.append(dom.close);
        }

        // insert invisible, focusable nodes.
        // while this dialog is open, we use them to make sure that focus never
        // leaves modal boundaries
        dom.focusCatchBefore = this._createEl('focusCatcher');
        dom.wrap.prepend(dom.focusCatchBefore);

        dom.focusCatchAfter = this._createEl('focusCatcher');
        dom.wrap.append(dom.focusCatchAfter);

        return dom;
      }
    }, {
      key: '_createEl',
      value: function _createEl(templateName) {
        var template = this._templates[templateName],
            el = $(template);

        if (!el.length) console.warn('njBox, smth wrong with template - ' + templateName + '.');

        return el;
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

        return {
          show: animShow || '',
          hide: animHide || '',
          showDur: animShowDur || 0,
          hideDur: animHideDur || 0
        };
      }
    }, {
      key: '_getAnimTime',
      value: function _getAnimTime(el, property) {
        //get max animation or transition time
        function _getMaxTransitionDuration(el, property) {
          //function also can get animation duration
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

        return _getMaxTransitionDuration(el, 'animation') || _getMaxTransitionDuration(el, 'transition');
      }
    }, {
      key: '_createItemDom',
      value: function _createItemDom(item) {
        var o = this.o,
            dom = {},
            modalOuter,
            modal,
            modalFragment = document.createDocumentFragment();

        //main modal wrapper
        dom.modal = modal = this._createEl('modal');
        modal[0].tabIndex = '-1';
        modal[0].njBox = this;

        dom.modalOuter = modalOuter = this._createEl('modalOuter');

        if (o.role) modal.attr('role', o.role);
        if (o.label) modal.attr('aria-label', o.label);
        if (o.labelledby) modal.attr('aria-labelledby', o.labelledby);
        if (o.describedby) modal.attr('aria-describedby', o.describedby);

        modalOuter.append(modal);

        if (item.type !== "template") {
          //insert body
          dom.body = this._createEl('body');
          //find data-njb-body in item body element
          dom.bodyInput = (0, _utils.getItemFromDom)(dom.body, 'data-njb-body');

          // modalFragment.appendChild(dom.body[0])

          //insert header
          if (item.header) {
            dom.header = this._createEl('header');

            //create header dom el
            dom.headerInput = (0, _utils.getItemFromDom)(dom.header, 'data-njb-header');
            if (!dom.headerInput.length) {
              this._e('njBox, error in o.templates.header');
            }
          }

          //insert footer
          if (item.footer) {
            dom.footer = this._createEl('footer');

            //create footer dom el
            dom.footerInput = (0, _utils.getItemFromDom)(dom.footer, 'data-njb-footer');
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

          modal.append(modalFragment);
        }

        if (item.type === 'image') {
          modal.addClass('njb--image');
        } else if (item.type === 'selector') {
          modal.addClass('njb--selector');
        } else {
          modal.addClass('njb--content');
        }
        // modal.addClass('njb--'+item.type)

        this._repairItemDom(dom);
        return dom;
      }
    }, {
      key: '_repairItemDom',
      value: function _repairItemDom(dom) {
        dom.modal.append(dom.body);
        dom.modal.append(dom.close);
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
      key: '_insertItemContent',
      value: function _insertItemContent(props) {
        var that = this,
            o = that.o,
            item = props.item,
            delayed = props.delayed,
            dom = item.dom,
            itemType = item.type,
            itemContent = item.content,
            bodyItemToInsert = dom.bodyInput;


        function contentAddedCallback() {
          //insert header
          if (dom.headerInput) {
            dom.headerInput.html(item.header);
            dom.modal.prepend(dom.header);
          }
          //insert footer
          if (dom.footerInput) {
            dom.footerInput.html(item.footer);
            dom.modal.append(dom.footer);
          }
          item.state.status = 'loaded';

          that._cb('item_loaded', item);

          if (that.state.status !== 'inited' && that.items && that._getActive() === item) {
            that._cb('item_ready', item);

            if (o.delayed) {
              that.position(); //needs for delayed items autoheight
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
    }, {
      key: '_insertSelector',
      value: function _insertSelector(item, callback) {
        var contentEl = item.state.contentEl = $(item.content),
            bodyItemToInsert = item.dom.bodyInput;

        if (contentEl.length) {
          item.state.contentElStyle = contentEl[0].style.cssText;

          item.state.contentElDisplayNone = contentEl.css('display') === 'none';
          if (item.state.contentElDisplayNone) {
            contentEl[0].style.display = 'block';
          }

          bodyItemToInsert.html(''); //clear element before inserting other dom element. (e.g. body for case when first time we can't find contentEl on page and error text already here)
          bodyItemToInsert.append(contentEl);

          item.state.contentInserted = true;
        } else {
          //if we don't find element with this selector
          bodyItemToInsert.html(item.content);
        }
        callback();
      }
    }, {
      key: '_insertImage',
      value: function _insertImage(item, callback) {
        var that = this,
            o = this.o,
            img = document.createElement('img'),
            $img = $(img),
            ready,
            loaded;

        if (item.state.status === 'loading') return; //dont do anything, just wait until callbacks are called

        item.state.status = 'loading';
        item.dom.img = $img;

        item._handlerError = function () {
          $img.off('error', item._handlerError).off('abort', item._handlerError);
          delete item._handlerError;

          that._preloader('hide', item);

          item.dom.bodyInput.html(that._text.imageError.replace('%url%', item.content));
          item.dom.modal.removeClass('njb--' + item.type);

          that._cb('img_e', item); //img_ready, img_load callbacks

          item.state.status = 'error';
          item.state.contentInserted = true;
        };
        $img.on('error', item._handlerError).on('abort', item._handlerError);

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
            that._cb('item_img_ready', item); //img_ready callback

            if (o.img === 'ready') {
              insertImg();
            }
          });

          item._handlerLoad = function () {
            $img.off('load', item._handlerLoad);
            that._cb('item_img_load', item); //img_load callback

            if (o.img === 'load') {
              insertImg();
            }
          };
          $img.on('load', item._handlerLoad);
        }

        function insertImg() {
          that._cb('item_img_true', item); //img_ready, img_load callbacks

          that._preloader('hide', item);

          $img.attr('width', 'auto'); //for IE <= 10

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
              njbSetInterval = function njbSetInterval(delay) {
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
    }, {
      key: '_preloader',
      value: function _preloader(type, item) {
        var o = this.o;

        switch (type) {
          case 'show':
            item.state.preloader = true;
            item.dom.preloader = this._createEl('preloader').attr('title', this._text.preloader);

            item.dom.modal.addClass('njb--loading');
            item.dom.modal.html('');
            item.dom.modal.append(item.dom.preloader);
            break;

          case 'hide':
            if (!item.state.preloader) return;

            item.dom.preloader[0].parentElement.removeChild(item.dom.preloader[0]);
            item.dom.modal.removeClass('njb--loading');
            delete item.dom.preloader;
            delete item.state.preloader;
            this._repairItemDom(item.dom); //we should repair dom, becase in inserting we remove all content from modal

            break;
        }
      }
    }, {
      key: '_addClickHandler',
      value: function _addClickHandler() {
        //initial click handlers
        var o = this.o,
            handlers = this._handlers;

        this._removeClickHandler();

        if (o.click) {
          handlers.elsClick = this._clickHandler();

          if (this._g.els && this._g.els.length) {
            this._g.els.on('click', handlers.elsClick);
          }

          if (o.clickels) {
            $(o.clickels).on('click', handlers.elsClick);
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

          if ($(el).closest('.njb-close-system, .njb-arrow').length) return;

          that.state.clickedEvent = e;
          that.state.clickedEl = el;
          that.state.focused = el;
          that.show();
        };
      }
    }, {
      key: '_removeClickHandler',
      value: function _removeClickHandler() {
        var o = this.o;

        if (this._g.els && this._g.els.length) {
          this._g.els.off('click', this._handlers.elsClick);

          if (o.clickels) $(o.clickels).off('click', this._handlers.elsClick);
        }
      }
    }, {
      key: '_addListeners',
      value: function _addListeners() {
        //all other event handlers
        var o = this.o,
            that = this,
            h = this._handlers;

        h.container_resize = function (e) {
          that.position();
        };
        h.container_scroll = function (e) {
          that.position();
        };
        h.container_out = function (e) {
          //1. dont immidiate hide on clicking calling element
          //2. dont react until full show to disable misclicks
          if (that.state.clickedEl && that.state.clickedEl === e.target || that.state.status !== 'shown') return;

          var $el = $(e.target),
              prevent = $el.closest('.njb, .njb-ui').length;
          if (prevent) return;

          e.preventDefault ? e.preventDefault() : e.returnValue = false;

          if (o.out) {
            that.hide();
          } else {
            that._getActive().dom.modal.addClass('njb--pulse');
            that._set_focus(that.items[that.state.active]);

            setTimeout(function () {
              that._getActive().dom.modal.removeClass('njb--pulse');
            }, that._getAnimTime(that._getActive().dom.modal));
          }
        };

        that.dom.container.on('resize', h.container_resize).on('scroll', h.container_scroll);

        that.dom.document.on('click', h.container_out);

        h.wrap_resize = function () {
          that.position();
        };
        h.wrap_scroll = function () {
          that.position();
        };
        h.wrap_keydown = function (e) {
          that._cb('keydown', e);

          switch (e.which) {
            case 27:
              //esc
              if (o.esc) {
                that.hide();
              }

              e.preventDefault ? e.preventDefault() : e.returnValue = false;
              break;

          }
        };
        h.wrap_close = function (e) {
          e.preventDefault ? e.preventDefault() : e.returnValue = false;

          that.hide();
        };
        h.wrap_ok = function (e) {
          e.preventDefault ? e.preventDefault() : e.returnValue = false;

          that.returnValue = that._getReturnValue();

          if (that._cb('ok', that.returnValue) === false) {
            return;
          } else {
            that.state.okCb = true;
          }

          that.hide();
        };
        h.wrap_cancel = function (e) {
          e.preventDefault ? e.preventDefault() : e.returnValue = false;

          that.returnValue = that._getReturnValue();

          that._cb('cancel', that.returnValue);
          that.state.cancelCb = true;

          that.hide();
        };

        that.dom.wrap.on('resize', h.wrap_resize).on('scroll', h.wrap_scroll).on('keydown', h.wrap_keydown).delegate('[data-njb-close]', 'click', h.wrap_close).delegate('[data-njb-ok]', 'click', h.wrap_ok).delegate('[data-njb-cancel]', 'click', h.wrap_cancel);

        h.window_resize = function () {
          that.position();
        };
        h.window_scroll = function () {
          that.position();
        };
        h.window_orientation = function () {
          that.position();
        };

        that.dom.window.on('resize', h.window_resize).on('scroll', h.window_scroll).on('orientationchange', h.window_orientation);

        h.focusCatchBefore = function (e) {
          var related = e.relatedTarget,
              fromUi;

          if (related) {
            //firefox have no related
            fromUi = !!$(related).closest('.njb-ui').length;
            if (fromUi) {
              that._set_focus(that.items[that.state.active]);
            } else {
              that._set_focus(that.items[that.state.active], true);
            }
          } else {
            that._set_focus(that.items[that.state.active], true);
          }
        };
        h.focusCatchAfter = function (e) {
          that._set_focus(that.items[that.state.active]);
        };

        this.dom.focusCatchBefore.on('focus', h.focusCatchBefore);
        this.dom.focusCatchAfter.on('focus', h.focusCatchAfter);

        this._cb('listeners_added');
      }
    }, {
      key: '_getReturnValue',
      value: function _getReturnValue() {
        var modal = this._getActive().dom.modal,
            prompt_input = modal.find('[data-njb-return]'),
            prompt_value = void 0;
        if (prompt_input.length) prompt_value = prompt_input[0].value || "";

        return prompt_value;
      }
    }, {
      key: '_removeListeners',
      value: function _removeListeners() {
        //we should delete manually each handler, because in handlers object can be other handlers from addons
        var h = this._handlers,
            that = this;

        that.dom.document.off('click', h.container_out);
        delete h.container_out;

        that.dom.container.off('resize', h.container_resize).off('scroll', h.container_scroll);
        delete h.container_resize;
        delete h.container_scroll;

        that.dom.wrap.off('resize', h.wrap_resize).off('scroll', h.wrap_scroll).off('keydown', h.wrap_keydown).undelegate('[data-njb-close]', 'click', h.wrap_close).undelegate('[data-njb-ok]', 'click', h.wrap_ok).undelegate('[data-njb-cancel]', 'click', h.wrap_cancel);
        delete h.wrap_resize;
        delete h.wrap_scroll;
        delete h.wrap_keydown;
        delete h.wrap_close;
        delete h.wrap_ok;
        delete h.wrap_cancel;

        that.dom.window.off('resize', h.window_resize).off('scroll', h.window_scroll).off('orientationchange', h.window_orientation);
        delete h.window_resize;
        delete h.window_scroll;
        delete h.window_orientation;

        that.dom.focusCatchBefore.off('focus', h.focusCatchBefore);
        that.dom.focusCatchAfter.off('focus', h.focusCatchAfter);
        delete h.focusCatchBefore;
        delete h.focusCatchAfter;

        this._cb('listeners_removed');
      }
    }, {
      key: '_scrollbar',
      value: function _scrollbar(type) {
        var o = this.o;
        switch (type) {
          case 'hide':
            if (this.state.scrollbarHidden) return;

            if (this._g.containerIsBody) {
              //we can insert modal window in any custom element, that's why we need this if
              var sb = (document.documentElement.scrollHeight || document.body.scrollHeight) > document.documentElement.clientHeight; //check for scrollbar existance (we can have no scrollbar on simple short pages)

              //don't add padding to html tag if no scrollbar (simple short page) or popup already opened
              if (!this.dom.container[0].njb_scrollbar && !this.state.scrollbarHidden && (sb || this.dom.html.css('overflowY') === 'scroll' || this.dom.body.css('overflowY') === 'scroll')) {
                //existing of that variable means that other instance of popup hides scrollbar on this element already
                this.dom.html.addClass('njb-hideScrollbar');
                this.dom.html.css('paddingRight', parseInt(this.dom.html.css('paddingRight')) + njBox.g.scrollbarSize + 'px');
              }
            } else {
              var sb = this.dom.container[0].scrollHeight > this.dom.container[0].clientHeight; //check for scrollbar existance on this element

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
            this.dom.container[0].njb_scrollbar ? this.dom.container[0].njb_scrollbar++ : this.dom.container[0].njb_scrollbar = 1;
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

              if (computedPadding) {
                //if greater than 0
                this.dom.html.css('paddingRight', computedPadding + 'px');
              } else {
                //if padding is 0, remove it from style attribute
                this.dom.html[0].style.paddingRight = '';
              }
            } else {

              this.dom.container.removeClass('njb-hideScrollbar');
              var computedPadding = parseInt(this.dom.container.css('paddingRight')) - njBox.g.scrollbarSize;

              if (computedPadding) {
                //if greater than 0
                this.dom.container.css('paddingRight', computedPadding + 'px');
              } else {
                //if padding is 0, remove it from style attribute
                this.dom.container[0].style.paddingRight = '';
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
            this.dom.backdrop = this._createEl('backdrop');

            if (this.state.backdropVisible) return;

            if (o.backdropassist) this.dom.backdrop.css('transitionDuration', this._g.animation.showDur + 'ms');

            if (o.layout === 'absolute') this.dom.backdrop.addClass('njb-absolute');
            this.dom.container.append(this.dom.backdrop);

            setTimeout(function () {
              //this prevent page from scrolling in chrome while background transition is working..., also needed as reflow
              that.dom.backdrop.addClass('njb-backdrop--visible');
            }, 0);

            this.state.backdropVisible = true;

            break;

          case 'hide':
            if (!this.state.backdropVisible) return;
            if (o.backdropassist) this.dom.backdrop.css('transitionDuration', this._g.animation.hideDur + 'ms');

            this.dom.backdrop.removeClass('njb-backdrop--visible');

            setTimeout(function () {
              that.dom.backdrop[0].parentNode.removeChild(that.dom.backdrop[0]);
              if (o.backdropassist) that.dom.backdrop[0].style.cssText = '';
              delete that.state.backdropVisible;
            }, that._getAnimTime(that.dom.backdrop[0]));
            break;
        }
      }
    }, {
      key: '_uiUpdate',
      value: function _uiUpdate() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.state.active;

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
        dom.wrap.find('[data-njb-title]').html(item.title || '');

        if (item.type === 'image') {
          dom.wrap.removeClass('njb-wrap--content').addClass('njb-wrap--image');
        } else {
          dom.wrap.removeClass('njb-wrap--image').addClass('njb-wrap--content');
        }
      }
    }, {
      key: '_drawItem',
      value: function _drawItem(props) {
        var o = this.o,
            item = props.item,
            container = props.container,
            prepend = props.prepend,
            itemToInsert = item.toInsert;


        if (!item.state.contentInserted && o.delayed && (item.type === 'image' || item.type === 'selector')) {
          this._insertItemContent({ item: item, delayed: false });
        }

        if (prepend) {
          container.prepend(itemToInsert);
        } else {
          container.append(itemToInsert);
        }

        this._cb('item_inserted', item);
        if (item.state.status === 'loaded') this._cb('item_ready', item);
      }
    }, {
      key: '_set_focus',
      value: function _set_focus(item, last) {
        var o = this.o,
            focusable,
            focusEl;

        if (!o.autofocus) {
          this.dom.wrap[0].focus();
          return;
        }

        if (last) {
          focusable = this.dom.ui.find(this.o._focusable);
          focusable[focusable.length - 1].focus();
          return;
        }
        if (o.autofocus) {
          focusEl = item.dom.modal.find(o.autofocus)[0];
        }
        if (!focusEl) {
          focusEl = item.dom.modal.find('[autofocus]')[0];
        }
        if (!focusEl) {
          focusable = item.dom.modal.find(this.o._focusable);
          focusEl = focusable[0];
        }

        if (focusEl) {
          focusEl.focus();
        }
        //  else if (o.close === "outside") {//then try to focus close buttons
        //   this.dom.close[0].focus()
        // } else if (o.close === "inside" && item.dom.close) {//if type:"template" is used we have no close button here
        //   item.dom.close[0].focus();
        // }
        else {
            //if no, focus popup itself
            item.dom.modal[0].focus();
          }
      }
    }, {
      key: '_removeSelectorItemsElement',
      value: function _removeSelectorItemsElement() {
        var items = this.items,
            item,
            contentEl;

        for (var i = 0, l = items.length; i < l; i++) {
          if (items[i].type === 'selector' && this.o.delayed) {
            item = items[i];
            if (!item.state.contentInserted) continue;

            contentEl = item.state.contentEl;

            if (item.state.contentElDisplayNone) {
              contentEl[0].style.display = 'none';
              item.state.contentElDisplayNone = undefined;
            }
            if (item.state.contentElStyle) {
              contentEl[0].style.cssText = item.state.contentElStyle;
              item.state.contentElStyle = undefined;
            }
            //return selector element to the dom
            this.dom.body.append(contentEl);
            item.state.contentInserted = false;
          }
        }
      }
    }, {
      key: '_getDimensions',
      value: function _getDimensions() {
        var o = this.o,
            dimensions = {};

        dimensions.window = this._getDomSize(this.dom.window);
        dimensions.container = this._getDomSize(this._g.containerIsBody ? this.dom.window : this.dom.container);

        if (this.state.clickedEl) dimensions.clickedEl = this._getDomSize(this.state.clickedEl);

        if (o.$elem && o.$elem.length === 1) dimensions.el = this._getDomSize(o.$elem);

        return dimensions;
      }
    }, {
      key: '_getDomSize',
      value: function _getDomSize(domObject) {
        domObject = $(domObject)[0];
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
            scrollWidth: Math.max(documentBody.scrollWidth, documentElement.scrollWidth, documentBody.offsetWidth, documentElement.offsetWidth, documentBody.clientWidth, documentElement.clientWidth),
            scrollHeight: Math.max(documentBody.scrollHeight, documentElement.scrollHeight, documentBody.offsetHeight, documentElement.offsetHeight, documentBody.clientHeight, documentElement.clientHeight),
            scrollLeft: window.pageXOffset || documentElement.scrollLeft || documentBody.scrollLeft || 0,
            scrollTop: window.pageYOffset || documentElement.scrollTop || documentBody.scrollTop || 0
          };
        } else {
          rectOriginal = domObject.getBoundingClientRect();
          // rectComputed = $.extend({}, rectOriginal)//Object.assign dont work with getBoundingClientRect object...
          rectComputed = {
            el: domObject,
            left: rectOriginal.left,
            top: rectOriginal.top,
            right: rectOriginal.right,
            bottom: rectOriginal.bottom
          };

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
    }, {
      key: '_setMaxHeight',
      value: function _setMaxHeight(item) {
        var o = this.o,
            dimensions = this.state.dimensions,
            height = void 0,
            bodyBorderBox = void 0;

        if (!o.autoheight || o.autoheight === 'image' && item.type !== 'image') return;

        var v = item.dom,
            modalMargin = summ(v.modal, 'margin'),
            modalPadding = summ(v.modal, 'padding') + parseInt(v.modal.css('borderTopWidth')) + parseInt(v.modal.css('borderBottomWidth')) || 0,
            bodyMargin = summ(v.body, 'margin'),
            bodyPadding = summ(v.body, 'padding') + parseInt(v.body.css('borderTopWidth')) + parseInt(v.body.css('borderBottomWidth')) || 0,
            containerHeight = this._g.containerIsBody ? dimensions.window.height : dimensions.container.height;

        height = containerHeight, bodyBorderBox = v.body.css('boxSizing') === 'border-box';

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
    }, {
      key: '_getPassedOption',
      value: function _getPassedOption(optionName) {
        //this method needs to check if option was passed specifically by user or get from defaults
        if (this._g.optionsGathered && this._g.optionsGathered[optionName] !== undefined) {
          return this._g.optionsGathered[optionName];
        } else if (this._g.optionsPassed[optionName] && this._g.optionsPassed[optionName] !== undefined) {
          return this._g.optionsPassed[optionName];
        }
      }
    }, {
      key: '_focusPreviousModal',
      value: function _focusPreviousModal() {
        //because of possibility to open multiple dialogs, we need to proper focus handling when dialogs are closed
        var openedBox = this.dom.body.find('.njb-wrap'),
            openedInstance;

        if (!openedBox.length) return;
        openedInstance = openedBox[openedBox.length - 1].njBox;
        openedInstance._set_focus(openedInstance.items[openedInstance.state.active]);
      }
    }]);

    return njBox;
  }(_njBox_base3.default);

  njBox.defaults = _utils.defaults;
  njBox.templates = _utils.templates;
  njBox.text = _utils.text;

  //get environment info, getDefaultInfo trying to launch as early as possible (even before this init method), but may fail because of missing body tag (if script included in head), so we check it init again
  if (document.body && !njBox.g) njBox.g = (0, _utils.getDefaultInfo)();

  njBox.addons = {};
  njBox.addAddon = function (name, addonObj) {
    var options = addonObj.options,
        templates = addonObj.templates,
        text = addonObj.text,
        prototype = addonObj.prototype;


    this.addons[name] = addonObj;

    if (options) $.extend(this.defaults, options);
    if (templates) $.extend(this.templates, templates);
    if (text) $.extend(this.text, text);
    if (prototype) $.extend(this.prototype, prototype);
  };

  //get instance
  njBox.get = function (elem) {
    var el = $(elem)[0];

    return el && el.njBox || undefined;
  };
  njBox.autobind = function (selector) {
    //autobind global
    $(selector).each(function () {
      new njBox({
        elem: $(this)
      });
    });
  };
  if (typeof window !== 'undefined') {
    //autobind only in browser and on document ready
    $(function () {
      njBox.autobind(njBox.defaults.autobind);
    });
  }

  return njBox;
}(window, undefined, setTimeout, document);

exports.default = njBox;
module.exports = exports['default'];

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*!
 * njBox - v3.0.0
 * nejikrofl@gmail.com
 * Copyright (c) 2017 N.J.
 * MIT license
*/

//abstract main class, without anything related to dom, just state management
var njBox = function () {
  function njBox(options) {
    _classCallCheck(this, njBox);

    if (!arguments.length) {
      console.error('njBox, arguments not passed.');
      return;
    }
    var opts = void 0,
        that = this;

    opts = options || {};
    that.co = opts; //constructorOptions

    //this allows users to listen init callbacks via .on() on modal instance
    setTimeout(function () {
      that._init();
    }, 0);
  }

  _createClass(njBox, [{
    key: '_init',
    value: function _init() {
      if (this.state && this.state.inited) return; //init only once

      this._cb('init');

      var opts = this.co; //constructorOptions
      delete this.co;

      //inner options, current state of app, this.state clears after every hide
      this.state = {
        active: 0,
        arguments: {} //here all arguments from public methods are saved (for using in callbacks/events)
      };

      //inner options, this settings alive throughout the life cycle of the plugin(until destroy)
      this._g = {
        optionsPassed: opts
      };

      this.o = opts;

      this._cb('options_set');
      this._cb('options_setted', this.o);

      //we should have content for creating item
      if (!this.o.elem && !this.o.content) {
        this._e('njBox, no elements (o.elem) or content (o.content) for modal.');
        return;
      }

      this.dom = {};
      this._cb('dom_create');
      this._cb('dom_created', this.dom);

      this._g.rawItems = [this.o];
      this._cb('items_gather');
      this._cb('items_gathered', this._g.rawItems);

      this.items = this._createItems(this._g.rawItems);
      this._cb('items_created', this.items);
      if (!this.items.length) {
        this._e('njBox, smth goes wrong, plugin don\'t create any item to show', true);
        return;
      }

      this.state.inited = true;
      this._cb('inited');

      return this;
    }
  }, {
    key: 'show',
    value: function show() {
      this._init(); //try to init
      this.state.arguments.show = arguments;

      //if popup is hiding now, force to end hide and start show
      if (this.state.status === 'hide') {
        clearTimeout(this._g.hiddenCb);
        this._hiddenCb();
      }

      if (this.state.status !== 'inited') {
        this._e('njBox, show, plugin not inited or in not inited state(probably plugin is already visible or destroyed, or smth else..)');
        return;
      }

      if (this._cb('show') === false) return; //callback show (we can cancel showing popup, if show callback will return false)

      this._cb('show_prepare');

      this._cb('animation_show');

      //dont forget manually call  _shownCb here after animation end

      return this;
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.state.arguments.hide = arguments;

      if (this.state.status === 'show') {
        clearTimeout(this._g.shownCb);
        this._shownCb();
      }

      if (this.state.status !== 'shown') {
        this._e('njBox, hide, we can hide only shown modal (probably animation is still running or plugin destroyed).');
        return;
      }

      if (this._cb('hide') === false) return; //callback hide

      this._cb('hide_prepare');

      this._cb('animation_hide');

      //dont forget manually call  _hiddenCb here after animation end

      return this;
    }
  }, {
    key: 'position',
    value: function position() {
      this.state.arguments.position = arguments;

      if (!this.state || !this.state.inited || this.state.status !== 'show' && this.state.status !== 'shown') return;

      this._cb('position');
      this._cb('positioned');

      return this;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.state.arguments.destroy = arguments;
      if (!this.state.inited || this.state.status !== 'inited') {
        this._e('njBox, we can destroy only initialized && hidden modals.');
        return;
      }

      this._cb('destroy');

      this._cb('destroyed');

      this._events = this.o = this.state = this._g = this.items = this.dom = {};

      return this;
    }
  }, {
    key: '_createItems',
    value: function _createItems(itemsRaw) {
      var items = [];
      for (var i = 0, l = itemsRaw.length; i < l; i++) {
        items.push(this._createItem(itemsRaw[i], i));
      }
      return items;
    }
  }, {
    key: '_createItem',
    value: function _createItem(item, index) {
      var o = this.o,
          normalizedItem = this._normalizeItem(item);

      this._cb('item_create', normalizedItem, index);
      this._cb('item_created', normalizedItem, index);

      return normalizedItem;
    }
  }, {
    key: '_normalizeItem',
    value: function _normalizeItem(itemRaw, el) {
      var evaluatedContent;

      if (typeof itemRaw.content === 'function') {
        evaluatedContent = itemRaw.content.call(this, itemRaw);
      } else {
        evaluatedContent = itemRaw.content;
      }

      var item = {
        content: evaluatedContent,
        type: itemRaw.type,
        header: itemRaw.header,
        footer: itemRaw.footer,
        title: itemRaw.title,
        state: {
          status: 'inited'
        },
        raw: itemRaw
      };

      this._cb('item_normalized', item, itemRaw);
      return item;
    }
  }, {
    key: '_getActive',
    value: function _getActive() {
      return this.items[this.state.active];
    }
  }, {
    key: '_shownCb',
    value: function _shownCb() {
      this._cb('shown');
    }
  }, {
    key: '_hiddenCb',
    value: function _hiddenCb() {
      this._clear();
      this._cb('hidden');
      this.state.status = 'inited';
    }
  }, {
    key: '_clear',
    value: function _clear() {
      var o = this.o;

      this._cb('clear');

      this.state = {
        active: 0,
        arguments: {},
        inited: true
      };
    }
  }, {
    key: '_e',
    value: function _e(msg, clear) {
      //_e
      if (!msg) return;

      console.error(msg);
      if (clear) this._clear();
    }
  }, {
    key: '_cb',
    value: function _cb(type) {
      //cb - callback
      var o = this.o,
          callbackResult;

      if (type === 'inited' || type === 'show' || type === 'shown' || type === 'hide' || type === 'hidden' || type === 'destroy') {
        this.state.status = type;
      }

      //trigger callbacks

      //trigger on modal instance
      this.trigger.apply(this, arguments);

      var cbArgs = Array.prototype.slice.call(arguments);

      //trigger common global callback on instance
      this.trigger.apply(this, ['cb'].concat(cbArgs));

      //trigger common callback function from options
      if (o && o['oncb'] && typeof o['oncb'] === 'function') {
        callbackResult = o['oncb'].apply(this, cbArgs);
      }

      //trigger callback from options with "on" prefix (e.g. onshow, onhide)
      var clearArgs = Array.prototype.slice.call(arguments, 1);

      if (o && typeof o['on' + type] === 'function') {
        callbackResult = o['on' + type].apply(this, clearArgs);
      }

      if (type === 'show' && callbackResult === false) {
        this.state.status = 'inited';
      } else if (type === 'hide' && callbackResult === false) {
        this.state.status = 'shown';
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
        if (typeof this._events[event][i] === 'function') this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
      }
      return this;
    }
  }]);

  return njBox;
}();

exports.default = njBox;
module.exports = exports['default'];

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getDefaultInfo = getDefaultInfo;
exports.getItemFromDom = getItemFromDom;
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
function getItemFromDom(dom, selector) {
	return dom.attr(selector) !== null ? dom : dom.find('[' + selector + ']');
}

var defaults = exports.defaults = {
	elem: '', //(selector || dom\jQuery element) dom element for triggering modal
	content: undefined, //(string || function) content for modal
	delayed: true, //(boolean) Interesting option, that works only for selector and image types. When its true with selector type, dom element will not be touched until show, and will be returned to dom after hiding modal. When its true and type image, images will not be loading on initialization, loading starts when show method calls
	type: undefined, //(html || selector || text || image || template) type of content, if selector used, whole element will be inserted in modal. Template similar to html, but template inserted without .njb__body tag(header/footer also not inserted), directly to .njb
	header: undefined, //(html) html that will be added as modal header
	footer: undefined, //(html) html that will be added as modal footer
	// we need quotes here because of ie8..
	'class': false, //(string) classnames(separated with space) that will be added to modal wrapper, you can use it for styling (theming).
	zindex: false, //(boolean false || number) zindex that will be set on modal, probably not a good idea to use this option, set it in css and use o.class instead

	container: 'body', //(selector) appends modal to specific element
	layout: 'fixed', //(fixed || absolute || popover), how popup will be positioned. For most cases fixed is good, but when we insert popup inside element(not document), absolute position sets automatically, popover mode works only with popover addon)

	click: true, //(boolean) should we set click handler on element(o.elem)?
	clickels: false, //(selector || dom\jQuery element) additional elements that can trigger same modal window (very often on landing pages you need few buttons to open one modal window)

	backdrop: true, //(boolean) should we show backdrop (black overlay)?
	backdropassist: true, //(boolean) if true, animation durations of modal will automatically sets to backdrop to be in sync
	scrollbar: 'hide', //(show || hide) should we hide scrollbar from page?
	out: true, //(boolean) click outside modal will close it, false also adds fancy animation when somebody tries to close modal with outside click
	esc: true, //(boolean) close modal when esc button pressed?
	close: 'outside', //(inside || outside || boolean false) add close button inside or outside popup or don't add at all
	autoheight: 'image', //(boolean || image) should we fit modal height to window height? if image is selected, only images will be autoheighted
	autofocus: true, //(boolean, selector) set focus to element, after modal is shown, also you may use autofocus attribute without this option
	focusprevious: true, //(boolean) focus previous modal window after hiding current modal. (only for case when we open two or more modal windows)
	title: undefined, //(string || boolean false) title (usually for image)
	titleattr: 'title', //(string || boolean false) attribute from which we gather title 
	img: 'ready', //(load || ready) we should wait until img will fully loaded or show as soon as size will be known (ready is useful for progressive images)
	anim: 'scale', //(false || string) name of animation, or string with space separated 2 names of show/hide animation (default same as `scale scale`). 2 predefined animations are built in: scale and fade.
	animclass: '', //(string) additional class that will be added to modal window during animation (can be used for animate.css or other css animation libraries)
	duration: 'auto', //(string || number || auto) duration of animations, or string with space separated 2 durations of show/hide animation. You can set 'auto 100' if you want to set only duration for hide. It should be used when problems with auto detection (but I have not seen such problem yet ^^)


	jquery: undefined, //!!! jQuery NOT required for plugin, plugin can work with it to support old browsers !!! link to jquery (for modules without global scope) P.S. Plugin will try to found jquery in global namespace even without this option.
	autobind: '[data-toggle~="box"], [data-toggle~="modal"]', //(selector) selector that will be used for autobind (can be used only with changing global default properties) Set it after njBox.js is inserted njBox.defaults.autobind = '.myAutoBindSelector'

	//accessibility options
	_focusable: 'a[href], area[href], details, iframe, object, embed, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]', //(selector) this elements we will try to focus in popup shown after option o.autofocus
	buttonrole: 'button', //(button || boolean false) this role will be set to elements, which opens modal window
	role: 'dialog', //(dialog || alertdialog || boolean false) role that will be set to modal dialog https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_alertdialog_role
	label: false, //(string || boolean false) add aria-label attribute to support screenreaders
	labelledby: false, //(string || boolean false) add aria-labelledby attribute to support screenreaders
	describedby: false //(string || boolean false) add aria-describedby attribute to support screenreaders
};
var templates = exports.templates = {
	wrap: '<div class="njb-wrap"><div class="njb-items"></div></div>',
	backdrop: '<div class="njb-backdrop"></div>',
	modalOuter: '<div class="njb-outer"></div>',
	modal: '<div class="njb"></div>',
	body: '<div class="njb__body" data-njb-body></div>',
	header: '<header class="njb__header" data-njb-header></header>',
	footer: '<footer class="njb__footer" data-njb-footer></footer>',
	close: '<button type="button" class="njb-ui__close" data-njb-close><span aria-hidden="true">×</span></button>',
	focusCatcher: '<span tabindex="0" class="njb-focus-catch" aria-hidden="true"></span>',

	preloader: '<div class="njb-preloader"><div class="njb-preloader__inner"><div class="njb-preloader__bar1"></div><div class="njb-preloader__bar2"></div><div class="njb-preloader__bar3"></div></div></div>',
	ui: '<div class="njb-ui"></div>',
	title: '<div class="njb-ui__title"><div class="njb-ui__title-inner" id="njb-title" data-njb-title></div></div>' //id in title used for accessibility
};
var text = exports.text = {
	_missedContent: 'njBox plugin: meow, put some content here...', //text for case, when slide have no content
	preloader: 'Loading...', //title on preloader element
	imageError: '<a href="%url%">This image</a> can not be loaded.',
	close: 'Close dialog', //title on close button
	ok: 'Ok', //text on 'ok' button when dialog modal(alert, prompt, confirm) or in any other custom type
	cancel: 'Cancel', //text on 'cancel' button when dialog modal(alert, prompt, confirm) or in any other custom type
	placeholder: '' //placeholder for prompt input
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//syntax sugar like jquery
var j = function j(selector) {
    return new j.fn.init(selector || '');
};

j.match = function (el, selector) {
    if (el === document) el = document.documentElement;

    var matchesSelector = el.matches || el.matchesSelector || el.oMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.msMatchesSelector;

    return matchesSelector.call(el, selector);
};
j.extend = function () {
    return Object.assign.apply(Object, Array.prototype.slice.call(arguments));
};
j.isPlainObject = function (obj) {
    return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj !== null && obj.constructor === Object && Object.prototype.toString.call(obj) === '[object Object]';
};
j.isWindow = function (obj) {
    return obj != null && obj == obj.window;
};
j.fn = j.prototype;
j.fn.init = function (selector) {
    var query;

    if (typeof selector === 'string' && selector.length > 0) {
        //detect html input
        if (selector.charAt(0) === "<") {
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
j.inArray = function (element, array, i) {
    return array == null ? -1 : array.indexOf(element, i);
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
//only in get mode
j.fn.data = function (type) {
    if (type) {
        return this[0].dataset[type];
    } else {
        return this[0].dataset;
    }
};
j.fn.attr = function (prop, value) {
    if (value !== undefined) {
        return this.each(function () {
            this.setAttribute(prop, value);
        });
    } else {
        return this[0].getAttribute(prop);
    }
};
j.parseJSON = function (json) {
    return JSON.parse(json);
};
j.fn.css = function (prop, value) {
    var that = this;
    if (!prop) return;

    if (prop == 'float') prop = 'styleFloat';
    if (value) {
        return this.each(function () {
            this.style[prop] = value;
        });
    } else {
        return getComputedStyle(this[0], null)[prop] || undefined;
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
j.fn.html = function (html) {
    return this.each(function () {
        this.innerHTML = html;
    });
};
j.fn.text = function (text) {
    return this.each(function () {
        this.textContent = text;
    });
};
j.fn.append = function (content) {
    return insert.call(this, content, 'append');
};
j.fn.prepend = function (content) {
    return insert.call(this, content, 'prepend');
};
function insert(content, type) {
    var els = j(content),
        frag = document.createDocumentFragment();

    //insert all elements in fragment, because prepend method insert elements reversed
    els.each(function () {
        frag.appendChild(this);
    });
    return this.each(function () {
        if (type === 'append') {
            this.appendChild(frag);
        } else {
            this.insertBefore(frag, this.firstChild);
        }
    });
}
exports.default = j;
module.exports = exports['default'];

/***/ })
/******/ ]);
});