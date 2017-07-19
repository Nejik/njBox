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
        prev: 'Previous gallery item',//prev slide button title
        next: 'Next gallery item'//next slide button title
      }
    },
    prototype: {
      _gallery_init() {
        var that = this,
          o = this.o,
          $ = this.$;
        
        if (o.gallery) {
          that._g.gallery = true;
          if(o.layout === "popover") o.layout = "fixed";
        }

        if ($.isArray(o.content)) {
          that._g.gallery = true
        }
        
        if(!that._g.gallery) return;
        
        this.on('items_raw', function () {
          this._g_createRawItems();
        })
        this.on('domready', function () {
          if (!this._g.gallery) return;

          this.dom.ui_count = $(o.templates.count)
          this.dom.ui.append(this.dom.ui_count)

          this.dom.ui_current = this.dom.ui_count.find('[data-njb-current]')
          this.dom.ui_current.attr('title', o.text.current)
          this.dom.ui_total = this.dom.ui_count.find('[data-njb-total]')
          this.dom.ui_total.attr('title', o.text.total)

          this.dom.prev = $(o.templates.prev);
          this.dom.prev.attr('title', o.text.prev);
          this.dom.next = $(o.templates.next)
          this.dom.next.attr('title', o.text.next);

          if (o.arrows && this._g.gallery && !this._g.arrowsInserted) {
            if (this.dom.next[0]) this.dom.ui.append(this.dom.next);
            if (this.dom.prev[0]) this.dom.ui.append(this.dom.prev);

            this._g.arrowsInserted = true;
          }
        })
        this.on('item_created', function (item, index) {
          if (this._g.gallery) item.dom.modalOuter.attr('data-njb-index', index);
        })
        this.on('inserted', function () {
          if (!that._g.gallery) return

          this._g_setQueue(this.state.active);
          that._g__uiUpdate();
        })
        // this.on('item_inserted', function (item) {
        //   if (!this._g.gallery) return; 
        //   // if(this.state.status === 'shown') that.position();
        // })
        this.on('change', function () {
          that._g__uiUpdate();
        })
        this.on('changed', function () {
          this._g_preload()
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

          if (that._g.gallery) {
            that.dom.wrap.undelegate('[data-njb-prev]', 'click', h.wrap_prev)
                         .undelegate('[data-njb-next]', 'click', h.wrap_next)
          }
        })
        this.on('positioned', function () {
          //we need autoheight for prev and next slide in gallery
          if (!this._g.gallery) return; 

          if (this.state.status === 'shown') {
            if (this.queue.prev.index !== null) this._setMaxHeight(this.items[this.queue.prev.index]);
            if (this.queue.next.index !== null) this._setMaxHeight(this.items[this.queue.next.index]);
          }
          
        })
        this.on('show', function () {
          this.state.active = this._g_detectIndexForOpen();
        })
        this.on('shown', function () {
          if (!this._g.gallery) return;

          this._g_drawItemSiblings()
          this._g_preload()
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
      prev() {
        // if (this.dom.prev[0]) this.dom.prev[0].focus();
        this._g_changeItem(this.state.active - 1, 'prev');

        return this;
      },
      next() {
        // if (this.dom.next[0]) this.dom.next[0].focus();
        this._g_changeItem(this.state.active + 1, 'next');

        return this;
      },
      goTo(index) {
        index = index - 1;//inside gallery we have index -1, because slides starts from 0

        if (typeof index !== 'number') {
          this._error('njBox, wrong index argument in goTo method.')
          return;
        }

        if (this.state.status === 'inited' || this.state.status === 'show') {
          this.state.active = index;
          return;
        } else if (this.state.status !== 'shown'
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
              this.queue.prev = this._g_getQueueItem(null);
              this.queue.next = this._g_getQueueItem(index);

              //draw new slides
              this._g_drawItemSiblings();

              this._g_changeItem(index, 'next')
              break;
            case 'prev':
              // set new state
              this.queue.prev = this._g_getQueueItem(index);
              this.queue.next = this._g_getQueueItem(null);

              //draw new slides
              this._g_drawItemSiblings();

              //animation to new slide
              this._g_changeItem(index, 'prev')
              break;
          }
        }
        return this;
      },
      _g_makeUnfocusable(el, selector) {
        var $ = this.$,
            wrap = $(el),
            focusable,
            history = [];
        if (!wrap.length) return history;

        focusable = wrap.find(selector);
        focusable.each(function () {
          history.push({
            el: $(this),
            tabindex: this.tabIndex || null
          })
          this.tabIndex = '-1';
        })
        return history;
      },
      _g_restoreUnfocusable(obj) {
        var item = obj.item,
            tabs = obj.tabs,
            dom;
        
        if(tabs) tabs.forEach(function(tabObj) {
          if(tabObj.tabindex !== null) {
            tabObj.el.attr('tabindex', tabObj.tabindex)
          } else {
            tabObj.el[0].removeAttribute('tabindex')
          }
        })
      },
      _g_preload() {
        var o = this.o,
          that = this;

        if (!o.preload || this.state.status !== 'shown') return;//we should start preloading only after show animation is finished, because loading images makes animation glitchy

        var temp = o.preload.split(' '),
          prev = parseInt(temp[0]),
          prevState = this._g_getItemsOrder(this.queue.prev.index)[0],
          next = parseInt(temp[1]),
          nextState = this._g_getItemsOrder(this.queue.next.index)[2];

        //load next
        while (next--) {
          preload.call(this, nextState);
          nextState = this._g_getItemsOrder(nextState)[2];
        }

        //load previous
        while (prev--) {
          preload.call(this, prevState);
          prevState = this._g_getItemsOrder(prevState)[0]
        }

        function preload(index) {
          if (index === null) return;
          var item = this.items[index],
            content = item.content;

          if (item.o.status !== 'loading' && item.o.status !== 'loaded' && item.type === 'image') document.createElement('img').src = content;
        }
      },
      _g_drawItemSiblings() {
        var o = this.o,
          that = this;
        if (typeof that.queue.prev.index === 'number') {
          that._g_moveItem(that.queue.prev.item, -110, '%');
          that._drawItem(that.queue.prev.item, true, that.dom.items);
          that.queue.prev.tabs = that._g_makeUnfocusable(that.queue.prev.item.dom.modal, o._focusable)
        }
        if (typeof that.queue.next.index === 'number') {
          that._g_moveItem(that.queue.next.item, 110, '%');
          that._drawItem(that.queue.next.item, false, that.dom.items);
          that.queue.next.tabs = that._g_makeUnfocusable(that.queue.next.item.dom.modal, o._focusable)
        }
        that.position();
      },
      _g_moveItem(item, value, unit) {
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
      _g_changeItem(nextIndex, dir) {
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

        this._g_setQueue(nextIndex);

        //restore tabindexes of focusable elements
        this._g_restoreUnfocusable(queueBackup.prev);
        this._g_restoreUnfocusable(queueBackup.next);
        
        switch (dir) {
          case 'prev':
            queueBackup.prev.item.dom.body[0].style.verticalAlign = 'middle';//hack for FireFox at least 42.0. When we changing max-height on image it not trigger changing width on parent inline-block element, this hack triggers it

            this._g_moveItem(queueBackup.current.item, 110, '%');
            this._g_moveItem(queueBackup.prev.item, 0, '%');
            break;
          case 'next':
            queueBackup.next.item.dom.body[0].style.verticalAlign = 'middle';//hack for FireFox at least 42.0. When we changing max-height on image it not trigger changing width on parent inline-block element, this hack triggers it

            this._g_moveItem(queueBackup.current.item, -110, '%');
            this._g_moveItem(queueBackup.next.item, 0, '%');
            break;
        }

        setTimeout(function () {
          if (that.state.status !== 'shown') {
            that.state.itemChanging = false;
            return;//case when we hide modal when slide is changing
          }
          //remove slide that was active before changing
          removeSlide(queueBackup.current.item);

          //remove third slide
          var thirdItem = (dir === 'prev') ? queueBackup.next.index : queueBackup.prev.index;
          if (that.items[thirdItem]) removeSlide(that.items[thirdItem]);//we should check if such slide exist, because it can be null, when o.loop is false

          that._g_drawItemSiblings();
          that._set_focus(that.items[that.state.active]);
          that.state.itemChanging = false;
          that._cb('changed', that.state.active);

        }, this._getAnimTime(queueBackup.current.item.dom.modalOuter));

        function removeSlide(item) {
          item.dom.modalOuter[0].parentNode.removeChild(item.dom.modalOuter[0])
          item.dom.modalOuter[0].style.cssText = '';
        }
      },
      _g_detectIndexForOpen() {
        var o = this.o,
          that = this,
          index,
          showArg = this.state.arguments.show.index;

        if (showArg !== undefined) this.state.active = showArg - 1;

        index = this.state.active || 0;

        if (this._g.gallery && o.start - 1 && this.items[o.start - 1]) {//then we check o.start option
          index = o.start - 1;
        }
        //if we have clicked element, take index from it
        if (this._g.gallery && this._g.els && this._g.els.length && that.state.clickedEl && o.click) {
          this._g.els.each(function (i, el) {
            if (that.state.clickedEl === el) {
              index = i;
              return;
            }
          })
        }

        return index;
      },
      _g_setQueue(currentIndex) {
        var order = this._g_getItemsOrder(currentIndex);

        this.queue = {
          prev: this._g_getQueueItem(order[0]),
          current: this._g_getQueueItem(order[1]),
          next: this._g_getQueueItem(order[2])
        };
      },
      _g_getItemsOrder(index) {
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
      _g_getQueueItem(index) {
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
      _g__uiUpdate(index) {
        index = index || this.state.active;

        var o = this.o,
          item = this.items[index];

        if (!item) this._error('njBox, can\'t update ui info from item index - ' + index);

        //set item counts
        this.dom.wrap.find('[data-njb-current]').html(index + 1 || '')//+1 because indexes are zero-based
        this.dom.wrap.find('[data-njb-total]').html(this.items.length || '')

        //arrow classes
        if (index === 0) {
          this.state.gallery_first = true;
          this.dom.ui.addClass('njb-ui--first');
        } else {
          this.state.gallery_first = false;
          this.dom.ui.removeClass('njb-ui--first');
        }

        if (index === this.items.length - 1) {
          this.state.gallery_last = true;
          this.dom.ui.addClass('njb-ui--last');
        } else {
          this.state.gallery_last = false;
          this.dom.ui.removeClass('njb-ui--last');
        }

        //only one class
        if (this.items.length === 1) {
          this.state.gallery_only = true;
          this.dom.ui.addClass('njb-ui--only');
        } else {
          this.state.gallery_only = false;
          this.dom.ui.removeClass('njb-ui--only');
        }

        if (o.loop && this.items.length >= 3) {
          this.state.gallery_noloop = false;
          this.dom.ui.removeClass('njb-ui--no-loop');
        } else {
          this.state.gallery_noloop = true;
          this.dom.ui.addClass('njb-ui--no-loop');
        }

        if (this.state.gallery_noloop) {
          if (this.state.gallery_first) {
            this.dom.prev.attr('disabled', true)
          } else {
            this.dom.prev[0].removeAttribute('disabled')
          }
          if (this.state.gallery_last) {
            this.dom.next.attr('disabled', true)
          } else {
            this.dom.next[0].removeAttribute('disabled')
          }
        }
      },
      _g_createRawItems() {
        var o = this.o;

        if (!this._g.gallery) return;

        if (this.$.isArray(o.content)) {
          this._g.items_raw = o.content;
        } else {
          this._g.els = this._g_g_gatherElements(o.gallery);
          this._g.items_raw = [];

          if (this._g.els && this._g.els.length) {
            for (var index = 0; index < this._g.els.length; index++) {
              var element = this._g.els[index],
                gathered_data = this._gatherData(element);
              this._cb('item_gathered', gathered_data, element);
              this._g.items_raw.push(gathered_data)
            }
          }
        }
      },
      _g_g_gatherElements(selector) {
        if (selector) {
          return this.o.el.find(selector);
        } else {
          return this.o.el;
        }
      }
    }
  })
})();
