export function alert(content, okCb, cancelCb) {
  return new njBox({
    content: function () {
      return (
        `<div class="njb__body">
${content || this._text._missedContent}
</div>
<div class="njb__footer">
  <button data-njb-ok>${this._text.ok}</button>
</div>`);
    },
    type: 'template',
    role: 'alertdialog',
    out: false,
    onok: okCb,
    oncancel: cancelCb
  }).show()
}

export function confirm(content, okCb, cancelCb) {
  return new njBox({
    content: function () {
      return (
        `<div class="njb__body">
${content || this._text._missedContent}
</div>
<div class="njb__footer">
  <button data-njb-ok>${this._text.ok}</button>
  <button data-njb-cancel>${this._text.cancel}</button>
</div>`);
    },
    type: 'template',
    role: 'alertdialog',
    out: false,
    onok: okCb,
    oncancel: cancelCb
  }).show()
}

export function prompt(content, placeholder, okCb, cancelCb) {
  if (typeof placeholder === 'function') {
    cancelCb = okCb;
    okCb = placeholder;
    placeholder = '';
  }

  return new njBox({
    content: function () {
      return (
`<div class="njb__header">
${content || this._text._missedContent}
</div>
<div class="njb__body">
  <input data-njb-return type="text" placeholder="${placeholder || ''}" />
</div>
<div class="njb__footer">
  <button data-njb-ok>${this._text.ok}</button>
  <button data-njb-cancel>${this._text.cancel}</button>
</div>`);
    },
    type: 'template',
    role: 'alertdialog',
    out: false,
    onok: okCb,
    oncancel: cancelCb
  }).show()
}