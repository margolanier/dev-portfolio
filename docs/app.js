"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
            }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
                var n = t[o][1][e];return s(n ? n : e);
            }, l, l.exports, e, t, n, r);
        }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
        s(r[o]);
    }return s;
})({ 1: [function (require, module, exports) {
        var app = angular.module('PortfolioApp', []);

        var controllers = [require('./controllers/list-repos')];

        for (var i = 0; i < controllers.length; i++) {
            app.controller(controllers[i].name, controllers[i].task);
        }

        var services = [require('./services/repo-data')];

        for (var _i = 0; _i < services.length; _i++) {
            app.factory(services[_i].name, services[_i].task);
        }
    }, { "./controllers/list-repos": 2, "./services/repo-data": 3 }], 2: [function (require, module, exports) {
        module.exports = {
            name: 'ListProjects',
            task: function task($scope, ProjectData) {

                var getPortfolio = function getPortfolio() {
                    return ProjectData.parseGithub('margolanier');
                };

                var currentItems = void 0;

                var mixitup = require('mixitup');
                var container = document.querySelector('[data-ref="container"]');
                var projects = void 0; 

                var render = function render(item) {
                    return "<div class=\"item\" data-ref=\"item\">\n\t\t\t\t<div class=\"item-image\">\n\t\t\t\t\t<img src=\"" + item.image + "\" alt=\"" + item.name + "\">\n\t\t\t\t</div>\n\t\t\t\t<div class=\"item-info\">\n\t\t\t\t\t<h2>" + item.name + "</h2>\n\t\t\t\t\t<p>" + item.desc + "</p>\n\t\t\t\t\t<div class=\"item-btns\">\n\t\t\t\t\t\t<a href=\"" + item.siteLink + "\" target=\"blank\">View site</a>\n\t\t\t\t\t\t<a href=\"" + item.githubLink + "\" target=\"blank\">View code</a>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>";
                };

                var mixer = mixitup(container, {
                    data: {
                        uidKey: 'id'
                    },
                    render: {
                        target: render
                    },
                    selectors: {
                        target: '[data-ref="item"]'
                    },
                    layout: {
                        containerClassName: 'grid'
                    }
                });

                getPortfolio().then(function () {
                    return ProjectData.getAllProjects();
                }).then(function (projects) {
                    mixer.dataset(projects);
                }).catch(console.error.bind(console));

                var controls = document.querySelector('[data-ref="controls"]');
                var filters = document.querySelectorAll('[data-ref="filter"]');
                var layouts = document.querySelectorAll('[data-ref="layout"]');
                var activeCategory = '';
                var activeLayout = '';

                var activateButton = function activateButton(activeButton, siblings) {
                    for (var i = 0; i < siblings.length; i++) {
                        var button = siblings[i];
                        button.classList[button === activeButton ? 'add' : 'remove']('control-active');
                    }
                };

                activateButton(controls.querySelector('[data-category="all"]'), filters);
                activateButton(controls.querySelector('[data-layout="grid"]'), layouts);

                var getFiltered = function getFiltered(category) {
                    currentItems = ProjectData.getFilteredProjects(category);
                    mixer.dataset(currentItems);
                };

                controls.addEventListener('click', function (e) {
                    filterItems(e.target);
                });

                var filterItems = function filterItems(button) {

                    if (button.classList.contains('control-active') || mixer.isMixing()) {
                        return;
                    } else if (button.matches('[data-ref="filter"]')) {
                        activateButton(button, filters);
                        activeCategory = button.getAttribute('data-category');
                    } else if (button.matches('[data-ref="layout"]')) {
                        activateButton(button, layouts);
                        activeLayout = button.getAttribute('data-layout');
                        mixer.changeLayout(activeLayout);
                    }

                    getFiltered(activeCategory);

                    controls.addEventListener('click', function (e) {
                        filterItems(e.target);
                    });
                };
            }
        };
    }, { "mixitup": 5 }], 3: [function (require, module, exports) {
        module.exports = {
            name: 'ProjectData',
            task: function task($http) {
                var projects = [];
                var filtered = [];

                var highlights = require('./repo-options');

                function Project(repo, highlight) {
                    this.id = repo.id;
                    this.name = highlight.title;
                    this.repoName = repo.name;
                    this.image = highlight.image;
                    this.full_desc = repo.description;
                    var short_desc = repo.description.substr(0, repo.description.indexOf('.')) + '.';
                    this.desc = short_desc;
                    this.category = highlight.category;
                    this.siteLink = repo.homepage;
                    this.githubLink = repo.html_url;
                    this.dateCreated = repo.created_at;
                    this.dateUpdated = repo.updated_at;

                    return this;
                }

                return {
                    parseGithub: function parseGithub(username) {
                        return $http.get("https://api.github.com/users/" + username + "/repos").then(function (response) {
                            var repoData = response.data;
                            repoData.forEach(function (repo) {

                                var repoOptions = void 0;
                                if (highlights.filter(function (highlight) {
                                    if (highlight.name === repo.name) {
                                        repoOptions = highlight;
                                    }
                                    return highlight.name === repo.name;
                                }).length > 0) {
                                    var currentRepo = new Project(repo, repoOptions);
                                    projects.push(currentRepo);
                                }
                            });
                        });
                    },
                    getAllProjects: function getAllProjects() {
                        return projects;
                    },
                    getFilteredProjects: function getFilteredProjects(category) {
                        if (category === 'all') {
                            filtered = projects;
                        } else {
                            filtered = projects.filter(function (project) {
                                return project.category.includes(category);
                            });
                        }
                        return filtered;
                    }
                };
            }
        };
    }, { "./repo-options": 4 }], 4: [function (require, module, exports) {
        module.exports = [{
            title: 'Autocomplete Search',
            name: 'autocomplete',
            image: 'assets/autocomplete-preview.png',
            category: ['tool', 'api']
        }, {
            title: 'Bibliocache',
            name: 'bibliocache',
            image: 'assets/bibliocache-preview.png',
            category: ['game', 'angular', 'api']
        }, {
            title: 'Chatterbox',
            name: 'chatterbox',
            image: 'assets/chatterbox-preview.png',
            category: ['tool', 'angular', 'api']
        }, {
            title: 'Flag Freeze Tag',
            name: 'flag-freeze-tag',
            image: 'assets/freezetag-preview.png',
            category: ['game']
        }, {
            title: 'Lemonade Stand',
            name: 'lemonade-stand',
            image: 'assets/lemonade-preview.png',
            category: ['game', 'angular', 'api']
        }, {
            title: 'Movie Emporeum',
            name: 'movie-emporeum',
            image: 'assets/movies-preview.png',
            category: ['angular', 'tool', 'api']
        }, {
            title: 'Stock Trading',
            name: 'stock-market',
            image: 'assets/stockmarket-preview.png',
            category: ['tool', 'api']
        }];
    }, {}], 5: [function (require, module, exports) {

        (function (window) {
            'use strict';

            var _mixitup = null,
                h = null,
                jq = null;

            (function () {
                var VENDORS = ['webkit', 'moz', 'o', 'ms'],
                    canary = window.document.createElement('div'),
                    i = -1;


                for (i = 0; i < VENDORS.length && !window.requestAnimationFrame; i++) {
                    window.requestAnimationFrame = window[VENDORS[i] + 'RequestAnimationFrame'];
                }


                if (typeof canary.nextElementSibling === 'undefined') {
                    Object.defineProperty(window.Element.prototype, 'nextElementSibling', {
                        get: function get() {
                            var el = this.nextSibling;

                            while (el) {
                                if (el.nodeType === 1) {
                                    return el;
                                }

                                el = el.nextSibling;
                            }

                            return null;
                        }
                    });
                }


                (function (ElementPrototype) {
                    ElementPrototype.matches = ElementPrototype.matches || ElementPrototype.machesSelector || ElementPrototype.mozMatchesSelector || ElementPrototype.msMatchesSelector || ElementPrototype.oMatchesSelector || ElementPrototype.webkitMatchesSelector || function (selector) {
                        return Array.prototype.indexOf.call(this.parentElement.querySelectorAll(selector), this) > -1;
                    };
                })(window.Element.prototype);


                if (!Object.keys) {
                    Object.keys = function () {
                        var hasOwnProperty = Object.prototype.hasOwnProperty,
                            hasDontEnumBug = false,
                            dontEnums = [],
                            dontEnumsLength = -1;

                        hasDontEnumBug = !{
                            toString: null
                        }.propertyIsEnumerable('toString');

                        dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'];

                        dontEnumsLength = dontEnums.length;

                        return function (obj) {
                            var result = [],
                                prop = '',
                                i = -1;

                            if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) !== 'object' && (typeof obj !== 'function' || obj === null)) {
                                throw new TypeError('Object.keys called on non-object');
                            }

                            for (prop in obj) {
                                if (hasOwnProperty.call(obj, prop)) {
                                    result.push(prop);
                                }
                            }

                            if (hasDontEnumBug) {
                                for (i = 0; i < dontEnumsLength; i++) {
                                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                                        result.push(dontEnums[i]);
                                    }
                                }
                            }

                            return result;
                        };
                    }();
                }


                if (!Array.isArray) {
                    Array.isArray = function (arg) {
                        return Object.prototype.toString.call(arg) === '[object Array]';
                    };
                }


                if (typeof Object.create !== 'function') {
                    Object.create = function (undefined) {
                        var Temp = function Temp() {};

                        return function (prototype, propertiesObject) {
                            if (prototype !== Object(prototype) && prototype !== null) {
                                throw TypeError('Argument must be an object, or null');
                            }

                            Temp.prototype = prototype || {};

                            var result = new Temp();

                            Temp.prototype = null;

                            if (propertiesObject !== undefined) {
                                Object.defineProperties(result, propertiesObject);
                            }

                            if (prototype === null) {
                                result.__proto__ = null;
                            }

                            return result;
                        };
                    }();
                }


                if (!String.prototype.trim) {
                    String.prototype.trim = function () {
                        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
                    };
                }


                if (!Array.prototype.indexOf) {
                    Array.prototype.indexOf = function (searchElement) {
                        var n, k, t, len;

                        if (this === null) {
                            throw new TypeError();
                        }

                        t = Object(this);

                        len = t.length >>> 0;

                        if (len === 0) {
                            return -1;
                        }

                        n = 0;

                        if (arguments.length > 1) {
                            n = Number(arguments[1]);

                            if (n !== n) {
                                n = 0;
                            } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                                n = (n > 0 || -1) * Math.floor(Math.abs(n));
                            }
                        }

                        if (n >= len) {
                            return -1;
                        }

                        for (k = n >= 0 ? n : Math.max(len - Math.abs(n), 0); k < len; k++) {
                            if (k in t && t[k] === searchElement) {
                                return k;
                            }
                        }

                        return -1;
                    };
                }


                if (!Function.prototype.bind) {
                    Function.prototype.bind = function (oThis) {
                        var aArgs, self, FNOP, fBound;

                        if (typeof this !== 'function') {
                            throw new TypeError();
                        }

                        aArgs = Array.prototype.slice.call(arguments, 1);

                        self = this;

                        FNOP = function FNOP() {};

                        fBound = function fBound() {
                            return self.apply(this instanceof FNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
                        };

                        if (this.prototype) {
                            FNOP.prototype = this.prototype;
                        }

                        fBound.prototype = new FNOP();

                        return fBound;
                    };
                }


                if (!window.Element.prototype.dispatchEvent) {
                    window.Element.prototype.dispatchEvent = function (event) {
                        try {
                            return this.fireEvent('on' + event.type, event);
                        } catch (err) {}
                    };
                }
            })();


            _mixitup = function mixitup(container, config, foreignDoc) {
                var el = null,
                    returnCollection = false,
                    instance = null,
                    facade = null,
                    doc = null,
                    output = null,
                    instances = [],
                    id = '',
                    elements = [],
                    i = -1;

                doc = foreignDoc || window.document;

                if (returnCollection = arguments[3]) {

                    returnCollection = typeof returnCollection === 'boolean';
                }

                if (typeof container === 'string') {
                    elements = doc.querySelectorAll(container);
                } else if (container && (typeof container === "undefined" ? "undefined" : _typeof(container)) === 'object' && h.isElement(container, doc)) {
                    elements = [container];
                } else if (container && (typeof container === "undefined" ? "undefined" : _typeof(container)) === 'object' && container.length) {

                    elements = container;
                } else {
                    throw new Error(_mixitup.messages.errorFactoryInvalidContainer());
                }

                if (elements.length < 1) {
                    throw new Error(_mixitup.messages.errorFactoryContainerNotFound());
                }

                for (i = 0; el = elements[i]; i++) {
                    if (i > 0 && !returnCollection) break;

                    if (!el.id) {
                        id = 'MixItUp' + h.randomHex();

                        el.id = id;
                    } else {
                        id = el.id;
                    }

                    if (_mixitup.instances[id] instanceof _mixitup.Mixer) {
                        instance = _mixitup.instances[id];

                        if (!config || config && config.debug && config.debug.showWarnings !== false) {
                            console.warn(_mixitup.messages.warningFactoryPreexistingInstance());
                        }
                    } else {
                        instance = new _mixitup.Mixer();

                        instance.attach(el, doc, id, config);

                        _mixitup.instances[id] = instance;
                    }

                    facade = new _mixitup.Facade(instance);

                    if (config && config.debug && config.debug.enable) {
                        instances.push(instance);
                    } else {
                        instances.push(facade);
                    }
                }

                if (returnCollection) {
                    output = new _mixitup.Collection(instances);
                } else {

                    output = instances[0];
                }

                return output;
            };


            _mixitup.use = function (extension) {
                _mixitup.Base.prototype.callActions.call(_mixitup, 'beforeUse', arguments);


                if (typeof extension === 'function' && extension.TYPE === 'mixitup-extension') {

                    if (typeof _mixitup.extensions[extension.NAME] === 'undefined') {
                        extension(_mixitup);

                        _mixitup.extensions[extension.NAME] = extension;
                    }
                } else if (extension.fn && extension.fn.jquery) {

                    _mixitup.libraries.$ = extension;


                    _mixitup.registerJqPlugin(extension);
                }

                _mixitup.Base.prototype.callActions.call(_mixitup, 'afterUse', arguments);
            };


            _mixitup.registerJqPlugin = function ($) {
                $.fn.mixItUp = function () {
                    var method = arguments[0],
                        config = arguments[1],
                        args = Array.prototype.slice.call(arguments, 1),
                        outputs = [],
                        chain = [];

                    chain = this.each(function () {
                        var instance = null,
                            output = null;

                        if (method && typeof method === 'string') {

                            instance = _mixitup.instances[this.id];

                            output = instance[method].apply(instance, args);

                            if (typeof output !== 'undefined' && output !== null && typeof output.then !== 'function') outputs.push(output);
                        } else {
                            _mixitup(this, config);
                        }
                    });

                    if (outputs.length) {
                        return outputs.length > 1 ? outputs : outputs[0];
                    } else {
                        return chain;
                    }
                };
            };

            _mixitup.instances = {};
            _mixitup.extensions = {};
            _mixitup.libraries = {};


            h = {


                hasClass: function hasClass(el, cls) {
                    return !!el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
                },


                addClass: function addClass(el, cls) {
                    if (!this.hasClass(el, cls)) el.className += el.className ? ' ' + cls : cls;
                },


                removeClass: function removeClass(el, cls) {
                    if (this.hasClass(el, cls)) {
                        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');

                        el.className = el.className.replace(reg, ' ').trim();
                    }
                },


                extend: function extend(destination, source, deep, handleErrors) {
                    var sourceKeys = [],
                        key = '',
                        i = -1;

                    deep = deep || false;
                    handleErrors = handleErrors || false;

                    try {
                        if (Array.isArray(source)) {
                            for (i = 0; i < source.length; i++) {
                                sourceKeys.push(i);
                            }
                        } else if (source) {
                            sourceKeys = Object.keys(source);
                        }

                        for (i = 0; i < sourceKeys.length; i++) {
                            key = sourceKeys[i];

                            if (!deep || _typeof(source[key]) !== 'object' || this.isElement(source[key])) {

                                destination[key] = source[key];
                            } else if (Array.isArray(source[key])) {

                                if (!destination[key]) {
                                    destination[key] = [];
                                }

                                this.extend(destination[key], source[key], deep, handleErrors);
                            } else {

                                if (!destination[key]) {
                                    destination[key] = {};
                                }

                                this.extend(destination[key], source[key], deep, handleErrors);
                            }
                        }
                    } catch (err) {
                        if (handleErrors) {
                            this.handleExtendError(err, destination);
                        } else {
                            throw err;
                        }
                    }

                    return destination;
                },


                handleExtendError: function handleExtendError(err, destination) {
                    var re = /property "?(\w*)"?[,:] object/i,
                        matches = null,
                        erroneous = '',
                        message = '',
                        suggestion = '',
                        probableMatch = '',
                        key = '',
                        mostMatchingChars = -1,
                        i = -1;

                    if (err instanceof TypeError && (matches = re.exec(err.message))) {
                        erroneous = matches[1];

                        for (key in destination) {
                            i = 0;

                            while (i < erroneous.length && erroneous.charAt(i) === key.charAt(i)) {
                                i++;
                            }

                            if (i > mostMatchingChars) {
                                mostMatchingChars = i;
                                probableMatch = key;
                            }
                        }

                        if (mostMatchingChars > 1) {
                            suggestion = _mixitup.messages.errorConfigInvalidPropertySuggestion({
                                probableMatch: probableMatch
                            });
                        }

                        message = _mixitup.messages.errorConfigInvalidProperty({
                            erroneous: erroneous,
                            suggestion: suggestion
                        });

                        throw new TypeError(message);
                    }

                    throw err;
                },


                template: function template(str) {
                    var re = /\${([\w]*)}/g,
                        dynamics = {},
                        matches = null;

                    while (matches = re.exec(str)) {
                        dynamics[matches[1]] = new RegExp('\\${' + matches[1] + '}', 'g');
                    }

                    return function (data) {
                        var key = '',
                            output = str;

                        data = data || {};

                        for (key in dynamics) {
                            output = output.replace(dynamics[key], typeof data[key] !== 'undefined' ? data[key] : '');
                        }

                        return output;
                    };
                },


                on: function on(el, type, fn, useCapture) {
                    if (!el) return;

                    if (el.addEventListener) {
                        el.addEventListener(type, fn, useCapture);
                    } else if (el.attachEvent) {
                        el['e' + type + fn] = fn;

                        el[type + fn] = function () {
                            el['e' + type + fn](window.event);
                        };

                        el.attachEvent('on' + type, el[type + fn]);
                    }
                },


                off: function off(el, type, fn) {
                    if (!el) return;

                    if (el.removeEventListener) {
                        el.removeEventListener(type, fn, false);
                    } else if (el.detachEvent) {
                        el.detachEvent('on' + type, el[type + fn]);
                        el[type + fn] = null;
                    }
                },


                getCustomEvent: function getCustomEvent(eventType, detail, doc) {
                    var event = null;

                    doc = doc || window.document;

                    if (typeof window.CustomEvent === 'function') {
                        event = new window.CustomEvent(eventType, {
                            detail: detail,
                            bubbles: true,
                            cancelable: true
                        });
                    } else if (typeof doc.createEvent === 'function') {
                        event = doc.createEvent('CustomEvent');
                        event.initCustomEvent(eventType, true, true, detail);
                    } else {
                        event = doc.createEventObject(), event.type = eventType;

                        event.returnValue = false;
                        event.cancelBubble = false;
                        event.detail = detail;
                    }

                    return event;
                },


                getOriginalEvent: function getOriginalEvent(e) {
                    if (e.touches && e.touches.length) {
                        return e.touches[0];
                    } else if (e.changedTouches && e.changedTouches.length) {
                        return e.changedTouches[0];
                    } else {
                        return e;
                    }
                },


                index: function index(el, selector) {
                    var i = 0;

                    while ((el = el.previousElementSibling) !== null) {
                        if (!selector || el.matches(selector)) {
                            ++i;
                        }
                    }

                    return i;
                },


                camelCase: function camelCase(str) {
                    return str.toLowerCase().replace(/([_-][a-z])/g, function ($1) {
                        return $1.toUpperCase().replace(/[_-]/, '');
                    });
                },


                pascalCase: function pascalCase(str) {
                    return (str = this.camelCase(str)).charAt(0).toUpperCase() + str.slice(1);
                },


                dashCase: function dashCase(str) {
                    return str.replace(/([A-Z])/g, '-$1').replace(/^-/, '').toLowerCase();
                },


                isElement: function isElement(el, doc) {
                    doc = doc || window.document;

                    if (window.HTMLElement && el instanceof window.HTMLElement) {
                        return true;
                    } else if (doc.defaultView && doc.defaultView.HTMLElement && el instanceof doc.defaultView.HTMLElement) {
                        return true;
                    } else {
                        return el !== null && el.nodeType === 1 && typeof el.nodeName === 'string';
                    }
                },


                createElement: function createElement(htmlString, doc) {
                    var frag = null,
                        temp = null;

                    doc = doc || window.document;

                    frag = doc.createDocumentFragment();
                    temp = doc.createElement('div');

                    temp.innerHTML = htmlString;

                    while (temp.firstChild) {
                        frag.appendChild(temp.firstChild);
                    }

                    return frag;
                },


                removeWhitespace: function removeWhitespace(node) {
                    var deleting;

                    while (node && node.nodeName === '#text') {
                        deleting = node;

                        node = node.previousSibling;

                        deleting.parentElement && deleting.parentElement.removeChild(deleting);
                    }
                },


                isEqualArray: function isEqualArray(a, b) {
                    var i = a.length;

                    if (i !== b.length) return false;

                    while (i--) {
                        if (a[i] !== b[i]) return false;
                    }

                    return true;
                },


                deepEquals: function deepEquals(a, b) {
                    var key;

                    if ((typeof a === "undefined" ? "undefined" : _typeof(a)) === 'object' && a && (typeof b === "undefined" ? "undefined" : _typeof(b)) === 'object' && b) {
                        if (Object.keys(a).length !== Object.keys(b).length) return false;

                        for (key in a) {
                            if (!b.hasOwnProperty(key) || !this.deepEquals(a[key], b[key])) return false;
                        }
                    } else if (a !== b) {
                        return false;
                    }

                    return true;
                },


                arrayShuffle: function arrayShuffle(oldArray) {
                    var newArray = oldArray.slice(),
                        len = newArray.length,
                        i = len,
                        p = -1,
                        t = [];

                    while (i--) {
                        p = ~~(Math.random() * len);
                        t = newArray[i];

                        newArray[i] = newArray[p];
                        newArray[p] = t;
                    }

                    return newArray;
                },


                arrayFromList: function arrayFromList(list) {
                    var output, i;

                    try {
                        return Array.prototype.slice.call(list);
                    } catch (err) {
                        output = [];

                        for (i = 0; i < list.length; i++) {
                            output.push(list[i]);
                        }

                        return output;
                    }
                },


                debounce: function debounce(func, wait, immediate) {
                    var timeout;

                    return function () {
                        var self = this,
                            args = arguments,
                            callNow = immediate && !timeout,
                            later = null;

                        later = function later() {
                            timeout = null;

                            if (!immediate) {
                                func.apply(self, args);
                            }
                        };

                        clearTimeout(timeout);

                        timeout = setTimeout(later, wait);

                        if (callNow) func.apply(self, args);
                    };
                },


                position: function position(element) {
                    var xPosition = 0,
                        yPosition = 0,
                        offsetParent = element;

                    while (element) {
                        xPosition -= element.scrollLeft;
                        yPosition -= element.scrollTop;

                        if (element === offsetParent) {
                            xPosition += element.offsetLeft;
                            yPosition += element.offsetTop;

                            offsetParent = element.offsetParent;
                        }

                        element = element.parentElement;
                    }

                    return {
                        x: xPosition,
                        y: yPosition
                    };
                },


                getHypotenuse: function getHypotenuse(node1, node2) {
                    var distanceX = node1.x - node2.x,
                        distanceY = node1.y - node2.y;

                    distanceX = distanceX < 0 ? distanceX * -1 : distanceX, distanceY = distanceY < 0 ? distanceY * -1 : distanceY;

                    return Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
                },


                getIntersectionRatio: function getIntersectionRatio(box1, box2) {
                    var controlArea = box1.width * box1.height,
                        intersectionX = -1,
                        intersectionY = -1,
                        intersectionArea = -1,
                        ratio = -1;

                    intersectionX = Math.max(0, Math.min(box1.left + box1.width, box2.left + box2.width) - Math.max(box1.left, box2.left));

                    intersectionY = Math.max(0, Math.min(box1.top + box1.height, box2.top + box2.height) - Math.max(box1.top, box2.top));

                    intersectionArea = intersectionY * intersectionX;

                    ratio = intersectionArea / controlArea;

                    return ratio;
                },


                closestParent: function closestParent(el, selector, includeSelf, doc) {
                    var parent = el.parentNode;

                    doc = doc || window.document;

                    if (includeSelf && el.matches(selector)) {
                        return el;
                    }

                    while (parent && parent != doc.body) {
                        if (parent.matches && parent.matches(selector)) {
                            return parent;
                        } else if (parent.parentNode) {
                            parent = parent.parentNode;
                        } else {
                            return null;
                        }
                    }

                    return null;
                },


                children: function children(el, selector, doc) {
                    var children = [],
                        tempId = '';

                    doc = doc || window.doc;

                    if (el) {
                        if (!el.id) {
                            tempId = 'Temp' + this.randomHexKey();

                            el.id = tempId;
                        }

                        children = doc.querySelectorAll('#' + el.id + ' > ' + selector);

                        if (tempId) {
                            el.removeAttribute('id');
                        }
                    }

                    return children;
                },


                clean: function clean(originalArray) {
                    var cleanArray = [],
                        i = -1;

                    for (i = 0; i < originalArray.length; i++) {
                        if (originalArray[i] !== '') {
                            cleanArray.push(originalArray[i]);
                        }
                    }

                    return cleanArray;
                },


                defer: function defer(libraries) {
                    var deferred = null,
                        promiseWrapper = null,
                        $ = null;

                    promiseWrapper = new this.Deferred();

                    if (_mixitup.features.has.promises) {

                        promiseWrapper.promise = new Promise(function (resolve, reject) {
                            promiseWrapper.resolve = resolve;
                            promiseWrapper.reject = reject;
                        });
                    } else if (($ = window.jQuery || libraries.$) && typeof $.Deferred === 'function') {

                        deferred = $.Deferred();

                        promiseWrapper.promise = deferred.promise();
                        promiseWrapper.resolve = deferred.resolve;
                        promiseWrapper.reject = deferred.reject;
                    } else if (window.console) {

                        console.warn(_mixitup.messages.warningNoPromiseImplementation());
                    }

                    return promiseWrapper;
                },


                all: function all(tasks, libraries) {
                    var $ = null;

                    if (_mixitup.features.has.promises) {
                        return Promise.all(tasks);
                    } else if (($ = window.jQuery || libraries.$) && typeof $.when === 'function') {
                        return $.when.apply($, tasks).done(function () {

                            return arguments;
                        });
                    }


                    if (window.console) {
                        console.warn(_mixitup.messages.warningNoPromiseImplementation());
                    }

                    return [];
                },


                getPrefix: function getPrefix(el, property, vendors) {
                    var i = -1,
                        prefix = '';

                    if (h.dashCase(property) in el.style) return '';

                    for (i = 0; prefix = vendors[i]; i++) {
                        if (prefix + property in el.style) {
                            return prefix.toLowerCase();
                        }
                    }

                    return 'unsupported';
                },


                randomHex: function randomHex() {
                    return ('00000' + (Math.random() * 16777216 << 0).toString(16)).substr(-6).toUpperCase();
                },


                getDocumentState: function getDocumentState(doc) {
                    doc = _typeof(doc.body) === 'object' ? doc : window.document;

                    return {
                        scrollTop: window.pageYOffset,
                        scrollLeft: window.pageXOffset,
                        docHeight: doc.documentElement.scrollHeight
                    };
                },


                bind: function bind(obj, fn) {
                    return function () {
                        return fn.apply(obj, arguments);
                    };
                },


                isVisible: function isVisible(el) {
                    var styles = null;

                    if (el.offsetParent) return true;

                    styles = window.getComputedStyle(el);

                    if (styles.position === 'fixed' && styles.visibility !== 'hidden' && styles.opacity !== '0') {

                        return true;
                    }

                    return false;
                },


                seal: function seal(obj) {
                    if (typeof Object.seal === 'function') {
                        Object.seal(obj);
                    }
                },


                freeze: function freeze(obj) {
                    if (typeof Object.freeze === 'function') {
                        Object.freeze(obj);
                    }
                },


                compareVersions: function compareVersions(control, specimen) {
                    var controlParts = control.split('.'),
                        specimenParts = specimen.split('.'),
                        controlPart = -1,
                        specimenPart = -1,
                        i = -1;

                    for (i = 0; i < controlParts.length; i++) {
                        controlPart = parseInt(controlParts[i].replace(/[^\d.]/g, ''));
                        specimenPart = parseInt(specimenParts[i].replace(/[^\d.]/g, '') || 0);

                        if (specimenPart < controlPart) {
                            return false;
                        } else if (specimenPart > controlPart) {
                            return true;
                        }
                    }

                    return true;
                },


                Deferred: function Deferred() {
                    this.promise = null;
                    this.resolve = null;
                    this.reject = null;
                    this.id = h.randomHex();
                },


                isEmptyObject: function isEmptyObject(obj) {
                    var key = '';

                    if (typeof Object.keys === 'function') {
                        return Object.keys(obj).length === 0;
                    }

                    for (key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            return false;
                        }
                    }

                    return true;
                },


                getClassname: function getClassname(classNames, elementName, modifier) {
                    var classname = '';

                    classname += classNames.block;

                    if (classname.length) {
                        classname += classNames.delineatorElement;
                    }

                    classname += classNames['element' + this.pascalCase(elementName)];

                    if (!modifier) return classname;

                    if (classname.length) {
                        classname += classNames.delineatorModifier;
                    }

                    classname += modifier;

                    return classname;
                },


                getProperty: function getProperty(obj, stringKey) {
                    var parts = stringKey.split('.'),
                        returnCurrent = null,
                        current = '',
                        i = 0;

                    if (!stringKey) {
                        return obj;
                    }

                    returnCurrent = function returnCurrent(obj) {
                        if (!obj) {
                            return null;
                        } else {
                            return obj[current];
                        }
                    };

                    while (i < parts.length) {
                        current = parts[i];

                        obj = returnCurrent(obj);

                        i++;
                    }

                    if (typeof obj !== 'undefined') {
                        return obj;
                    } else {
                        return null;
                    }
                }
            };

            _mixitup.h = h;


            _mixitup.Base = function () {};

            _mixitup.Base.prototype = {
                constructor: _mixitup.Base,


                callActions: function callActions(actionName, args) {
                    var self = this,
                        hooks = self.constructor.actions[actionName],
                        extensionName = '';

                    if (!hooks || h.isEmptyObject(hooks)) return;

                    for (extensionName in hooks) {
                        hooks[extensionName].apply(self, args);
                    }
                },


                callFilters: function callFilters(filterName, input, args) {
                    var self = this,
                        hooks = self.constructor.filters[filterName],
                        output = input,
                        extensionName = '';

                    if (!hooks || h.isEmptyObject(hooks)) return output;

                    args = args || [];

                    for (extensionName in hooks) {
                        args = h.arrayFromList(args);

                        args.unshift(output);

                        output = hooks[extensionName].apply(self, args);
                    }

                    return output;
                }
            };


            _mixitup.BaseStatic = function () {
                this.actions = {};
                this.filters = {};


                this.extend = function (extension) {
                    h.extend(this.prototype, extension);
                };


                this.registerAction = function (hookName, extensionName, func) {
                    (this.actions[hookName] = this.actions[hookName] || {})[extensionName] = func;
                };


                this.registerFilter = function (hookName, extensionName, func) {
                    (this.filters[hookName] = this.filters[hookName] || {})[extensionName] = func;
                };
            };


            _mixitup.Features = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.boxSizingPrefix = '';
                this.transformPrefix = '';
                this.transitionPrefix = '';

                this.boxSizingPrefix = '';
                this.transformProp = '';
                this.transformRule = '';
                this.transitionProp = '';
                this.perspectiveProp = '';
                this.perspectiveOriginProp = '';

                this.has = new _mixitup.Has();

                this.canary = null;

                this.BOX_SIZING_PROP = 'boxSizing';
                this.TRANSITION_PROP = 'transition';
                this.TRANSFORM_PROP = 'transform';
                this.PERSPECTIVE_PROP = 'perspective';
                this.PERSPECTIVE_ORIGIN_PROP = 'perspectiveOrigin';
                this.VENDORS = ['Webkit', 'moz', 'O', 'ms'];

                this.TWEENABLE = ['opacity', 'width', 'height', 'marginRight', 'marginBottom', 'x', 'y', 'scale', 'translateX', 'translateY', 'translateZ', 'rotateX', 'rotateY', 'rotateZ'];

                this.callActions('afterConstruct');
            };

            _mixitup.BaseStatic.call(_mixitup.Features);

            _mixitup.Features.prototype = Object.create(_mixitup.Base.prototype);

            h.extend(_mixitup.Features.prototype,
            {
                constructor: _mixitup.Features,


                init: function init() {
                    var self = this;

                    self.callActions('beforeInit', arguments);

                    self.canary = document.createElement('div');

                    self.setPrefixes();
                    self.runTests();

                    self.callActions('beforeInit', arguments);
                },


                runTests: function runTests() {
                    var self = this;

                    self.callActions('beforeRunTests', arguments);

                    self.has.promises = typeof window.Promise === 'function';
                    self.has.transitions = self.transitionPrefix !== 'unsupported';

                    self.callActions('afterRunTests', arguments);

                    h.freeze(self.has);
                },


                setPrefixes: function setPrefixes() {
                    var self = this;

                    self.callActions('beforeSetPrefixes', arguments);

                    self.transitionPrefix = h.getPrefix(self.canary, 'Transition', self.VENDORS);
                    self.transformPrefix = h.getPrefix(self.canary, 'Transform', self.VENDORS);
                    self.boxSizingPrefix = h.getPrefix(self.canary, 'BoxSizing', self.VENDORS);

                    self.boxSizingProp = self.boxSizingPrefix ? self.boxSizingPrefix + h.pascalCase(self.BOX_SIZING_PROP) : self.BOX_SIZING_PROP;

                    self.transitionProp = self.transitionPrefix ? self.transitionPrefix + h.pascalCase(self.TRANSITION_PROP) : self.TRANSITION_PROP;

                    self.transformProp = self.transformPrefix ? self.transformPrefix + h.pascalCase(self.TRANSFORM_PROP) : self.TRANSFORM_PROP;

                    self.transformRule = self.transformPrefix ? '-' + self.transformPrefix + '-' + self.TRANSFORM_PROP : self.TRANSFORM_PROP;

                    self.perspectiveProp = self.transformPrefix ? self.transformPrefix + h.pascalCase(self.PERSPECTIVE_PROP) : self.PERSPECTIVE_PROP;

                    self.perspectiveOriginProp = self.transformPrefix ? self.transformPrefix + h.pascalCase(self.PERSPECTIVE_ORIGIN_PROP) : self.PERSPECTIVE_ORIGIN_PROP;

                    self.callActions('afterSetPrefixes', arguments);
                }
            });


            _mixitup.Has = function () {
                this.transitions = false;
                this.promises = false;

                h.seal(this);
            };


            _mixitup.features = new _mixitup.Features();

            _mixitup.features.init();


            _mixitup.ConfigAnimation = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');


                this.enable = true;


                this.effects = 'fade scale';


                this.effectsIn = '';


                this.effectsOut = '';


                this.duration = 600;


                this.easing = 'ease';


                this.applyPerspective = true;


                this.perspectiveDistance = '3000px';


                this.perspectiveOrigin = '50% 50%';


                this.queue = true;


                this.queueLimit = 3;


                this.animateResizeContainer = true;


                this.animateResizeTargets = false;


                this.staggerSequence = null;


                this.reverseOut = false;


                this.nudge = true;


                this.clampHeight = true;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.ConfigAnimation);

            _mixitup.ConfigAnimation.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.ConfigAnimation.prototype.constructor = _mixitup.ConfigAnimation;


            _mixitup.ConfigCallbacks = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');


                this.onMixStart = null;


                this.onMixBusy = null;


                this.onMixEnd = null;


                this.onMixFail = null;


                this.onMixClick = null;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.ConfigCallbacks);

            _mixitup.ConfigCallbacks.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.ConfigCallbacks.prototype.constructor = _mixitup.ConfigCallbacks;


            _mixitup.ConfigControls = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');


                this.enable = true;


                this.live = false;


                this.scope = 'global'; 


                this.toggleLogic = 'or'; 


                this.toggleDefault = 'all'; 

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.ConfigControls);

            _mixitup.ConfigControls.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.ConfigControls.prototype.constructor = _mixitup.ConfigControls;


            _mixitup.ConfigClassNames = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');


                this.block = 'mixitup';


                this.elementContainer = 'container';


                this.elementFilter = 'control';


                this.elementSort = 'control';


                this.elementMultimix = 'control';


                this.elementToggle = 'control';


                this.modifierActive = 'active';


                this.modifierDisabled = 'disabled';


                this.modifierFailed = 'failed';


                this.delineatorElement = '-';


                this.delineatorModifier = '-';

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.ConfigClassNames);

            _mixitup.ConfigClassNames.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.ConfigClassNames.prototype.constructor = _mixitup.ConfigClassNames;


            _mixitup.ConfigData = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');


                this.uidKey = '';


                this.dirtyCheck = false;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.ConfigData);

            _mixitup.ConfigData.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.ConfigData.prototype.constructor = _mixitup.ConfigData;


            _mixitup.ConfigDebug = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');


                this.enable = false;


                this.showWarnings = true;


                this.fauxAsync = false;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.ConfigDebug);

            _mixitup.ConfigDebug.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.ConfigDebug.prototype.constructor = _mixitup.ConfigDebug;


            _mixitup.ConfigLayout = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');


                this.allowNestedTargets = true;


                this.containerClassName = '';


                this.siblingBefore = null;


                this.siblingAfter = null;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.ConfigLayout);

            _mixitup.ConfigLayout.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.ConfigLayout.prototype.constructor = _mixitup.ConfigLayout;


            _mixitup.ConfigLoad = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');


                this.filter = 'all';


                this.sort = 'default:asc';


                this.dataset = null;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.ConfigLoad);

            _mixitup.ConfigLoad.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.ConfigLoad.prototype.constructor = _mixitup.ConfigLoad;


            _mixitup.ConfigSelectors = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');


                this.target = '.mix';


                this.control = '';

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.ConfigSelectors);

            _mixitup.ConfigSelectors.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.ConfigSelectors.prototype.constructor = _mixitup.ConfigSelectors;


            _mixitup.ConfigRender = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');


                this.target = null;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.ConfigRender);

            _mixitup.ConfigRender.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.ConfigRender.prototype.constructor = _mixitup.ConfigRender;


            _mixitup.ConfigTemplates = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.ConfigTemplates);

            _mixitup.ConfigTemplates.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.ConfigTemplates.prototype.constructor = _mixitup.ConfigTemplates;


            _mixitup.Config = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.animation = new _mixitup.ConfigAnimation();
                this.callbacks = new _mixitup.ConfigCallbacks();
                this.controls = new _mixitup.ConfigControls();
                this.classNames = new _mixitup.ConfigClassNames();
                this.data = new _mixitup.ConfigData();
                this.debug = new _mixitup.ConfigDebug();
                this.layout = new _mixitup.ConfigLayout();
                this.load = new _mixitup.ConfigLoad();
                this.selectors = new _mixitup.ConfigSelectors();
                this.render = new _mixitup.ConfigRender();
                this.templates = new _mixitup.ConfigTemplates();

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.Config);

            _mixitup.Config.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.Config.prototype.constructor = _mixitup.Config;


            _mixitup.MixerDom = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.document = null;
                this.body = null;
                this.container = null;
                this.parent = null;
                this.targets = [];

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.MixerDom);

            _mixitup.MixerDom.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.MixerDom.prototype.constructor = _mixitup.MixerDom;


            _mixitup.UiClassNames = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.base = '';
                this.active = '';
                this.disabled = '';

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.UiClassNames);

            _mixitup.UiClassNames.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.UiClassNames.prototype.constructor = _mixitup.UiClassNames;


            _mixitup.CommandDataset = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.dataset = null;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.CommandDataset);

            _mixitup.CommandDataset.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.CommandDataset.prototype.constructor = _mixitup.CommandDataset;


            _mixitup.CommandMultimix = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.filter = null;
                this.sort = null;
                this.insert = null;
                this.remove = null;
                this.changeLayout = null;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.CommandMultimix);

            _mixitup.CommandMultimix.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.CommandMultimix.prototype.constructor = _mixitup.CommandMultimix;


            _mixitup.CommandFilter = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.selector = '';
                this.collection = null;
                this.action = 'show'; 

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.CommandFilter);

            _mixitup.CommandFilter.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.CommandFilter.prototype.constructor = _mixitup.CommandFilter;


            _mixitup.CommandSort = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.sortString = '';
                this.attribute = '';
                this.order = 'asc';
                this.collection = null;
                this.next = null;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.CommandSort);

            _mixitup.CommandSort.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.CommandSort.prototype.constructor = _mixitup.CommandSort;


            _mixitup.CommandInsert = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.index = 0;
                this.collection = [];
                this.position = 'before'; 
                this.sibling = null;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.CommandInsert);

            _mixitup.CommandInsert.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.CommandInsert.prototype.constructor = _mixitup.CommandInsert;


            _mixitup.CommandRemove = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.targets = [];
                this.collection = [];

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.CommandRemove);

            _mixitup.CommandRemove.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.CommandRemove.prototype.constructor = _mixitup.CommandRemove;


            _mixitup.CommandChangeLayout = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.containerClassName = '';

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.CommandChangeLayout);

            _mixitup.CommandChangeLayout.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.CommandChangeLayout.prototype.constructor = _mixitup.CommandChangeLayout;


            _mixitup.ControlDefinition = function (type, selector, live, parent) {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.type = type;
                this.selector = selector;
                this.live = live || false;
                this.parent = parent || '';

                this.callActions('afterConstruct');

                h.freeze(this);
                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.ControlDefinition);

            _mixitup.ControlDefinition.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.ControlDefinition.prototype.constructor = _mixitup.ControlDefinition;

            _mixitup.controlDefinitions = [];

            _mixitup.controlDefinitions.push(new _mixitup.ControlDefinition('multimix', '[data-filter][data-sort]'));
            _mixitup.controlDefinitions.push(new _mixitup.ControlDefinition('filter', '[data-filter]'));
            _mixitup.controlDefinitions.push(new _mixitup.ControlDefinition('sort', '[data-sort]'));
            _mixitup.controlDefinitions.push(new _mixitup.ControlDefinition('toggle', '[data-toggle]'));


            _mixitup.Control = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.el = null;
                this.selector = '';
                this.bound = [];
                this.pending = -1;
                this.type = '';
                this.status = 'inactive'; 
                this.filter = '';
                this.sort = '';
                this.canDisable = false;
                this.handler = null;
                this.classNames = new _mixitup.UiClassNames();

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.Control);

            _mixitup.Control.prototype = Object.create(_mixitup.Base.prototype);

            h.extend(_mixitup.Control.prototype,
            {
                constructor: _mixitup.Control,


                init: function init(el, type, selector) {
                    var self = this;

                    this.callActions('beforeInit', arguments);

                    self.el = el;
                    self.type = type;
                    self.selector = selector;

                    if (self.selector) {
                        self.status = 'live';
                    } else {
                        self.canDisable = typeof self.el.disable === 'boolean';

                        switch (self.type) {
                            case 'filter':
                                self.filter = self.el.getAttribute('data-filter');

                                break;
                            case 'toggle':
                                self.filter = self.el.getAttribute('data-toggle');

                                break;
                            case 'sort':
                                self.sort = self.el.getAttribute('data-sort');

                                break;
                            case 'multimix':
                                self.filter = self.el.getAttribute('data-filter');
                                self.sort = self.el.getAttribute('data-sort');

                                break;
                        }
                    }

                    self.bindClick();

                    _mixitup.controls.push(self);

                    this.callActions('afterInit', arguments);
                },


                isBound: function isBound(mixer) {
                    var self = this,
                        isBound = false;

                    this.callActions('beforeIsBound', arguments);

                    isBound = self.bound.indexOf(mixer) > -1;

                    return self.callFilters('afterIsBound', isBound, arguments);
                },


                addBinding: function addBinding(mixer) {
                    var self = this;

                    this.callActions('beforeAddBinding', arguments);

                    if (!self.isBound()) {
                        self.bound.push(mixer);
                    }

                    this.callActions('afterAddBinding', arguments);
                },


                removeBinding: function removeBinding(mixer) {
                    var self = this,
                        removeIndex = -1;

                    this.callActions('beforeRemoveBinding', arguments);

                    if ((removeIndex = self.bound.indexOf(mixer)) > -1) {
                        self.bound.splice(removeIndex, 1);
                    }

                    if (self.bound.length < 1) {

                        self.unbindClick();


                        removeIndex = _mixitup.controls.indexOf(self);

                        _mixitup.controls.splice(removeIndex, 1);

                        if (self.status === 'active') {
                            self.renderStatus(self.el, 'inactive');
                        }
                    }

                    this.callActions('afterRemoveBinding', arguments);
                },


                bindClick: function bindClick() {
                    var self = this;

                    this.callActions('beforeBindClick', arguments);

                    self.handler = function (e) {
                        self.handleClick(e);
                    };

                    h.on(self.el, 'click', self.handler);

                    this.callActions('afterBindClick', arguments);
                },


                unbindClick: function unbindClick() {
                    var self = this;

                    this.callActions('beforeUnbindClick', arguments);

                    h.off(self.el, 'click', self.handler);

                    self.handler = null;

                    this.callActions('afterUnbindClick', arguments);
                },


                handleClick: function handleClick(e) {
                    var self = this,
                        button = null,
                        mixer = null,
                        isActive = false,
                        returnValue = void 0,
                        command = {},
                        clone = null,
                        commands = [],
                        i = -1;

                    this.callActions('beforeHandleClick', arguments);

                    this.pending = 0;

                    mixer = self.bound[0];

                    if (!self.selector) {
                        button = self.el;
                    } else {
                        button = h.closestParent(e.target, mixer.config.selectors.control + self.selector, true, mixer.dom.document);
                    }

                    if (!button) {
                        self.callActions('afterHandleClick', arguments);

                        return;
                    }

                    switch (self.type) {
                        case 'filter':
                            command.filter = self.filter || button.getAttribute('data-filter');

                            break;
                        case 'sort':
                            command.sort = self.sort || button.getAttribute('data-sort');

                            break;
                        case 'multimix':
                            command.filter = self.filter || button.getAttribute('data-filter');
                            command.sort = self.sort || button.getAttribute('data-sort');

                            break;
                        case 'toggle':
                            command.filter = self.filter || button.getAttribute('data-toggle');

                            if (self.status === 'live') {
                                isActive = h.hasClass(button, self.classNames.active);
                            } else {
                                isActive = self.status === 'active';
                            }

                            break;
                    }

                    for (i = 0; i < self.bound.length; i++) {

                        clone = new _mixitup.CommandMultimix();

                        h.extend(clone, command);

                        commands.push(clone);
                    }

                    commands = self.callFilters('commandsHandleClick', commands, arguments);

                    self.pending = self.bound.length;

                    for (i = 0; mixer = self.bound[i]; i++) {
                        command = commands[i];

                        if (!command) {

                            continue;
                        }

                        if (!mixer.lastClicked) {
                            mixer.lastClicked = button;
                        }

                        _mixitup.events.fire('mixClick', mixer.dom.container, {
                            state: mixer.state,
                            instance: mixer,
                            originalEvent: e,
                            control: mixer.lastClicked
                        }, mixer.dom.document);

                        if (typeof mixer.config.callbacks.onMixClick === 'function') {
                            returnValue = mixer.config.callbacks.onMixClick.call(mixer.lastClicked, mixer.state, e, mixer);

                            if (returnValue === false) {

                                continue;
                            }
                        }

                        if (self.type === 'toggle') {
                            isActive ? mixer.toggleOff(command.filter) : mixer.toggleOn(command.filter);
                        } else {
                            mixer.multimix(command);
                        }
                    }

                    this.callActions('afterHandleClick', arguments);
                },


                update: function update(command, toggleArray) {
                    var self = this,
                        actions = new _mixitup.CommandMultimix();

                    self.callActions('beforeUpdate', arguments);

                    self.pending--;

                    self.pending = Math.max(0, self.pending);

                    if (self.pending > 0) return;

                    if (self.status === 'live') {

                        self.updateLive(command, toggleArray);
                    } else {

                        actions.sort = self.sort;
                        actions.filter = self.filter;

                        self.callFilters('actionsUpdate', actions, arguments);

                        self.parseStatusChange(self.el, command, actions, toggleArray);
                    }

                    self.callActions('afterUpdate', arguments);
                },


                updateLive: function updateLive(command, toggleArray) {
                    var self = this,
                        controlButtons = null,
                        actions = null,
                        button = null,
                        i = -1;

                    self.callActions('beforeUpdateLive', arguments);

                    if (!self.el) return;

                    controlButtons = self.el.querySelectorAll(self.selector);

                    for (i = 0; button = controlButtons[i]; i++) {
                        actions = new _mixitup.CommandMultimix();

                        switch (self.type) {
                            case 'filter':
                                actions.filter = button.getAttribute('data-filter');

                                break;
                            case 'sort':
                                actions.sort = button.getAttribute('data-sort');

                                break;
                            case 'multimix':
                                actions.filter = button.getAttribute('data-filter');
                                actions.sort = button.getAttribute('data-sort');

                                break;
                            case 'toggle':
                                actions.filter = button.getAttribute('data-toggle');

                                break;
                        }

                        actions = self.callFilters('actionsUpdateLive', actions, arguments);

                        self.parseStatusChange(button, command, actions, toggleArray);
                    }

                    self.callActions('afterUpdateLive', arguments);
                },


                parseStatusChange: function parseStatusChange(button, command, actions, toggleArray) {
                    var self = this,
                        alias = '',
                        toggle = '',
                        i = -1;

                    self.callActions('beforeParseStatusChange', arguments);

                    switch (self.type) {
                        case 'filter':
                            if (command.filter === actions.filter) {
                                self.renderStatus(button, 'active');
                            } else {
                                self.renderStatus(button, 'inactive');
                            }

                            break;
                        case 'multimix':
                            if (command.sort === actions.sort && command.filter === actions.filter) {
                                self.renderStatus(button, 'active');
                            } else {
                                self.renderStatus(button, 'inactive');
                            }

                            break;
                        case 'sort':
                            if (command.sort.match(/:asc/g)) {
                                alias = command.sort.replace(/:asc/g, '');
                            }

                            if (command.sort === actions.sort || alias === actions.sort) {
                                self.renderStatus(button, 'active');
                            } else {
                                self.renderStatus(button, 'inactive');
                            }

                            break;
                        case 'toggle':
                            if (toggleArray.length < 1) self.renderStatus(button, 'inactive');

                            if (command.filter === actions.filter) {
                                self.renderStatus(button, 'active');
                            }

                            for (i = 0; i < toggleArray.length; i++) {
                                toggle = toggleArray[i];

                                if (toggle === actions.filter) {

                                    self.renderStatus(button, 'active');

                                    break;
                                }

                                self.renderStatus(button, 'inactive');
                            }

                            break;
                    }

                    self.callActions('afterParseStatusChange', arguments);
                },


                renderStatus: function renderStatus(button, status) {
                    var self = this;

                    self.callActions('beforeRenderStatus', arguments);

                    switch (status) {
                        case 'active':
                            h.addClass(button, self.classNames.active);
                            h.removeClass(button, self.classNames.disabled);

                            if (self.canDisable) self.el.disabled = false;

                            break;
                        case 'inactive':
                            h.removeClass(button, self.classNames.active);
                            h.removeClass(button, self.classNames.disabled);

                            if (self.canDisable) self.el.disabled = false;

                            break;
                        case 'disabled':
                            if (self.canDisable) self.el.disabled = true;

                            h.addClass(button, self.classNames.disabled);
                            h.removeClass(button, self.classNames.active);

                            break;
                    }

                    if (self.status !== 'live') {

                        self.status = status;
                    }

                    self.callActions('afterRenderStatus', arguments);
                }
            });

            _mixitup.controls = [];


            _mixitup.StyleData = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.x = 0;
                this.y = 0;
                this.top = 0;
                this.right = 0;
                this.bottom = 0;
                this.left = 0;
                this.width = 0;
                this.height = 0;
                this.marginRight = 0;
                this.marginBottom = 0;
                this.opacity = 0;
                this.scale = new _mixitup.TransformData();
                this.translateX = new _mixitup.TransformData();
                this.translateY = new _mixitup.TransformData();
                this.translateZ = new _mixitup.TransformData();
                this.rotateX = new _mixitup.TransformData();
                this.rotateY = new _mixitup.TransformData();
                this.rotateZ = new _mixitup.TransformData();

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.StyleData);

            _mixitup.StyleData.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.StyleData.prototype.constructor = _mixitup.StyleData;


            _mixitup.TransformData = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.value = 0;
                this.unit = '';

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.TransformData);

            _mixitup.TransformData.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.TransformData.prototype.constructor = _mixitup.TransformData;


            _mixitup.TransformDefaults = function () {
                _mixitup.StyleData.apply(this);

                this.callActions('beforeConstruct');

                this.scale.value = 0.01;
                this.scale.unit = '';

                this.translateX.value = 20;
                this.translateX.unit = 'px';

                this.translateY.value = 20;
                this.translateY.unit = 'px';

                this.translateZ.value = 20;
                this.translateZ.unit = 'px';

                this.rotateX.value = 90;
                this.rotateX.unit = 'deg';

                this.rotateY.value = 90;
                this.rotateY.unit = 'deg';

                this.rotateX.value = 90;
                this.rotateX.unit = 'deg';

                this.rotateZ.value = 180;
                this.rotateZ.unit = 'deg';

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.TransformDefaults);

            _mixitup.TransformDefaults.prototype = Object.create(_mixitup.StyleData.prototype);

            _mixitup.TransformDefaults.prototype.constructor = _mixitup.TransformDefaults;


            _mixitup.transformDefaults = new _mixitup.TransformDefaults();


            _mixitup.EventDetail = function () {
                this.state = null;
                this.futureState = null;
                this.instance = null;
                this.originalEvent = null;
            };


            _mixitup.Events = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');


                this.mixStart = null;


                this.mixBusy = null;


                this.mixEnd = null;


                this.mixFail = null;


                this.mixClick = null;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.Events);

            _mixitup.Events.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.Events.prototype.constructor = _mixitup.Events;


            _mixitup.Events.prototype.fire = function (eventType, el, detail, doc) {
                var self = this,
                    event = null,
                    eventDetail = new _mixitup.EventDetail();

                self.callActions('beforeFire', arguments);

                if (typeof self[eventType] === 'undefined') {
                    throw new Error('Event type "' + eventType + '" not found.');
                }

                eventDetail.state = new _mixitup.State();

                h.extend(eventDetail.state, detail.state);

                if (detail.futureState) {
                    eventDetail.futureState = new _mixitup.State();

                    h.extend(eventDetail.futureState, detail.futureState);
                }

                eventDetail.instance = detail.instance;

                if (detail.originalEvent) {
                    eventDetail.originalEvent = detail.originalEvent;
                }

                event = h.getCustomEvent(eventType, eventDetail, doc);

                self.callFilters('eventFire', event, arguments);

                el.dispatchEvent(event);
            };


            _mixitup.events = new _mixitup.Events();


            _mixitup.QueueItem = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.args = [];
                this.instruction = null;
                this.triggerElement = null;
                this.deferred = null;
                this.isToggling = false;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.QueueItem);

            _mixitup.QueueItem.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.QueueItem.prototype.constructor = _mixitup.QueueItem;


            _mixitup.Mixer = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.config = new _mixitup.Config();

                this.id = '';

                this.isBusy = false;
                this.isToggling = false;
                this.incPadding = true;

                this.controls = [];
                this.targets = [];
                this.origOrder = [];
                this.cache = {};

                this.toggleArray = [];

                this.targetsMoved = 0;
                this.targetsImmovable = 0;
                this.targetsBound = 0;
                this.targetsDone = 0;

                this.staggerDuration = 0;
                this.effectsIn = null;
                this.effectsOut = null;
                this.transformIn = [];
                this.transformOut = [];
                this.queue = [];

                this.state = null;
                this.lastOperation = null;
                this.lastClicked = null;
                this.userCallback = null;
                this.userDeferred = null;

                this.dom = new _mixitup.MixerDom();

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.Mixer);

            _mixitup.Mixer.prototype = Object.create(_mixitup.Base.prototype);

            h.extend(_mixitup.Mixer.prototype,
            {
                constructor: _mixitup.Mixer,


                attach: function attach(container, document, id, config) {
                    var self = this,
                        target = null,
                        i = -1;

                    self.callActions('beforeAttach', arguments);

                    self.id = id;

                    if (config) {
                        h.extend(self.config, config, true, true);
                    }

                    self.sanitizeConfig();

                    self.cacheDom(container, document);

                    if (self.config.layout.containerClassName) {
                        h.addClass(self.dom.container, self.config.layout.containerClassName);
                    }

                    if (!_mixitup.features.has.transitions) {
                        self.config.animation.enable = false;
                    }

                    if (typeof window.console === 'undefined') {
                        self.config.debug.showWarnings = false;
                    }

                    if (self.config.data.uidKey) {

                        self.config.controls.enable = false;
                    }

                    self.indexTargets();

                    self.state = self.getInitialState();

                    for (i = 0; target = self.lastOperation.toHide[i]; i++) {
                        target.hide();
                    }

                    if (self.config.controls.enable) {
                        self.initControls();

                        self.updateControls({
                            filter: self.state.activeFilter,
                            sort: self.state.activeSort
                        });

                        self.buildToggleArray(null, self.state);
                    }

                    self.parseEffects();

                    self.callActions('afterAttach', arguments);
                },


                sanitizeConfig: function sanitizeConfig() {
                    var self = this;

                    self.callActions('beforeSanitizeConfig', arguments);


                    self.config.controls.scope = self.config.controls.scope.toLowerCase().trim();
                    self.config.controls.toggleLogic = self.config.controls.toggleLogic.toLowerCase().trim();
                    self.config.controls.toggleDefault = self.config.controls.toggleDefault.toLowerCase().trim();

                    self.config.animation.effects = self.config.animation.effects.trim();

                    self.callActions('afterSanitizeConfig', arguments);
                },


                getInitialState: function getInitialState() {
                    var self = this,
                        state = new _mixitup.State(),
                        operation = new _mixitup.Operation();

                    self.callActions('beforeGetInitialState', arguments);


                    state.activeContainerClassName = self.config.layout.containerClassName;

                    if (self.config.load.dataset) {

                        if (!self.config.data.uidKey || typeof self.config.data.uidKey !== 'string') {
                            throw new TypeError(_mixitup.messages.errorConfigDataUidKeyNotSet());
                        }

                        operation.startDataset = operation.newDataset = state.activeDataset = self.config.load.dataset.slice();
                        operation.startContainerClassName = operation.newContainerClassName = state.activeContainerClassName;
                        operation.show = self.targets.slice();

                        state = self.callFilters('stateGetInitialState', state, arguments);
                    } else {

                        state.activeFilter = self.parseFilterArgs([self.config.load.filter]).command;
                        state.activeSort = self.parseSortArgs([self.config.load.sort]).command;
                        state.totalTargets = self.targets.length;

                        state = self.callFilters('stateGetInitialState', state, arguments);

                        if (state.activeSort.collection || state.activeSort.attribute || state.activeSort.order === 'random' || state.activeSort.order === 'desc') {

                            operation.newSort = state.activeSort;

                            self.sortOperation(operation);

                            self.printSort(false, operation);

                            self.targets = operation.newOrder;
                        } else {
                            operation.startOrder = operation.newOrder = self.targets;
                        }

                        operation.startFilter = operation.newFilter = state.activeFilter;
                        operation.startSort = operation.newSort = state.activeSort;
                        operation.startContainerClassName = operation.newContainerClassName = state.activeContainerClassName;

                        if (operation.newFilter.selector === 'all') {
                            operation.newFilter.selector = self.config.selectors.target;
                        } else if (operation.newFilter.selector === 'none') {
                            operation.newFilter.selector = '';
                        }
                    }

                    operation = self.callFilters('operationGetInitialState', operation, [state]);

                    self.lastOperation = operation;

                    if (operation.newFilter) {
                        self.filterOperation(operation);
                    }

                    state = self.buildState(operation);

                    return state;
                },


                cacheDom: function cacheDom(el, document) {
                    var self = this;

                    self.callActions('beforeCacheDom', arguments);

                    self.dom.document = document;
                    self.dom.body = self.dom.document.querySelector('body');
                    self.dom.container = el;
                    self.dom.parent = el;

                    self.callActions('afterCacheDom', arguments);
                },


                indexTargets: function indexTargets() {
                    var self = this,
                        target = null,
                        el = null,
                        dataset = null,
                        i = -1;

                    self.callActions('beforeIndexTargets', arguments);

                    self.dom.targets = self.config.layout.allowNestedTargets ? self.dom.container.querySelectorAll(self.config.selectors.target) : h.children(self.dom.container, self.config.selectors.target, self.dom.document);

                    self.dom.targets = h.arrayFromList(self.dom.targets);

                    self.targets = [];

                    if ((dataset = self.config.load.dataset) && dataset.length !== self.dom.targets.length) {
                        throw new Error(_mixitup.messages.errorDatasetPrerenderedMismatch());
                    }

                    if (self.dom.targets.length) {
                        for (i = 0; el = self.dom.targets[i]; i++) {
                            target = new _mixitup.Target();

                            target.init(el, self, dataset ? dataset[i] : void 0);

                            target.isInDom = true;

                            self.targets.push(target);
                        }

                        self.dom.parent = self.dom.targets[0].parentElement === self.dom.container ? self.dom.container : self.dom.targets[0].parentElement;
                    }

                    self.origOrder = self.targets;

                    self.callActions('afterIndexTargets', arguments);
                },

                initControls: function initControls() {
                    var self = this,
                        definition = '',
                        controlElements = null,
                        el = null,
                        parent = null,
                        delagator = null,
                        control = null,
                        i = -1,
                        j = -1;

                    self.callActions('beforeInitControls', arguments);

                    switch (self.config.controls.scope) {
                        case 'local':
                            parent = self.dom.container;

                            break;
                        case 'global':
                            parent = self.dom.document;

                            break;
                        default:
                            throw new Error(_mixitup.messages.errorConfigInvalidControlsScope());
                    }

                    for (i = 0; definition = _mixitup.controlDefinitions[i]; i++) {
                        if (self.config.controls.live || definition.live) {
                            if (definition.parent) {
                                delagator = self.dom[definition.parent];

                                if (!delagator) continue;
                            } else {
                                delagator = parent;
                            }

                            control = self.getControl(delagator, definition.type, definition.selector);

                            self.controls.push(control);
                        } else {
                            controlElements = parent.querySelectorAll(self.config.selectors.control + definition.selector);

                            for (j = 0; el = controlElements[j]; j++) {
                                control = self.getControl(el, definition.type, '');

                                if (!control) continue;

                                self.controls.push(control);
                            }
                        }
                    }

                    self.callActions('afterInitControls', arguments);
                },


                getControl: function getControl(el, type, selector) {
                    var self = this,
                        control = null,
                        i = -1;

                    self.callActions('beforeGetControl', arguments);

                    if (!selector) {

                        for (i = 0; control = _mixitup.controls[i]; i++) {
                            if (control.el === el && control.isBound(self)) {


                                return self.callFilters('controlGetControl', null, arguments);
                            } else if (control.el === el && control.type === type && control.selector === selector) {

                                control.addBinding(self);

                                return self.callFilters('controlGetControl', control, arguments);
                            }
                        }
                    }


                    control = new _mixitup.Control();

                    control.init(el, type, selector);

                    control.classNames.base = h.getClassname(self.config.classNames, type);
                    control.classNames.active = h.getClassname(self.config.classNames, type, self.config.classNames.modifierActive);
                    control.classNames.disabled = h.getClassname(self.config.classNames, type, self.config.classNames.modifierDisabled);


                    control.addBinding(self);

                    return self.callFilters('controlGetControl', control, arguments);
                },


                getToggleSelector: function getToggleSelector() {
                    var self = this,
                        delineator = self.config.controls.toggleLogic === 'or' ? ', ' : '',
                        toggleSelector = '';

                    self.callActions('beforeGetToggleSelector', arguments);

                    self.toggleArray = h.clean(self.toggleArray);

                    toggleSelector = self.toggleArray.join(delineator);

                    if (toggleSelector === '') {
                        toggleSelector = self.config.controls.toggleDefault;
                    }

                    return self.callFilters('selectorGetToggleSelector', toggleSelector, arguments);
                },


                buildToggleArray: function buildToggleArray(command, state) {
                    var self = this,
                        activeFilterSelector = '';

                    self.callActions('beforeBuildToggleArray', arguments);

                    if (command && command.filter) {
                        activeFilterSelector = command.filter.selector.replace(/\s/g, '');
                    } else if (state) {
                        activeFilterSelector = state.activeFilter.selector.replace(/\s/g, '');
                    } else {
                        return;
                    }

                    if (activeFilterSelector === self.config.selectors.target || activeFilterSelector === 'all') {
                        activeFilterSelector = '';
                    }

                    if (self.config.controls.toggleLogic === 'or') {
                        self.toggleArray = activeFilterSelector.split(',');
                    } else {
                        self.toggleArray = self.splitCompoundSelector(activeFilterSelector);
                    }

                    self.toggleArray = h.clean(self.toggleArray);

                    self.callActions('afterBuildToggleArray', arguments);
                },


                splitCompoundSelector: function splitCompoundSelector(compoundSelector) {

                    var partials = compoundSelector.split(/([\.\[])/g),
                        toggleArray = [],
                        selector = '',
                        i = -1;

                    if (partials[0] === '') {
                        partials.shift();
                    }

                    for (i = 0; i < partials.length; i++) {
                        if (i % 2 === 0) {
                            selector = '';
                        }

                        selector += partials[i];

                        if (i % 2 !== 0) {
                            toggleArray.push(selector);
                        }
                    }

                    return toggleArray;
                },


                updateControls: function updateControls(command) {
                    var self = this,
                        control = null,
                        output = new _mixitup.CommandMultimix(),
                        i = -1;

                    self.callActions('beforeUpdateControls', arguments);


                    if (command.filter) {
                        output.filter = command.filter.selector;
                    } else {
                        output.filter = self.state.activeFilter.selector;
                    }

                    if (command.sort) {
                        output.sort = self.buildSortString(command.sort);
                    } else {
                        output.sort = self.buildSortString(self.state.activeSort);
                    }

                    if (output.filter === self.config.selectors.target) {
                        output.filter = 'all';
                    }

                    if (output.filter === '') {
                        output.filter = 'none';
                    }

                    h.freeze(output);

                    for (i = 0; control = self.controls[i]; i++) {
                        control.update(output, self.toggleArray);
                    }

                    self.callActions('afterUpdateControls', arguments);
                },


                buildSortString: function buildSortString(command) {
                    var self = this;
                    var output = '';

                    output += command.sortString;

                    if (command.next) {
                        output += ' ' + self.buildSortString(command.next);
                    }

                    return output;
                },


                insertTargets: function insertTargets(command, operation) {
                    var self = this,
                        nextSibling = null,
                        insertionIndex = -1,
                        frag = null,
                        target = null,
                        el = null,
                        i = -1;

                    self.callActions('beforeInsertTargets', arguments);

                    if (typeof command.index === 'undefined') command.index = 0;

                    nextSibling = self.getNextSibling(command.index, command.sibling, command.position);
                    frag = self.dom.document.createDocumentFragment();

                    if (nextSibling) {
                        insertionIndex = h.index(nextSibling, self.config.selectors.target);
                    } else {
                        insertionIndex = self.targets.length;
                    }

                    if (command.collection) {
                        for (i = 0; el = command.collection[i]; i++) {
                            if (self.dom.targets.indexOf(el) > -1) {
                                throw new Error(_mixitup.messages.errorInsertPreexistingElement());
                            }


                            el.style.display = 'none';

                            frag.appendChild(el);
                            frag.appendChild(self.dom.document.createTextNode(' '));

                            if (!h.isElement(el, self.dom.document) || !el.matches(self.config.selectors.target)) continue;

                            target = new _mixitup.Target();

                            target.init(el, self);

                            target.isInDom = true;

                            self.targets.splice(insertionIndex, 0, target);

                            insertionIndex++;
                        }

                        self.dom.parent.insertBefore(frag, nextSibling);
                    }


                    operation.startOrder = self.origOrder = self.targets;

                    self.callActions('afterInsertTargets', arguments);
                },


                getNextSibling: function getNextSibling(index, sibling, position) {
                    var self = this,
                        element = null;

                    index = Math.max(index, 0);

                    if (sibling && position === 'before') {

                        element = sibling;
                    } else if (sibling && position === 'after') {

                        element = sibling.nextElementSibling || null;
                    } else if (self.targets.length > 0 && typeof index !== 'undefined') {

                        element = index < self.targets.length || !self.targets.length ? self.targets[index].dom.el : self.targets[self.targets.length - 1].dom.el.nextElementSibling;
                    } else if (self.targets.length === 0 && self.dom.parent.children.length > 0) {

                        if (self.config.layout.siblingAfter) {
                            element = self.config.layout.siblingAfter;
                        } else if (self.config.layout.siblingBefore) {
                            element = self.config.layout.siblingBefore.nextElementSibling;
                        } else {
                            self.dom.parent.children[0];
                        }
                    } else {
                        element === null;
                    }

                    return self.callFilters('elementGetNextSibling', element, arguments);
                },


                filterOperation: function filterOperation(operation) {
                    var self = this,
                        testResult = false,
                        index = -1,
                        action = '',
                        target = null,
                        i = -1;

                    self.callActions('beforeFilterOperation', arguments);

                    action = operation.newFilter.action;

                    for (i = 0; target = operation.newOrder[i]; i++) {
                        if (operation.newFilter.collection) {

                            testResult = operation.newFilter.collection.indexOf(target.dom.el) > -1;
                        } else {

                            if (operation.newFilter.selector === '') {
                                testResult = false;
                            } else {
                                testResult = target.dom.el.matches(operation.newFilter.selector);
                            }
                        }

                        self.evaluateHideShow(testResult, target, action, operation);
                    }

                    if (operation.toRemove.length) {
                        for (i = 0; target = operation.show[i]; i++) {
                            if (operation.toRemove.indexOf(target) > -1) {

                                operation.show.splice(i, 1);

                                if ((index = operation.toShow.indexOf(target)) > -1) {
                                    operation.toShow.splice(index, 1);
                                }

                                operation.toHide.push(target);
                                operation.hide.push(target);

                                i--;
                            }
                        }
                    }

                    operation.matching = operation.show.slice();

                    if (operation.show.length === 0 && operation.newFilter.selector !== '' && self.targets.length !== 0) {
                        operation.hasFailed = true;
                    }

                    self.callActions('afterFilterOperation', arguments);
                },


                evaluateHideShow: function evaluateHideShow(testResult, target, action, operation) {
                    var self = this;

                    self.callActions('beforeEvaluateHideShow', arguments);

                    if (testResult === true && action === 'show' || testResult === false && action === 'hide') {
                        operation.show.push(target);

                        !target.isShown && operation.toShow.push(target);
                    } else {
                        operation.hide.push(target);

                        target.isShown && operation.toHide.push(target);
                    }

                    self.callActions('afterEvaluateHideShow', arguments);
                },


                sortOperation: function sortOperation(operation) {
                    var self = this;

                    self.callActions('beforeSortOperation', arguments);

                    operation.startOrder = self.targets;

                    if (operation.newSort.collection) {

                        operation.newOrder = operation.newSort.collection;
                    } else if (operation.newSort.order === 'random') {

                        operation.newOrder = h.arrayShuffle(operation.startOrder);
                    } else if (operation.newSort.attribute === '') {

                        operation.newOrder = self.origOrder.slice();

                        if (operation.newSort.order === 'desc') {
                            operation.newOrder.reverse();
                        }
                    } else {

                        operation.newOrder = operation.startOrder.slice();

                        operation.newOrder.sort(function (a, b) {
                            return self.compare(a, b, operation.newSort);
                        });
                    }

                    if (h.isEqualArray(operation.newOrder, operation.startOrder)) {
                        operation.willSort = false;
                    }

                    self.callActions('afterSortOperation', arguments);
                },


                compare: function compare(a, b, command) {
                    var self = this,
                        order = command.order,
                        attrA = self.getAttributeValue(a, command.attribute),
                        attrB = self.getAttributeValue(b, command.attribute);

                    if (isNaN(attrA * 1) || isNaN(attrB * 1)) {
                        attrA = attrA.toLowerCase();
                        attrB = attrB.toLowerCase();
                    } else {
                        attrA = attrA * 1;
                        attrB = attrB * 1;
                    }

                    if (attrA < attrB) {
                        return order === 'asc' ? -1 : 1;
                    }

                    if (attrA > attrB) {
                        return order === 'asc' ? 1 : -1;
                    }

                    if (attrA === attrB && command.next) {
                        return self.compare(a, b, command.next);
                    }

                    return 0;
                },


                getAttributeValue: function getAttributeValue(target, attribute) {
                    var self = this,
                        value = '';

                    value = target.dom.el.getAttribute('data-' + attribute);

                    if (value === null) {
                        if (self.config.debug.showWarnings) {

                            console.warn(_mixitup.messages.warningInconsistentSortingAttributes({
                                attribute: 'data-' + attribute
                            }));
                        }
                    }


                    return self.callFilters('valueGetAttributeValue', value || 0, arguments);
                },


                printSort: function printSort(isResetting, operation) {
                    var self = this,
                        startOrder = isResetting ? operation.newOrder : operation.startOrder,
                        newOrder = isResetting ? operation.startOrder : operation.newOrder,
                        nextSibling = startOrder.length ? startOrder[startOrder.length - 1].dom.el.nextElementSibling : null,
                        frag = window.document.createDocumentFragment(),
                        whitespace = null,
                        target = null,
                        el = null,
                        i = -1;

                    self.callActions('beforePrintSort', arguments);


                    for (i = 0; target = startOrder[i]; i++) {
                        el = target.dom.el;

                        if (el.style.position === 'absolute') continue;

                        h.removeWhitespace(el.previousSibling);

                        el.parentElement.removeChild(el);
                    }

                    whitespace = nextSibling ? nextSibling.previousSibling : self.dom.parent.lastChild;

                    if (whitespace && whitespace.nodeName === '#text') {
                        h.removeWhitespace(whitespace);
                    }

                    for (i = 0; target = newOrder[i]; i++) {

                        el = target.dom.el;

                        if (h.isElement(frag.lastChild)) {
                            frag.appendChild(window.document.createTextNode(' '));
                        }

                        frag.appendChild(el);
                    }


                    if (self.dom.parent.firstChild && self.dom.parent.firstChild !== nextSibling) {
                        frag.insertBefore(window.document.createTextNode(' '), frag.childNodes[0]);
                    }

                    if (nextSibling) {
                        frag.appendChild(window.document.createTextNode(' '));

                        self.dom.parent.insertBefore(frag, nextSibling);
                    } else {
                        self.dom.parent.appendChild(frag);
                    }

                    self.callActions('afterPrintSort', arguments);
                },


                parseSortString: function parseSortString(sortString, command) {
                    var self = this,
                        rules = sortString.split(' '),
                        current = command,
                        rule = [],
                        i = -1;


                    for (i = 0; i < rules.length; i++) {
                        rule = rules[i].split(':');

                        current.sortString = rules[i];
                        current.attribute = h.dashCase(rule[0]);
                        current.order = rule[1] || 'asc';

                        switch (current.attribute) {
                            case 'default':

                                current.attribute = '';

                                break;
                            case 'random':

                                current.attribute = '';
                                current.order = 'random';

                                break;
                        }

                        if (!current.attribute || current.order === 'random') break;

                        if (i < rules.length - 1) {

                            current.next = new _mixitup.CommandSort();

                            h.freeze(current);

                            current = current.next;
                        }
                    }

                    return self.callFilters('commandsParseSort', command, arguments);
                },


                parseEffects: function parseEffects() {
                    var self = this,
                        transformName = '',
                        effectsIn = self.config.animation.effectsIn || self.config.animation.effects,
                        effectsOut = self.config.animation.effectsOut || self.config.animation.effects;

                    self.callActions('beforeParseEffects', arguments);

                    self.effectsIn = new _mixitup.StyleData();
                    self.effectsOut = new _mixitup.StyleData();
                    self.transformIn = [];
                    self.transformOut = [];

                    self.effectsIn.opacity = self.effectsOut.opacity = 1;

                    self.parseEffect('fade', effectsIn, self.effectsIn, self.transformIn);
                    self.parseEffect('fade', effectsOut, self.effectsOut, self.transformOut, true);

                    for (transformName in _mixitup.transformDefaults) {
                        if (!(_mixitup.transformDefaults[transformName] instanceof _mixitup.TransformData)) {
                            continue;
                        }

                        self.parseEffect(transformName, effectsIn, self.effectsIn, self.transformIn);
                        self.parseEffect(transformName, effectsOut, self.effectsOut, self.transformOut, true);
                    }

                    self.parseEffect('stagger', effectsIn, self.effectsIn, self.transformIn);
                    self.parseEffect('stagger', effectsOut, self.effectsOut, self.transformOut, true);

                    self.callActions('afterParseEffects', arguments);
                },


                parseEffect: function parseEffect(effectName, effectString, effects, transform, isOut) {
                    var self = this,
                        re = /\(([^)]+)\)/,
                        propIndex = -1,
                        str = '',
                        match = [],
                        val = '',
                        units = ['%', 'px', 'em', 'rem', 'vh', 'vw', 'deg'],
                        unit = '',
                        i = -1;

                    self.callActions('beforeParseEffect', arguments);

                    if (typeof effectString !== 'string') {
                        throw new TypeError(_mixitup.messages.errorConfigInvalidAnimationEffects());
                    }

                    if (effectString.indexOf(effectName) < 0) {

                        if (effectName === 'stagger') {

                            self.staggerDuration = 0;
                        }

                        return;
                    }


                    propIndex = effectString.indexOf(effectName + '(');

                    if (propIndex > -1) {


                        str = effectString.substring(propIndex);


                        match = re.exec(str);

                        val = match[1];
                    }

                    switch (effectName) {
                        case 'fade':
                            effects.opacity = val ? parseFloat(val) : 0;

                            break;
                        case 'stagger':
                            self.staggerDuration = val ? parseFloat(val) : 100;


                            break;
                        default:

                            if (isOut && self.config.animation.reverseOut && effectName !== 'scale') {
                                effects[effectName].value = (val ? parseFloat(val) : _mixitup.transformDefaults[effectName].value) * -1;
                            } else {
                                effects[effectName].value = val ? parseFloat(val) : _mixitup.transformDefaults[effectName].value;
                            }

                            if (val) {
                                for (i = 0; unit = units[i]; i++) {
                                    if (val.indexOf(unit) > -1) {
                                        effects[effectName].unit = unit;

                                        break;
                                    }
                                }
                            } else {
                                effects[effectName].unit = _mixitup.transformDefaults[effectName].unit;
                            }

                            transform.push(effectName + '(' + effects[effectName].value + effects[effectName].unit + ')');
                    }

                    self.callActions('afterParseEffect', arguments);
                },


                buildState: function buildState(operation) {
                    var self = this,
                        state = new _mixitup.State(),
                        target = null,
                        i = -1;

                    self.callActions('beforeBuildState', arguments);


                    for (i = 0; target = self.targets[i]; i++) {
                        if (!operation.toRemove.length || operation.toRemove.indexOf(target) < 0) {
                            state.targets.push(target.dom.el);
                        }
                    }

                    for (i = 0; target = operation.matching[i]; i++) {
                        state.matching.push(target.dom.el);
                    }

                    for (i = 0; target = operation.show[i]; i++) {
                        state.show.push(target.dom.el);
                    }

                    for (i = 0; target = operation.hide[i]; i++) {
                        if (!operation.toRemove.length || operation.toRemove.indexOf(target) < 0) {
                            state.hide.push(target.dom.el);
                        }
                    }

                    state.id = self.id;
                    state.container = self.dom.container;
                    state.activeFilter = operation.newFilter;
                    state.activeSort = operation.newSort;
                    state.activeDataset = operation.newDataset;
                    state.activeContainerClassName = operation.newContainerClassName;
                    state.hasFailed = operation.hasFailed;
                    state.totalTargets = self.targets.length;
                    state.totalShow = operation.show.length;
                    state.totalHide = operation.hide.length;
                    state.totalMatching = operation.matching.length;
                    state.triggerElement = operation.triggerElement;

                    return self.callFilters('stateBuildState', state, arguments);
                },


                goMix: function goMix(shouldAnimate, operation) {
                    var self = this,
                        deferred = null;

                    self.callActions('beforeGoMix', arguments);


                    if (!self.config.animation.duration || !self.config.animation.effects || !h.isVisible(self.dom.container)) {
                        shouldAnimate = false;
                    }

                    if (!operation.toShow.length && !operation.toHide.length && !operation.willSort && !operation.willChangeLayout) {

                        shouldAnimate = false;
                    }

                    if (!operation.startState.show.length && !operation.show.length) {

                        shouldAnimate = false;
                    }

                    _mixitup.events.fire('mixStart', self.dom.container, {
                        state: operation.startState,
                        futureState: operation.newState,
                        instance: self
                    }, self.dom.document);

                    if (typeof self.config.callbacks.onMixStart === 'function') {
                        self.config.callbacks.onMixStart.call(self.dom.container, operation.startState, operation.newState, self);
                    }

                    h.removeClass(self.dom.container, h.getClassname(self.config.classNames, 'container', self.config.classNames.modifierFailed));

                    if (!self.userDeferred) {

                        deferred = self.userDeferred = h.defer(_mixitup.libraries);
                    } else {

                        deferred = self.userDeferred;
                    }

                    self.isBusy = true;

                    if (!shouldAnimate || !_mixitup.features.has.transitions) {

                        if (self.config.debug.fauxAsync) {
                            setTimeout(function () {
                                self.cleanUp(operation);
                            }, self.config.animation.duration);
                        } else {
                            self.cleanUp(operation);
                        }

                        return self.callFilters('promiseGoMix', deferred.promise, arguments);
                    }


                    if (window.pageYOffset !== operation.docState.scrollTop) {
                        window.scrollTo(operation.docState.scrollLeft, operation.docState.scrollTop);
                    }

                    if (self.config.animation.applyPerspective) {
                        self.dom.parent.style[_mixitup.features.perspectiveProp] = self.config.animation.perspectiveDistance;

                        self.dom.parent.style[_mixitup.features.perspectiveOriginProp] = self.config.animation.perspectiveOrigin;
                    }

                    if (self.config.animation.animateResizeContainer || operation.startHeight === operation.newHeight) {
                        self.dom.parent.style.height = operation.startHeight + 'px';
                    }

                    if (self.config.animation.animateResizeContainer || operation.startWidth === operation.newWidth) {
                        self.dom.parent.style.width = operation.startWidth + 'px';
                    }

                    requestAnimationFrame(function () {
                        self.moveTargets(operation);
                    });

                    return self.callFilters('promiseGoMix', deferred.promise, arguments);
                },


                getStartMixData: function getStartMixData(operation) {
                    var self = this,
                        parentStyle = window.getComputedStyle(self.dom.parent),
                        parentRect = self.dom.parent.getBoundingClientRect(),
                        target = null,
                        data = {},
                        i = -1,
                        boxSizing = parentStyle[_mixitup.features.boxSizingProp];

                    self.incPadding = boxSizing === 'border-box';

                    self.callActions('beforeGetStartMixData', arguments);

                    for (i = 0; target = operation.show[i]; i++) {
                        data = target.getPosData();

                        operation.showPosData[i] = {
                            startPosData: data
                        };
                    }

                    for (i = 0; target = operation.toHide[i]; i++) {
                        data = target.getPosData();

                        operation.toHidePosData[i] = {
                            startPosData: data
                        };
                    }

                    operation.startX = parentRect.left;
                    operation.startY = parentRect.top;

                    operation.startHeight = self.incPadding ? parentRect.height : parentRect.height - parseFloat(parentStyle.paddingTop) - parseFloat(parentStyle.paddingBottom) - parseFloat(parentStyle.borderTop) - parseFloat(parentStyle.borderBottom);

                    operation.startWidth = self.incPadding ? parentRect.width : parentRect.width - parseFloat(parentStyle.paddingLeft) - parseFloat(parentStyle.paddingRight) - parseFloat(parentStyle.borderLeft) - parseFloat(parentStyle.borderRight);

                    self.callActions('afterGetStartMixData', arguments);
                },


                setInter: function setInter(operation) {
                    var self = this,
                        target = null,
                        i = -1;

                    self.callActions('beforeSetInter', arguments);


                    if (self.config.animation.clampHeight) {
                        self.dom.parent.style.height = operation.startHeight;
                        self.dom.parent.style.overflow = 'hidden';
                    }

                    for (i = 0; target = operation.toShow[i]; i++) {
                        target.show();
                    }

                    if (operation.willChangeLayout) {
                        h.removeClass(self.dom.container, operation.startContainerClassName);
                        h.addClass(self.dom.container, operation.newContainerClassName);
                    }

                    self.callActions('afterSetInter', arguments);
                },


                getInterMixData: function getInterMixData(operation) {
                    var self = this,
                        target = null,
                        i = -1;

                    self.callActions('beforeGetInterMixData', arguments);

                    for (i = 0; target = operation.show[i]; i++) {
                        operation.showPosData[i].interPosData = target.getPosData();
                    }

                    for (i = 0; target = operation.toHide[i]; i++) {
                        operation.toHidePosData[i].interPosData = target.getPosData();
                    }

                    self.callActions('afterGetInterMixData', arguments);
                },


                setFinal: function setFinal(operation) {
                    var self = this,
                        target = null,
                        i = -1;

                    self.callActions('beforeSetFinal', arguments);


                    if (self.config.animation.clampHeight) {
                        self.dom.parent.style.height = self.dom.parent.style.overflow = '';
                    }

                    operation.willSort && self.printSort(false, operation);

                    for (i = 0; target = operation.toHide[i]; i++) {
                        target.hide();
                    }

                    self.callActions('afterSetFinal', arguments);
                },


                getFinalMixData: function getFinalMixData(operation) {
                    var self = this,
                        parentStyle = null,
                        parentRect = self.dom.parent.getBoundingClientRect(),
                        target = null,
                        i = -1;

                    if (!self.incPadding) {
                        parentStyle = window.getComputedStyle(self.dom.parent);
                    }

                    self.callActions('beforeGetFinalMixData', arguments);

                    for (i = 0; target = operation.show[i]; i++) {
                        operation.showPosData[i].finalPosData = target.getPosData();
                    }

                    for (i = 0; target = operation.toHide[i]; i++) {
                        operation.toHidePosData[i].finalPosData = target.getPosData();
                    }

                    operation.newX = parentRect.left;
                    operation.newY = parentRect.top;

                    operation.newHeight = self.incPadding ? parentRect.height : parentRect.height - parseFloat(parentStyle.paddingTop) - parseFloat(parentStyle.paddingBottom) - parseFloat(parentStyle.borderTop) - parseFloat(parentStyle.borderBottom);

                    operation.newWidth = self.incPadding ? parentRect.width : parentRect.width - parseFloat(parentStyle.paddingLeft) - parseFloat(parentStyle.paddingRight) - parseFloat(parentStyle.borderLeft) - parseFloat(parentStyle.borderRight);

                    if (operation.willSort) {
                        self.printSort(true, operation);
                    }

                    for (i = 0; target = operation.toShow[i]; i++) {
                        target.hide();
                    }

                    for (i = 0; target = operation.toHide[i]; i++) {
                        target.show();
                    }

                    if (operation.willChangeLayout) {
                        h.removeClass(self.dom.container, operation.newContainerClassName);
                        h.addClass(self.dom.container, self.config.layout.containerClassName);
                    }

                    self.callActions('afterGetFinalMixData', arguments);
                },


                getTweenData: function getTweenData(operation) {
                    var self = this,
                        target = null,
                        posData = null,
                        effectNames = Object.getOwnPropertyNames(self.effectsIn),
                        effectName = '',
                        effect = null,
                        widthChange = -1,
                        heightChange = -1,
                        i = -1,
                        j = -1;

                    self.callActions('beforeGetTweenData', arguments);

                    for (i = 0; target = operation.show[i]; i++) {
                        posData = operation.showPosData[i];
                        posData.posIn = new _mixitup.StyleData();
                        posData.posOut = new _mixitup.StyleData();
                        posData.tweenData = new _mixitup.StyleData();


                        if (target.isShown) {
                            posData.posIn.x = posData.startPosData.x - posData.interPosData.x;
                            posData.posIn.y = posData.startPosData.y - posData.interPosData.y;
                        } else {
                            posData.posIn.x = posData.posIn.y = 0;
                        }

                        posData.posOut.x = posData.finalPosData.x - posData.interPosData.x;
                        posData.posOut.y = posData.finalPosData.y - posData.interPosData.y;


                        posData.posIn.opacity = target.isShown ? 1 : self.effectsIn.opacity;
                        posData.posOut.opacity = 1;
                        posData.tweenData.opacity = posData.posOut.opacity - posData.posIn.opacity;


                        if (!target.isShown && !self.config.animation.nudge) {
                            posData.posIn.x = posData.posOut.x;
                            posData.posIn.y = posData.posOut.y;
                        }

                        posData.tweenData.x = posData.posOut.x - posData.posIn.x;
                        posData.tweenData.y = posData.posOut.y - posData.posIn.y;


                        if (self.config.animation.animateResizeTargets) {
                            posData.posIn.width = posData.startPosData.width;
                            posData.posIn.height = posData.startPosData.height;


                            widthChange = (posData.startPosData.width || posData.finalPosData.width) - posData.interPosData.width;

                            posData.posIn.marginRight = posData.startPosData.marginRight - widthChange;

                            heightChange = (posData.startPosData.height || posData.finalPosData.height) - posData.interPosData.height;

                            posData.posIn.marginBottom = posData.startPosData.marginBottom - heightChange;

                            posData.posOut.width = posData.finalPosData.width;
                            posData.posOut.height = posData.finalPosData.height;

                            widthChange = (posData.finalPosData.width || posData.startPosData.width) - posData.interPosData.width;

                            posData.posOut.marginRight = posData.finalPosData.marginRight - widthChange;

                            heightChange = (posData.finalPosData.height || posData.startPosData.height) - posData.interPosData.height;

                            posData.posOut.marginBottom = posData.finalPosData.marginBottom - heightChange;

                            posData.tweenData.width = posData.posOut.width - posData.posIn.width;
                            posData.tweenData.height = posData.posOut.height - posData.posIn.height;
                            posData.tweenData.marginRight = posData.posOut.marginRight - posData.posIn.marginRight;
                            posData.tweenData.marginBottom = posData.posOut.marginBottom - posData.posIn.marginBottom;
                        }


                        for (j = 0; effectName = effectNames[j]; j++) {
                            effect = self.effectsIn[effectName];

                            if (!(effect instanceof _mixitup.TransformData) || !effect.value) continue;

                            posData.posIn[effectName].value = effect.value;
                            posData.posOut[effectName].value = 0;

                            posData.tweenData[effectName].value = posData.posOut[effectName].value - posData.posIn[effectName].value;

                            posData.posIn[effectName].unit = posData.posOut[effectName].unit = posData.tweenData[effectName].unit = effect.unit;
                        }
                    }

                    for (i = 0; target = operation.toHide[i]; i++) {
                        posData = operation.toHidePosData[i];
                        posData.posIn = new _mixitup.StyleData();
                        posData.posOut = new _mixitup.StyleData();
                        posData.tweenData = new _mixitup.StyleData();


                        posData.posIn.x = target.isShown ? posData.startPosData.x - posData.interPosData.x : 0;
                        posData.posIn.y = target.isShown ? posData.startPosData.y - posData.interPosData.y : 0;
                        posData.posOut.x = self.config.animation.nudge ? 0 : posData.posIn.x;
                        posData.posOut.y = self.config.animation.nudge ? 0 : posData.posIn.y;
                        posData.tweenData.x = posData.posOut.x - posData.posIn.x;
                        posData.tweenData.y = posData.posOut.y - posData.posIn.y;


                        if (self.config.animation.animateResizeTargets) {
                            posData.posIn.width = posData.startPosData.width;
                            posData.posIn.height = posData.startPosData.height;

                            widthChange = posData.startPosData.width - posData.interPosData.width;

                            posData.posIn.marginRight = posData.startPosData.marginRight - widthChange;

                            heightChange = posData.startPosData.height - posData.interPosData.height;

                            posData.posIn.marginBottom = posData.startPosData.marginBottom - heightChange;
                        }


                        posData.posIn.opacity = 1;
                        posData.posOut.opacity = self.effectsOut.opacity;
                        posData.tweenData.opacity = posData.posOut.opacity - posData.posIn.opacity;


                        for (j = 0; effectName = effectNames[j]; j++) {
                            effect = self.effectsOut[effectName];

                            if (!(effect instanceof _mixitup.TransformData) || !effect.value) continue;

                            posData.posIn[effectName].value = 0;
                            posData.posOut[effectName].value = effect.value;

                            posData.tweenData[effectName].value = posData.posOut[effectName].value - posData.posIn[effectName].value;

                            posData.posIn[effectName].unit = posData.posOut[effectName].unit = posData.tweenData[effectName].unit = effect.unit;
                        }
                    }

                    self.callActions('afterGetTweenData', arguments);
                },


                moveTargets: function moveTargets(operation) {
                    var self = this,
                        target = null,
                        moveData = null,
                        posData = null,
                        statusChange = '',
                        willTransition = false,
                        staggerIndex = -1,
                        i = -1,
                        checkProgress = self.checkProgress.bind(self);

                    self.callActions('beforeMoveTargets', arguments);


                    for (i = 0; target = operation.show[i]; i++) {
                        moveData = new _mixitup.IMoveData();
                        posData = operation.showPosData[i];

                        statusChange = target.isShown ? 'none' : 'show';

                        willTransition = self.willTransition(statusChange, operation.hasEffect, posData.posIn, posData.posOut);

                        if (willTransition) {

                            staggerIndex++;
                        }

                        target.show();

                        moveData.posIn = posData.posIn;
                        moveData.posOut = posData.posOut;
                        moveData.statusChange = statusChange;
                        moveData.staggerIndex = staggerIndex;
                        moveData.operation = operation;
                        moveData.callback = willTransition ? checkProgress : null;

                        target.move(moveData);
                    }

                    for (i = 0; target = operation.toHide[i]; i++) {
                        posData = operation.toHidePosData[i];
                        moveData = new _mixitup.IMoveData();

                        statusChange = 'hide';

                        willTransition = self.willTransition(statusChange, posData.posIn, posData.posOut);

                        moveData.posIn = posData.posIn;
                        moveData.posOut = posData.posOut;
                        moveData.statusChange = statusChange;
                        moveData.staggerIndex = i;
                        moveData.operation = operation;
                        moveData.callback = willTransition ? checkProgress : null;

                        target.move(moveData);
                    }

                    if (self.config.animation.animateResizeContainer) {
                        self.dom.parent.style[_mixitup.features.transitionProp] = 'height ' + self.config.animation.duration + 'ms ease, ' + 'width ' + self.config.animation.duration + 'ms ease ';

                        requestAnimationFrame(function () {
                            self.dom.parent.style.height = operation.newHeight + 'px';
                            self.dom.parent.style.width = operation.newWidth + 'px';
                        });
                    }

                    if (operation.willChangeLayout) {
                        h.removeClass(self.dom.container, self.config.layout.ContainerClassName);
                        h.addClass(self.dom.container, operation.newContainerClassName);
                    }

                    self.callActions('afterMoveTargets', arguments);
                },


                hasEffect: function hasEffect() {
                    var self = this,
                        EFFECTABLES = ['scale', 'translateX', 'translateY', 'translateZ', 'rotateX', 'rotateY', 'rotateZ'],
                        effectName = '',
                        effect = null,
                        result = false,
                        value = -1,
                        i = -1;

                    if (self.effectsIn.opacity !== 1) {
                        return self.callFilters('resultHasEffect', true, arguments);
                    }

                    for (i = 0; effectName = EFFECTABLES[i]; i++) {
                        effect = self.effectsIn[effectName];
                        value = (typeof effect === "undefined" ? "undefined" : _typeof(effect)) && effect.value !== 'undefined' ? effect.value : effect;

                        if (value !== 0) {
                            result = true;

                            break;
                        }
                    }

                    return self.callFilters('resultHasEffect', result, arguments);
                },


                willTransition: function willTransition(statusChange, hasEffect, posIn, posOut) {
                    var self = this,
                        result = false;

                    if (!h.isVisible(self.dom.container)) {

                        result = false;
                    } else if (statusChange !== 'none' && hasEffect || posIn.x !== posOut.x || posIn.y !== posOut.y) {

                        result = true;
                    } else if (self.config.animation.animateResizeTargets) {

                        result = posIn.width !== posOut.width || posIn.height !== posOut.height || posIn.marginRight !== posOut.marginRight || posIn.marginTop !== posOut.marginTop;
                    } else {
                        result = false;
                    }

                    return self.callFilters('resultWillTransition', result, arguments);
                },


                checkProgress: function checkProgress(operation) {
                    var self = this;

                    self.targetsDone++;

                    if (self.targetsBound === self.targetsDone) {
                        self.cleanUp(operation);
                    }
                },


                cleanUp: function cleanUp(operation) {
                    var self = this,
                        target = null,
                        whitespaceBefore = null,
                        whitespaceAfter = null,
                        nextInQueue = null,
                        i = -1;

                    self.callActions('beforeCleanUp', arguments);

                    self.targetsMoved = self.targetsImmovable = self.targetsBound = self.targetsDone = 0;

                    for (i = 0; target = operation.show[i]; i++) {
                        target.cleanUp();

                        target.show();
                    }

                    for (i = 0; target = operation.toHide[i]; i++) {
                        target.cleanUp();

                        target.hide();
                    }

                    if (operation.willSort) {
                        self.printSort(false, operation);
                    }


                    self.dom.parent.style[_mixitup.features.transitionProp] = self.dom.parent.style.height = self.dom.parent.style.width = self.dom.parent.style[_mixitup.features.perspectiveProp] = self.dom.parent.style[_mixitup.features.perspectiveOriginProp] = '';

                    if (operation.willChangeLayout) {
                        h.removeClass(self.dom.container, operation.startContainerClassName);
                        h.addClass(self.dom.container, operation.newContainerClassName);
                    }

                    if (operation.toRemove.length) {
                        for (i = 0; target = self.targets[i]; i++) {
                            if (operation.toRemove.indexOf(target) > -1) {
                                if ((whitespaceBefore = target.dom.el.previousSibling) && whitespaceBefore.nodeName === '#text' && (whitespaceAfter = target.dom.el.nextSibling) && whitespaceAfter.nodeName === '#text') {
                                    h.removeWhitespace(whitespaceBefore);
                                }

                                if (!operation.willSort) {

                                    self.dom.parent.removeChild(target.dom.el);
                                }

                                self.targets.splice(i, 1);

                                target.isInDom = false;

                                i--;
                            }
                        }


                        self.origOrder = self.targets;
                    }

                    if (operation.willSort) {
                        self.targets = operation.newOrder;
                    }

                    self.state = operation.newState;
                    self.lastOperation = operation;

                    self.dom.targets = self.state.targets;


                    _mixitup.events.fire('mixEnd', self.dom.container, {
                        state: self.state,
                        instance: self
                    }, self.dom.document);

                    if (typeof self.config.callbacks.onMixEnd === 'function') {
                        self.config.callbacks.onMixEnd.call(self.dom.container, self.state, self);
                    }

                    if (operation.hasFailed) {

                        _mixitup.events.fire('mixFail', self.dom.container, {
                            state: self.state,
                            instance: self
                        }, self.dom.document);

                        if (typeof self.config.callbacks.onMixFail === 'function') {
                            self.config.callbacks.onMixFail.call(self.dom.container, self.state, self);
                        }

                        h.addClass(self.dom.container, h.getClassname(self.config.classNames, 'container', self.config.classNames.modifierFailed));
                    }


                    if (typeof self.userCallback === 'function') {
                        self.userCallback.call(self.dom.container, self.state, self);
                    }

                    if (typeof self.userDeferred.resolve === 'function') {
                        self.userDeferred.resolve(self.state);
                    }

                    self.userCallback = null;
                    self.userDeferred = null;
                    self.lastClicked = null;
                    self.isToggling = false;
                    self.isBusy = false;

                    if (self.queue.length) {
                        self.callActions('beforeReadQueueCleanUp', arguments);

                        nextInQueue = self.queue.shift();


                        self.userDeferred = nextInQueue.deferred;
                        self.isToggling = nextInQueue.isToggling;
                        self.lastClicked = nextInQueue.triggerElement;

                        if (nextInQueue.instruction.command instanceof _mixitup.CommandMultimix) {
                            self.multimix.apply(self, nextInQueue.args);
                        } else {
                            self.dataset.apply(self, nextInQueue.args);
                        }
                    }

                    self.callActions('afterCleanUp', arguments);
                },


                parseMultimixArgs: function parseMultimixArgs(args) {
                    var self = this,
                        instruction = new _mixitup.UserInstruction(),
                        arg = null,
                        i = -1;

                    instruction.animate = self.config.animation.enable;
                    instruction.command = new _mixitup.CommandMultimix();

                    for (i = 0; i < args.length; i++) {
                        arg = args[i];

                        if (arg === null) continue;

                        if ((typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object') {
                            h.extend(instruction.command, arg);
                        } else if (typeof arg === 'boolean') {
                            instruction.animate = arg;
                        } else if (typeof arg === 'function') {
                            instruction.callback = arg;
                        }
                    }


                    if (instruction.command.insert && !(instruction.command.insert instanceof _mixitup.CommandInsert)) {
                        instruction.command.insert = self.parseInsertArgs([instruction.command.insert]).command;
                    }

                    if (instruction.command.remove && !(instruction.command.remove instanceof _mixitup.CommandRemove)) {
                        instruction.command.remove = self.parseRemoveArgs([instruction.command.remove]).command;
                    }

                    if (instruction.command.filter && !(instruction.command.filter instanceof _mixitup.CommandFilter)) {
                        instruction.command.filter = self.parseFilterArgs([instruction.command.filter]).command;
                    }

                    if (instruction.command.sort && !(instruction.command.sort instanceof _mixitup.CommandSort)) {
                        instruction.command.sort = self.parseSortArgs([instruction.command.sort]).command;
                    }

                    if (instruction.command.changeLayout && !(instruction.command.changeLayout instanceof _mixitup.CommandChangeLayout)) {
                        instruction.command.changeLayout = self.parseChangeLayoutArgs([instruction.command.changeLayout]).command;
                    }

                    instruction = self.callFilters('instructionParseMultimixArgs', instruction, arguments);

                    h.freeze(instruction);

                    return instruction;
                },


                parseFilterArgs: function parseFilterArgs(args) {
                    var self = this,
                        instruction = new _mixitup.UserInstruction(),
                        arg = null,
                        i = -1;

                    instruction.animate = self.config.animation.enable;
                    instruction.command = new _mixitup.CommandFilter();

                    for (i = 0; i < args.length; i++) {
                        arg = args[i];

                        if (typeof arg === 'string') {

                            instruction.command.selector = arg;
                        } else if (arg === null) {
                            instruction.command.collection = [];
                        } else if ((typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object' && h.isElement(arg, self.dom.document)) {

                            instruction.command.collection = [arg];
                        } else if ((typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object' && typeof arg.length !== 'undefined') {

                            instruction.command.collection = h.arrayFromList(arg);
                        } else if ((typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object') {

                            h.extend(instruction.command, arg);
                        } else if (typeof arg === 'boolean') {
                            instruction.animate = arg;
                        } else if (typeof arg === 'function') {
                            instruction.callback = arg;
                        }
                    }

                    if (instruction.command.selector && instruction.command.collection) {
                        throw new Error(_mixitup.messages.errorFilterInvalidArguments());
                    }

                    instruction = self.callFilters('instructionParseFilterArgs', instruction, arguments);

                    h.freeze(instruction);

                    return instruction;
                },

                parseSortArgs: function parseSortArgs(args) {
                    var self = this,
                        instruction = new _mixitup.UserInstruction(),
                        arg = null,
                        sortString = '',
                        i = -1;

                    instruction.animate = self.config.animation.enable;
                    instruction.command = new _mixitup.CommandSort();

                    for (i = 0; i < args.length; i++) {
                        arg = args[i];

                        if (arg === null) continue;

                        switch (typeof arg === "undefined" ? "undefined" : _typeof(arg)) {
                            case 'string':

                                sortString = arg;

                                break;
                            case 'object':

                                if (arg.length) {
                                    instruction.command.collection = h.arrayFromList(arg);
                                }

                                break;
                            case 'boolean':
                                instruction.animate = arg;

                                break;
                            case 'function':
                                instruction.callback = arg;

                                break;
                        }
                    }

                    if (sortString) {
                        instruction.command = self.parseSortString(sortString, instruction.command);
                    }

                    instruction = self.callFilters('instructionParseSortArgs', instruction, arguments);

                    h.freeze(instruction);

                    return instruction;
                },


                parseInsertArgs: function parseInsertArgs(args) {
                    var self = this,
                        instruction = new _mixitup.UserInstruction(),
                        arg = null,
                        i = -1;

                    instruction.animate = self.config.animation.enable;
                    instruction.command = new _mixitup.CommandInsert();

                    for (i = 0; i < args.length; i++) {
                        arg = args[i];

                        if (arg === null) continue;

                        if (typeof arg === 'number') {

                            instruction.command.index = arg;
                        } else if (typeof arg === 'string' && ['before', 'after'].indexOf(arg) > -1) {

                            instruction.command.position = arg;
                        } else if (typeof arg === 'string') {

                            instruction.command.collection = h.arrayFromList(h.createElement(arg).childNodes);
                        } else if ((typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object' && h.isElement(arg, self.dom.document)) {

                            !instruction.command.collection.length ? instruction.command.collection = [arg] : instruction.command.sibling = arg;
                        } else if ((typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object' && arg.length) {

                            !instruction.command.collection.length ? instruction.command.collection = arg : instruction.command.sibling = arg[0];
                        } else if ((typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object' && arg.childNodes && arg.childNodes.length) {

                            !instruction.command.collection.length ? instruction.command.collection = h.arrayFromList(arg.childNodes) : instruction.command.sibling = arg.childNodes[0];
                        } else if ((typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object') {

                            h.extend(instruction.command, arg);
                        } else if (typeof arg === 'boolean') {
                            instruction.animate = arg;
                        } else if (typeof arg === 'function') {
                            instruction.callback = arg;
                        }
                    }

                    if (instruction.command.index && instruction.command.sibling) {
                        throw new Error(_mixitup.messages.errorInsertInvalidArguments());
                    }

                    if (!instruction.command.collection.length && self.config.debug.showWarnings) {
                        console.warn(_mixitup.messages.warningInsertNoElements());
                    }

                    instruction = self.callFilters('instructionParseInsertArgs', instruction, arguments);

                    h.freeze(instruction);

                    return instruction;
                },


                parseRemoveArgs: function parseRemoveArgs(args) {
                    var self = this,
                        instruction = new _mixitup.UserInstruction(),
                        target = null,
                        arg = null,
                        i = -1;

                    instruction.animate = self.config.animation.enable;
                    instruction.command = new _mixitup.CommandRemove();

                    for (i = 0; i < args.length; i++) {
                        arg = args[i];

                        if (arg === null) continue;

                        switch (typeof arg === "undefined" ? "undefined" : _typeof(arg)) {
                            case 'number':
                                if (self.targets[arg]) {
                                    instruction.command.targets[0] = self.targets[arg];
                                }

                                break;
                            case 'string':
                                instruction.command.collection = h.arrayFromList(self.dom.parent.querySelectorAll(arg));

                                break;
                            case 'object':
                                if (arg && arg.length) {
                                    instruction.command.collection = arg;
                                } else if (h.isElement(arg, self.dom.document)) {
                                    instruction.command.collection = [arg];
                                } else {

                                    h.extend(instruction.command, arg);
                                }

                                break;
                            case 'boolean':
                                instruction.animate = arg;

                                break;
                            case 'function':
                                instruction.callback = arg;

                                break;
                        }
                    }

                    if (instruction.command.collection.length) {
                        for (i = 0; target = self.targets[i]; i++) {
                            if (instruction.command.collection.indexOf(target.dom.el) > -1) {
                                instruction.command.targets.push(target);
                            }
                        }
                    }

                    if (!instruction.command.targets.length && self.config.debug.showWarnings) {
                        console.warn(_mixitup.messages.warningRemoveNoElements());
                    }

                    h.freeze(instruction);

                    return instruction;
                },


                parseDatasetArgs: function parseDatasetArgs(args) {
                    var self = this,
                        instruction = new _mixitup.UserInstruction(),
                        arg = null,
                        i = -1;

                    instruction.animate = self.config.animation.enable;
                    instruction.command = new _mixitup.CommandDataset();

                    for (i = 0; i < args.length; i++) {
                        arg = args[i];

                        if (arg === null) continue;

                        switch (typeof arg === "undefined" ? "undefined" : _typeof(arg)) {
                            case 'object':
                                if (Array.isArray(arg) || typeof arg.length === 'number') {
                                    instruction.command.dataset = arg;
                                } else {

                                    h.extend(instruction.command, arg);
                                }

                                break;
                            case 'boolean':
                                instruction.animate = arg;

                                break;
                            case 'function':
                                instruction.callback = arg;

                                break;
                        }
                    }

                    h.freeze(instruction);

                    return instruction;
                },


                parseChangeLayoutArgs: function parseChangeLayoutArgs(args) {
                    var self = this,
                        instruction = new _mixitup.UserInstruction(),
                        arg = null,
                        i = -1;

                    instruction.animate = self.config.animation.enable;
                    instruction.command = new _mixitup.CommandChangeLayout();

                    for (i = 0; i < args.length; i++) {
                        arg = args[i];

                        if (arg === null) continue;

                        switch (typeof arg === "undefined" ? "undefined" : _typeof(arg)) {
                            case 'string':
                                instruction.command.containerClassName = arg;

                                break;
                            case 'object':

                                h.extend(instruction.command, arg);

                                break;
                            case 'boolean':
                                instruction.animate = arg;

                                break;
                            case 'function':
                                instruction.callback = arg;

                                break;
                        }
                    }

                    h.freeze(instruction);

                    return instruction;
                },


                queueMix: function queueMix(queueItem) {
                    var self = this,
                        deferred = null,
                        toggleSelector = '';

                    self.callActions('beforeQueueMix', arguments);

                    deferred = h.defer(_mixitup.libraries);

                    if (self.config.animation.queue && self.queue.length < self.config.animation.queueLimit) {
                        queueItem.deferred = deferred;

                        self.queue.push(queueItem);


                        if (self.config.controls.enable) {
                            if (self.isToggling) {
                                self.buildToggleArray(queueItem.instruction.command);

                                toggleSelector = self.getToggleSelector();

                                self.updateControls({
                                    filter: {
                                        selector: toggleSelector
                                    }
                                });
                            } else {
                                self.updateControls(queueItem.instruction.command);
                            }
                        }
                    } else {
                        if (self.config.debug.showWarnings) {
                            console.warn(_mixitup.messages.warningMultimixInstanceQueueFull());
                        }

                        deferred.resolve(self.state);

                        _mixitup.events.fire('mixBusy', self.dom.container, {
                            state: self.state,
                            instance: self
                        }, self.dom.document);

                        if (typeof self.config.callbacks.onMixBusy === 'function') {
                            self.config.callbacks.onMixBusy.call(self.dom.container, self.state, self);
                        }
                    }

                    return self.callFilters('promiseQueueMix', deferred.promise, arguments);
                },


                getDataOperation: function getDataOperation(newDataset) {
                    var self = this,
                        operation = new _mixitup.Operation(),
                        startDataset = [];

                    operation = self.callFilters('operationUnmappedGetDataOperation', operation, arguments);

                    if (self.dom.targets.length && !(startDataset = self.state.activeDataset || []).length) {
                        throw new Error(_mixitup.messages.errorDatasetNotSet());
                    }

                    operation.id = h.randomHex();
                    operation.startState = self.state;
                    operation.startDataset = startDataset;
                    operation.newDataset = newDataset.slice();

                    self.diffDatasets(operation);

                    operation.startOrder = self.targets;
                    operation.newOrder = operation.show;

                    if (self.config.animation.enable) {
                        self.getStartMixData(operation);
                        self.setInter(operation);

                        operation.docState = h.getDocumentState(self.dom.document);

                        self.getInterMixData(operation);
                        self.setFinal(operation);
                        self.getFinalMixData(operation);

                        self.parseEffects();

                        operation.hasEffect = self.hasEffect();

                        self.getTweenData(operation);
                    }

                    self.targets = operation.show.slice();

                    operation.newState = self.buildState(operation);


                    Array.prototype.push.apply(self.targets, operation.toRemove);

                    operation = self.callFilters('operationMappedGetDataOperation', operation, arguments);

                    return operation;
                },


                diffDatasets: function diffDatasets(operation) {
                    var self = this,
                        persistantStartIds = [],
                        persistantNewIds = [],
                        insertedTargets = [],
                        data = null,
                        target = null,
                        el = null,
                        frag = null,
                        nextEl = null,
                        uids = {},
                        id = '',
                        i = -1;

                    self.callActions('beforeDiffDatasets', arguments);

                    for (i = 0; data = operation.newDataset[i]; i++) {
                        if (typeof (id = data[self.config.data.uidKey]) === 'undefined' || id.toString().length < 1) {
                            throw new TypeError(_mixitup.messages.errorDatasetInvalidUidKey({
                                uidKey: self.config.data.uidKey
                            }));
                        }

                        if (!uids[id]) {
                            uids[id] = true;
                        } else {
                            throw new Error(_mixitup.messages.errorDatasetDuplicateUid({
                                uid: id
                            }));
                        }

                        if ((target = self.cache[id]) instanceof _mixitup.Target) {

                            if (self.config.data.dirtyCheck && !h.deepEquals(data, target.data)) {

                                el = target.render(data);

                                target.data = data;

                                if (el !== target.dom.el) {

                                    if (target.isInDom) {
                                        target.unbindEvents();

                                        self.dom.parent.replaceChild(el, target.dom.el);
                                    }

                                    if (!target.isShown) {
                                        el.style.display = 'none';
                                    }

                                    target.dom.el = el;

                                    if (target.isInDom) {
                                        target.bindEvents();
                                    }
                                }
                            }

                            el = target.dom.el;
                        } else {

                            target = new _mixitup.Target();

                            target.init(null, self, data);

                            target.hide();
                        }

                        if (!target.isInDom) {

                            if (!frag) {

                                frag = self.dom.document.createDocumentFragment();
                            }

                            if (frag.lastElementChild) {
                                frag.appendChild(self.dom.document.createTextNode(' '));
                            }

                            frag.appendChild(target.dom.el);

                            target.isInDom = true;

                            target.unbindEvents();
                            target.bindEvents();
                            target.hide();

                            operation.toShow.push(target);

                            insertedTargets.push(target);
                        } else {

                            nextEl = target.dom.el.nextElementSibling;

                            persistantNewIds.push(id);

                            if (frag) {

                                if (frag.lastElementChild) {
                                    frag.appendChild(self.dom.document.createTextNode(' '));
                                }

                                self.insertDatasetFrag(frag, target.dom.el, self.targets.indexOf(target), insertedTargets);

                                frag = null;
                            }
                        }

                        operation.show.push(target);
                    }

                    if (frag) {

                        nextEl = nextEl || self.config.layout.siblingAfter;

                        if (nextEl) {
                            frag.appendChild(self.dom.document.createTextNode(' '));
                        }

                        self.insertDatasetFrag(frag, nextEl, self.dom.targets.length, insertedTargets);
                    }

                    for (i = 0; data = operation.startDataset[i]; i++) {
                        id = data[self.config.data.uidKey];

                        target = self.cache[id];

                        if (operation.show.indexOf(target) < 0) {

                            operation.hide.push(target);
                            operation.toHide.push(target);
                            operation.toRemove.push(target);
                        } else {
                            persistantStartIds.push(id);
                        }
                    }

                    if (!h.isEqualArray(persistantStartIds, persistantNewIds)) {
                        operation.willSort = true;
                    }

                    self.callActions('afterDiffDatasets', arguments);
                },


                insertDatasetFrag: function insertDatasetFrag(frag, nextEl, insertionIndex, targets) {
                    var self = this;

                    self.dom.parent.insertBefore(frag, nextEl);

                    while (targets.length) {
                        self.targets.splice(insertionIndex, 0, targets.shift());

                        insertionIndex++;
                    }
                },


                willSort: function willSort(sortCommandA, sortCommandB) {
                    var self = this,
                        result = false;

                    if (sortCommandA.order === 'random' || sortCommandA.attribute !== sortCommandB.attribute || sortCommandA.order !== sortCommandB.order || sortCommandA.collection !== sortCommandB.collection || sortCommandA.next === null && sortCommandB.next || sortCommandA.next && sortCommandB.next === null) {
                        result = true;
                    } else if (sortCommandA.next && sortCommandB.next) {
                        result = self.willSort(sortCommandA.next, sortCommandB.next);
                    } else {
                        result = false;
                    }

                    return self.callFilters('resultWillSort', result, arguments);
                },


                show: function show() {
                    var self = this;

                    return self.filter('all');
                },


                hide: function hide() {
                    var self = this;

                    return self.filter('none');
                },


                isMixing: function isMixing() {
                    var self = this;

                    return self.isBusy;
                },


                filter: function filter() {
                    var self = this,
                        instruction = self.parseFilterArgs(arguments);

                    return self.multimix({
                        filter: instruction.command
                    }, instruction.animate, instruction.callback);
                },


                toggleOn: function toggleOn() {
                    var self = this,
                        instruction = self.parseFilterArgs(arguments),
                        selector = instruction.command.selector,
                        toggleSelector = '';

                    self.isToggling = true;

                    if (self.toggleArray.indexOf(selector) < 0) {
                        self.toggleArray.push(selector);
                    }

                    toggleSelector = self.getToggleSelector();

                    return self.multimix({
                        filter: toggleSelector
                    }, instruction.animate, instruction.callback);
                },


                toggleOff: function toggleOff() {
                    var self = this,
                        instruction = self.parseFilterArgs(arguments),
                        selector = instruction.command.selector,
                        toggleSelector = '';

                    self.isToggling = true;

                    self.toggleArray.splice(self.toggleArray.indexOf(selector), 1);

                    toggleSelector = self.getToggleSelector();

                    return self.multimix({
                        filter: toggleSelector
                    }, instruction.animate, instruction.callback);
                },


                sort: function sort() {
                    var self = this,
                        instruction = self.parseSortArgs(arguments);

                    return self.multimix({
                        sort: instruction.command
                    }, instruction.animate, instruction.callback);
                },


                changeLayout: function changeLayout() {
                    var self = this,
                        instruction = self.parseChangeLayoutArgs(arguments);

                    return self.multimix({
                        changeLayout: instruction.command
                    }, instruction.animate, instruction.callback);
                },


                dataset: function dataset() {
                    var self = this,
                        instruction = self.parseDatasetArgs(arguments),
                        operation = null,
                        queueItem = null,
                        animate = false;

                    self.callActions('beforeDataset', arguments);

                    if (!self.isBusy) {
                        if (instruction.callback) self.userCallback = instruction.callback;

                        animate = instruction.animate ^ self.config.animation.enable ? instruction.animate : self.config.animation.enable;

                        operation = self.getDataOperation(instruction.command.dataset);

                        return self.goMix(animate, operation);
                    } else {
                        queueItem = new _mixitup.QueueItem();

                        queueItem.args = arguments;
                        queueItem.instruction = instruction;

                        return self.queueMix(queueItem);
                    }
                },


                multimix: function multimix() {
                    var self = this,
                        operation = null,
                        animate = false,
                        queueItem = null,
                        instruction = self.parseMultimixArgs(arguments);

                    self.callActions('beforeMultimix', arguments);

                    if (!self.isBusy) {
                        operation = self.getOperation(instruction.command);

                        if (self.config.controls.enable) {

                            if (instruction.command.filter && !self.isToggling) {

                                self.toggleArray.length = 0;
                                self.buildToggleArray(operation.command);
                            }

                            if (self.queue.length < 1) {
                                self.updateControls(operation.command);
                            }
                        }

                        if (instruction.callback) self.userCallback = instruction.callback;


                        animate = instruction.animate ^ self.config.animation.enable ? instruction.animate : self.config.animation.enable;

                        self.callFilters('operationMultimix', operation, arguments);

                        return self.goMix(animate, operation);
                    } else {
                        queueItem = new _mixitup.QueueItem();

                        queueItem.args = arguments;
                        queueItem.instruction = instruction;
                        queueItem.triggerElement = self.lastClicked;
                        queueItem.isToggling = self.isToggling;

                        return self.queueMix(queueItem);
                    }
                },


                getOperation: function getOperation(multimixCommand) {
                    var self = this,
                        sortCommand = multimixCommand.sort,
                        filterCommand = multimixCommand.filter,
                        changeLayoutCommand = multimixCommand.changeLayout,
                        removeCommand = multimixCommand.remove,
                        insertCommand = multimixCommand.insert,
                        operation = new _mixitup.Operation();

                    operation = self.callFilters('operationUnmappedGetOperation', operation, arguments);

                    operation.id = h.randomHex();
                    operation.command = multimixCommand;
                    operation.startState = self.state;
                    operation.triggerElement = self.lastClicked;

                    if (self.isBusy) {
                        if (self.config.debug.showWarnings) {
                            console.warn(_mixitup.messages.warningGetOperationInstanceBusy());
                        }

                        return null;
                    }

                    if (insertCommand) {
                        self.insertTargets(insertCommand, operation);
                    }

                    if (removeCommand) {
                        operation.toRemove = removeCommand.targets;
                    }

                    operation.startSort = operation.newSort = operation.startState.activeSort;
                    operation.startOrder = operation.newOrder = self.targets;

                    if (sortCommand) {
                        operation.startSort = operation.startState.activeSort;
                        operation.newSort = sortCommand;

                        operation.willSort = self.willSort(sortCommand, operation.startState.activeSort);

                        if (operation.willSort) {
                            self.sortOperation(operation);
                        }
                    }

                    operation.startFilter = operation.startState.activeFilter;

                    if (filterCommand) {
                        operation.newFilter = filterCommand;
                    } else {
                        operation.newFilter = h.extend(new _mixitup.CommandFilter(), operation.startFilter);
                    }

                    if (operation.newFilter.selector === 'all') {
                        operation.newFilter.selector = self.config.selectors.target;
                    } else if (operation.newFilter.selector === 'none') {
                        operation.newFilter.selector = '';
                    }

                    self.filterOperation(operation);

                    if (changeLayoutCommand) {
                        operation.startContainerClassName = operation.startState.activeContainerClassName;

                        operation.newContainerClassName = changeLayoutCommand.containerClassName;

                        if (operation.newContainerClassName !== operation.startContainerClassName) {
                            operation.willChangeLayout = true;
                        }
                    }

                    if (self.config.animation.enable) {

                        self.getStartMixData(operation);
                        self.setInter(operation);

                        operation.docState = h.getDocumentState(self.dom.document);

                        self.getInterMixData(operation);
                        self.setFinal(operation);
                        self.getFinalMixData(operation);

                        self.parseEffects();

                        operation.hasEffect = self.hasEffect();

                        self.getTweenData(operation);
                    }

                    operation.newState = self.buildState(operation);

                    return self.callFilters('operationMappedGetOperation', operation, arguments);
                },


                tween: function tween(operation, multiplier) {
                    var target = null,
                        posData = null,
                        toHideIndex = -1,
                        i = -1;

                    multiplier = Math.min(multiplier, 1);
                    multiplier = Math.max(multiplier, 0);

                    for (i = 0; target = operation.show[i]; i++) {
                        posData = operation.showPosData[i];

                        target.applyTween(posData, multiplier);
                    }

                    for (i = 0; target = operation.hide[i]; i++) {
                        if (target.isShown) {
                            target.hide();
                        }

                        if ((toHideIndex = operation.toHide.indexOf(target)) > -1) {
                            posData = operation.toHidePosData[toHideIndex];

                            if (!target.isShown) {
                                target.show();
                            }

                            target.applyTween(posData, multiplier);
                        }
                    }
                },


                insert: function insert() {
                    var self = this,
                        args = self.parseInsertArgs(arguments);

                    return self.multimix({
                        insert: args.command
                    }, args.animate, args.callback);
                },


                insertBefore: function insertBefore() {
                    var self = this,
                        args = self.parseInsertArgs(arguments);

                    return self.insert(args.command.collection, 'before', args.command.sibling, args.animate, args.callback);
                },


                insertAfter: function insertAfter() {
                    var self = this,
                        args = self.parseInsertArgs(arguments);

                    return self.insert(args.command.collection, 'after', args.command.sibling, args.animate, args.callback);
                },


                prepend: function prepend() {
                    var self = this,
                        args = self.parseInsertArgs(arguments);

                    return self.insert(0, args.command.collection, args.animate, args.callback);
                },


                append: function append() {
                    var self = this,
                        args = self.parseInsertArgs(arguments);

                    return self.insert(self.state.totalTargets, args.command.collection, args.animate, args.callback);
                },


                remove: function remove() {
                    var self = this,
                        args = self.parseRemoveArgs(arguments);

                    return self.multimix({
                        remove: args.command
                    }, args.animate, args.callback);
                },


                getConfig: function getConfig(stringKey) {
                    var self = this,
                        value = null;

                    if (!stringKey) {
                        value = self.config;
                    } else {
                        value = h.getProperty(self.config, stringKey);
                    }

                    return self.callFilters('valueGetConfig', value, arguments);
                },


                configure: function configure(config) {
                    var self = this;

                    self.callActions('beforeConfigure', arguments);

                    h.extend(self.config, config, true, true);

                    self.callActions('afterConfigure', arguments);
                },


                getState: function getState() {
                    var self = this,
                        state = null;

                    state = new _mixitup.State();

                    h.extend(state, self.state);

                    h.freeze(state);

                    return self.callFilters('stateGetState', state, arguments);
                },


                forceRefresh: function forceRefresh() {
                    var self = this;

                    self.indexTargets();
                },


                destroy: function destroy(cleanUp) {
                    var self = this,
                        control = null,
                        target = null,
                        i = 0;

                    self.callActions('beforeDestroy', arguments);

                    for (i = 0; control = self.controls[i]; i++) {
                        control.removeBinding(self);
                    }

                    for (i = 0; target = self.targets[i]; i++) {
                        if (cleanUp) {
                            target.show();
                        }

                        target.unbindEvents();
                    }

                    if (self.dom.container.id.match(/^MixItUp/)) {
                        self.dom.container.removeAttribute('id');
                    }

                    delete _mixitup.instances[self.id];

                    self.callActions('afterDestroy', arguments);
                }
            });


            _mixitup.IMoveData = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.posIn = null;
                this.posOut = null;
                this.operation = null;
                this.callback = null;
                this.statusChange = '';
                this.duration = -1;
                this.staggerIndex = -1;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.IMoveData);

            _mixitup.IMoveData.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.IMoveData.prototype.constructor = _mixitup.IMoveData;


            _mixitup.TargetDom = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.el = null;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.TargetDom);

            _mixitup.TargetDom.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.TargetDom.prototype.constructor = _mixitup.TargetDom;


            _mixitup.Target = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.id = '';
                this.sortString = '';
                this.mixer = null;
                this.callback = null;
                this.isShown = false;
                this.isBound = false;
                this.isExcluded = false;
                this.isInDom = false;
                this.handler = null;
                this.operation = null;
                this.data = null;
                this.dom = new _mixitup.TargetDom();

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.Target);

            _mixitup.Target.prototype = Object.create(_mixitup.Base.prototype);

            h.extend(_mixitup.Target.prototype, {
                constructor: _mixitup.Target,


                init: function init(el, mixer, data) {
                    var self = this,
                        id = '';

                    self.callActions('beforeInit', arguments);

                    self.mixer = mixer;

                    if (!el) {

                        el = self.render(data);
                    }

                    self.cacheDom(el);

                    self.bindEvents();

                    if (self.dom.el.style.display !== 'none') {
                        self.isShown = true;
                    }

                    if (data && mixer.config.data.uidKey) {
                        if (typeof (id = data[mixer.config.data.uidKey]) === 'undefined' || id.toString().length < 1) {
                            throw new TypeError(_mixitup.messages.errorDatasetInvalidUidKey({
                                uidKey: mixer.config.data.uidKey
                            }));
                        }

                        self.id = id;
                        self.data = data;

                        mixer.cache[id] = self;
                    }

                    self.callActions('afterInit', arguments);
                },


                render: function render(data) {
                    var self = this,
                        render = null,
                        el = null,
                        temp = null,
                        output = '';

                    self.callActions('beforeRender', arguments);

                    render = self.callFilters('renderRender', self.mixer.config.render.target, arguments);

                    if (typeof render !== 'function') {
                        throw new TypeError(_mixitup.messages.errorDatasetRendererNotSet());
                    }

                    output = render(data);

                    if (output && (typeof output === "undefined" ? "undefined" : _typeof(output)) === 'object' && h.isElement(output)) {
                        el = output;
                    } else if (typeof output === 'string') {
                        temp = document.createElement('div');
                        temp.innerHTML = output;

                        el = temp.firstElementChild;
                    }

                    return self.callFilters('elRender', el, arguments);
                },


                cacheDom: function cacheDom(el) {
                    var self = this;

                    self.callActions('beforeCacheDom', arguments);

                    self.dom.el = el;

                    self.callActions('afterCacheDom', arguments);
                },


                getSortString: function getSortString(attributeName) {
                    var self = this,
                        value = self.dom.el.getAttribute('data-' + attributeName) || '';

                    self.callActions('beforeGetSortString', arguments);

                    value = isNaN(value * 1) ? value.toLowerCase() : value * 1;

                    self.sortString = value;

                    self.callActions('afterGetSortString', arguments);
                },


                show: function show() {
                    var self = this;

                    self.callActions('beforeShow', arguments);

                    if (!self.isShown) {
                        self.dom.el.style.display = '';

                        self.isShown = true;
                    }

                    self.callActions('afterShow', arguments);
                },


                hide: function hide() {
                    var self = this;

                    self.callActions('beforeHide', arguments);

                    if (self.isShown) {
                        self.dom.el.style.display = 'none';

                        self.isShown = false;
                    }

                    self.callActions('afterHide', arguments);
                },


                move: function move(moveData) {
                    var self = this;

                    self.callActions('beforeMove', arguments);

                    if (!self.isExcluded) {
                        self.mixer.targetsMoved++;
                    }

                    self.applyStylesIn(moveData);

                    requestAnimationFrame(function () {
                        self.applyStylesOut(moveData);
                    });

                    self.callActions('afterMove', arguments);
                },


                applyTween: function applyTween(posData, multiplier) {
                    var self = this,
                        propertyName = '',
                        tweenData = null,
                        posIn = posData.posIn,
                        currentTransformValues = [],
                        currentValues = new _mixitup.StyleData(),
                        i = -1;

                    self.callActions('beforeApplyTween', arguments);

                    currentValues.x = posIn.x;
                    currentValues.y = posIn.y;

                    if (multiplier === 0) {
                        self.hide();
                    } else if (!self.isShown) {
                        self.show();
                    }

                    for (i = 0; propertyName = _mixitup.features.TWEENABLE[i]; i++) {
                        tweenData = posData.tweenData[propertyName];

                        if (propertyName === 'x') {
                            if (!tweenData) continue;

                            currentValues.x = posIn.x + tweenData * multiplier;
                        } else if (propertyName === 'y') {
                            if (!tweenData) continue;

                            currentValues.y = posIn.y + tweenData * multiplier;
                        } else if (tweenData instanceof _mixitup.TransformData) {
                            if (!tweenData.value) continue;

                            currentValues[propertyName].value = posIn[propertyName].value + tweenData.value * multiplier;

                            currentValues[propertyName].unit = tweenData.unit;

                            currentTransformValues.push(propertyName + '(' + currentValues[propertyName].value + tweenData.unit + ')');
                        } else {
                            if (!tweenData) continue;

                            currentValues[propertyName] = posIn[propertyName] + tweenData * multiplier;

                            self.dom.el.style[propertyName] = currentValues[propertyName];
                        }
                    }

                    if (currentValues.x || currentValues.y) {
                        currentTransformValues.unshift('translate(' + currentValues.x + 'px, ' + currentValues.y + 'px)');
                    }

                    if (currentTransformValues.length) {
                        self.dom.el.style[_mixitup.features.transformProp] = currentTransformValues.join(' ');
                    }

                    self.callActions('afterApplyTween', arguments);
                },


                applyStylesIn: function applyStylesIn(moveData) {
                    var self = this,
                        posIn = moveData.posIn,
                        isFading = self.mixer.effectsIn.opacity !== 1,
                        transformValues = [];

                    self.callActions('beforeApplyStylesIn', arguments);

                    transformValues.push('translate(' + posIn.x + 'px, ' + posIn.y + 'px)');

                    if (self.mixer.config.animation.animateResizeTargets) {
                        if (moveData.statusChange !== 'show') {

                            self.dom.el.style.width = posIn.width + 'px';
                            self.dom.el.style.height = posIn.height + 'px';
                        }

                        self.dom.el.style.marginRight = posIn.marginRight + 'px';
                        self.dom.el.style.marginBottom = posIn.marginBottom + 'px';
                    }

                    isFading && (self.dom.el.style.opacity = posIn.opacity);

                    if (moveData.statusChange === 'show') {
                        transformValues = transformValues.concat(self.mixer.transformIn);
                    }

                    self.dom.el.style[_mixitup.features.transformProp] = transformValues.join(' ');

                    self.callActions('afterApplyStylesIn', arguments);
                },


                applyStylesOut: function applyStylesOut(moveData) {
                    var self = this,
                        transitionRules = [],
                        transformValues = [],
                        isResizing = self.mixer.config.animation.animateResizeTargets,
                        isFading = typeof self.mixer.effectsIn.opacity !== 'undefined';

                    self.callActions('beforeApplyStylesOut', arguments);


                    transitionRules.push(self.writeTransitionRule(_mixitup.features.transformRule, moveData.staggerIndex));

                    if (moveData.statusChange !== 'none') {
                        transitionRules.push(self.writeTransitionRule('opacity', moveData.staggerIndex, moveData.duration));
                    }

                    if (isResizing) {
                        transitionRules.push(self.writeTransitionRule('width', moveData.staggerIndex, moveData.duration));

                        transitionRules.push(self.writeTransitionRule('height', moveData.staggerIndex, moveData.duration));

                        transitionRules.push(self.writeTransitionRule('margin', moveData.staggerIndex, moveData.duration));
                    }


                    if (!moveData.callback) {
                        self.mixer.targetsImmovable++;

                        if (self.mixer.targetsMoved === self.mixer.targetsImmovable) {

                            self.mixer.cleanUp(moveData.operation);
                        }

                        return;
                    }


                    self.operation = moveData.operation;
                    self.callback = moveData.callback;


                    !self.isExcluded && self.mixer.targetsBound++;


                    self.isBound = true;


                    self.applyTransition(transitionRules);


                    if (isResizing && moveData.posOut.width > 0 && moveData.posOut.height > 0) {
                        self.dom.el.style.width = moveData.posOut.width + 'px';
                        self.dom.el.style.height = moveData.posOut.height + 'px';
                        self.dom.el.style.marginRight = moveData.posOut.marginRight + 'px';
                        self.dom.el.style.marginBottom = moveData.posOut.marginBottom + 'px';
                    }

                    if (!self.mixer.config.animation.nudge && moveData.statusChange === 'hide') {

                        transformValues.push('translate(' + moveData.posOut.x + 'px, ' + moveData.posOut.y + 'px)');
                    }


                    switch (moveData.statusChange) {
                        case 'hide':
                            isFading && (self.dom.el.style.opacity = self.mixer.effectsOut.opacity);

                            transformValues = transformValues.concat(self.mixer.transformOut);

                            break;
                        case 'show':
                            isFading && (self.dom.el.style.opacity = 1);
                    }

                    if (self.mixer.config.animation.nudge || !self.mixer.config.animation.nudge && moveData.statusChange !== 'hide') {

                        transformValues.push('translate(' + moveData.posOut.x + 'px, ' + moveData.posOut.y + 'px)');
                    }


                    self.dom.el.style[_mixitup.features.transformProp] = transformValues.join(' ');

                    self.callActions('afterApplyStylesOut', arguments);
                },


                writeTransitionRule: function writeTransitionRule(property, staggerIndex, duration) {
                    var self = this,
                        delay = self.getDelay(staggerIndex),
                        rule = '';

                    rule = property + ' ' + (duration > 0 ? duration : self.mixer.config.animation.duration) + 'ms ' + delay + 'ms ' + (property === 'opacity' ? 'linear' : self.mixer.config.animation.easing);

                    return self.callFilters('ruleWriteTransitionRule', rule, arguments);
                },


                getDelay: function getDelay(index) {
                    var self = this,
                        delay = -1;

                    if (typeof self.mixer.config.animation.staggerSequence === 'function') {
                        index = self.mixer.config.animation.staggerSequence.call(self, index, self.state);
                    }

                    delay = !!self.mixer.staggerDuration ? index * self.mixer.staggerDuration : 0;

                    return self.callFilters('delayGetDelay', delay, arguments);
                },


                applyTransition: function applyTransition(rules) {
                    var self = this,
                        transitionString = rules.join(', ');

                    self.callActions('beforeApplyTransition', arguments);

                    self.dom.el.style[_mixitup.features.transitionProp] = transitionString;

                    self.callActions('afterApplyTransition', arguments);
                },


                handleTransitionEnd: function handleTransitionEnd(e) {
                    var self = this,
                        propName = e.propertyName,
                        canResize = self.mixer.config.animation.animateResizeTargets;

                    self.callActions('beforeHandleTransitionEnd', arguments);

                    if (self.isBound && e.target.matches(self.mixer.config.selectors.target) && (propName.indexOf('transform') > -1 || propName.indexOf('opacity') > -1 || canResize && propName.indexOf('height') > -1 || canResize && propName.indexOf('width') > -1 || canResize && propName.indexOf('margin') > -1)) {
                        self.callback.call(self, self.operation);

                        self.isBound = false;
                        self.callback = null;
                        self.operation = null;
                    }

                    self.callActions('afterHandleTransitionEnd', arguments);
                },


                eventBus: function eventBus(e) {
                    var self = this;

                    self.callActions('beforeEventBus', arguments);

                    switch (e.type) {
                        case 'webkitTransitionEnd':
                        case 'transitionend':
                            self.handleTransitionEnd(e);
                    }

                    self.callActions('afterEventBus', arguments);
                },


                unbindEvents: function unbindEvents() {
                    var self = this;

                    self.callActions('beforeUnbindEvents', arguments);

                    h.off(self.dom.el, 'webkitTransitionEnd', self.handler);
                    h.off(self.dom.el, 'transitionend', self.handler);

                    self.callActions('afterUnbindEvents', arguments);
                },


                bindEvents: function bindEvents() {
                    var self = this,
                        transitionEndEvent = '';

                    self.callActions('beforeBindEvents', arguments);

                    transitionEndEvent = _mixitup.features.transitionPrefix === 'webkit' ? 'webkitTransitionEnd' : 'transitionend';

                    self.handler = function (e) {
                        return self.eventBus(e);
                    };

                    h.on(self.dom.el, transitionEndEvent, self.handler);

                    self.callActions('afterBindEvents', arguments);
                },


                getPosData: function getPosData(getBox) {
                    var self = this,
                        styles = {},
                        rect = null,
                        posData = new _mixitup.StyleData();

                    self.callActions('beforeGetPosData', arguments);

                    posData.x = self.dom.el.offsetLeft;
                    posData.y = self.dom.el.offsetTop;

                    if (self.mixer.config.animation.animateResizeTargets || getBox) {
                        rect = self.dom.el.getBoundingClientRect();

                        posData.top = rect.top;
                        posData.right = rect.right;
                        posData.bottom = rect.bottom;
                        posData.left = rect.left;

                        posData.width = rect.width;
                        posData.height = rect.height;
                    }

                    if (self.mixer.config.animation.animateResizeTargets) {
                        styles = window.getComputedStyle(self.dom.el);

                        posData.marginBottom = parseFloat(styles.marginBottom);
                        posData.marginRight = parseFloat(styles.marginRight);
                    }

                    return self.callFilters('posDataGetPosData', posData, arguments);
                },


                cleanUp: function cleanUp() {
                    var self = this;

                    self.callActions('beforeCleanUp', arguments);

                    self.dom.el.style[_mixitup.features.transformProp] = '';
                    self.dom.el.style[_mixitup.features.transitionProp] = '';
                    self.dom.el.style.opacity = '';

                    if (self.mixer.config.animation.animateResizeTargets) {
                        self.dom.el.style.width = '';
                        self.dom.el.style.height = '';
                        self.dom.el.style.marginRight = '';
                        self.dom.el.style.marginBottom = '';
                    }

                    self.callActions('afterCleanUp', arguments);
                }
            });


            _mixitup.Collection = function (instances) {
                var instance = null,
                    i = -1;

                this.callActions('beforeConstruct');

                for (i = 0; instance = instances[i]; i++) {
                    this[i] = instance;
                }

                this.length = instances.length;

                this.callActions('afterConstruct');

                h.freeze(this);
            };

            _mixitup.BaseStatic.call(_mixitup.Collection);

            _mixitup.Collection.prototype = Object.create(_mixitup.Base.prototype);

            h.extend(_mixitup.Collection.prototype,
            {
                constructor: _mixitup.Collection,


                mixitup: function mixitup(methodName) {
                    var self = this,
                        instance = null,
                        args = Array.prototype.slice.call(arguments),
                        tasks = [],
                        i = -1;

                    this.callActions('beforeMixitup');

                    args.shift();

                    for (i = 0; instance = self[i]; i++) {
                        tasks.push(instance[methodName].apply(instance, args));
                    }

                    return self.callFilters('promiseMixitup', h.all(tasks, _mixitup.libraries), arguments);
                }
            });


            _mixitup.Operation = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.id = '';

                this.args = [];
                this.command = null;
                this.showPosData = [];
                this.toHidePosData = [];

                this.startState = null;
                this.newState = null;
                this.docState = null;

                this.willSort = false;
                this.willChangeLayout = false;
                this.hasEffect = false;
                this.hasFailed = false;

                this.triggerElement = null;

                this.show = [];
                this.hide = [];
                this.matching = [];
                this.toShow = [];
                this.toHide = [];
                this.toMove = [];
                this.toRemove = [];
                this.startOrder = [];
                this.newOrder = [];
                this.startSort = null;
                this.newSort = null;
                this.startFilter = null;
                this.newFilter = null;
                this.startDataset = null;
                this.newDataset = null;
                this.startX = 0;
                this.startY = 0;
                this.startHeight = 0;
                this.startWidth = 0;
                this.newX = 0;
                this.newY = 0;
                this.newHeight = 0;
                this.newWidth = 0;
                this.startContainerClassName = '';
                this.startDisplay = '';
                this.newContainerClassName = '';
                this.newDisplay = '';

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.Operation);

            _mixitup.Operation.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.Operation.prototype.constructor = _mixitup.Operation;


            _mixitup.State = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');


                this.id = '';


                this.activeFilter = null;


                this.activeSort = null;


                this.activeContainerClassName = '';


                this.container = null;


                this.targets = [];


                this.hide = [];


                this.show = [];


                this.matching = [];


                this.totalTargets = -1;


                this.totalShow = -1;


                this.totalHide = -1;


                this.totalMatching = -1;


                this.hasFailed = false;


                this.triggerElement = null;


                this.activeDataset = null;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.State);

            _mixitup.State.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.State.prototype.constructor = _mixitup.State;


            _mixitup.UserInstruction = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');

                this.command = {};
                this.animate = false;
                this.callback = null;

                this.callActions('afterConstruct');

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.UserInstruction);

            _mixitup.UserInstruction.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.UserInstruction.prototype.constructor = _mixitup.UserInstruction;


            _mixitup.Messages = function () {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct');


                this.ERROR_FACTORY_INVALID_CONTAINER = '[MixItUp] An invalid selector or element reference was passed to the mixitup factory function';

                this.ERROR_FACTORY_CONTAINER_NOT_FOUND = '[MixItUp] The provided selector yielded no container element';

                this.ERROR_CONFIG_INVALID_ANIMATION_EFFECTS = '[MixItUp] Invalid value for `animation.effects`';

                this.ERROR_CONFIG_INVALID_CONTROLS_SCOPE = '[MixItUp] Invalid value for `controls.scope`';

                this.ERROR_CONFIG_INVALID_PROPERTY = '[MixitUp] Invalid configuration object property "${erroneous}"${suggestion}';

                this.ERROR_CONFIG_INVALID_PROPERTY_SUGGESTION = '. Did you mean "${probableMatch}"?';

                this.ERROR_CONFIG_DATA_UID_KEY_NOT_SET = '[MixItUp] To use the dataset API, a UID key must be specified using `data.uidKey`';

                this.ERROR_DATASET_INVALID_UID_KEY = '[MixItUp] The specified UID key "${uidKey}" is not present on one or more dataset items';

                this.ERROR_DATASET_DUPLICATE_UID = '[MixItUp] The UID "${uid}" was found on two or more dataset items. UIDs must be unique.';

                this.ERROR_INSERT_INVALID_ARGUMENTS = '[MixItUp] Please provider either an index or a sibling and position to insert, not both';

                this.ERROR_INSERT_PREEXISTING_ELEMENT = '[MixItUp] An element to be inserted already exists in the container';

                this.ERROR_FILTER_INVALID_ARGUMENTS = '[MixItUp] Please provide either a selector or collection `.filter()`, not both';

                this.ERROR_DATASET_NOT_SET = '[MixItUp] To use the dataset API with pre-rendered targets, a starting dataset must be set using `load.dataset`';

                this.ERROR_DATASET_PRERENDERED_MISMATCH = '[MixItUp] `load.dataset` does not match pre-rendered targets';

                this.ERROR_DATASET_RENDERER_NOT_SET = '[MixItUp] To insert an element via the dataset API, a target renderer function must be provided to `render.target`';


                this.WARNING_FACTORY_PREEXISTING_INSTANCE = '[MixItUp] WARNING: This element already has an active MixItUp instance. The provided configuration object will be ignored.' + ' If you wish to perform additional methods on this instance, please create a reference.';

                this.WARNING_INSERT_NO_ELEMENTS = '[MixItUp] WARNING: No valid elements were passed to `.insert()`';

                this.WARNING_REMOVE_NO_ELEMENTS = '[MixItUp] WARNING: No valid elements were passed to `.remove()`';

                this.WARNING_MULTIMIX_INSTANCE_QUEUE_FULL = '[MixItUp] WARNING: An operation was requested but the MixItUp instance was busy. The operation was rejected because the ' + 'queue is full or queuing is disabled.';

                this.WARNING_GET_OPERATION_INSTANCE_BUSY = '[MixItUp] WARNING: Operations can be be created while the MixItUp instance is busy.';

                this.WARNING_NO_PROMISE_IMPLEMENTATION = '[MixItUp] WARNING: No Promise implementations could be found. If you wish to use promises with MixItUp please install' + ' an ES6 Promise polyfill.';

                this.WARNING_INCONSISTENT_SORTING_ATTRIBUTES = '[MixItUp] WARNING: The requested sorting data attribute "${attribute}" was not present on one or more target elements' + ' which may product unexpected sort output';

                this.callActions('afterConstruct');

                this.compileTemplates();

                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.Messages);

            _mixitup.Messages.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.Messages.prototype.constructor = _mixitup.Messages;


            _mixitup.Messages.prototype.compileTemplates = function () {
                var errorKey = '';
                var errorMessage = '';

                for (errorKey in this) {
                    if (typeof (errorMessage = this[errorKey]) !== 'string') continue;

                    this[h.camelCase(errorKey)] = h.template(errorMessage);
                }
            };

            _mixitup.messages = new _mixitup.Messages();


            _mixitup.Facade = function Mixer(mixer) {
                _mixitup.Base.call(this);

                this.callActions('beforeConstruct', arguments);

                this.configure = mixer.configure.bind(mixer);
                this.show = mixer.show.bind(mixer);
                this.hide = mixer.hide.bind(mixer);
                this.filter = mixer.filter.bind(mixer);
                this.toggleOn = mixer.toggleOn.bind(mixer);
                this.toggleOff = mixer.toggleOff.bind(mixer);
                this.sort = mixer.sort.bind(mixer);
                this.changeLayout = mixer.changeLayout.bind(mixer);
                this.multimix = mixer.multimix.bind(mixer);
                this.multiMix = mixer.multimix.bind(mixer);
                this.dataset = mixer.dataset.bind(mixer);
                this.tween = mixer.tween.bind(mixer);
                this.insert = mixer.insert.bind(mixer);
                this.insertBefore = mixer.insertBefore.bind(mixer);
                this.insertAfter = mixer.insertAfter.bind(mixer);
                this.prepend = mixer.prepend.bind(mixer);
                this.append = mixer.append.bind(mixer);
                this.remove = mixer.remove.bind(mixer);
                this.destroy = mixer.destroy.bind(mixer);
                this.forceRefresh = mixer.forceRefresh.bind(mixer);
                this.isMixing = mixer.isMixing.bind(mixer);
                this.getOperation = mixer.getOperation.bind(mixer);
                this.getConfig = mixer.getConfig.bind(mixer);
                this.getState = mixer.getState.bind(mixer);

                this.callActions('afterConstruct', arguments);

                h.freeze(this);
                h.seal(this);
            };

            _mixitup.BaseStatic.call(_mixitup.Facade);

            _mixitup.Facade.prototype = Object.create(_mixitup.Base.prototype);

            _mixitup.Facade.prototype.constructor = _mixitup.Facade;

            if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && (typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object') {
                module.exports = _mixitup;
            } else if (typeof define === 'function' && define.amd) {
                define(function () {
                    return _mixitup;
                });
            } else if (typeof window.mixitup === 'undefined' || typeof window.mixitup !== 'function') {
                window.mixitup = window.mixItUp = _mixitup;
            }

            if ((jq = window.$ || window.jQuery) && jq.fn.jquery) {
                _mixitup.registerJqPlugin(jq);
            }
            _mixitup.BaseStatic.call(_mixitup.constructor);

            _mixitup.NAME = 'mixitup';
            _mixitup.CORE_VERSION = '3.1.7';
        })(window);
    }, {}] }, {}, [1]);