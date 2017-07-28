/*!
 * njBox - v3.0.0
 * nejikrofl@gmail.com
 * Copyright (c) 2017 N.J.
*/
class njBox_base {
  constructor(options) {
    console.log('constructor based');
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

    this._cb('init');

    var opts = this.co;//constructorOptions
    delete this.co;

    //inner options, current state of app, this.state clears after every hide
    this.state = {
      active: 0,
      arguments: {}//here all arguments from public methods are saved (for using in callbacks/events)
    };

    //inner options, this settings alive throughout the life cycle of the plugin(until destroy)
    this._g = {
      optionsPassed: opts
    };

    var o = opts;

    this._cb('options_setted', o);

    // initializing addons
    for (let key in njBox_base.addons) {
      if (njBox.addons.hasOwnProperty(key)) {
        this['_' + key + '_init']();
      }
    }

    //we should have content for creating item
    if (!o.content) {
      this._e('njBox, no content for popup.');
      return;
    }

    this._cb('dom_create');

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

    if (index !== undefined) this.state.active = index - 1;

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

    var o = this.o;

    if (!this.state || !this.state.inited || (this.state.status !== 'show' && this.state.status !== 'shown')) return;
    
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

    this._cb('destroy');

    this._events =
      this.o =
      this.state = 
      this._defaults = 
      this._text =
      this._g =
      this._handlers =
      this.items =
      this.itemsRaw =
      this.dom =
      this.$ = undefined;

    this._cb('destroyed');

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
    switch (type) {
      case 'show':
        this._cb('show_animation');
        break;
      case 'hide':
        this._cb('hide_animation');
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
    if (o && o['oncb'] && typeof o['oncb'] === 'function') {
      callbackResult = o['oncb'].apply(this, cbArgs);
    }
    //trigger common global callback on instance
    this.trigger.apply(this, ['cb'].concat(cbArgs));


    //trigger callback from options with "on" prefix (e.g. onshow, onhide)
    var clearArgs = Array.prototype.slice.call(arguments, 1);

    if (o && typeof o['on' + type] === 'function') {
      callbackResult = o['on' + type].apply(this, clearArgs);
    }

    console.log('cb', arguments);
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
njBox_base.addons = {}

njBox_base.addAddon = function (name, addon) {
  njBox_base.addons[name] = true;

  if (addon.options) Object.assign(njBox_base.defaults, addon.options);
  Object.assign(njBox_base.prototype, addon.prototype);
}
export default njBox_base;