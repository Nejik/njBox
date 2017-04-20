/*!
 * njBox gallery addon
 * nejikrofl@gmail.com
 * Copyright (c) 2017 N.J.
*/
(function () {
  if (window.njBox) njBox.addAddon('gallery', {
    options: {
      gallery: '',//(selector) child items selector, for gallery elements.
      arrows: true,//(boolean) should we add navigation arrows
      start: false,//(number) slide number, from which we should show gallery (not zero based, first slide is number 1)
      loop: true,//(boolean), show first image when call next on last slide and vice versa. Requires three or more images. If there are less than 3 slides, option will be set to false automatically.
      preload: '1 1',//(boolean false || string) space separated string with 2 numbers, how much images we should preload before and after active slide (1 image before and after will be preloaded alwsys, even if you set false in this option)

      templates: {
        count: '<div class="njb-ui__count"><span data-njb-current>1</span> / <span data-njb-total>1</span></div>',
        prev: '<button type="button" class="njb-ui__arrow njb-ui__arrow--prev" data-njb-prev></button>',
        next: '<button type="button" class="njb-ui__arrow njb-ui__arrow--next" data-njb-next></button>'
      },
      text: {
        current: 'Current slide',
        total: 'Total slides',
        prev: 'Previous (Left arrow key)',//prev slide button title
        next: 'Next (Right arrow key)',//next slide button title
      }
    },
    prototype: {
      _gallery_init: function () {
        var that = this,
          o = this.o,
          $ = this.$;
        this.on('options_setted', function () {
          var o = this.o;
          if (o.gallery) this.state.gallery = true;

          if ($.isArray(o.content)) {
            this.state.gallery = true
          }
        })
        this.on('items_raw', function () {
          this._gallery_createRawItems();
        })
        this.on('domready', function () {
          if (this.state.gallery) {
            this.dom.ui_count = $(o.templates.count)
            this.dom.ui[0].appendChild(this.dom.ui_count[0])

            this.dom.ui_current = this.dom.ui_count.find('[data-njb-current]')
            this.dom.ui_current[0].setAttribute('title', o.text.current)
            this.dom.ui_total = this.dom.ui_count.find('[data-njb-total]')
            this.dom.ui_total[0].setAttribute('title', o.text.total)

            this.dom.prev = $(o.templates.prev);
            this.dom.prev[0].setAttribute('title', o.text.prev);
            this.dom.next = $(o.templates.next)
            this.dom.next[0].setAttribute('title', o.text.next);

            if (o.arrows && !this.state.arrowsInserted && this.state.gallery) {
              if (this.dom.next[0]) this.dom.ui[0].appendChild(this.dom.next[0]);
              if (this.dom.prev[0]) this.dom.ui[0].appendChild(this.dom.prev[0]);

              this.state.arrowsInserted = true;
            }
          }
        })
        this.on('item_domready', function (item, index) {
          if (this.state.gallery) item.dom.modalOuter[0].setAttribute('data-njb-index', index);
        })
        this.on('inserted', function () {
          if (that.state.gallery) {
            this._setItemsOrder(this.state.active);
            that._gallery__uiUpdate();
          }
        })
        this.on('change', function () {
          that._gallery__uiUpdate();
        })
        this.on('events_setted', function () {
          var o = this.o,
            that = this,
            h = this._handlers;

          h.wrap_prev = function (e) {
            that.prev();
            e.preventDefault();
          }
          h.wrap_next = function (e) {
            that.next();
            e.preventDefault();
          }

          this.dom.wrap
            .delegate('[data-njb-prev]', 'click', h.wrap_prev)
            .delegate('[data-njb-next]', 'click', h.wrap_next)
        })
        this.on('events_removed', function () {
          var h = this._handlers;

          this.dom.wrap
            .undelegate('[data-njb-prev]', 'click', h.wrap_prev)
            .undelegate('[data-njb-next]', 'click', h.wrap_next)
        })
        this.on('position', function () {
          //we need autoheight for prev and next slide in gallery
          if (this.state.gallery) {
            if (this.state.itemsOrder[0] !== null) this._setMaxHeight(this.items[this.state.itemsOrder[0]]);
            if (this.state.itemsOrder[2] !== null) this._setMaxHeight(this.items[this.state.itemsOrder[2]]);
          }
        })
        this.on('show', function () {
          this.state.active = this._detectIndexForOpen();
        })
        this.on('shown', function () {
          if (this.state.gallery) {
            that._drawItemSiblings();
            this._preload();
          }
        })
        this.on('keydown', function (e) {
          var o = this.o;
          switch (e.which) {
            case 37://left arrow
              that.prev();
              e.preventDefault();
              break;
            case 39://right arrow
              that.next();
              e.preventDefault();
              break;
          }
        })
        var origGalleryState;
        this.on('clear', function () {
          origGalleryState = this.state.gallery;
        })
        this.on('cleared', function () {
          this.state.gallery = origGalleryState;
        })
      },
      prev: function () {
        // if (this.dom.prev[0]) this.dom.prev[0].focus();
        this._changeItem(this.state.active - 1, 'prev');

        return this;
      },
      next: function () {
        // if (this.dom.next[0]) this.dom.next[0].focus();
        this._changeItem(this.state.active + 1, 'next');

        return this;
      },
      goTo: function (index) {
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
      },
      _preload: function () {
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
      },
      _drawItemSiblings: function () {
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
      },
      _moveItem: function (item, value, unit) {
        unit = unit || 'px';

        //detect translate property
        if (njBox.g.transform['3d']) {
          item.dom.modalOuter[0].style.cssText = njBox.g.transform.css + ': translate3d(' + (value + unit) + ',0,0)'
        } else if (njBox.g.transform['css']) {
          item.dom.modalOuter[0].style.cssText = njBox.g.transform.css + ': translateX(' + (value + unit) + ')'
        } else {
          item.dom.modalOuter[0].style.cssText = 'left:' + (value + unit)
        }
      },
      _changeItem: function (nextIndex, dir) {
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
        this._uiUpdate();

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
      },
      _detectIndexForOpen() {
        var o = this.o,
          that = this,
          index = this.state.active || 0;
        if (this.state.gallery && o.start - 1 && this.items[o.start - 1]) {//then we check o.start option
          index = o.start - 1;
        }
        //if we have clicked element, take index from it
        if (this.state.gallery && this.data.els && this.data.els.length && that.state.clickedEl && o.click) {
          this.data.els.each(function (i, el) {
            if (that.state.clickedEl === el) {
              index = i;
              return;
            }
          })
        }

        return index;
      },
      _setItemsOrder(currentIndex) {
        this.state.itemsOrder = this._getItemsOrder(currentIndex);
      },
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
      },
      _gallery__uiUpdate(index) {
        index = index || this.state.active;

        var o = this.o,
          item = this.items[index];

        if (!item) this._error('njBox, can\'t update ui info from item index - ' + index);

        //set item counts
        this.dom.wrap.find('[data-njb-current]').html(index + 1 || '')//+1 because indexes are zero-based
        this.dom.wrap.find('[data-njb-total]').html(this.items.length || '')

        if(o.loop && this.items.length >= 3) {
          this.dom.ui.removeClass('njb-ui--no-loop');
        } else {
          this.dom.ui.addClass('njb-ui--no-loop');
        }

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

        //only one class
        if (this.items.length === 1) {
          this.dom.ui.addClass('njb-ui--only');
        } else {
          this.dom.ui.removeClass('njb-ui--only');
        }
      },
      _gallery_createRawItems: function () {
        var o = this.o;
        
        if(!this.state.gallery) return;

        if (this.$.isArray(o.content)) {
          this.data.items_raw = o.content;
        } else {
          this.data.els = this._gatherElements(o.gallery);
          this.data.items_raw = [];

          if (this.data.els && this.data.els.length) {
            for (var index = 0; index < this.data.els.length; index++) {
              var element = this.data.els[index],
                gathered_data = this._gatherData(element);
                console.log(gathered_data);
              this._cb('item_gathered', gathered_data, element);
              this.data.items_raw.push(gathered_data)
            }
          }
        }





      },
      _gatherElements(selector) {
        if (selector) {
          return this.o.el.find(selector);
        } else {
          return this.o.el;
        }
      }
    }
  })
})();
