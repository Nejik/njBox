# njBox
Highly customizable pure javascript modal window.

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

## Usage

You can initialize plugin in few ways:
1) Bootstrap style (HTML api, without js at all), all settings you should set in data-njb-* attributes

```html
<a href="#modalDiv" data-toggle="modal">Show popup</a>
<!-- or -->
<button data-toggle="modal" data-njb-content="#modalDiv">Show popup</button>
<!-- or gallery-->
<div class="gallery" data-njb-gallery="a" data-toggle="modal">
  <a href="img1.jpg" class="link"><img src="img1.jpg" alt=""></a>
  <a href="img2.jpg" class="link"><img src="img2.jpg" alt=""></a>
  <a href="img3.jpg" class="link"><img src="img3.jpg" alt=""></a>
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
  //or
  var modal = new njBox({elem:'#myModal'})
  // or with options
  var modal = new njBox('#myModal', {option1:value1})
  //gallery example
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

### Options list:

| Name  | Default | Type | Description |
| :--- | :---: | :--- | :--- |
| elem | '' | selector \|\| dom\jQuery element | dom element for triggering modal
| content | undefined | string | content for modal
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
| title | '' | string \|\| boolean false | title (usually for image)
| title_attr | title | string \|\| boolean false | attribute from which we gather title for slide (used basically in galleries)
| img | ready | load \|\| ready | we should wait until img will fully loaded or show as soon as size will be known (ready is useful for progressive images)
| imgload | show | init \|\| show | should we load gallery images on init(even before dialog open, on init) or on open
| gallery | '' | selector | child items selector, for gallery elements (galleries created with this option)
| arrows | true | boolean | should we add navigation arrows
| start | false | number | slide number, from which we should show gallery (not zero based, first slide is number 1)
| loop | true | boolean | show first image when call `next` on last slide and vice versa. Requires three or more images. If there are less than 3 slides, option will be set to false automatically
| preload | '1 1' | boolean false \|\| string | space separated string with 2 numbers, how much images we should preload before and after active slide (1 image before and after will be preloaded alwsys, even if you set false in this option)
| anim | 'scale' | false \|\| string | name of animation, or string with space separated 2 names of show/hide animation (default same as `scale scale`). 2 predefined animations are built in: scale and fade.
| animclass | animated | string | additional class that will be added to modal window during animation (can be used for `animate.css` or other css animation libraries)
| duration | auto | string \|\| number \|\| auto | duration of animations, or string with space separated 2 durations of show/hide animation. You can set 'auto 100' if you want to set only duration for hide. It should be used when problems with auto detection (but I have not seen this problem ^^)
| jquery | undefined | 123 | !!! jQuery NOT required for plugin, plugin can work with it to support old browsers !!! link to jquery (for modules without global scope) P.S. Plugin will try to found jquery in global namespace even without this option.
| templates | object | object | **More detailed under this table!** object with html templates for all modal parts. P.S. you cant change this from html api.
| text | object | object | **More detailed under this table!** object with locale strings P.S. you cant change this from html api.
| autobind | [data-toggle~="box"], [data-toggle~="modal"] | selector | selector that will be used for autobind (can be used only with changing global default properties) Usage: njBox.defaults.autobind = '.myAutoBindSelector'
| _focusable | a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable] | selector | this elements we will try to focus in popup shown after option o.autofocus

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

  current:        'Current slide',
  total:          'Total slides',
  close:          'Close (Esc)',//title on close button
  prev:           'Previous (Left arrow key)',//prev slide button title
  next:           'Next (Right arrow key)',//next slide button title

  ok:             'Ok',//text on 'ok' button when dialog modal(alert, prompt, confirm) or in any other custom type
  cancel:         'Cancel',//text on 'cancel' button when dialog modal(alert, prompt, confirm) or in any other custom type
  placeholder:    ''//placeholder for prompt input
}
```

## API

## Events

## Delegate attributes

## Tips

## Examples

## License

njBox is licensed under the [MIT License](http://www.tldrlegal.com/license/mit-license)