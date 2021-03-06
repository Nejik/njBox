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
export function getItemFromDom(dom, selector) {
	return dom.attr(selector) !== null ? dom : dom.find(`[${selector}]`);
}


export const defaults = {
	elem           : '',//(selector || dom\jQuery element) dom element for triggering modal
	content        : undefined,//(string || function) content for modal
	delayed        : true,//(boolean) Interesting option, that works only for selector and image types. When its true with selector type, dom element will not be touched until show, and will be returned to dom after hiding modal. When its true and type image, images will not be loading on initialization, loading starts when show method calls
	type           : undefined,//(html || selector || text || image || template) type of content, if selector used, whole element will be inserted in modal. Template similar to html, but template inserted without .njb__body tag(header/footer also not inserted), directly to .njb
	header         : undefined,//(html) html that will be added as modal header
	footer         : undefined,//(html) html that will be added as modal footer
	// we need quotes here because of ie8..
	'class'        : false,//(string) classnames(separated with space) that will be added to modal wrapper, you can use it for styling (theming).
	zindex         : false,//(boolean false || number) zindex that will be set on modal, probably not a good idea to use this option, set it in css and use o.class instead

	container      : 'body',//(selector) appends modal to specific element
	layout         : 'fixed',//(fixed || absolute || popover), how popup will be positioned. For most cases fixed is good, but when we insert popup inside element(not document), absolute position sets automatically, popover mode works only with popover addon)

	click          : true,//(boolean) should we set click handler on element(o.elem)?
	clickels       : false,//(selector || dom\jQuery element) additional elements that can trigger same modal window (very often on landing pages you need few buttons to open one modal window)

	backdrop       : true,//(boolean) should we show backdrop (black overlay)?
	backdropassist : true,//(boolean) if true, animation durations of modal will automatically sets to backdrop to be in sync
	scrollbar      : 'hide',//(show || hide) should we hide scrollbar from page?
	out            : true,//(boolean) click outside modal will close it, false also adds fancy animation when somebody tries to close modal with outside click
	esc            : true,//(boolean) close modal when esc button pressed?
	close          : 'outside',//(inside || outside || boolean false) add close button inside or outside popup or don't add at all
	autoheight     : 'image',//(boolean || image) should we fit modal height to window height? if image is selected, only images will be autoheighted
	autofocus      : true,//(boolean, selector) set focus to element, after modal is shown, also you may use autofocus attribute without this option
	focusprevious  : true,//(boolean) focus previous modal window after hiding current modal. (only for case when we open two or more modal windows)
	title          : undefined,//(string || boolean false) title (usually for image)
	titleattr     : 'title',//(string || boolean false) attribute from which we gather title 
	img            : 'ready',//(load || ready) we should wait until img will fully loaded or show as soon as size will be known (ready is useful for progressive images)
	anim           : 'scale',//(false || string) name of animation, or string with space separated 2 names of show/hide animation (default same as `scale scale`). 2 predefined animations are built in: scale and fade.
	animclass      : '',//(string) additional class that will be added to modal window during animation (can be used for animate.css or other css animation libraries)
	duration       : 'auto',//(string || number || auto) duration of animations, or string with space separated 2 durations of show/hide animation. You can set 'auto 100' if you want to set only duration for hide. It should be used when problems with auto detection (but I have not seen such problem yet ^^)

	

	jquery         : undefined,//!!! jQuery NOT required for plugin, plugin can work with it to support old browsers !!! link to jquery (for modules without global scope) P.S. Plugin will try to found jquery in global namespace even without this option.
	autobind       : '[data-toggle~="box"], [data-toggle~="modal"]',//(selector) selector that will be used for autobind (can be used only with changing global default properties) Set it after njBox.js is inserted njBox.defaults.autobind = '.myAutoBindSelector'

	//accessibility options
	_focusable     : 'a[href], area[href], details, iframe, object, embed, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]',//(selector) this elements we will try to focus in popup shown after option o.autofocus
	buttonrole     : 'button',//(button || boolean false) this role will be set to elements, which opens modal window
	role           : 'dialog',//(dialog || alertdialog || boolean false) role that will be set to modal dialog https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_alertdialog_role
	label          : false,//(string || boolean false) add aria-label attribute to support screenreaders
	labelledby     : false,//(string || boolean false) add aria-labelledby attribute to support screenreaders
	describedby    : false//(string || boolean false) add aria-describedby attribute to support screenreaders
}
export const templates = {
	wrap          : '<div class="njb-wrap"><div class="njb-items"></div></div>',
	backdrop      : '<div class="njb-backdrop"></div>',
	modalOuter    : '<div class="njb-outer"></div>',
	modal         : '<div class="njb"></div>',
	body          : '<div class="njb__body" data-njb-body></div>',
	header        : '<header class="njb__header" data-njb-header></header>',
	footer        : '<footer class="njb__footer" data-njb-footer></footer>',
	close         : '<button type="button" class="njb-ui__close" data-njb-close><span aria-hidden="true">×</span></button>',
	focusCatcher  : '<span tabindex="0" class="njb-focus-catch" aria-hidden="true"></span>',

	preloader     : '<div class="njb-preloader"><div class="njb-preloader__inner"><div class="njb-preloader__bar1"></div><div class="njb-preloader__bar2"></div><div class="njb-preloader__bar3"></div></div></div>',
	ui            : '<div class="njb-ui"></div>',
	title         : '<div class="njb-ui__title"><div class="njb-ui__title-inner" id="njb-title" data-njb-title></div></div>'//id in title used for accessibility
}
export const text = {
	_missedContent: 'njBox plugin: meow, put some content here...',//text for case, when slide have no content
	preloader     : 'Loading...',//title on preloader element
	imageError    : '<a href="%url%">This image</a> can not be loaded.',
	close         : 'Close dialog',//title on close button
	ok            : 'Ok',//text on 'ok' button when dialog modal(alert, prompt, confirm) or in any other custom type
	cancel        : 'Cancel',//text on 'cancel' button when dialog modal(alert, prompt, confirm) or in any other custom type
	placeholder   : ''//placeholder for prompt input
}
