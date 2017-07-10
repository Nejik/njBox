//syntax sugar like jquery

let j = function (selector) {
    return new j.fn.init(selector || '');
};
//autobinding
// if(!window.$) window.$ = window.j;

j.match = function (el, selector) {
    if (el === document) el = document.documentElement;

    var matchesSelector = el.matches
        || el.matchesSelector
        || el.oMatchesSelector
        || el.mozMatchesSelector
        || el.webkitMatchesSelector
        || el.msMatchesSelector;

    return matchesSelector.call(el, selector);
}
j.fn = j.prototype;
j.fn.init = function (selector) {
    var query;

    if (typeof selector === 'string' && selector.length > 0) {
        //detect html input
        if (selector.charAt(0) === "<") {
            (j.str2dom) ? query = j.str2dom(selector) : query = [];
        } else {
            query = document.querySelectorAll(selector);
        }
    } else if (selector instanceof Array || selector instanceof NodeList || selector instanceof HTMLCollection || selector instanceof j) {
        query = selector;
    } else if (selector.nodeType || (window.Node && selector instanceof Node) || selector == selector.window || typeof selector === 'object') {
        query = [selector];
    } else if (typeof selector === 'function') {
        query = [document];
        document.addEventListener("DOMContentLoaded", selector);
    } else {
        query = [];
    }

    //save selector length
    this.length = query.length;

    for (var i = 0, l = this.length; i < l; i++) {
        this[i] = query[i];
    }

    // Return as object
    return this;
}
j.fn.init.prototype = j.fn;//maked for using instenceOf operator(example: j('#test') instanceOf j)
j.fn.each = function (callback) {
    for (var i = 0, l = this.length; i < l; i++) {
        if (callback.call(this[i], i, this[i]) === false) break;
    }
    return this;
}

j.str2dom = function (html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.childNodes;
}
//extend function from jQuery
j.isArray = function (a) { return j.type(a) === "array" };
j.isFunction = function (a) { return j.type(a) == "function" };
j.isPlainObject = function (f) { var b, c = {}, a = {}.hasOwnProperty; if (!f || j.type(f) !== "object" || f.nodeType || j.isWindow(f)) { return false } try { if (f.constructor && !a.call(f, "constructor") && !a.call(f.constructor.prototype, "isPrototypeOf")) { return false } } catch (d) { return false } if (c.ownLast) { for (b in f) { return a.call(f, b) } } for (b in f) { } return b === undefined || a.call(f, b) };
j.isWindow = function (a) { return a != null && a == a.window };
j.type = function (c) { var a = a = { "[object Array]": "array", "[object Boolean]": "boolean", "[object Date]": "date", "[object Error]": "error", "[object Function]": "function", "[object Number]": "number", "[object Object]": "object", "[object RegExp]": "regexp", "[object String]": "string" }, b = a.toString; if (c == null) { return c + "" } return typeof c === "object" || typeof c === "function" ? a[b.call(c)] || "object" : typeof c };
//for extend function we need: j.isArray, j.isFunction, j.isPlainObject, j.isWindow, j.type
j.extend = function () {
    var src, copyIsArray, copy, name, options, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if (typeof target === "boolean") {
        deep = target;

        // skip the boolean and the target
        target = arguments[i] || {};
        i++;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== "object" && !j.isFunction(target)) {
        target = {};
    }

    // extend jQuery itself if only one argument is passed
    if (i === length) {
        target = this;
        i--;
    }

    for (; i < length; i++) {
        // Only deal with non-null/undefined values
        if ((options = arguments[i]) != null) {
            // Extend the base object
            for (name in options) {
                src = target[name];
                copy = options[name];

                // Prevent never-ending loop
                if (target === copy) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if (deep && copy && (j.isPlainObject(copy) || (copyIsArray = j.isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && j.isArray(src) ? src : [];

                    } else {
                        clone = src && j.isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[name] = j.extend(deep, clone, copy);

                    // Don't bring in undefined values
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
};
j.inArray = function (element, array, i) {
    return array == null ? -1 : array.indexOf(element, i);
}
j.fn.find = function (selector) {
    var newArray = [],
        tq;//temporary query

    this.each(function (i) {
        tq = Array.prototype.slice.call(this.querySelectorAll(selector), '')
        if (tq.length) {
            newArray = newArray.concat(tq);
        }
    })
    return j(newArray);
}
j.fn.on = function (type, fn) {
    return this.each(function () {
        this.addEventListener(type, fn, false);
    })
}
j.fn.off = function (type, fn) {
    return this.each(function () {
        this.removeEventListener(type, fn);
    })
}
j.fn.delegate = function (selector, type, fn) {
    return this.each(function (i) {
        var parent = this;

        if (!this._events) this._events = {};
        if (!this._events[type]) this._events[type] = [];

        var cb = function (e) {
            var target = e && e.target || window.event.srcElement,
                path = e.path;//only in chrome for now... 18.12.2015

            if (!path) {
                path = [];
                var node = target;
                while (node) {
                    path.push(node);
                    node = node.parentNode;
                }
            }
            // e.path = path;

            for (var i = 0, l = path.length; i < l; i++) {
                if (path[i] === parent) break;//don't check all dom
                if (path[i] !== document && j.match(path[i], selector)) {
                    fn.call(path[i], e);
                    break;//if we find needed el, don't need to check all other dom elements
                }
            }
        }
        cb.fn = fn;

        this.addEventListener(type, cb, false);

        this._events[type].push(cb);
    })
}
j.fn.undelegate = function (selector, type, fn) {
    if (!fn) {
        fn = type;
        type = selector;
    }
    return this.each(function (i) {
        var events = this._events,
            types = this._events[type];
        if (!events || !types) return;

        for (var i = 0, l = types.length; i < l; i++) {
            if (fn === types[i].fn) {
                this.removeEventListener(type, types[i]);
                delete types[i].fn;
                types.splice(i, 1)
                break;
            }
        }
        if (!types.length) delete events[type];


        //check if we have any empty event containers
        var emptyEvents = true;
        for (var prop in events) {
            if (events.hasOwnProperty(prop)) {
                emptyEvents = false;
                break;
            }
        }
        if (emptyEvents) delete this._events;
    })
}
//only in get mode
j.fn.data = function (type) {
    if (type) {
        return this[0].dataset[type];
    } else {
        return this[0].dataset;
    }
}
j.fn.attr = function (prop, value) {
    if (value) {
        return this.each(function () {
            this.setAttribute(prop, value);
        })
    } else {
        return this[0].getAttribute(prop);
    }
}
j.parseJSON = function (json) {
    return JSON.parse(json);
}
j.fn.css = function (prop, value) {
    var that = this;
    if (!prop) return;

    if (prop == 'float') prop = 'styleFloat';
    if (value) {
        return this.each(function () {
            this.style[prop] = value;
        });
    } else {
        return getComputedStyle(this[0], null)[prop] || undefined;
    }
}
j.fn.hasClass = function (classname) {
    return this[0].classList.contains(classname);
}
j.fn.addClass = function (classes) {
    var arr = classes.split(' ');

    return this.each(function () {
        for (var i = 0, l = arr.length; i < l; i++) {
            this.classList.add(arr[i]);
        }
    });
}
j.fn.removeClass = function (classes) {
    var arr = classes.split(' ');

    return this.each(function (i) {
        for (var i = 0, l = arr.length; i < l; i++) {
            this.classList.remove(arr[i]);
        }
    });
}
// for closest we need j.inArray
j.fn.closest = function (selector) {
    var closestArr = [],
        parent;

    for (var i = 0, l = this.length; i < l; i++) {
        if (j.match(this[i], selector)) {
            closestArr.push(this[i])
        } else {
            parent = this[i].parentNode;
            if (parent === document) parent = document.documentElement;

            while (parent && parent.tagName !== 'HTML') {
                if (j.match(parent, selector) && j.inArray(parent, closestArr) === -1) closestArr.push(parent);
                parent = parent.parentNode;
            }
        }
    }

    return j(closestArr);
}
j.fn.html = function (html) {
    return this.each(function () {
        this.innerHTML = html;
    });
}
// j.fn.append = function(content) {
//     var els = j(content),
//         frag = document.createDocumentFragment();
    
//     //insert all elements in fragment, because prepend method insert elements reversed, and also for perfomance
//     els.each(function () {
//         frag.appendChild( this );
//     });
    
//     return this.each(function () {
//         this.appendChild(frag)
//     });
// }
// j.fn.prepend = function(content) {
//     var els = j(content),
//         frag = document.createDocumentFragment();
    
//     //insert all elements in fragment, because prepend method insert elements reversed, and also for perfomance
//     els.each(function () {
//         frag.appendChild( this );
//     });
//     return this.each(function () {
//         this.insertBefore(frag, this.firstChild)
//     });
// }
j.fn.append = function(content) {
    return insert.call(this, content, 'append');
}
j.fn.prepend = function(content) {
    return insert.call(this, content, 'prepend');
}
function insert(content, type) {
    var els = j(content),
        frag = document.createDocumentFragment();
    
    //insert all elements in fragment, because prepend method insert elements reversed, and also for perfomance
    els.each(function () {
        frag.appendChild( this );
    });
    return this.each(function () {
        if (type === 'append') {
            this.appendChild(frag)
        } else  {
            this.insertBefore(frag, this.firstChild)
        }
    });
}



export default j;