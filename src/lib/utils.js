export function getDefaultInfo() {
	let options = {};

	//calculate scrollbar width
	var scrollDiv = document.createElement("div");
	scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -99px;';
	document.body.appendChild(scrollDiv);
	options.scrollbarSize = (scrollDiv.offsetWidth - scrollDiv.clientWidth) || 0;
	document.body.removeChild(scrollDiv);
	//end calculate scrollbar width
	
	//detect features

	//ie8 and below
	options.oldIE = !!(document.all && !document.addEventListener);

	//touch interface
	options.touch = 'ontouchstart' in window;

	//detect css3 support
	let h = options;

	h.nativeDialogSupport = !!document.createElement('dialog').showModal;
	h.transition = styleSupport('transition');
	h.transitionDuration = styleSupport('transitionDuration');
	h.transform = styleSupport('transform');
	h.animation = styleSupport('animation');

	function styleSupport(prop) {
		var vendorProp, supportedProp,
			prefix, prefixes = ["Webkit", "Moz", "O", "ms"],
			capProp = prop.charAt(0).toUpperCase() + prop.slice(1),// Capitalize first character of the prop to test vendor prefix
			div = document.createElement("div");

		document.body.insertBefore(div, null);

		if (prop in div.style) {
			supportedProp = prop;// Browser supports standard CSS property name
			prefix = null;
		} else {
			for (var i = 0; i < prefixes.length; i++) {// Otherwise test support for vendor-prefixed property names
				vendorProp = prefixes[i] + capProp;

				if (vendorProp in div.style) {
					prefix = prefixes[i];
					break;
				} else {
					vendorProp = undefined;
				}

			}
		}

		var support = {
			js: supportedProp || vendorProp,
			css: writePrefixes(prop, prefix)
		}

		if (prop === 'transform') {//detect transform3d
			if (div.style[support.js] !== undefined) {
				div.style[support.js] = "translate3d(1px,1px,1px)";
				var has3d = window.getComputedStyle(div)[support.js];
			}
			support['3d'] = (has3d !== undefined && has3d.length > 0 && has3d !== "none");
		}

		document.body.removeChild(div);
		return support;
	}

	function writePrefixes(prop, prefix) {
		//make prop camelCase
		prop = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

		if (prefix === null) {
			return prop;
		}

		let ourPrefix;
		switch (prefix) {
			case 'Webkit':
				ourPrefix = '-webkit-' + prop;
				break;
			case 'Moz':
				ourPrefix = '-moz-' + prop;
				break;
			case 'ms':
				ourPrefix = '-ms-' + prop;
				break;
			case 'O':
				ourPrefix = '-o-' + prop;
				break;
		}
		return ourPrefix;
	}
	//end of CSS3 support

	return options
}

export let defaults = {
	elem: '',//(selector || dom\jQuery element) dom element for triggering modal (it should be single elements, if plugin will found here few elements, instance of gallery will be created)
	container: 'body',//(selector) appends modal to specific element
	position: 'fixed',//(fixed || absolute), how popup will be positioned. For most cases fixed is good, but when we insert popup inside element, not document, absolute position sets automatically
	click: true,//(boolean) should we set click handler on element(o.elem)?
	clickels: '',//(selector || dom\jQuery element) additional elements that can trigger same modal window (very often on landing pages you need few links to open one modal window)

	backdrop: true,//(boolean) should we show backdrop? true - show backdrop for every popup
	backdropassist: true,//(boolean) if true, animation durations of modal will automatically sets to backdrop to be in sync
	scrollbar: 'hide',//(show || hide) should we hide scrollbar from page?
	out: true,//(boolean) click outside modal will close it, false also adds fancy animation when somebody tries to close modal with outside click
	esc: true,//(boolean) close modal when esc button pressed?
	close: 'outside',//(inside || outside || boolean false) add close button inside or outside popup or don't add at all
	autoheight: 'image',//(boolean || image) should we set maximum height of modal? if image is selected, only images will be autoheighted

	autofocus: '',//(boolean false, selector) set focus to element, after modal is shown, if false, no autofocus elements inside, otherwise focus selected element

	//gallery
	img:               'ready',//(load || ready) we should wait until img will fully loaded or show as soon as size will be known (ready is useful for progressive images)
	imgload:           'show',//(init || show) should we load gallery images on init(before dialog open) or on open 


	selector:          '',//(selector) child items selector, for gallery elements. Can be used o.selector OR o.delegate
	delegate:          '',//(selector) child items selector, for gallery elements. Can be used o.selector OR o.delegate. If delegate used instead of selector, gallery items will be gathered dynamically before show

	// arrows:            'outside',//(inside || outside || boolean false) add navigation arrows inside or outside popup or don't add at all

	// title:             false,//(string || boolean false) title for first slide if we call it via js
	// title_attr:        'title',//(string || boolean false) attribute from which we gather title for slide (used in galleries)

	// start:             false,//(number) slide number, from which we should start
	// loop:              true,//(boolean), show first image when call next on last slide and vice versa. Requires three or more images. If there are less than 4 slides, option will be set to false automatically.
	// imgclick:          true,//(boolean) should we change slide if user clicks on image?
	// preload:           '3 3',//(boolean false || string) space separated string with 2 numbers, how much images we should preload before  and after active slide

	

	content: undefined,//(string) content for modal
	_missedContent: 'njBox plugin: meow, put some content here...',//this string uses, when slide have no content
	type: '',//(html || selector || text || template) type of content, if selector used, whole element will be inserted in modal. Template simila to html, but template inserted without .njb__body tag, directly to .njb
	header: undefined,//(html) html that will be added as modal header (for first slide)
	footer: undefined,//(html) html that will be added as modal footer (for first slide)

	// we need quotes here because of ie8..
	'class': false,//(string) classnames(separated with space) that will be added to modal wrapper, you can use it for styling
	zindex: false,//(boolean false || number) zindex that will be set on modal, probably not a good idea to use this option, set it in css and use o.class instead

	anim: 'scale',//(false || string) name of animation, or string with space separated 2 names of show/hide animation
	animclass: 'animated',//(string) additional class that will be added to modal window during animation (can be used for animate.css or other css animation libraries)
	duration: 'auto',//(string || number || auto) duration of animations, or string with space separated 2 durations of show/hide animation. You can set 'auto 100' if you want to set only duration for hide. It should be used when problems with auto detection (but I have not seen this problem ^^)

	templates: {
		wrap: '<div class="njb-wrap"><div class="njb-items"></div></div>',
		backdrop: '<div class="njb-backdrop"></div>',
		modalOuter: '<div class="njb-outer" data-njb-outer></div>',
		modal: '<aside class="njb" tabindex="-1"></aside>',
		body: '<div class="njb__body" data-njb-body></div>',
		header: '<header class="njb__header" data-njb-header></header>',
		footer: '<footer class="njb__footer" data-njb-footer></footer>',
		close: '<button type="button" class="njb-close-system" data-njb-close>×</button>',
		focusCatcher: '<a href="#!" class="njb-focus-catch">This link is just focus catcher of modal window, link do nothing.</a>',

		//todo, in gallery
		preloader:   '<div class="njb-preloader"><div class="njb-preloader__inner"><div class="njb-preloader__bar1"></div><div class="njb-preloader__bar2"></div><div class="njb-preloader__bar3"></div></div></div>'
		// ui:          '<div class="njb-ui"><div class="njb-ui-title-outer"><div class="njb-ui-title-inner" data-njb-title></div></div></div>',
		// count:       '<div class="njb-ui-count"><span data-njb-current></span> / <span data-njb-total></span></div>',
		// prev:        '<button type="button" class="njb-arrow njb-prev" data-njb-prev></button>',
		// next:        '<button type="button" class="njb-arrow njb-next" data-njb-next></button>'
	},

	text: {
		_missedContent: 'njBox plugin: meow, put some content here...',//text for case, when slide have no content
		// preloader:    'Loading...',//title on preloader element

		imageError:   '<a href="%url%">This image</a> can not be loaded.',
		// ajaxError:    'Smth goes wrong, ajax failed or ajax timeout (:',

		// current:      'Current slide',
		// total:        'Total slides',
		close: 'Close (Esc)',//title on close button
		// prev:         'Previous (Left arrow key)',//prev slide button title
		// next:         'Next (Right arrow key)'//next slide button title

		ok: 'Ok',//text on 'ok' button when dialog modal(alert, prompt, confirm) or in any other custom type
		cancel: 'Cancel',//text on 'cancel' button when dialog modal(alert, prompt, confirm) or in any other custom type
		placeholder: ''//placeholder for prompt input

	},

	_focusable: 'a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]',//(selector) this elements we will try to focus in popup shown after custom o.focus
	jquery: undefined,//link to jquery (for modules)
	autobind: '[data-toggle~="box"], [data-toggle~="modal"]'//(selector) selector that will be used for autobind (can be used only with changing global default properties) Set it after njBox.js is inserted njBox.defaults.autobind = '.myAutoBindSelector'
};