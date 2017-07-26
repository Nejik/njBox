/*!
 * njBox - v3.0.0
 * nejikrofl@gmail.com
 * Copyright (c) 2017 N.J.
*/
import {
  isPlainObject,
  defaults,
  text
} from 'lib/utils.js';

var njBox = (function(undefined, setTimeout, document) {

class njBox {
  constructor(options) {
    if (!arguments.length) {
      console.error('njBox, arguments not passed.');
      return;
    }
    let opts,
      that = this;

    opts = options || {};
    that.co = opts;//constructorOptions

    //this allows users to listen init callbacks via .on() on modal instance
    setTimeout(function () {
      that._init();
    }, 0);
  }

  _init() {
    if (this.state && this.state.inited) return;//init only once

    var opts = this.co;//constructorOptions
    delete this.co;

    this._defaults = njBox.defaults;
    this._text = njBox.text;

    //inner options, current state of app, this.state clears after every hide
    this.state = {
      active: 0,
      arguments: {}//here all arguments from public methods are saved (for using in callbacks/events)
    };

    //inner options, this settings alive throughout the life cycle of the plugin(until destroy)
    this._g = {
      optionsPassed: opts
    };

    var o = this.o = Object.assign({}, this._defaults, opts);

    this._cb('options_setted', o);

    //we should have dom element or at least content option for creating item
    if (!o.content) {
      this._e('njBox, no content for popup.');
      return;
    }
    
    // initializing addons
    for (let key in njBox.addons) {
      if (njBox.addons.hasOwnProperty(key)) {
        this['_' + key + '_init']();
      }
    }

    this._cb('dom_ready');

    this._g.animation = this._calculateAnimations();

    this._g.rawItems = [this.o];
    this._cb('items_gathered_raw', this._g.rawItems);

    this.items = this._createItems(this._g.rawItems)

    this._cb('items_created', this.items);
    
    this.state.inited = true;
    this._cb('inited');
  }
  show(index) {
    this._init();//try to init
    this.state.arguments.show = arguments;
    
    var o = this.o;

    if (index !== undefined) state.active = index - 1;

    if(this.state.status === 'hide') {
      clearTimeout(this._g.hiddenCb);
      this._hiddenCb();
    }
    if (this.state.status !== 'inited') {
      this._e('njBox, show, plugin not inited or in not inited state(probably plugin is already visible or destroyed, or smth else..)');
      return;
    }
    if (!this.items.length) {
      this._e('njBox, smth goes wrong, plugin don\'t create any item to show', true);
      return;
    }

    if (this._cb('show') === false) return;//callback show (we can cancel showing popup, if show callback will return false)

    this.returnValue = null;
    
    this._cb('dom_insert');

    this._cb('dom_inserted');

    this.position();//set all positions

    this._anim('show');
    
    return this;
  }
  hide() {
    this.state.arguments.hide = arguments;
    var that = this;

    if(this.state.status === 'show') {
      clearTimeout(this._g.shownCb);
      this._shownCb();
    }

    if (this.state.status !== 'shown') {
      this._e('njBox, hide, we can hide only shown modal (probably animation is still running or plugin destroyed).')
      return;
    }

    if (this._cb('hide') === false) return;//callback hide

    this._anim('hide');
    
    return this;
  }
  position() {
    this.state.arguments.position = arguments;

    var o = this.o,
        state = this.state,
        dimensions;

    if (!state || !state.inited || (state.status !== 'show' && state.status !== 'shown')) return;
    
    this._cb('position');
    this._cb('positioned');

    return this;
  }
  destroy() {
    this.state.arguments.destroy = arguments;
    if (!this.state.inited || this.state.status !== 'inited') {
      this._e('njBox, we can destroy only initialized && hidden modals.');
      return;
    }

    this._removeClickHandler();


    this.dom.container.removeClass('njb-relative');

    this._cb('destroy');

    this._events =
      this._g =
      this._handlers =
      this.items =
      this.itemsRaw =
      this.dom =
      this.$ = undefined;
    this.o = {};


    return this;
  }

  _createItems(itemsRaw) {
    let items = [];
    for (var i = 0, l = itemsRaw.length; i < l; i++) {
      items.push(this._createItem(itemsRaw[i], i))
    }
    return items;
  }
  _createItem(item, index) {
    var o = this.o,
        normalizedItem = this._normalizeItem(item);

    this._cb('item_created', normalizedItem, index);

    return normalizedItem;
  }
  _normalizeItem(item, el) {
    var evaluatedContent;
    
    if (typeof item.content === 'function') {
      evaluatedContent = item.content.call(this, item);
    } else {
      evaluatedContent = item.content;
    }

    var content = evaluatedContent || this.text._missedContent;

    var item = {
      content: content,
      type: item.type,
      header: item.header,
      footer: item.footer,
      title: item.title,
      state: {
        status: 'inited'
      },
      raw: item
    }


    this._cb('item_normalized', item);
    return item;
  }
  _drawItem(item, prepend, container) {
    var o = this.o,
        itemToInsert = item.toInsert;
    
    this._cb('item_prepare', item);
    
    if (item.o.contentInserted) {
      this._cb('item_content_ready', item);
    } else if(o.delayed && (item.type === 'image' || item.type === 'selector')) {
      this._insertItemContent({item, delayed: false});
    }

    if (prepend) {
      container.prepend(itemToInsert)
    } else {
      container.append(itemToInsert);
    }

    this._cb('item_inserted', item);
    if(item.o.contentInserted) this._cb('item_loaded', item);
  }
  _uiUpdate(index = this.state.active) {
    var dom = this.dom,
        o = this.o,
        item = this.items[index];

    if (!item) {
      this._e('njBox, can\'t update ui info from item index - ' + index);
      return;
    }

    //set title
    if (item.title) {
      dom.ui.addClass('njb-ui--title');
    } else {
      dom.ui.removeClass('njb-ui--title');
    }
    dom.wrap.find('[data-njb-title]').html(item.title || '')

    if (item.type === 'image') {
      dom.wrap.removeClass('njb-wrap--content').addClass('njb-wrap--image');
    } else {
      dom.wrap.removeClass('njb-wrap--image').addClass('njb-wrap--content');
    }
  }
  _getActive() {
    return this.items[this.state.active];
  }
  _calculateAnimations() {
    var animations = {
      showName: '',
      hideName: '',
      showDur: 0,
      hideDur:  0
    }
    this._cb('calculate_animations', animations);
    return animations;
  }
  _anim(type) {
    var o = this.o,
      that = this,
      animShow = this._g.animation.show,
      animHide = this._g.animation.hide,
      animShowDur = this._g.animation.showDur,
      animHideDur = this._g.animation.hideDur;


    switch (type) {
      case 'show':
        if (animShow) {
          that._g.shownCb = setTimeout(() => {
              if(that.state.status === 'show') that._shownCb();
            //check if hiding not initialized
          }, animShowDur);
        } else {
          that._shownCb();
        }
        break;
      case 'hide':
        if (animHide) {
          that._g.hiddenCb = setTimeout(() => {
              that._hiddenCb()
          }, animHideDur)
        } else {
          that._hiddenCb();
        }
        break;
    }
  }
  _shownCb() {
    this._cb('shown');
  }
  _hiddenCb() {
    this._clear();
    this._cb('hidden');
    this.state.status = 'inited';
  }















  _clear() {
    var o = this.o;

    this._cb('clear');

    this.state = {
      active: 0,
      arguments: {},
      inited: true
    };

    this._cb('cleared');
  }
  _e(msg, clear) {//_e
    if (!msg) return;

    console.error(msg);
    if (clear) this._clear();
  }
  _cb(type) {//cb - callback
    var o = this.o,
      callbackResult;

    if (type === 'inited' ||
      type === 'show' ||
      type === 'shown' ||
      type === 'hide' ||
      type === 'hidden' ||
      type === 'destroy' ||
      type === 'destroyed'
    ) {
      this.state.status = type;
    }

    //trigger callbacks

    //trigger on modal instance
    this.trigger.apply(this, arguments);


    //trigger common callback function from options
    var cbArgs = Array.prototype.slice.call(arguments);
    if (o['oncb'] && typeof o['oncb'] === 'function') {
      callbackResult = o['oncb'].apply(this, cbArgs);
    }

    //trigger common global callback on instance
    this.trigger.apply(this, ['cb'].concat(cbArgs));


    //trigger callback from options with "on" prefix (e.g. onshow, onhide)
    var clearArgs = Array.prototype.slice.call(arguments, 1);

    if (type === 'ok' || type === 'cancel') {
      let modal = this._getActive().dom.modal,
        prompt_input = modal.find('[data-njb-return]'),
        prompt_value;
      if (prompt_input.length) prompt_value = prompt_input[0].value || null;

      clearArgs.unshift(prompt_value)
      this.returnValue = prompt_value;
    }

    if (typeof o['on' + type] === 'function') {
      callbackResult = o['on' + type].apply(this, clearArgs);
    }
    return callbackResult;
  }

  //event emitter
  on(event, fct) {
    this._events = this._events || {};
    this._events[event] = this._events[event] || [];
    this._events[event].push(fct);

    return this;
  }
  off(event, fct) {
    this._events = this._events || {};
    if (event in this._events === false) return;
    this._events[event].splice(this._events[event].indexOf(fct), 1);
    return this;
  }
  trigger(event /* , args... */) {
    this._events = this._events || {};
    if (event in this._events === false) return;
    for (var i = 0; i < this._events[event].length; i++) {
      this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    return this;
  }
}
//addons
njBox.addons = {}
//default settings
njBox.defaults = defaults;
njBox.text = text;

//todo, разобраться с jquery
// njBox.addAddon = function (name, addon) {
//   njBox.addons[name] = true;

//   if (addon.options) $.extend(true, njBox.defaults, addon.options);
//   $.extend(njBox.prototype, addon.prototype);
// }
return njBox;
})(undefined, setTimeout, document);

export default njBox;