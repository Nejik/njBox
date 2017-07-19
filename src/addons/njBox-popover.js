/*!
 * njBox gallery addon
 * nejikrofl@gmail.com
 * Copyright (c) 2017 N.J.
*/
(function () {
  if (window.njBox) njBox.addAddon('popover', {
    options: {
      layout         : 'fixed',//(fixed || absolute || popover) how popup will be positioned. For most cases fixed is good, but when we insert popup inside other element, not document, absolute position sets automatically. popover mode works only with popover addon)
      trigger        : 'click',//(click || hover || focus || follow) how popover is triggered
      placement      : 'bottom',//(string || array || function) coordinates or designations for positioning popover. Coordinates as string should be space separated 2 numbers (e.g. "100 100") or if it is array, it should be array with 2 numbers (e.g. [100,100]). Designations can be - top || right || bottom || left || center. Top,right,bottom,left are relative to clicked element, but "center" relative to window. Also when a function is used to determine the placement, it is called with the popover DOM node as its first argument and the triggering element DOM node as its second, this context is set to the popover instance.
      reverse        : true,//(boolean) should we reverse direction left/right top/bottom if no space for popover
      offset         : '10 10',//(string or array) popover specific option. Offset of the popover relative to its target
	    boundary       : true//(boolean) popover specific option. Should popover stay in window boundaries?
    },
    prototype: {
      _popover_init() {
        var that = this,
          o = that.o,
          $ = that.$;
        
        if(o.layout === 'popover') {
          that._g.popover = true
          o.backdrop = that._getPassedOption('backdrop') || false;
          o.scrollbar = that._getPassedOption('scrollbar') || 'show';
          o.out = that._getPassedOption('out') || false;
          o.esc = that._getPassedOption('esc') || false;
          o.autofocus = that._getPassedOption('autofocus') || false;
          o.container = 'body';//you cant change container in popover mode
          o.focusprevious = false;
          o.click = false;
          o.clickels = false;
        }
        if(!that._g.popover) return;
        
        that.on('inited', function() {
          var that = this,
              o = that.o,
              h = this._handlers;
          
          this.dom.insertInto = this.dom.container;
          this._g.insertWrap = false;


          switch (o.trigger) {
            case 'click':
              h.trigger_click = function(e) {
                var el = this;
                if (e.originalEvent) e = e.originalEvent;//work with original event
              
                if ('which' in e && (e.which !== 1 || e.which === 1 && e.ctrlKey && e.shiftKey)) return;//handle only left button click without key modificators
                (e.preventDefault) ? e.preventDefault() : e.returnValue = false;
              
                if (that.state.status !== 'inited') {
                  that.hide();
                  return;
                }
                that.state.clickedEvent = e;
                that.state.clickedEl = el;
                that.state.focused = el;
                that.show();
              }
              that._g.els.on('click', h.trigger_click)
              break;
            case 'hover': 
              h.trigger_mouseenter = function(e) {
                var el = this;
                if (e.originalEvent) e = e.originalEvent;//work with original event
                that.state.clickedEvent = e;
                that.state.clickedEl = el;
                that.state.focused = document.activeElement;
                that.show();
              }
              h.trigger_mouseleave = function(e) {
                that.hide();
              }
              that._g.els .on('mouseenter', h.trigger_mouseenter)
                          .on('mouseleave', h.trigger_mouseleave)
              break;
            case 'focus':
              h.trigger_focus_click = function(e) {
                if (e.originalEvent) e = e.originalEvent;//work with original event
                (e.preventDefault) ? e.preventDefault() : e.returnValue = false;
              }
              h.trigger_focus = function(e) {
                var el = this;
                if (e.originalEvent) e = e.originalEvent;//work with original event

                that.state.clickedEvent = e;
                that.state.clickedEl = el;
                that.state.focused = el;
                that.show()
              }
              h.trigger_blur = function(e) {
                that.hide()
              }
              that._g.els .on('click', h.trigger_focus_click)
                          .on('focus', h.trigger_focus)
                          .on('blur', h.trigger_blur)
              break;
            case 'follow':
              h.trigger_follow_enter = function(e) {
                 if (e.originalEvent) e = e.originalEvent;//work with original event

                o.placement = [e.pageX + 3, e.pageY + 3];

                that.dom.document.on('mousemove', h.trigger_follow_move)

                that.show();
              }
              h.trigger_follow_move = function(e) {
                if (e.originalEvent) e = e.originalEvent;//work with original event
                if (that.state.status === 'show' || that.state.status === 'shown') {
                  that.position(that._p_checkBounds([e.pageX + 5, e.pageY + 5]))
                }
              }
              h.trigger_follow_leave = function(e) {
                if (e.originalEvent) e = e.originalEvent;//work with original event
                that.dom.document.off('mousemove', h.trigger_follow_move)
                that.hide();
              }
              

              that._g.els .on('mouseenter', h.trigger_follow_enter)
              that._g.els .on('mouseleave', h.trigger_follow_leave)
              break;
          }
        })
        that.on('hide', function() {
          if(this.o.trigger = 'focus') delete that.state.focused;
        })
        that.on('destroy', function() {
          switch (o.trigger) {
            case 'click':
              that._g.els.off('click', trigger_click)
              break;
            case 'hover': 
              that._g.els .off('mouseenter', h.trigger_mouseenter)
                          .off('mouseleave', h.trigger_mouseleave)
              break;
            case 'focus':
              that._g.els .on('click', h.trigger_focus_click)
                          .on('focus', h.trigger_focus)
                          .on('blur', h.trigger_blur)
              break;
            case 'follow':
              console.log(this);
              break;
          }
        })
        that.on('item_inserted', function(item) {
          if (!that._g.popover) return;
          item.dom.modal.css('width', item.dom.modal.css('width'));
        })
        that.on('position', function () {
          if (!this._g.popover) return;

          var that = this,
              o = this.o,
              state = this.state,
              coords = o.placement,
              activeModal = that._getActive();

          if(state.arguments.position.length) {
            coords = state.arguments.position[0];
          }

          coords = (typeof coords === 'function') ? coords.call(this, this._getActive()[0]) : coords;
          coords = that._p_parseCoords(coords);
          if (!(typeof coords == 'object' && coords.length === 2)) {//if our placement still text and we need to calculate position
            coords = this._p_checkBounds(
              this._p_getCoordsFromPlacement(o.placement, state.dimensions)
            );
          }

          state.coords = coords;//computed
        
          if(coords && coords.length === 2) {
            activeModal .css('left', coords[0] + "px")
                        .css('top', coords[1] + "px")
          }
        })
        that.on('item_created', function(item) {
          if(that._g.popover) item.dom.modal.addClass('njb--popover');
          item.toInsert = item.dom.modal;
        })
        that.on('listeners_added', function() {
          var that = this,
              h = this._handlers;
          
          that.dom.container.on('keydown', h.wrap_keydown)
                            .delegate('[data-njb-close]', 'click', h.wrap_close)
                            .delegate('[data-njb-ok]', 'click', h.wrap_ok)
                            .delegate('[data-njb-cancel]', 'click', h.wrap_cancel)
          
        })
        that.on('listeners_removed', function() {
          var that = this,
              h = this._handlers;
          that.dom.container.off('keydown', h.wrap_keydown)
                            .undelegate('[data-njb-close]', 'click', h.wrap_close)
                            .undelegate('[data-njb-ok]', 'click', h.wrap_ok)
                            .undelegate('[data-njb-cancel]', 'click', h.wrap_cancel)
        })
      },
      _p_getCoordsFromPlacement(placement, dimensions) {
        var that = this,
            o = that.o,
            clickedElDimensions = dimensions.clickedEl || dimensions.el;//we can use dimensions from initializing element for setting first coords (case when we call .show programmatically)

        if(!clickedElDimensions) return placement;
        
        var popoverWiderThanClicked = dimensions.modal.width > clickedElDimensions.width,
            popoverTallerThanClicked = dimensions.modal.height > clickedElDimensions.height,
            offset = that._p_parseCoords(o.offset),
            coords = [],
            leftForTopAndBottom,
            topForLeftAndRight;
        
        if (popoverWiderThanClicked) {
          leftForTopAndBottom = clickedElDimensions.left - ((dimensions.modal.width - clickedElDimensions.width) / 2)
        } else {
          leftForTopAndBottom = clickedElDimensions.left + ((clickedElDimensions.width - dimensions.modal.width) / 2)
        }
        if (dimensions.container.scrollLeft) {
          leftForTopAndBottom += dimensions.container.scrollLeft;
        }

        

        if (popoverTallerThanClicked) {
          topForLeftAndRight = clickedElDimensions.top - ((dimensions.modal.height - clickedElDimensions.height) / 2)
        } else {
          topForLeftAndRight = clickedElDimensions.top + ((clickedElDimensions.height - dimensions.modal.height) / 2)
        }
        if (dimensions.container.scrollTop) {
          topForLeftAndRight += dimensions.container.scrollTop;
        }

        switch (placement) {
          case 'center':
            coords[0] = ((dimensions.container.width - dimensions.modal.width) / 2) + dimensions.container.scrollLeft;
            coords[1] = ((dimensions.container.height - dimensions.modal.height) / 2) + dimensions.container.scrollTop
          break;
          
          case 'bottom':
            coords[0] = leftForTopAndBottom;
            coords[1] = (clickedElDimensions.bottom + offset[1]) + dimensions.container.scrollTop;
          break;

          case 'top':
            coords[0] = leftForTopAndBottom;
            coords[1] = (clickedElDimensions.top - dimensions.modal.height - offset[1]) + dimensions.container.scrollTop;
          break;

          case 'left':
            coords[0] = clickedElDimensions.left - dimensions.modal.width - offset[0];
            coords[1] = topForLeftAndRight;
          break

          case 'right':
            coords[0] = clickedElDimensions.right + offset[0];
            coords[1] = topForLeftAndRight;
          break
        }
        
        return coords;
      },
      _p_getDirtyStatus(currentCoords, dimensions) {
        var d = dimensions,
            boundaryCoords = d.container,
            modalCoords = d.modal;

        return {
          left: currentCoords[0] < boundaryCoords.left,
          top: currentCoords[1] < boundaryCoords.top,
          right: currentCoords[0] + modalCoords.width > boundaryCoords.scrollWidth,
          bottom: currentCoords[1] + modalCoords.height > boundaryCoords.scrollHeight
        }
      },
      _p_getOppositeDirection(direction) {
        switch (direction) {
          case 'left':
            return 'right'
          case 'right':
            return 'left'
          case 'top':
            return 'bottom'
          case 'bottom':
            return 'top'
        }
      },
      _p_checkBounds(currentcoords) {
        var that = this,
            o = that.o,
            boundary = o.boundary;
        if(!boundary) return currentcoords;

        var offset = that._p_parseCoords(o.offset),
            dimensions = that.state.dimensions,
            boundaryCoords = dimensions.window,
            fixedCoords = currentcoords,
            dirty = this._p_getDirtyStatus(currentcoords, dimensions);
        
        if (dirty[o.placement] && o.reverse) {
          fixedCoords = this._p_getCoordsFromPlacement(this._p_getOppositeDirection(o.placement), this.state.dimensions)
          dirty = this._p_getDirtyStatus(fixedCoords, dimensions);
        }

        if (boundary) {
          fixedCoords = makeSticky(dirty, fixedCoords);
        }
        
        
        function makeSticky(dirty, coordsToFix) {
          var coords = coordsToFix.slice();

          //fix negative left position
          if (dirty.left) {
            coords[0] = boundaryCoords.left;
          }
        
          //fix negative top position
          if (dirty.top) {
            coords[1] = boundaryCoords.top;
          }
        
          //fix negative right position
          if(dirty.right) {
            coords[0] = (boundaryCoords.scrollWidth - dimensions.modal.width)
          }
        
          //fix negative bottom position
          if (dirty.bottom) {
            coords[1] = (boundaryCoords.scrollHeight - dimensions.modal.height);
          }
          return coords;
        }
        return fixedCoords;
      },
      _p_parseCoords(stringOrArray) {
      	if (typeof stringOrArray === 'string') {
      		if (/\s/.test(stringOrArray)) {
      			var arr = stringOrArray.split(' ')
      			arr[0] = parseFloat(arr[0])
      			arr[1] = parseFloat(arr[1])
      			return arr;
      		} else {
      			return stringOrArray;
      		}
      	} else if(typeof stringOrArray === 'object') {
      		return stringOrArray;
      	}
      }
    }
  })
})();
