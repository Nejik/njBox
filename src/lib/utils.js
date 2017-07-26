export function isPlainObject(obj) {
	return	typeof obj === 'object'
								&& obj !== null
								&& obj.constructor === Object
								&& Object.prototype.toString.call(obj) === '[object Object]';
}

export function getItemFromDom(dom, selector) {
	return dom.attr(selector) !== null ? dom : dom.find(`[${selector}]`);
}
export const defaults = {
	elem           : '',//(selector || dom\jQuery element) dom element for triggering modal
	content        : undefined,//(string || function) content for modal
	delayed        : true,//(boolean) Interesting option, that works only for selector and image types. When its true with selector type, dom element will not be touched until show, and will be returned to dom after hiding modal. When its true and type image, images will not be loading on initialization.
	type           : 'text',//(html || selector || text || template) type of content, if selector used, whole element will be inserted in modal. Template similar to html, but template inserted without .njb__body tag(header/footer also not inserted), directly to .njb
	header         : undefined,//(html) html that will be added as modal header (for first slide)
	footer         : undefined,//(html) html that will be added as modal footer (for first slide)
	// we need quotes here because of ie8..
	'class'        : false,//(string) classnames(separated with space) that will be added to modal wrapper, you can use it for styling (theming)
	zindex         : false,//(boolean false || number) zindex that will be set on modal, probably not a good idea to use this option, set it in css and use o.class instead

	container      : 'body',//(selector) appends modal to specific element
	layout         : 'fixed',//(fixed || absolute || popover), how popup will be positioned. For most cases fixed is good, but when we insert popup inside element, not document, absolute position sets automatically, popover mode works only with popover addon)

	click          : true,//(boolean) should we set click handler on element(o.elem)?
	clickels       : '',//(selector || dom\jQuery element) additional elements that can trigger same modal window (very often on landing pages you need few buttons to open one modal window)

	backdrop       : true,//(boolean) should we show backdrop?
	backdropassist : true,//(boolean) if true, animation durations of modal will automatically sets to backdrop to be in sync (it can be calculatied automatically from css)
	scrollbar      : 'hide',//(show || hide) should we hide scrollbar from page?
	out            : true,//(boolean) click outside modal will close it, false also adds fancy animation when somebody tries to close modal with outside click
	esc            : true,//(boolean) close modal when esc button pressed?
	close          : 'outside',//(inside || outside || boolean false) add close button inside or outside popup or don't add at all
	autoheight     : 'image',//(boolean || image) should we set maximum height of modal? if image is selected, only images will be autoheighted
	autofocus      : true,//(boolean, selector) set focus to element, after modal is shown, also you may use autofocus attribute without this option
	focusprevious  : true,//(boolean) focus previous modal window after closing curren modal (case when we open two or more modal windows)
	title          : undefined,//(string || boolean false) title (usually for image)
	title_attr     : 'title',//(string || boolean false) attribute from which we gather title for slide (used basically in images)

	img            : 'ready',//(load || ready) we should wait until img will fully loaded or show as soon as size will be known (ready is useful for progressive images)
	anim           : 'scale',//(false || string) name of animation, or string with space separated 2 names of show/hide animation (default same as `scale scale`). 2 predefined animations are built in: scale and fade.
	animclass      : 'animated',//(string) additional class that will be added to modal window during animation (can be used for animate.css or other css animation libraries)
	duration       : 'auto',//(string || number || auto) duration of animations, or string with space separated 2 durations of show/hide animation. You can set 'auto 100' if you want to set only duration for hide. It should be used when problems with auto detection (but I have not seen such problem yet ^^)

	

	jquery         : undefined,//link to jquery (for modules without global scope)
	autobind       : '[data-toggle~="box"], [data-toggle~="modal"]',//(selector) selector that will be used for autobind (can be used only with changing global default properties) Set it after njBox.js is inserted njBox.defaults.autobind = '.myAutoBindSelector'

	//accessibility options
	_focusable     : 'a[href], area[href], details, iframe, object, embed, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]',//(selector) this elements we will try to focus in popup shown after option o.autofocus
	buttonrole     : 'button',//(button || boolean false) this role will be set to elements, which opens modal window
	role           : 'dialog',//(dialog || alertdialog || boolean false) role that will be set to modal dialog https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_alertdialog_role
	label          : false,//(string) add aria-label attribute to support screenreaders
	labelledby     : false,//(id selector) add aria-labelledby attribute to support screenreaders
	describedby    : false//(id selector) add aria-describedby attribute to support screenreaders
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
