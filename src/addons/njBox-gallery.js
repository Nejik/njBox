/*!
 * njBox gallery addon
 * nejikrofl@gmail.com
 * Copyright (c) 2017 N.J.
*/
(function () {
  if (window.njBox) njBox.addAddon('gallery', {
    options: {
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
      prev: function () {
        this._changeItem(this.state.active - 1, 'prev');

        return this;
      },
      next: function () {
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
      _gallery_init: function () {
        var that = this,
          o = this.o,
          $ = this.$;

        if (this.state.gallery) {
          this.dom.prev = $(o.templates.prev);
          this.dom.prev[0].setAttribute('title', o.text.prev);
          this.dom.next = $(o.templates.next)
          this.dom.next[0].setAttribute('title', o.text.next);
        }

        this.on('rawItems', function () {
          this.rawItems = createRawItems.call(this);
        })
        this.on('domready', function () {
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
        })
        this.on('inserted', function () {
          if (that.state.gallery) {
            this._setItemsOrder(this.state.active);
          }
          that._gallery__uiUpdate();
        })
        this.on('change', function () {
          that._gallery__uiUpdate();
        })
      },
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
      }
    }
  })
  function createRawItems() {
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

})();
