/*!
 * njBox - v3.0.0
 * nejikrofl@gmail.com
 * Copyright (c) 2017 N.J.
 * MIT license
*/

//abstract main class, without anything related to dom, just state management
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

    this.o = opts;

    this._cb('options_set');
    this._cb('options_setted', this.o);

    //we should have content for creating item
    if (!this.o.elem && !this.o.content) {
      this._e('njBox, no elements (o.elem) or content (o.content) for modal.');
      return;
    }

    this.dom = {};
    this._cb('dom_create');
    this._cb('dom_created', this.dom);

    this._g.rawItems = [this.o];
    this._cb('items_gather');
    this._cb('items_gathered', this._g.rawItems);

    this.items = this._createItems(this._g.rawItems)
    this._cb('items_created', this.items);
    if (!this.items.length) {
      this._e('njBox, smth goes wrong, plugin don\'t create any item to show', true);
      return;
    }
    
    this.state.inited = true;
    this._cb('inited');
    
    return this;
  }
  show() {
    this._init();//try to init
    this.state.arguments.show = arguments;

    //if popup is hiding now, force to end hide and start show
    if(this.state.status === 'hide') {
      clearTimeout(this._g.hiddenCb);
      this._hiddenCb();
    }

    if (this.state.status !== 'inited') {
      this._e('njBox, show, plugin not inited or in not inited state(probably plugin is already visible or destroyed, or smth else..)');
      return;
    }

    if (this._cb('show') === false) return;//callback show (we can cancel showing popup, if show callback will return false)

    this._cb('show_prepare');

    this._cb('animation_show');

    //dont forget manually call  _shownCb here after animation end
    
    return this;
  }
  hide() {
    this.state.arguments.hide = arguments;

    if(this.state.status === 'show') {
      clearTimeout(this._g.shownCb);
      this._shownCb();
    }

    if (this.state.status !== 'shown') {
      this._e('njBox, hide, we can hide only shown modal (probably animation is still running or plugin destroyed).')
      return;
    }

    if (this._cb('hide') === false) return;//callback hide

    this._cb('hide_prepare');

    this._cb('animation_hide');
    
    //dont forget manually call  _hiddenCb here after animation end

    return this;
  }
  position() {
    this.state.arguments.position = arguments;

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

    this._cb('destroyed');

    this._events =
    this.o =
    this.state = 
    this._g =
    this.items =
    this.dom = {};

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

    this._cb('item_create', normalizedItem, index);
    this._cb('item_created', normalizedItem, index);

    return normalizedItem;
  }
  _normalizeItem(itemRaw, el) {
    var evaluatedContent;
    
    if (typeof itemRaw.content === 'function') {
      evaluatedContent = itemRaw.content.call(this, itemRaw);
    } else {
      evaluatedContent = itemRaw.content;
    }

    var item = {
      content: evaluatedContent,
      type: itemRaw.type,
      header: itemRaw.header,
      footer: itemRaw.footer,
      title: itemRaw.title,
      state: {
        status: 'inited'
      },
      raw: itemRaw
    }

    this._cb('item_normalized', item, itemRaw);
    return item;
  }
  _getActive() {
    return this.items[this.state.active];
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
      type === 'destroy'
    ) {
      this.state.status = type;
    }

    //trigger callbacks

    //trigger on modal instance
    this.trigger.apply(this, arguments);



    var cbArgs = Array.prototype.slice.call(arguments);

    //trigger common global callback on instance
    this.trigger.apply(this, ['cb'].concat(cbArgs));

    //trigger common callback function from options
    if (o && o['oncb'] && typeof o['oncb'] === 'function') {
      callbackResult = o['oncb'].apply(this, cbArgs);
    }

    //trigger callback from options with "on" prefix (e.g. onshow, onhide)
    var clearArgs = Array.prototype.slice.call(arguments, 1);

    if (o && typeof o['on' + type] === 'function') {
      callbackResult = o['on' + type].apply(this, clearArgs);
    }
    
    if(type === 'show' && callbackResult === false) {
      this.state.status = 'inited';
    } else if(type === 'hide' && callbackResult === false) {
      this.state.status = 'shown';
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
      if(typeof this._events[event][i] === 'function') this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    return this;
  }
}

export default njBox;