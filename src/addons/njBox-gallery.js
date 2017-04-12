/*!
 * njBox gallery addon
 * nejikrofl@gmail.com
 * Copyright (c) 2017 N.J.
*/
(function () {
  if (window.njBox) njBox.addAddon('gallery', {
    options: {},
    prototype: {
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

        this.on('show', function () {
          // that.state.active = this._detectIndexForOpen(index);
        })

        this.on('createRawItems', function () {
          this.rawItems = createRawItems.call(this);
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
