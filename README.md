# njBox
Highly customizable pure javascript modal window.

## Install

### npm

### Manual

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
1) Bootstrap style (without js at all), all settings you should set in data-njb-* attributes

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



## Tips

## Examples

## License

njBox is licensed under the [MIT License](http://www.tldrlegal.com/license/mit-license)