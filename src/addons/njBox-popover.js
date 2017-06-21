/*!
 * njBox gallery addon
 * nejikrofl@gmail.com
 * Copyright (c) 2017 N.J.
*/
(function () {
  if (window.njBox) njBox.addAddon('popover', {
    options: {
      // placement: 'bottom'//(string || function) Where popover should be placed - top || right || bottom || left || center. Top/right\bottom\left are relative to clicked element, but "center" relative to window.
    },
    prototype: {
      _popover_init: function () {
        var that = this,
          o = this.o,
          $ = this.$;
        
        this.on('options_setted', function () {
          var o = this.o;
          
        })
        
      }
    }
  })
})();
