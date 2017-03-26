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

Options list:

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
| clickels | '' | selector \|\| dom\jQuery element| additional elements that can trigger same modal window (very often on landing pages you need few links to open one modal window)
| backdrop | boolean | true | should we show backdrop?
| backdropassist | true | boolean | if true, animation durations of modal will automatically sets to backdrop to be in sync
| scrollbar | hide | show \|\| hide | should we hide scrollbar from page?
| out | true | boolean | click outside modal will close it, false also adds fancy animation when somebody tries to close modal with outside click
| esc | true | boolean | close modal when esc button pressed?
| close | outside | inside \|\| outside \|\| boolean false | add close button inside or outside popup or don't add at all
| autoheight | image | boolean \|\| image | should we set maximum height of modal? if image is selected, only images will be autoheighted
| autofocus | false | boolean false, selector \|\| dom\jQuery element | set focus to element, after modal is shown, also you may use autofocus attribute without this option
| title | '' | string \|\| boolean false | title (usually for image)
| title_attr | title | string \|\| boolean false | attribute from which we gather title for slide (used in galleries)
| gallery | '' | selector | child items selector, for gallery elements.
| arrows | true | boolean | should we add navigation arrows
| start | false | number | slide number, from which we should show gallery
| loop | true | boolean | show first image when call `next` on last slide and vice versa. Requires three or more images. If there are less than 3 slides, option will be set to false automatically
| preload | '1 1' | boolean false \|\| string | space separated string with 2 numbers, how much images we should preload before and after active slide

| templates | object | object | **More detailed under this table!** object with html templates for all modal parts



| anim | 'scale' | false \|\| string | name of animation, or string with space separated 2 names of show/hide animation (default same as `scale scale`)
| animclass | animated | string | additional class that will be added to modal window during animation (can be used for `animate.css` or other css animation libraries)
| duration | auto | string \|\| number \|\| auto | duration of animations, or string with space separated 2 durations of show/hide animation. You can set 'auto 100' if you want to set only duration for hide. It should be used when problems with auto detection (but I have not seen this problem ^^)
| img | load | load \|\| ready | we should wait until img will fully loaded or show as soon as size will be known (ready is useful for progressive images)
| text | object | object | **More detailed under this table!** object with locale strings
| autobind | [data-toggle~="modal"] | selector | selector that will be used for autobind (can be used only with changing global default properties) Set it after njModal.js is inserted njModal.defaults.autobind = '.myAutoBindSelector'


## Tips

## Examples

## License

njBox is licensed under the [MIT License](http://www.tldrlegal.com/license/mit-license)