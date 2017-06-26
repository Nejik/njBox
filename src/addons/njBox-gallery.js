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
        prev: 'Previous dialog item',//prev slide button title
        next: 'Next dialog item'//next slide button title
      }
    },
    prototype: {
      _gallery_init: function () {
        var that = this,
          o = this.o,
          $ = this.$;
        this.on('options_setted', function () {
          var o = this.o;
          if (o.gallery) {
            this._globals.gallery = true;
            if(o.layout === "popover") o.layout = "fixed";
          }

          if ($.isArray(o.content)) {
            this._globals.gallery = true
          }
        })
        this.on('items_raw', function () {
          this._gallery_createRawItems();
        })
        this.on('domready', function () {
          if (this._globals.gallery) {
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

            if (o.arrows && !this.state.arrowsInserted && this._globals.gallery) {
              if (this.dom.next[0]) this.dom.ui[0].appendChild(this.dom.next[0]);
              if (this.dom.prev[0]) this.dom.ui[0].appendChild(this.dom.prev[0]);

              this.state.arrowsInserted = true;
            }
          }
        })
        this.on('item_domready', function (item, index) {
          if (this._globals.gallery) item.dom.modalOuter[0].setAttribute('data-njb-index', index);
        })
        this.on('inserted', function () {
          if (that._globals.gallery) {
            this._setQueue(this.state.active);
            that._gallery__uiUpdate();
          }
        })
        this.on('change', function () {
          that._gallery__uiUpdate();
        })
        this.on('listeners_added', function () {
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
        this.on('listeners_removed', function () {
          var h = this._handlers;

          that.dom.wrap
            .undelegate('[data-njb-prev]', 'click', h.wrap_prev)
            .undelegate('[data-njb-next]', 'click', h.wrap_next)
        })
        this.on('position', function () {
          //we need autoheight for prev and next slide in gallery
          if (this._globals.gallery) {
            if (this.queue.prev.index !== null) this._setMaxHeight(this.items[this.queue.prev.index]);
            if (this.queue.next.index !== null) this._setMaxHeight(this.items[this.queue.next.index]);
          }
        })
        this.on('show', function () {
          this.state.active = this._detectIndexForOpen();
        })
        this.on('shown', function () {
          if (this._globals.gallery) {
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
          this.queue.prev.dom.modalOuter[0].parentNode.removeChild(this.queue.prev.dom.modalOuter[0]);
          this.queue.next.dom.modalOuter[0].parentNode.removeChild(this.queue.next.dom.modalOuter[0]);
          //clear position of siblings
          this.queue.prev.dom.modalOuter[0].style.cssText = '';
          this.queue.next.dom.modalOuter[0].style.cssText = '';

          switch (dir) {
            case 'next':
              // set new state
              this.queue.prev = this._getQueueItem(null);
              this.queue.next = this._getQueueItem(index);

              //draw new slides
              this._drawItemSiblings();

              this._changeItem(index, 'next')
              break;
            case 'prev':
              // set new state
              this.queue.prev = this._getQueueItem(index);
              this.queue.next = this._getQueueItem(null);

              //draw new slides
              this._drawItemSiblings();

              //animation to new slide
              this._changeItem(index, 'prev')
              break;
          }
        }
        return this;
      },
      _makeUnfocusable(el, selector) {
        var wrap = this.$(el),
          focusable,
          history = [];
        if (!wrap.length) return history;

        focusable = wrap.find(selector);
        focusable.each(function () {
          history.push({
            el: this,
            tabindex: this.tabIndex || null
          })
          this.tabIndex = '-1';
        })

        return history;
      },
      _restoreUnfocusable(obj) {
        var item = obj.item,
            tabs = obj.tabs,
            dom;

        tabs.forEach(function(tabObj) {
          if(tabObj.tabindex !== null) {
            tabObj.el.setAttribute('tabindex', tabObj.tabindex)
          } else {
            tabObj.el.removeAttribute('tabindex')
          }
        })
      },
      _preload: function () {
        var o = this.o,
          that = this;

        if (!o.preload || this.state.state !== 'shown') return;//we should start preloading only after show animation is finished, because loading images makes animation glitchy

        var temp = o.preload.split(' '),
          prev = parseInt(temp[0]),
          prevState = this._getItemsOrder(this.queue.prev.index)[0],
          next = parseInt(temp[1]),
          nextState = this._getItemsOrder(this.queue.next.index)[2];

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

        if (typeof this.queue.prev.index === 'number') {
          this._moveItem(this.queue.prev.item, -110, '%');
          this._drawItem(this.queue.prev.item, true, this.dom.items[0]);
          this.queue.prev.tabs = this._makeUnfocusable(this.queue.prev.item.dom.modal, o._focusable)
        }
        if (typeof this.queue.next.index === 'number') {
          this._moveItem(this.queue.next.item, 110, '%');
          this._drawItem(this.queue.next.item, false, this.dom.items[0]);
          this.queue.next.tabs = this._makeUnfocusable(this.queue.next.item.dom.modal, o._focusable)
        }
        this.position()
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
          that = this,
          queueBackup = this.$.extend(true, {}, this.queue)

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

        this.state.active = nextIndex;
        this._cb('change', nextIndex);
        this._uiUpdate();

        this._setQueue(nextIndex);

        //restore tabindexes of focusable elements
        this._restoreUnfocusable(queueBackup.prev);
        this._restoreUnfocusable(queueBackup.next);
        
        switch (dir) {
          case 'prev':
            queueBackup.prev.item.dom.body[0].style.verticalAlign = 'middle';//hack for FireFox at least 42.0. When we changing max-height on image it not trigger changing width on parent inline-block element, this hack triggers it

            this._moveItem(queueBackup.current.item, 110, '%');
            this._moveItem(queueBackup.prev.item, 0, '%');
            break;
          case 'next':
            queueBackup.next.item.dom.body[0].style.verticalAlign = 'middle';//hack for FireFox at least 42.0. When we changing max-height on image it not trigger changing width on parent inline-block element, this hack triggers it

            this._moveItem(queueBackup.current.item, -110, '%');
            this._moveItem(queueBackup.next.item, 0, '%');
            break;
        }

        setTimeout(function () {
          if (that.state.state !== 'shown') {
            that.state.itemChanging = false;
            return;//case when we hide modal when slide is changing
          }
          //remove slide that was active before changing
          removeSlide(queueBackup.current.item);

          //remove third slide
          var thirdItem = (dir === 'prev') ? queueBackup.next.index : queueBackup.prev.index;
          if (that.items[thirdItem]) removeSlide(that.items[thirdItem]);//we should check if such slide exist, because it can be null, when o.loop is false

          that._drawItemSiblings();
          that._focus_set(that.items[that.state.active]);
          that.state.itemChanging = false;
          that._cb('changed', that.state.active);

        }, this._getAnimTime(queueBackup.current.item.dom.modalOuter));

        function removeSlide(item) {
          item.dom.modalOuter[0].parentNode.removeChild(item.dom.modalOuter[0])
          item.dom.modalOuter[0].style.cssText = '';
        }
      },
      _detectIndexForOpen: function () {
        var o = this.o,
          that = this,
          index = this.state.active || 0;
        if (this._globals.gallery && o.start - 1 && this.items[o.start - 1]) {//then we check o.start option
          index = o.start - 1;
        }
        //if we have clicked element, take index from it
        if (this._globals.gallery && this.data.els && this.data.els.length && that.state.clickedEl && o.click) {
          this.data.els.each(function (i, el) {
            if (that.state.clickedEl === el) {
              index = i;
              return;
            }
          })
        }

        return index;
      },
      _setQueue: function (currentIndex) {
        var order = this._getItemsOrder(currentIndex);

        this.queue = {
          prev: this._getQueueItem(order[0]),
          current: this._getQueueItem(order[1]),
          next: this._getQueueItem(order[2])
        };
      },
      _getQueueItem(index) {
        var item;
        
        if (index === null) {
          index = null
          item = null
        } else {
          item = this.items[index]
        }

        return {
          index: index,
          item: item
        }
      },
      _getItemsOrder: function (index) {
        var o = this.o,
          prev = index - 1,
          next = index + 1;

        if (o.loop && this.items.length > 2) {
          if (prev === -1) prev = this.items.length - 1;
          if (next === this.items.length) next = 0;
        }
        if (!this.items[prev]) prev = null;
        if (!this.items[next]) next = null;

        return [prev, index, next];
      },
      _gallery__uiUpdate: function (index) {
        index = index || this.state.active;

        var o = this.o,
          item = this.items[index];

        if (!item) this._error('njBox, can\'t update ui info from item index - ' + index);

        //set item counts
        this.dom.wrap.find('[data-njb-current]').html(index + 1 || '')//+1 because indexes are zero-based
        this.dom.wrap.find('[data-njb-total]').html(this.items.length || '')

        if (o.loop && this.items.length >= 3) {
          this.dom.ui.removeClass('njb-ui--no-loop');
          this.dom.prev[0].removeAttribute('disabled')
          this.dom.next[0].removeAttribute('disabled')
        } else {
          this.dom.ui.addClass('njb-ui--no-loop');
          this.dom.prev[0].setAttribute('disabled', true)
          this.dom.next[0].setAttribute('disabled', true)
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

        if (!this._globals.gallery) return;

        if (this.$.isArray(o.content)) {
          this.data.items_raw = o.content;
        } else {
          this.data.els = this._gatherElements(o.gallery);
          this.data.items_raw = [];

          if (this.data.els && this.data.els.length) {
            for (var index = 0; index < this.data.els.length; index++) {
              var element = this.data.els[index],
                gathered_data = this._gatherData(element);
              this._cb('item_gathered', gathered_data, element);
              this.data.items_raw.push(gathered_data)
            }
          }
        }
      },
      _gatherElements: function (selector) {
        if (selector) {
          return this.o.el.find(selector);
        } else {
          return this.o.el;
        }
      }
    }
  })
})();
