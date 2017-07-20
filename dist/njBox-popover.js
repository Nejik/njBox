/******/ (function(modules) { // webpackBootstrap
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
/* 0 */,
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * njBox gallery addon
 * nejikrofl@gmail.com
 * Copyright (c) 2017 N.J.
*/
(function () {
  if (window.njBox) njBox.addAddon('popover', {
    options: {
      placement: 'bottom' //(string || array || function) coordinates or designations for positioning popover. Coordinates as string should be space separated 2 numbers (e.g. "100 100") or if it is array, it should be array with 2 numbers (e.g. [100,100]). Designations can be - top || right || bottom || left || center. Top,right,bottom,left are relative to clicked element, but "center" relative to window. Also when a function is used to determine the placement, it is called with the popover DOM node as its first argument and the triggering element DOM node as its second. The this context is set to the popover instance.
    },
    prototype: {
      _popover_init: function _popover_init() {
        var that = this,
            o = this.o,
            $ = this.$;

        if (o.layout === 'popover') {
          that._g.popover = true;
          o.backdrop = that._getPassedOption('backdrop') || false;
          o.scrollbar = that._getPassedOption('scrollbar') || 'show';
          o.out = that._getPassedOption('out') || true;
          o.container = 'body'; //you cant change container in popover mode
        }
        if (!that._g.popover) return;

        that.on('position', function () {
          var that = this,
              o = this.o,
              coords,
              activeModal = that.items[that.state.active].dom.modal,
              coordinates = that.state.coordsFromPosition;

          if (this.state.arguments.position.length) {
            coordinates = this.state.coordsFromPosition = this.state.arguments.position[0];
          }

          if (this._g.popover) {
            if (coordinates) {
              coords = typeof coordinates === 'function' ? coordinates() : coordinates;
            } else {
              coords = this._getCoordsFromPlacement(o.placement, this.state.dimensions);
            }

            coords = that._parseCoords(coords);
            this.state.coords = coords;

            if (this._g.popover && this.state.coords && this.state.coords.length === 2) {
              activeModal.css('left', this.state.coords[0] + "px").css('top', this.state.coords[1] + "px");
            }
          }
        });
        that.on('item_created', function (item) {
          if (that._g.popover) item.dom.modal.addClass('njb--popover');
          item.toInsert = item.dom.modal;
        });
        that.on('listeners_added', function () {
          var that = this,
              h = this._handlers;

          that.dom.container.on('keydown', h.wrap_keydown).delegate('[data-njb-close]', 'click', h.wrap_close).delegate('[data-njb-ok]', 'click', h.wrap_ok).delegate('[data-njb-cancel]', 'click', h.wrap_cancel);
        });
        that.on('listeners_removed', function () {
          var that = this,
              h = this._handlers;

          that.dom.container.on('keydown', h.wrap_keydown).undelegate('[data-njb-close]', 'click', h.wrap_close).undelegate('[data-njb-ok]', 'click', h.wrap_ok).undelegate('[data-njb-cancel]', 'click', h.wrap_cancel);
        });
      },
      _getCoordsFromPlacement: function _getCoordsFromPlacement(value, dimensions) {
        var that = this,
            o = that.o,
            placement = value,
            cbPlacement = that._cb('placement', dimensions.modal.el, dimensions.clickedEl.el);

        if (cbPlacement !== undefined) placement = cbPlacement;

        if (typeof placement === 'function') placement = placement();

        placement = that._parseCoords(placement);

        var popoverWiderThanClicked = dimensions.modal.width > dimensions.clickedEl.width,
            popoverTallerThanClicked = dimensions.modal.height > dimensions.clickedEl.height,
            offset = that._parseCoords(o.offset),
            coords = [],
            leftForTopAndBottom,
            topForLeftAndRight;

        if (popoverWiderThanClicked) {
          leftForTopAndBottom = dimensions.clickedEl.left - (dimensions.modal.width - dimensions.clickedEl.width) / 2;
        } else {
          leftForTopAndBottom = dimensions.clickedEl.left + (dimensions.clickedEl.width - dimensions.modal.width) / 2;
        }
        if (dimensions.container.scrollLeft) {
          leftForTopAndBottom += dimensions.container.scrollLeft;
        }

        if (popoverTallerThanClicked) {
          topForLeftAndRight = dimensions.clickedEl.top - (dimensions.modal.height - dimensions.clickedEl.height) / 2;
        } else {
          topForLeftAndRight = dimensions.clickedEl.top + (dimensions.clickedEl.height - dimensions.modal.height) / 2;
        }
        if (dimensions.container.scrollTop) {
          topForLeftAndRight += dimensions.container.scrollTop;
        }

        switch (placement) {
          case 'center':
            coords[0] = (dimensions.container.width - dimensions.modal.width) / 2 + dimensions.window.scrollLeft;
            coords[1] = (dimensions.container.height - dimensions.modal.height) / 2 + dimensions.window.scrollTop;
            break;

          case 'bottom':
            coords[0] = leftForTopAndBottom;
            coords[1] = dimensions.clickedEl.bottom + offset[1];
            break;

          case 'top':
            coords[0] = leftForTopAndBottom;
            coords[1] = dimensions.clickedEl.top - dimensions.modal.height - offset[1];
            break;

          case 'left':
            coords[0] = dimensions.clickedEl.left - dimensions.modal.width - offset[0];
            coords[1] = topForLeftAndRight;
            break;

          case 'right':
            coords[0] = dimensions.clickedEl.right + offset[0];
            coords[1] = topForLeftAndRight;
            break;
        }

        return that._checkBounds(coords);
      },
      _checkBounds: function _checkBounds(currentcoords) {
        var that = this,
            o = that.o,
            boundary = o.boundary,
            offset = that._parseCoords(o.offset),
            dimensions = that.state.dimensions,
            boundaryCoords = this._getDomSize(window),
            fixedCoords = currentcoords;

        if (!boundary) return currentcoords;

        //fix negative left position
        if (currentcoords[0] < boundaryCoords.left) {
          fixedCoords[0] = boundaryCoords.left;
        }

        //fix negative top position
        if (currentcoords[1] < boundaryCoords.top) {
          fixedCoords[1] = boundaryCoords.top;
        }

        //fix negative right position
        if (currentcoords[0] + dimensions.modal.width > boundaryCoords.scrollWidth) {
          fixedCoords[0] = boundaryCoords.scrollWidth - dimensions.modal.width;
        }

        //fix negative bottom position
        if (currentcoords[1] + dimensions.modal.height > boundaryCoords.scrollHeight) {
          fixedCoords[1] = boundaryCoords.scrollHeight - dimensions.modal.height;
        }

        return fixedCoords;
      },
      _parseCoords: function _parseCoords(stringOrArray) {
        if (typeof stringOrArray === 'string') {
          if (/\s/.test(stringOrArray)) {
            var arr = stringOrArray.split(' ');
            arr[0] = parseFloat(arr[0]);
            arr[1] = parseFloat(arr[1]);
            return arr;
          } else {
            return stringOrArray;
          }
        } else if ((typeof stringOrArray === 'undefined' ? 'undefined' : _typeof(stringOrArray)) === 'object') {
          return stringOrArray;
        }
      }
    }
  });
})();

/***/ }),
/* 2 */,
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ })
/******/ ]);