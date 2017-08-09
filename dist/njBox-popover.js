/******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * njBox popover addon
 * nejikrofl@gmail.com
 * Copyright (c) 2017 N.J.
 * MIT license
*/

(function () {
  var njBox_class = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.njBox;

  if (!njBox_class) return;

  njBox_class.addAddon('popover', {
    options: {
      layout: 'fixed', //(fixed || absolute || popover) how popup will be positioned. For most cases fixed is good, but when we insert popup inside other element, not document, absolute position sets automatically. Popover mode works only with popover addon). Its not popover addon specific options, it extends basic option with popover option.
      trigger: 'click', //(boolean false || click || hover || follow) how popover is triggered
      placement: 'bottom', //(string || array || function) coordinates or designations for positioning popover. Coordinates as string should be space separated 2 numbers (e.g. "100 100") or if it is array, it should be array with 2 numbers (e.g. [100,100]). Designations can be - top || right || bottom || left || center. Top,right,bottom,left are relative to clicked element, but "center" relative to window. Also when a function is used to determine the placement, it is called with the popover DOM node as its first argument and the triggering element DOM node as second, 'this' context is set to the popover instance.
      reverse: true, //(boolean) should we reverse direction left/right top/bottom if no space for popover
      offset: '10 10', //(string || array) (default '5 5' for trigger:'follow' case) Offset of the popover relative to its target for all triggers except follow. For follow trigger it is offset from mouse coordinates.
      boundary: true //(boolean) should popover stay in window boundaries?
    },
    prototype: {
      _popover_init: function _popover_init() {
        var that = this,
            o = that.o,
            $ = that.$;

        if (o.layout === 'popover') {
          that._g.popover = true;

          //modify options
          o.container = 'body'; //you cant change container in popover mode
          o.backdrop = that._getPassedOption('backdrop') || false;
          o.scrollbar = that._getPassedOption('scrollbar') || 'show';
          o.close = that._getPassedOption('close') || false;
          o.autoheight = false;
          o.autofocus = that._getPassedOption('autofocus') || false;
          o.focusprevious = false;
          o.click = false;
          o.clickels = false;
          o.autoheight = that._getPassedOption('autoheight') || false;

          if (o.trigger === 'follow') {
            o.placement = that._getPassedOption('placement') || 'right';
            o.offset = '5 5';
          }
        }

        if (!that._g.popover) return;

        that.on('inited', function () {
          var that = this,
              o = that.o,
              h = this._handlers;

          this.dom.insertInto = this.dom.container;
          this._g.insertWrap = false;

          switch (o.trigger) {
            case 'click':
              h.trigger_click = function (e) {
                var el = this;
                if (e.originalEvent) e = e.originalEvent; //work with original event

                if ('which' in e && (e.which !== 1 || e.which === 1 && e.ctrlKey && e.shiftKey)) return; //handle only left button click without key modificators
                e.preventDefault ? e.preventDefault() : e.returnValue = false;

                switch (that.state.status) {
                  case 'inited':
                  case 'hide':
                    that.state.clickedEvent = e;
                    that.state.clickedEl = el;
                    that.state.focused = el;
                    that.show();
                    break;
                  case 'show':
                  case 'shown':
                    that.hide();
                    break;
                }
              };
              that._g.els.on('click', h.trigger_click);
              break;
            case 'hover':
              h.trigger_mouseenter = function (e) {
                var el = this;
                if (e.originalEvent) e = e.originalEvent; //work with original event
                that.state.clickedEvent = e;
                that.state.clickedEl = el;
                that.state.focused = document.activeElement;
                that.show();
              };
              h.trigger_mouseleave = function (e) {
                that.hide();
              };
              that._g.els.on('mouseenter', h.trigger_mouseenter).on('mouseleave', h.trigger_mouseleave);
              break;
            // case 'focus':
            //   h.trigger_focus_click = function(e) {
            //     if (e.originalEvent) e = e.originalEvent;//work with original event
            //     (e.preventDefault) ? e.preventDefault() : e.returnValue = false;
            //   }
            //   h.trigger_focus = function(e) {
            //     console.log('focus');
            //     var el = this;
            //     if (e.originalEvent) e = e.originalEvent;//work with original event

            //     that.state.clickedEvent = e;
            //     that.state.clickedEl = el;
            //     that.state.focused = el;
            //     that.show()
            //   }
            //   h.trigger_blur = function(e) {
            //     that.hide()
            //   }
            //   that._g.els .on('click', h.trigger_focus_click)
            //               .on('focus', h.trigger_focus)
            //               .on('blur', h.trigger_blur)
            //   break;
            case 'follow':
              h.trigger_follow_enter = function (e) {
                that._g.followEvent = e;
                that.show();
                that.dom.document.off('mousemove', undefined);

                that.dom.document.off('mousemove', h.trigger_follow_move).on('mousemove', h.trigger_follow_move);
              };
              h.trigger_follow_move = function (e) {
                if (e.originalEvent) e = e.originalEvent; //work with original event
                if (that.state.status !== 'show' && that.state.status !== 'shown') return;

                that._g.followEvent = e;

                if (that._p_mouseInRect({ e: e, 'rect': that.state.dimensions.el })) {
                  that.position();
                } else {
                  that.dom.document.off('mousemove', h.trigger_follow_move);
                  that.hide();
                }
              };

              that._g.els.on('mouseenter', h.trigger_follow_enter);
              break;
          }
        });
        that.on('destroy', function () {
          var h = this._handlers;

          switch (o.trigger) {
            case 'click':
              that._g.els.off('click', h.trigger_click);
              break;
            case 'hover':
              that._g.els.off('mouseenter', h.trigger_mouseenter).off('mouseleave', h.trigger_mouseleave);
              break;
            // case 'focus':
            //   that._g.els .on('click', h.trigger_focus_click)
            //               .on('focus', h.trigger_focus)
            //               .on('blur', h.trigger_blur)
            //   break;
            case 'follow':
              that._g.els.off('mouseenter', h.trigger_follow_enter);
              that.dom.document.off('mousemove', h.trigger_follow_move);
              break;
          }
        });
        that.on('item_inserted', function (item) {
          item.dom.modalOuter.css('width', item.dom.modalOuter.css('width'));
        });
        that.on('item_ready', function (item) {
          item.dom.modalOuter.css('width', 'auto').css('left', "0px").css('top', '0px'); //fix case, when image after loading inserted and make container higher, so plugin think we can use this new scrollheight, but we cant...
        });
        that.on('position', function () {
          var that = this,
              o = this.o,
              state = this.state,
              coords = o.placement,
              modalOuter = that._getActive().dom.modalOuter;

          //use modalOuter results, because scale transformations on modal affects sizes and positioning...
          this.state.dimensions.modal = this._getDomSize(modalOuter);

          if (state.arguments.position.length) {
            coords = state.arguments.position[0];
          }

          coords = typeof coords === 'function' ? coords.call(this, this._getActive().dom.modal[0], this.state.clickedEl || this._g.els[0]) : coords;
          if (!coords) coords = 'bottom';

          if (o.trigger === 'follow') {
            coords = that._p_getFollowCoords(this._g.followEvent);
          } else if (this._p_isPlacement(coords)) {
            coords = that._p_getCoords(coords);
          }

          state.coords = coords; //computed

          if (state.coords && state.coords.length === 2) {
            modalOuter.css('left', state.coords[0] + "px").css('top', state.coords[1] + "px");
          }
        });
        that.on('item_create', function (item) {
          if (that._g.popover) item.dom.modalOuter.addClass('njb-outer--popover');
          if (o['class']) item.dom.modalOuter.addClass(o['class']);
          item.toInsert = item.dom.modalOuter;
        });
        that.on('item_created', function (item) {});
        that.on('listeners_added', function () {
          var that = this,
              h = this._handlers;

          //we use handlers from main plugin, but we need to save them with other links, because main plugin delete links after removing listeners
          h.p_wrap_keydown = h.wrap_keydown;
          h.p_wrap_close = h.wrap_close;
          h.p_wrap_ok = h.wrap_ok;
          h.p_wrap_cancel = h.wrap_cancel;

          that.dom.container.on('keydown', h.p_wrap_keydown).delegate('[data-njb-close]', 'click', h.p_wrap_close).delegate('[data-njb-ok]', 'click', h.p_wrap_ok).delegate('[data-njb-cancel]', 'click', h.p_wrap_cancel);
        });
        that.on('listeners_removed', function () {
          var that = this,
              h = this._handlers;
          that.dom.container.off('keydown', h.p_wrap_keydown).undelegate('[data-njb-close]', 'click', h.p_wrap_close).undelegate('[data-njb-ok]', 'click', h.p_wrap_ok).undelegate('[data-njb-cancel]', 'click', h.p_wrap_cancel);

          delete h.p_wrap_keydown;
          delete h.p_wrap_close;
          delete h.p_wrap_ok;
          delete h.p_wrap_cancel;
        });
        that.on('clear', function () {
          if (!this._g.popover) return;

          var modal = this._getActive().dom.modalOuter;

          modal[0].parentNode.removeChild(modal[0]);
          modal.css('left', '0').css('top', '0');
        });
      },
      _p_getCoords: function _p_getCoords(placement) {
        var o = this.o,
            reverse = o.reverse,
            boundary = o.boundary,
            dimensions = this.state.dimensions,
            container = dimensions.container,
            modal = dimensions.modal,
            dirty,
            coords;

        coords = this._p_getCoordsFromPlacement(placement, dimensions);

        if (boundary || reverse) {
          dirty = this._p_getDirtyStatus({
            coords: coords,
            element: modal,
            container: container
          });
        }

        //reverse position
        if (reverse && dirty && dirty[placement]) {
          var newPlacement = this._p_getOppositeDirection(placement);
          coords = this._p_getCoordsFromPlacement(newPlacement, dimensions);
          dirty = this._p_getDirtyStatus({
            coords: coords,
            element: modal,
            container: container
          });
        }

        //bounds to window
        if (boundary && dirty) {
          coords = this._p_fixBounds({ coords: coords });
        }

        return coords;
      },
      _p_getFollowCoords: function _p_getFollowCoords(e) {
        var o = this.o,
            mouseCoords = [e.clientX, e.clientY],
            computedCoords,
            dimensions = this.state.dimensions,
            container = dimensions.container,
            modal = dimensions.modal,
            placement = o.placement,
            reverse = o.reverse,
            boundary = o.boundary,
            offset = this._p_parseCoords(o.offset),
            dirty;

        computedCoords = getCoordsForFollow(mouseCoords);

        if (boundary || reverse) {
          dirty = this._p_getDirtyStatus({
            coords: computedCoords,
            element: modal,
            container: container
          });
        }

        if (reverse && dirty && dirty[placement]) {
          placement = this._p_getOppositeDirection(placement);

          computedCoords = getCoordsForFollow(mouseCoords);
          dirty = this._p_getDirtyStatus({
            coords: mouseCoords,
            container: container,
            element: modal
          });
        }

        if (boundary && dirty) {
          computedCoords = this._p_fixBounds({ coords: computedCoords });
        }

        function getCoordsForFollow(mouseCoords) {
          var computedCoords = mouseCoords.slice(); //copy array

          if (placement === 'right') {
            computedCoords[0] += offset[0];
            computedCoords[1] += offset[1];
          } else if (placement === 'left') {
            computedCoords[0] -= modal.width + offset[0];
          }

          return computedCoords;
        }

        return computedCoords;
      },
      _p_isPlacement: function _p_isPlacement(placement) {
        var result = false;

        switch (placement) {
          case 'left':
          case 'right':
          case 'bottom':
          case 'top':
          case 'center':
            result = true;
            break;

          default:
            break;
        }

        return result;
      },
      _p_mouseInRect: function _p_mouseInRect(props) {
        var e = props.e,
            rect = props.rect,
            x = e.clientX,
            y = e.clientY,
            result = false;


        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          result = true;
        }
        return result;
      },
      _p_getCoordsFromPlacement: function _p_getCoordsFromPlacement(placement, dimensions) {
        var that = this,
            o = that.o,
            clickedElDimensions = dimensions.clickedEl || dimensions.el; //we can use dimensions from initializing element for setting first coords (case when we call .show programmatically)
        if (!clickedElDimensions) return placement;

        var popoverWiderThanClicked = dimensions.modal.width > clickedElDimensions.width,
            popoverTallerThanClicked = dimensions.modal.height > clickedElDimensions.height,
            offset = that._p_parseCoords(o.offset),
            coords = [],
            leftForTopAndBottom,
            topForLeftAndRight;

        if (popoverWiderThanClicked) {
          leftForTopAndBottom = clickedElDimensions.left - (dimensions.modal.width - clickedElDimensions.width) / 2;
        } else {
          leftForTopAndBottom = clickedElDimensions.left + (clickedElDimensions.width - dimensions.modal.width) / 2;
        }
        if (dimensions.container.scrollLeft) {
          leftForTopAndBottom += dimensions.container.scrollLeft;
        }

        if (popoverTallerThanClicked) {
          topForLeftAndRight = clickedElDimensions.top - (dimensions.modal.height - clickedElDimensions.height) / 2;
        } else {
          topForLeftAndRight = clickedElDimensions.top + (clickedElDimensions.height - dimensions.modal.height) / 2;
        }
        if (dimensions.container.scrollTop) {
          topForLeftAndRight += dimensions.container.scrollTop;
        }

        switch (placement) {
          case 'center':
            coords[0] = (dimensions.container.width - dimensions.modal.width) / 2 + dimensions.container.scrollLeft;
            coords[1] = (dimensions.container.height - dimensions.modal.height) / 2 + dimensions.container.scrollTop;
            break;

          case 'bottom':
            coords[0] = leftForTopAndBottom;
            coords[1] = clickedElDimensions.bottom + offset[1] + dimensions.container.scrollTop;
            break;

          case 'top':
            coords[0] = leftForTopAndBottom;
            coords[1] = clickedElDimensions.top - dimensions.modal.height - offset[1] + dimensions.container.scrollTop;
            break;

          case 'left':
            coords[0] = clickedElDimensions.left - dimensions.modal.width - offset[0];
            coords[1] = topForLeftAndRight;
            break;

          case 'right':
            coords[0] = clickedElDimensions.right + offset[0];
            coords[1] = topForLeftAndRight;
            break;
        }

        return coords;
      },
      _p_getDirtyStatus: function _p_getDirtyStatus(props) {
        var coords = props.coords,
            container = props.container,
            element = props.element,
            result = false,
            statusObj = {
          left: coords[0] <= container.left,
          top: coords[1] <= container.top,
          right: coords[0] + element.width >= container.scrollWidth,
          bottom: coords[1] + element.height >= container.scrollHeight
        };


        if (statusObj.left || statusObj.top || statusObj.right || statusObj.bottom) {
          result = statusObj;
        }
        return result;
      },
      _p_getOppositeDirection: function _p_getOppositeDirection(direction) {
        switch (direction) {
          case 'left':
            return 'right';
          case 'right':
            return 'left';
          case 'top':
            return 'bottom';
          case 'bottom':
            return 'top';
          case 'center':
            return 'center';
        }
      },
      _p_fixBounds: function _p_fixBounds(props) {
        var that = this,
            coords = props.coords,
            o = that.o,
            boundary = o.boundary;


        if (!boundary) return coords;

        var offset = that._p_parseCoords(o.offset),
            dimensions = that.state.dimensions,
            container = dimensions.container,
            modal = dimensions.modal,
            fixedCoords = coords.slice(),
            dirty = this._p_getDirtyStatus({
          coords: coords,
          container: container,
          element: modal
        });

        fixedCoords = makeSticky({ dirty: dirty, coords: fixedCoords, container: container, element: modal });

        function makeSticky(props) {
          var dirty = props.dirty,
              coords = props.coords,
              container = props.container,
              element = props.element;


          var maxRight = container.scrollWidth - element.width;

          //fix negative left position
          if (dirty.left) {
            coords[0] = container.left;
          }

          //fix negative top position
          if (dirty.top) {
            coords[1] = container.top;
          }

          //fix negative right position
          if (dirty.right) {
            coords[0] = maxRight;
          }

          //fix negative bottom position
          if (dirty.bottom) {
            coords[1] = container.scrollHeight - element.height;
          }
          return coords;
        }
        return fixedCoords;
      },

      //parse coords always should return correct array
      _p_parseCoords: function _p_parseCoords(stringOrArray) {
        var defaultArray = [0, 0],
            arrayToReturn = defaultArray;

        if (typeof stringOrArray === 'string') {
          if (/\s/.test(stringOrArray)) {
            //check space in string
            var arr = stringOrArray.split(' ');
            arr[0] = parseFloat(arr[0]);
            arr[1] = parseFloat(arr[1]);
            arrayToReturn = arr;
          } else {
            arrayToReturn = defaultArray;
          }
        } else if ((typeof stringOrArray === 'undefined' ? 'undefined' : _typeof(stringOrArray)) === 'object' && stringOrArray.length == 2) {
          arrayToReturn = [parseFloat(stringOrArray[0]), parseFloat(stringOrArray[1])];
        }

        return arrayToReturn;
      }
    }
  });
})();

/***/ })
/******/ ]);