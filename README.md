# njBox
Highly customizable pure javascript modal window/lightbox/popover.

**Simple easy and the complex possible.**

React wrapper - todo

Angular wrapper - todo

Vue wrapper - todo

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

Plugin have **no dependencies** and support all modern browsers (ie11+). But, if you need to support older browsers, you can include jQuery that supports older browsers, plugin will find it and will use it, you don't need to configure anything here. Also if you need ie10,9 for example, you can insert some polyfills without jQuery at all.

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
// same as previous
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
5) content from separate data

"content from separate data" eventually won and modal will show this text.

### Options list:

| Name  | Default | Type | Description |
| :--- | :---: | :--- | :--- |
| elem | '' | selector \|\| dom\jQuery element | dom element for triggering modal
| content | undefined | string \|\| function | content for modal
| type | '' | html \|\| selector \|\| text \|\| image | type of content, if selector used, whole element will be inserted in modal
| header | undefined | html | html that will be added as modal header
| footer | undefined | html | html that will be added as modal footer
| class | false | string | classnames(separated with space) that will be added to modal wrapper, you can use it for styling (theming)
| zindex | false | boolean false \|\| number | zindex that will be set on modal, probably not a good idea to use this option, set it in css and use o.class instead
| container | body | body \|\|  selector \|\| dom\jQuery element | appends modal to specific element
| position | fixed | fixed \|\| absolute | how popup will be positioned. For most cases fixed is good, but when we insert popup inside element, not document, absolute position sets automatically
| click | true | boolean | should we set click handler on element? (if no)
| clickels | '' | selector \|\| dom\jQuery element| additional elements that can trigger same modal window (very often on landing pages you need few buttons to open one modal window)
| backdrop | boolean | true | should we show backdrop?
| backdropassist | true | boolean | if true, animation durations of modal will automatically sets to backdrop to be in sync (it can be calculatied automatically from css)
| scrollbar | hide | show \|\| hide | should we hide scrollbar from page?
| out | true | boolean | click outside modal will close it, false also adds fancy animation when somebody tries to close modal with outside click
| esc | true | boolean | close modal when esc button pressed?
| close | outside | inside \|\| outside \|\| boolean false | add close button inside or outside popup or don't add at all
| autoheight | image | boolean \|\| image | should we set maximum height of modal? if image is selected, only images will be autoheighted
| autofocus | false | boolean false, selector \|\| dom\jQuery element | set focus to element, after modal is shown, also you may use autofocus attribute without this option
| focusprevious | true | boolean | focus previous modal window  (case when we open two or more modal windows)
| title | '' | string \|\| boolean false | title (usually for image)
| title_attr | title | string \|\| boolean false | attribute from which we gather title for slide (used basically in galleries)
| img | ready | load \|\| ready | we should wait until img will fully loaded or show as soon as size will be known (ready is useful for progressive images)
| imgload | show | init \|\| show | should we load gallery images on init(even before dialog open, on init) or on open
| anim | 'scale' | false \|\| string | name of animation, or string with space separated 2 names of show/hide animation (default same as `scale scale`). 2 predefined animations are built in: scale and fade.
| animclass | animated | string | additional class that will be added to modal window during animation (can be used for `animate.css` or other css animation libraries)
| duration | auto | string \|\| number \|\| auto | duration of animations, or string with space separated 2 durations of show/hide animation. You can set 'auto 100' if you want to set only duration for hide. It should be used when problems with auto detection (but I have not seen this problem ^^)
| jquery | undefined | 123 | !!! jQuery NOT required for plugin, plugin can work with it to support old browsers !!! link to jquery (for modules without global scope) P.S. Plugin will try to found jquery in global namespace even without this option.
| autobind | [data-toggle~="box"], [data-toggle~="modal"] | selector | selector that will be used for autobind (can be used only with changing global default properties) Usage: njBox.defaults.autobind = '.myAutoBindSelector'
| _focusable | a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable] | selector | this elements we will try to focus in popup shown after option o.autofocus
| templates | object | object | **More detailed under this table!** object with html templates for all modal parts. P.S. you cant change this from html api.
| text | object | object | **More detailed under this table!** object with locale strings P.S. you cant change this from html api.
| **Gallery&nbsp;addon** | | |
| gallery | '' | selector | child items selector, for gallery elements (galleries created with this option)
| arrows | true | boolean | should we add navigation arrows
| start | false | number | slide number, from which we should show gallery (not zero based, first slide is number 1)
| loop | true | boolean | show first slide when call `next` on last slide and vice versa. Requires three or more slides. If there are less than 3 slides, option will be set to false automatically
| preload | '1 1' | boolean false \|\| string | space separated string with 2 numbers, how much images we should preload before and after active slide (1 image before and after will be preloaded alwsys, even if you set false in this option)


### o.templates

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

### o.text

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

Also plugin have some useful methods on njBox class.
```js
njBox.get(selector)//method tat return instance of modal from this selector/dom element
njBox.autobind()//autoinitialize modals (bootstrap style) from data-attributes. It fires automatically on document.ready
njBox.addons//object with included addons
njBox.defaults//object with default options P.S. you can change it of course before any initialization
njBox.addAddon(name, addon)//register addon, addon structure you can see in njBox-gallery.js addon
```

## Events

| Title  | Callback name | Arguments | Description |
| :--- | :--- | :---: | :--- |
| inited | oninited | - | When instance inited(all data gathered, dom created, events prepared, etc.) P.S. init method calls async in next event loop or in show method whichever comes first.
| show | onshow | - | When modal begin to show. <br /> P.S. If you return false in onshow callback, showing modal will be canceled.
| shown | onshown | - | After show animation finished.
| hide | onhide | - | When modal begin to hide. <br /> P.S. If you return false in onhide callback, hiding modal will be canceled.
| hidden | onhidden | - | After hide animation finished.
| **Advanced&nbsp;events** | | | **Events below basically used for creating addons enhancing functionality of plugin, but of course you can use it also.**
| options_gathered | onoptions_gathered | dataObject, domEl | When options gathered from dom element. P.S. You can modify options in this object
| options_setted | onoptions_setted | optionsObject | When all gather options steps complete, object with this options will be used in plugin
| domready | ondomready | domObject | When all global dom elements needed for plugin is created P.S. Mainly els from this.dom object
| item_gathered | onitem_gathered | dataObject, domEl | **Gallery addon only.** Called for every item(slide). When options for each item(slide) gathered from dom element. P.S. You can modify options in this object
| items_raw | onitems_raw | object | When plugin gather els and data for items. Item is a unit to show (for example in gallery each slide is item)
| item_created | onitem_created | itemObject, index | Called for every item(slide). When dom created for each item. P.S. dom element you can find in item.dom object
| data_gathered | ondata_gathered | dataObject, domEl | On gathering data from dom element (data-njb-* atrributes, title, content, etc.) <br /> P.S. In ondata_gathered callback you can modify dataObject if you need some custom logic on gathering data.
| item_domready | onitem_domready | itemObject | When dom for item created (called for each slide in gallery). <br /> P.S. in onitem_domready callback you can make your custom logic on dom elements for each slide under itemObject.dom.* (If customization templates not enough Oo)
| events_setted | onevents_setted | - |When event handlers attached. <br />Mostly for making addons.
| item_prepare | onitem_prepare | itemObject | Before insert item. Called before inserting delayed content. <br /> Read in tips section about delayed content.
| item_content_ready | onitem_content_ready | itemObject | When content inserted into item.
| item_inserted | onitem_inserted | itemObject | After item inserted.
| item_ready | onitem_ready | itemObject | Calls when item fully loaded AND INSERTED IN DOM.
| position | onposition | - | When calculation position triggered (window/container scroll/resize). In position we make autoheight and different calculation for position:absolute.
| item_img_ready | onitem_img_ready | itemObject | When image starts downloading and we have first info about width/height, but image not fully loaded. P.S. image dom element can be found in itemObject.dom.img[0]
| item_img_load | onitem_img_load | itemObject | When image fully loaded. P.S. image dom element can be found in itemObject.dom.img[0]
| item_img_true | onitem_img_true | itemObject | When image is ready, depending on o.img option
| ok | onok | - | When closing by clicking on element with data-njb-ok attribute. Used for callbacks in dialogs. Fires before hide event.
| cancel | oncancel | - | Called always, except case when clicked element with data-njb-ok. Used for callbacks in dialogs. Fires before hide event.
| events_removed | onevents_removed | - | When event handlers detached. <br />Mostly for making addons.
| clear | onclear | - |After hiding when we remove all unnecessary data. <br />Mostly for making addons.
| cb | oncb | event, event_arguments | Global callback that calls for EVERY event (first argument) that you can use for making some global changes. <br /> P.S. Using this callback allow you to listen callback twice, first event will fire in oncb callback where you can do some magic with all events, and later when you initialize modal in code with usual oninited, onshow, etc callbacks.

We can use events in 2 ways:

1. Using callbacks
```js
var modal = new njBox({
  elem:'#myModalLink',
  onshow: function() {
    console.log('Show my modal! :)')
    // this in callbacks always refers to modal instance, so you have access to: this.o, this.dom, this.data, this.items, this.state
  },
  onhidden: function() {
    console.log('My modal is hidden :(')
    // this in callbacks always refers to modal instance, so you have access to: this.o, this.dom, this.data, this.items, this.state
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
                                              // this in event callbacks always refers to modal instance, so you have access to: this.o, this.dom, this.data, this.items, this.state
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

List of template attributes:

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