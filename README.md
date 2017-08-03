# njBox
Highly customizable pure javascript modal window/lightbox/popover.

* [Install](#install)
  * [npm](#npm)
  * [manual](#manual)
* [Dependencies](#dependencies)
* [Usage](#usage)
* [Customization](#customization)
  * [Options](#options)
  * [Templates](#templates)
  * [Text](#text)
  * [Changing default settings globally](#changing-default-settings-globally)
* [API](#api)
* [Events](#events)
* [Delegate attributes](#delegate-attributes)
* [Tips](#tips)
* [Examples](#examples)
* [License](#license)

React wrapper - todo

Vue wrapper - todo

Angular wrapper - todo

## Install

### npm

### manual

1. Download `njBox.min.css` and `njBox.min.js` files from the `dist` folder.
2. Include css in head
```html
<link rel="stylesheet" href="njBox.min.css" />
```
3. Include js before closing ```</body>``` tag
```html
<script src="njBox.min.js"></script>
```

## Dependencies

Plugin have **no dependencies** and support all modern browsers (ie11+). But, if you need to support older browsers, you can include jQuery, plugin will find and use it, you don't need to configure anything here. Also if you need ie10, 9 for example, you can insert some polyfills without jQuery at all.

## Usage

You can initialize plugin in few ways:
1) Bootstrap style autoinitialization (HTML api, without js at all), all settings you should set in data-njb-* attributes

```html
<a href="#modalDiv" data-toggle="modal">Show popup</a>
<!-- or -->
<button data-toggle="modal" data-njb-content="#modalDiv">Show popup</button>

<!-- or gallery (with gallery addon)-->
<div data-njb-gallery="a" data-toggle="modal">
  <a href="img1.jpg"><img src="img1.jpg"></a>
  <a href="img2.jpg"><img src="img2.jpg"></a>
  <a href="img3.jpg"><img src="img3.jpg"></a>
</div>
```
2. Javascript style (if you need callbacks or advanced api)

HTML

```html
<a href="#modalDiv" id="myModal">Show popup</a>
<div id="modalDiv">
  my modal window
</div>
```

javascript

```js
var modal = new njBox('#myModal')
// or
var modal = new njBox({elem:'#myModal'})
// or with options
var modal = new njBox('#myModal', {scrollbar:'show'})
// or
var modal = new njBox({elem: '#myModal', scrollbar:'show'})

// gallery example (only with gallery addon)
var gallery = new njBox({
  elem: '.gallery',
  gallery: 'a'
})
```

## Customization

You can pass an object with custom options in js initialization or use data-njb-* if you want html api.
Also you can pass all options as json in one attribute njb-options.

P.S. You can't use callbacks with html api.

HTML API example

```html
<a href="#modalDiv" id="myModal" data-njb-backdrop="false" data-njb-close="inside" data-njb-scrollbar="show">Show popup</a>
```

JS options example

```js
var modal = new njBox({
  elem:'#myModal',
  backdrop: false,
  close: 'inside',
  scrollbar: 'show',
  onshow: function() {},
  onshown: function() {},
  onhide: function() {},
  onshidden: function() {}//more callbacks in advanced section
})
```
Options priority example:

1. defaults from njBox.defaults
2. options passed as object in constructor (e.g. new njBox({content:"constructor"})
3. global JSON data object from data-njb-options (e.g. data-njb-options='{"content": "test2"}')
4. content form "href" attribute if it is link (only for "content" option) (e.g. &lt;a href="#modal"&gt;show modal&lt;/a&gt;)
4. content from "title" attribute (or other attribute form options, only for "title" option) (e.g. &lt;a href="pathToImg" title="My awesome image!"&gt;show modal&lt;/a&gt;)
5. data-njb-* separate options (e.g. data-njb-content="test3")

Example

```html
<a href="content from href" class="modal" data-njb-content="content from separate data" data-njb-options='{"content": "content from data options"}'>image</a>
```
```js
var modal = new njBox({elem: '.modal', content: 'content from constructor'});
```
In this example "content" option calculated in next priority:
1) njBox plugin: meow, put some content here... (default text if "content" is undefined)
2) content from constructor
3) content from data options
4) content from href
5) content from data-njb-content

"content from separate data" eventually won and modal will show this text.

### Options

| Name  | Default | Type | Description |
| :--- | :---: | :--- | :--- |
| elem | '' | selector \|\| dom\jQuery element | dom element for triggering modal
| content | undefined | string \|\| function | content for modal
| delayed | true | boolean | Interesting option, that works only for selector and image types. When its true with selector type, dom element will not be touched until show, and will be returned to dom after hiding modal. When its true and type image, images will not be loading on initialization, loading starts when show method calls
| type | undefined | html \|\| selector \|\| text \|\| image \|\| template | type of content, if selector used, whole element will be inserted in modal. Template similar to html, but template inserted without .njb__body tag(header/footer also not inserted), directly to .njb
| header | undefined | html | html that will be added as modal header
| footer | undefined | html | html that will be added as modal footer
| class | false | string | classnames(separated with space) that will be added to modal wrapper, you can use it for styling (theming)
| zindex | false | boolean false \|\| number | zindex that will be set on modal, probably not a good idea to use this option, set it in css and use o.class instead
| container | body | body \|\|  selector \|\| dom\jQuery element | appends modal to specific element
| layout | fixed | fixed \|\| absolute \|\| popover | how popup will be positioned. For most cases fixed is good, but when we insert popup inside element(not document), absolute position sets automatically, popover mode works only with popover addon)
| click | true | boolean | should we set click handler on element(o.elem)?
| clickels | false | selector \|\| dom\jQuery element| additional elements that can trigger same modal window (very often on landing pages you need few buttons to open one modal window)
| backdrop | boolean | true | should we show backdrop (black overlay)?
| backdropassist | true | boolean | if true, animation durations of modal will automatically sets to backdrop to be in sync (it can be calculatied automatically from css)
| scrollbar | hide | show \|\| hide | should we hide scrollbar from page?
| out | true | boolean | click outside modal will close it, false also adds fancy animation when somebody tries to close modal with outside click
| esc | true | boolean | close modal when esc button pressed?
| close | outside | inside \|\| outside \|\| boolean false | add close button inside or outside popup or don't add at all
| autoheight | image | boolean \|\| image | should we fit modal height to window height? if image is selected, only images will be autoheighted
| autofocus | true | boolean, selector \|\| dom\jQuery element | set focus to element, after modal is shown, also you may use autofocus attribute without this option
| focusprevious | true | boolean | focus previous modal window after hiding current modal. (only for case when we open two or more modal windows)
| title | undefined | string \|\| boolean false | title (usually for image)
| titleattr | title | string \|\| boolean false | attribute from which we gather title
| img | ready | load \|\| ready | we should wait until img will fully loaded or show as soon as size will be known (ready is useful for progressive images and show image faster)
| anim | 'scale' | false \|\| string | name of animation, or string with space separated 2 names of show/hide animation (default same as `scale scale`). 2 predefined animations are built in: scale and fade.
| animclass | animated | string | additional class that will be added to modal window during animation (can be used for `animate.css` or other css animation libraries)
| duration | auto | string \|\| number \|\| auto | duration of animations, or string with space separated 2 durations of show/hide animation. You can set 'auto 100' if you want to set only duration for hide. It should be used when problems with auto detection (but I have not seen this problem yet ^^)
| jquery | undefined |  | !!! jQuery NOT required for plugin, plugin can work with it to support old browsers !!! link to jquery (for modules without global scope) P.S. Plugin will try to found jquery in global namespace even without this option.
| autobind | [data-toggle~="box"], [data-toggle~="modal"] | selector | selector that will be used for autobind (can be used only with changing global default properties) Usage: njBox.defaults.autobind = '.myAutoBindSelector'
| buttonrole | 'button' | button \|\| boolean false | this role will be set to elements, which opens modal window
| role | 'dialog' | dialog \|\| alertdialog \|\| boolean false | role that will be set to modal dialog https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_alertdialog_role
| label | false | string \|\| boolean false | add aria-label attribute to support screenreaders
| labelledby | false | string \|\| boolean false | add aria-labelledby attribute to support screenreaders
| describedby | false | string \|\| boolean false | add aria-describedby attribute to support screenreaders
| _focusable | in description | selector | Default: **a[href], area[href], details, iframe, object, embed, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]**. This elements we will try to focus in popup shown after option o.autofocus.
| **Gallery options** | | |  
| gallery | '' | selector | child items selector, for gallery elements (galleries created only with this option)
| arrows | true | boolean | should we add navigation arrows
| start | false | number | slide number, from which we should show gallery (not zero based, first slide is number 1)
| loop | true | boolean | show first slide when call `next` on last slide and vice versa. Requires three or more slides. If there are less than 3 slides, option will be set to false automatically
| preload | '1 1' | boolean false \|\| string | space separated string with 2 numbers, how much images we should preload before and after active slide (1 image before and after will be preloaded always, even if you set false in this option)
| **Popover options** | | | 
| trigger | 'click' | boolean false \|\| click \|\| hover \|\| follow | how popover is triggered
| placement | 'bottom' | string \|\| array \|\| function | coordinates or designations for positioning popover. Coordinates as string should be space separated 2 numbers (e.g. "100 100") or if it is array, it should be array with 2 numbers (e.g. [100,100]). Designations can be - top || right || bottom || left || center. Top,right,bottom,left are relative to clicked element, but "center" relative to window. Also when a function is used to determine the placement, it is called with the popover DOM node as its first argument and the triggering element DOM node as second, 'this' context is set to the popover instance.
| reverse | true | boolean | should we reverse direction left/right top/bottom if no space for popover?
| offset | '10 10' | string \|\| array | (default '5 5' for trigger:'follow' case) Offset of the popover relative to its target for all triggers except follow. For follow trigger it is offset from mouse coordinates.
| boundary | true | boolean | should popover stay in window boundaries?

### Templates

```js
templates: {
  wrap: '<div class="njb-wrap"><div class="njb-items"></div></div>',
  backdrop: '<div class="njb-backdrop"></div>',
  modalOuter: '<div class="njb-outer" data-njb-outer></div>',
  modal: '<aside class="njb" tabindex="-1"></aside>',
  body: '<div class="njb__body" data-njb-body></div>',
  header: '<header class="njb__header" data-njb-header></header>',
  footer: '<footer class="njb__footer" data-njb-footer></footer>',
  close: '<button type="button" class="njb-ui__close" data-njb-close>×</button>',
  focusCatcher: '<a href="#!" class="njb-focus-catch">This link is just focus catcher of modal window, link do nothing.</a>',
  preloader:   '<div class="njb-preloader"><div class="njb-preloader__inner"><div class="njb-preloader__bar1"></div><div class="njb-preloader__bar2"></div><div class="njb-preloader__bar3"></div></div></div>',
  ui:          '<div class="njb-ui"></div>',
  title:       '<div class="njb-ui__title-outer"><div class="njb-ui__title-inner" data-njb-title></div></div>',

  //Gallery addon templates
  count:       '<div class="njb-ui__count"><span data-njb-current>1</span> / <span data-njb-total>2</span></div>',
  prev:        '<button type="button" class="njb-ui__arrow njb-ui__arrow--prev" data-njb-prev></button>',
  next:        '<button type="button" class="njb-ui__arrow njb-ui__arrow--next" data-njb-next></button>'
}
```

### Text

```js
text: {
  _missedContent: 'njBox plugin: meow, put some content here...',//text for case, when slide have no content
  preloader:      'Loading...',//title on preloader element
  imageError:     '<a href="%url%">This image</a> can not be loaded.',
  close:          'Close (Esc)',//title on close button
  ok:             'Ok',//text on 'ok' button when dialog modal(alert, prompt, confirm) or in any other custom type
  cancel:         'Cancel',//text on 'cancel' button when dialog modal(alert, prompt, confirm) or in any other custom type
  placeholder:    ''//placeholder for prompt input
  
  //Gallery addon text
  current:        'Current slide',
  total:          'Total slides',
  prev:           'Previous (Left arrow key)',//prev slide button title
  next:           'Next (Right arrow key)',//next slide button title
}
```

### Changing default settings globally
If you need to change default settings to all modals in your project, you can do it via changing njBox.defaults

```js
njBox.defaults.autobind = '.myAutoBindSelector';
njBox.defaults.scrollbar = 'show';
njBox.defaults.backdrop =  false;
```

## API

P.S. All public method are chainable (like jQuery methods)

"new njBox" returns instance of modal. Later you can call public methods on this instance.
```js
//create instance
var modal = new njBox('#myModalLink');
//use api
modal	
.show(index)//index - for gallery, from what index we should show gallery
.hide()
.position()//can be used, when you made your custom ui... or whatever
.destroy()
.update()//update just recreate all slides with current settings (can be used when you add images to gallery dynamically)
.on(event, handler)//add event listener
.off(event, handler)//remove event listener

//Gallery addon methods
.prev()
.next()
.goTo(index)

```

Also plugin have some useful static methods and properties on njBox class.
```js
njBox.get(selector)//method tat return instance of modal from this selector/dom element
njBox.autobind(selector)//autoinitialize modals (bootstrap style) from data-attributes. It fires automatically on document.ready
njBox.addons//object with included addons (gallery, popover for example)
njBox.defaults//object with default options P.S. you can change it before any initialization
njBox.templates//object with default templates P.S. you can change it before any initialization
njBox.text//object with default text P.S. you can change it before any initialization
njBox.addAddon(name, addon)//register addon, addon structure you can see in njBox-gallery.js addon

//imitation of defaut dialog methods
njBox.alert(message, okCallback, cancelCallback)
njBox.confirm(message, okCallback, cancelCallback)
njBox.prompt(message, placeholder, okCallback, cancelCallback)//result from input you can gather from first argument in callbacks and in this.returnValue
```

## Events

| Title  | Callback name | Arguments | Description |
| :--- | :--- | :---: | :--- |
| init | oninited | - | First event, here you can set some defaults. 
| options_set | onoptions_set | - | When options set... Here you can manipulate options, add/change. (this.o)
| options_gathered | onoptions_gathered | optionsObject, element | Options gathered from dom element (data-njb-* attributes, href, title, etc)
| options_setted | onoptions_setted | optionsObject | **Helper for options_set. See description below table.**
| dom_create | ondom_create | - | When most global dom elements creates, wrapper, ui, etc (this.dom)
| dom_created | ondom_created | - | **Helper for dom_create. See description below table.**
| items_gather | onitems_gather | - | When the rough data is collected (this._g.rawItems). From this we will create items (slides) for show.
| items_gathered | onitems_gathered | itemsArray | **Helper for items_gather. See description below table.**
| item_normalized | onitem_normalized | itemNormalizedObject, itemRawDataObject | When from raw data we create normalized item to show.
| item_create | onitem_create | itemObject, index | When we create dom for item from state. Index can be used in array with all items (this.items).
| item_loaded | onitem_item_loaded | itemObject | **Can be async!** When content inserted in item, this event can be async in images slides for examples.
| item_created | onitem_created | itemObject, index | **Helper for item_create. See description below table.**
| items_created | onitems_created | itemsArray | When all items created. For usual modal or popover it always will be 1 item.
| inited | oninited | - | When plugin initialized and all preliminary work done.
| show | onshow | - | When modal begin to show. <br /> P.S. If you return false in onshow callback, showing modal will be canceled.
| show_prepare | onshow_prepare | - | When you should do some related stuff before showing modal. As example at this step plugin hides scrollbar, shows backdrop overlay, etc.
| listeners_added | onlisteners_added | - | Here you can add your custom event listeners.
| show_prepared | onshow_prepared | - | **Helper for show_prepare. See description below table.**
| dom_insert | ondom_insert | - | When inserting global wrapper/ui into page.
| item_inserted | onitem_inserted | itemObject | When inserting item to plugin wrapper. (as example used in gallery addon, when you need to do some actions when new slide inserted into page)
| item_ready | onitem_ready | itemObject | When item(slide) in dom and fully loaded. As example, image type can be inserted in dom, but still loading with preloader, those not ready, and only after loading this event will fire.
| dom_inserted | ondom_inserted | - | **Helper for dom_insert. See description below table.**
| position | onposition | - | When position needs changes and we should set coordinates for our element.
| positioned | onpositioned | - | **Helper for position. See description below table.**
| animation_show | onanimation_show | - | When showing animation starts.
| shown | onshown | - | When show animation finished.
| hide | onhide | - | When modal begin to hide. <br /> P.S. If you return false in onhide callback, hiding modal will be canceled.
| hide_prepare | onhide_prepare | - | When you should do some related stuff before hiding modal. As example at this step plugin shows scrollbar, hides backdrop overlay, etc.
| listeners_removed | onlisteners_removed | - | Here you can remove your custom event listeners.
| animation_hide | onanimation_hide | - | When hiding animation starts.
| clear | onclear | - | When hide animation finished and we should remove stuff from dom and similar work.
| hidden | onhidden | - | When hide animation finishedand all stuff removed from dom.
| item_img_ready | onitem_img_ready | itemObject | When we have data about image size, but image not fully loaded. P.S. image dom element can be found in itemObject.dom.img[0]
| item_img_load | onitem_img_load | itemObject | When image fully loaded. P.S. image dom element can be found in itemObject.dom.img[0]
| item_img_true | onitem_img_true | itemObject | When image is ready for inserting in dom, depending on o.img option. P.S. image dom element can be found in itemObject.dom.img[0]
| ok | onok | - | When closing by clicking on element with data-njb-ok attribute. Used for callbacks in dialogs. Fires before hide event.
| cancel | oncancel | - | When closing by clicking on element with data-njb-cancel attribute. Used for callbacks in dialogs. Fires before hide event.
| cb | oncb | event, event_arguments | Global callback that calls for EVERY event (first argument) that you can use for making some global changes. <br /> P.S. Using this callback allow you to listen callback twice, first event will fire in oncb callback where you can do some magic with all events, and later when you initialize modal in code with usual oninited, onshow, etc callbacks.

* Helper events pursue a single goal - when they fire, all user/addons callbacks related to helper fired. It's important for addons, as example we can use options_set event. One addon change some option, and second addon also changes this option. You can use options_setted event to be sure all callbacks/addons fires and now options are final.

1. Using callbacks
```js
var modal = new njBox({
  elem:'#myModalLink',
  onshow: function() {
    console.log('Show my modal! :)')
    // this in callbacks always refers to modal instance, so you have access to: this.o, this.dom, this.items, this.state
  },
  onhidden: function() {
    console.log('My modal is hidden :(')
    // this in callbacks always refers to modal instance, so you have access to: this.o, this.dom, this.items, this.state
  }
});
```
2. Listen events on created modal instance with .on method
```js
var modal = new njBox({elem:'#myModalLink'});
modal.on('shown', function() {
  console.log('My modal is shown!')
})
//or at once
var modal = new njBox({elem:'#myModalLink'})
                                            .on('shown', function() {
                                              console.log('My modal is shown!')
                                              // this in event callbacks always refers to modal instance, so you have access to: this.o, this.dom, this.items, this.state
                                            }).on('hidden', function() {
                                              console.log('My modal is hidden!')
                                            })
```
## Delegate attributes
For most events we using delegate method that binds on elements with specific attribute. For example if you need custom close button in your modal, you don't need to manage it with js api (but of course you can), you can add to button ```data-njb-close``` attribute. Also this attributes used as markers for dom creation, if you need to customize templates.

List of interactive attributes:

| Title  | Description |
| :--- | :--- |
| data&#x2011;njb&#x2011;close | Closes modal 
| data&#x2011;njb&#x2011;return | On hide, plugin will try to find input with this attribute and get value from it. Value will be stored in instance.returnValue variable, until next show, and will be avaliable as argument in onok, oncancel callbacks.
| data&#x2011;njb&#x2011;prev | Go to previous slide in gallery
| data&#x2011;njb&#x2011;next | Go to next slide in gallery
| data&#x2011;njb&#x2011;ok | Closes modal. onok callback will be triggered.
| data&#x2011;njb&#x2011;cancel | Closes modal. oncancel callback will be triggered.
| autofocus | On show, plugin will try to find element with this attribute and focus it

Markers for dom creation:

| Title  | Description |
| :--- | :--- |
| data&#x2011;njb&#x2011;header | In this element plugin will insert header text.
| data&#x2011;njb&#x2011;footer | In this element plugin will insert footer text.
| data&#x2011;njb&#x2011;body | In this element plugin will insert content of item(slide).
| data&#x2011;njb&#x2011;title | In this element title of current item(slide) will be inserted.
| data&#x2011;njb&#x2011;current | In this element current active index will be inserted.
| data&#x2011;njb&#x2011;total |  In this element total amount of slides will be inserted.

## Tips

## Examples

## License

njBox is licensed under the [MIT License](http://www.tldrlegal.com/license/mit-license)