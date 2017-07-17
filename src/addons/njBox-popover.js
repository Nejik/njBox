/*!
 * njBox gallery addon
 * nejikrofl@gmail.com
 * Copyright (c) 2017 N.J.
*/
(function () {
  if (window.njBox) njBox.addAddon('popover', {
    options: {
      layout         :'fixed',//(fixed || absolute || popover), how popup will be positioned. For most cases fixed is good, but when we insert popup inside other element, not document, absolute position sets automatically. popover mode works only with popover addon)
      placement      :'bottom',//(string || array || function) coordinates or designations for positioning popover. Coordinates as string should be space separated 2 numbers (e.g. "100 100") or if it is array, it should be array with 2 numbers (e.g. [100,100]). Designations can be - top || right || bottom || left || center. Top,right,bottom,left are relative to clicked element, but "center" relative to window. Also when a function is used to determine the placement, it is called with the popover DOM node as its first argument and the triggering element DOM node as its second, this context is set to the popover instance.
      reverse        : true,//(boolean) should we reverse direction left/right top/bottom if no space for popover
      offset         : '10 10',//(string or array) popover specific option. Offset of the popover relative to its target
	    boundary       : true//(boolean) popover specific option. Should popover stay in window boundaries?
    },
    prototype: {
      _popover_init: function () {
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
        }
        if(!that._g.popover) return;
        
        that.on('position', function () {
          var that = this,
              o = this.o,
              state = this.state,
              coords = o.placement,
              activeModal = that.items[that.state.active].dom.modal;
          
          if (!this._g.popover) return;

          if(state.arguments.position.length) {
            coords = state.arguments.position[0];
          }

          coords = (typeof coords === 'function') ? coords.call(this, this.items[this.state.active].dom.modal[0]) : coords;
          coords = that._p_parseCoords(coords);

          if (!(typeof coords == 'object' && coords.length === 2)) {//if our placement still text and we need to calculate position
            coords = this._p_checkBounds(
              this._p_getCoordsFromPlacement(o.placement, state.dimensions)
            );
          }

          state.coords = coords;//computed
        
          if(coords && coords.length === 2) {
            activeModal .css('width', state.dimensions.modal.width + "px")
                        .css('left', coords[0] + "px")
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
            o = that.o;
        
        var popoverWiderThanClicked = dimensions.modal.width > dimensions.clickedEl.width,
            popoverTallerThanClicked = dimensions.modal.height > dimensions.clickedEl.height,
            offset = that._p_parseCoords(o.offset),
            coords = [],
            leftForTopAndBottom,
            topForLeftAndRight;
        
        if (popoverWiderThanClicked) {
          leftForTopAndBottom = dimensions.clickedEl.left - ((dimensions.modal.width - dimensions.clickedEl.width) / 2)
        } else {
          leftForTopAndBottom = dimensions.clickedEl.left + ((dimensions.clickedEl.width - dimensions.modal.width) / 2)
        }
        if (dimensions.container.scrollLeft) {
          leftForTopAndBottom += dimensions.container.scrollLeft;
        }

        

        if (popoverTallerThanClicked) {
          topForLeftAndRight = dimensions.clickedEl.top - ((dimensions.modal.height - dimensions.clickedEl.height) / 2)
        } else {
          topForLeftAndRight = dimensions.clickedEl.top + ((dimensions.clickedEl.height - dimensions.modal.height) / 2)
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
            coords[1] = (dimensions.clickedEl.bottom + offset[1]) + dimensions.container.scrollTop;
          break;

          case 'top':
            coords[0] = leftForTopAndBottom;
            coords[1] = (dimensions.clickedEl.top - dimensions.modal.height - offset[1]) + dimensions.container.scrollTop;
          break;

          case 'left':
            coords[0] = dimensions.clickedEl.left - dimensions.modal.width - offset[0];
            coords[1] = topForLeftAndRight;
          break

          case 'right':
            coords[0] = dimensions.clickedEl.right + offset[0];
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
