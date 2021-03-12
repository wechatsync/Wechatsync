/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function extend (destination) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (source.hasOwnProperty(key)) destination[key] = source[key];
    }
  }
  return destination
}

function repeat (character, count) {
  return Array(count + 1).join(character)
}

var blockElements = [
  'address', 'article', 'aside', 'audio', 'blockquote', 'body', 'canvas',
  'center', 'dd', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption',
  'figure', 'footer', 'form', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'hgroup', 'hr', 'html', 'isindex', 'li', 'main', 'menu', 'nav',
  'noframes', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table',
  'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
];

function isBlock (node) {
  return blockElements.indexOf(node.nodeName.toLowerCase()) !== -1
}

var voidElements = [
  'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
  'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
];

function isVoid (node) {
  return voidElements.indexOf(node.nodeName.toLowerCase()) !== -1
}

var voidSelector = voidElements.join();
function hasVoid (node) {
  return node.querySelector && node.querySelector(voidSelector)
}

var rules = {};

rules.paragraph = {
  filter: 'p',

  replacement: function (content) {
    return '\n\n' + content + '\n\n'
  }
};

rules.lineBreak = {
  filter: 'br',

  replacement: function (content, node, options) {
    return options.br + '\n'
  }
};

rules.heading = {
  filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],

  replacement: function (content, node, options) {
    var hLevel = Number(node.nodeName.charAt(1));

    if (options.headingStyle === 'setext' && hLevel < 3) {
      var underline = repeat((hLevel === 1 ? '=' : '-'), content.length);
      return (
        '\n\n' + content + '\n' + underline + '\n\n'
      )
    } else {
      return '\n\n' + repeat('#', hLevel) + ' ' + content + '\n\n'
    }
  }
};

rules.blockquote = {
  filter: 'blockquote',

  replacement: function (content) {
    content = content.replace(/^\n+|\n+$/g, '');
    content = content.replace(/^/gm, '> ');
    return '\n\n' + content + '\n\n'
  }
};

rules.list = {
  filter: ['ul', 'ol'],

  replacement: function (content, node) {
    var parent = node.parentNode;
    if (parent.nodeName === 'LI' && parent.lastElementChild === node) {
      return '\n' + content
    } else {
      return '\n\n' + content + '\n\n'
    }
  }
};

rules.listItem = {
  filter: 'li',

  replacement: function (content, node, options) {
    content = content
      .replace(/^\n+/, '') // remove leading newlines
      .replace(/\n+$/, '\n') // replace trailing newlines with just a single one
      .replace(/\n/gm, '\n    '); // indent
    var prefix = options.bulletListMarker + '   ';
    var parent = node.parentNode;
    if (parent.nodeName === 'OL') {
      var start = parent.getAttribute('start');
      var index = Array.prototype.indexOf.call(parent.children, node);
      prefix = (start ? Number(start) + index : index + 1) + '.  ';
    }
    return (
      prefix + content + (node.nextSibling && !/\n$/.test(content) ? '\n' : '')
    )
  }
};

rules.indentedCodeBlock = {
  filter: function (node, options) {
    return (
      options.codeBlockStyle === 'indented' &&
      node.nodeName === 'PRE' &&
      node.firstChild &&
      node.firstChild.nodeName === 'CODE'
    )
  },

  replacement: function (content, node, options) {
    return (
      '\n\n    ' +
      node.firstChild.textContent.replace(/\n/g, '\n    ') +
      '\n\n'
    )
  }
};

rules.fencedCodeBlock = {
  filter: function (node, options) {
    return (
      options.codeBlockStyle === 'fenced' &&
      node.nodeName === 'PRE' &&
      node.firstChild &&
      node.firstChild.nodeName === 'CODE'
    )
  },

  replacement: function (content, node, options) {
    var className = node.firstChild.className || '';
    var language = (className.match(/language-(\S+)/) || [null, ''])[1];
    var code = node.firstChild.textContent;

    var fenceChar = options.fence.charAt(0);
    var fenceSize = 3;
    var fenceInCodeRegex = new RegExp('^' + fenceChar + '{3,}', 'gm');

    var match;
    while ((match = fenceInCodeRegex.exec(code))) {
      if (match[0].length >= fenceSize) {
        fenceSize = match[0].length + 1;
      }
    }

    var fence = repeat(fenceChar, fenceSize);

    return (
      '\n\n' + fence + language + '\n' +
      code.replace(/\n$/, '') +
      '\n' + fence + '\n\n'
    )
  }
};

rules.horizontalRule = {
  filter: 'hr',

  replacement: function (content, node, options) {
    return '\n\n' + options.hr + '\n\n'
  }
};

rules.inlineLink = {
  filter: function (node, options) {
    return (
      options.linkStyle === 'inlined' &&
      node.nodeName === 'A' &&
      node.getAttribute('href')
    )
  },

  replacement: function (content, node) {
    var href = node.getAttribute('href');
    var title = node.title ? ' "' + node.title + '"' : '';
    return '[' + content + '](' + href + title + ')'
  }
};

rules.referenceLink = {
  filter: function (node, options) {
    return (
      options.linkStyle === 'referenced' &&
      node.nodeName === 'A' &&
      node.getAttribute('href')
    )
  },

  replacement: function (content, node, options) {
    var href = node.getAttribute('href');
    var title = node.title ? ' "' + node.title + '"' : '';
    var replacement;
    var reference;

    switch (options.linkReferenceStyle) {
      case 'collapsed':
        replacement = '[' + content + '][]';
        reference = '[' + content + ']: ' + href + title;
        break
      case 'shortcut':
        replacement = '[' + content + ']';
        reference = '[' + content + ']: ' + href + title;
        break
      default:
        var id = this.references.length + 1;
        replacement = '[' + content + '][' + id + ']';
        reference = '[' + id + ']: ' + href + title;
    }

    this.references.push(reference);
    return replacement
  },

  references: [],

  append: function (options) {
    var references = '';
    if (this.references.length) {
      references = '\n\n' + this.references.join('\n') + '\n\n';
      this.references = []; // Reset references
    }
    return references
  }
};

rules.emphasis = {
  filter: ['em', 'i'],

  replacement: function (content, node, options) {
    if (!content.trim()) return ''
    return options.emDelimiter + content + options.emDelimiter
  }
};

rules.strong = {
  filter: ['strong', 'b'],

  replacement: function (content, node, options) {
    if (!content.trim()) return ''
    return options.strongDelimiter + content + options.strongDelimiter
  }
};

rules.code = {
  filter: function (node) {
    var hasSiblings = node.previousSibling || node.nextSibling;
    var isCodeBlock = node.parentNode.nodeName === 'PRE' && !hasSiblings;

    return node.nodeName === 'CODE' && !isCodeBlock
  },

  replacement: function (content) {
    if (!content.trim()) return ''

    var delimiter = '`';
    var leadingSpace = '';
    var trailingSpace = '';
    var matches = content.match(/`+/gm);
    if (matches) {
      if (/^`/.test(content)) leadingSpace = ' ';
      if (/`$/.test(content)) trailingSpace = ' ';
      while (matches.indexOf(delimiter) !== -1) delimiter = delimiter + '`';
    }

    return delimiter + leadingSpace + content + trailingSpace + delimiter
  }
};

rules.image = {
  filter: 'img',

  replacement: function (content, node) {
    var alt = node.alt || '';
    var src = node.getAttribute('src') || '';
    var title = node.title || '';
    var titlePart = title ? ' "' + title + '"' : '';
    return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : ''
  }
};

/**
 * Manages a collection of rules used to convert HTML to Markdown
 */

function Rules (options) {
  this.options = options;
  this._keep = [];
  this._remove = [];

  this.blankRule = {
    replacement: options.blankReplacement
  };

  this.keepReplacement = options.keepReplacement;

  this.defaultRule = {
    replacement: options.defaultReplacement
  };

  this.array = [];
  for (var key in options.rules) this.array.push(options.rules[key]);
}

Rules.prototype = {
  add: function (key, rule) {
    this.array.unshift(rule);
  },

  keep: function (filter) {
    this._keep.unshift({
      filter: filter,
      replacement: this.keepReplacement
    });
  },

  remove: function (filter) {
    this._remove.unshift({
      filter: filter,
      replacement: function () {
        return ''
      }
    });
  },

  forNode: function (node) {
    if (node.isBlank) return this.blankRule
    var rule;

    if ((rule = findRule(this.array, node, this.options))) return rule
    if ((rule = findRule(this._keep, node, this.options))) return rule
    if ((rule = findRule(this._remove, node, this.options))) return rule

    return this.defaultRule
  },

  forEach: function (fn) {
    for (var i = 0; i < this.array.length; i++) fn(this.array[i], i);
  }
};

function findRule (rules, node, options) {
  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    if (filterValue(rule, node, options)) return rule
  }
  return void 0
}

function filterValue (rule, node, options) {
  var filter = rule.filter;
  if (typeof filter === 'string') {
    if (filter === node.nodeName.toLowerCase()) return true
  } else if (Array.isArray(filter)) {
    if (filter.indexOf(node.nodeName.toLowerCase()) > -1) return true
  } else if (typeof filter === 'function') {
    if (filter.call(rule, node, options)) return true
  } else {
    throw new TypeError('`filter` needs to be a string, array, or function')
  }
}

/**
 * The collapseWhitespace function is adapted from collapse-whitespace
 * by Luc Thevenard.
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Luc Thevenard <lucthevenard@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * collapseWhitespace(options) removes extraneous whitespace from an the given element.
 *
 * @param {Object} options
 */
function collapseWhitespace (options) {
  var element = options.element;
  var isBlock = options.isBlock;
  var isVoid = options.isVoid;
  var isPre = options.isPre || function (node) {
    return node.nodeName === 'PRE'
  };

  if (!element.firstChild || isPre(element)) return

  var prevText = null;
  var prevVoid = false;

  var prev = null;
  var node = next(prev, element, isPre);

  while (node !== element) {
    if (node.nodeType === 3 || node.nodeType === 4) { // Node.TEXT_NODE or Node.CDATA_SECTION_NODE
      var text = node.data.replace(/[ \r\n\t]+/g, ' ');

      if ((!prevText || / $/.test(prevText.data)) &&
          !prevVoid && text[0] === ' ') {
        text = text.substr(1);
      }

      // `text` might be empty at this point.
      if (!text) {
        node = remove(node);
        continue
      }

      node.data = text;

      prevText = node;
    } else if (node.nodeType === 1) { // Node.ELEMENT_NODE
      if (isBlock(node) || node.nodeName === 'BR') {
        if (prevText) {
          prevText.data = prevText.data.replace(/ $/, '');
        }

        prevText = null;
        prevVoid = false;
      } else if (isVoid(node)) {
        // Avoid trimming space around non-block, non-BR void elements.
        prevText = null;
        prevVoid = true;
      }
    } else {
      node = remove(node);
      continue
    }

    var nextNode = next(prev, node, isPre);
    prev = node;
    node = nextNode;
  }

  if (prevText) {
    prevText.data = prevText.data.replace(/ $/, '');
    if (!prevText.data) {
      remove(prevText);
    }
  }
}

/**
 * remove(node) removes the given node from the DOM and returns the
 * next node in the sequence.
 *
 * @param {Node} node
 * @return {Node} node
 */
function remove (node) {
  var next = node.nextSibling || node.parentNode;

  node.parentNode.removeChild(node);

  return next
}

/**
 * next(prev, current, isPre) returns the next node in the sequence, given the
 * current and previous nodes.
 *
 * @param {Node} prev
 * @param {Node} current
 * @param {Function} isPre
 * @return {Node}
 */
function next (prev, current, isPre) {
  if ((prev && prev.parentNode === current) || isPre(current)) {
    return current.nextSibling || current.parentNode
  }

  return current.firstChild || current.nextSibling || current.parentNode
}

/*
 * Set up window for Node.js
 */

var root = (typeof window !== 'undefined' ? window : {});

/*
 * Parsing HTML strings
 */

function canParseHTMLNatively () {
  var Parser = root.DOMParser;
  var canParse = false;

  // Adapted from https://gist.github.com/1129031
  // Firefox/Opera/IE throw errors on unsupported types
  try {
    // WebKit returns null on unsupported types
    if (new Parser().parseFromString('', 'text/html')) {
      canParse = true;
    }
  } catch (e) {}

  return canParse
}

function createHTMLParser () {
  var Parser = function () {};

  {
    var JSDOM = __webpack_require__(9).JSDOM;
    Parser.prototype.parseFromString = function (string) {
      return new JSDOM(string).window.document
    };
  }
  return Parser
}

var HTMLParser = canParseHTMLNatively() ? root.DOMParser : createHTMLParser();

function RootNode (input) {
  var root;
  if (typeof input === 'string') {
    var doc = htmlParser().parseFromString(
      // DOM parsers arrange elements in the <head> and <body>.
      // Wrapping in a custom element ensures elements are reliably arranged in
      // a single element.
      '<x-turndown id="turndown-root">' + input + '</x-turndown>',
      'text/html'
    );
    root = doc.getElementById('turndown-root');
  } else {
    root = input.cloneNode(true);
  }
  collapseWhitespace({
    element: root,
    isBlock: isBlock,
    isVoid: isVoid
  });

  return root
}

var _htmlParser;
function htmlParser () {
  _htmlParser = _htmlParser || new HTMLParser();
  return _htmlParser
}

function Node (node) {
  node.isBlock = isBlock(node);
  node.isCode = node.nodeName.toLowerCase() === 'code' || node.parentNode.isCode;
  node.isBlank = isBlank(node);
  node.flankingWhitespace = flankingWhitespace(node);
  return node
}

function isBlank (node) {
  return (
    ['A', 'TH', 'TD', 'IFRAME', 'SCRIPT', 'AUDIO', 'VIDEO'].indexOf(node.nodeName) === -1 &&
    /^\s*$/i.test(node.textContent) &&
    !isVoid(node) &&
    !hasVoid(node)
  )
}

function flankingWhitespace (node) {
  var leading = '';
  var trailing = '';

  if (!node.isBlock) {
    var hasLeading = /^\s/.test(node.textContent);
    var hasTrailing = /\s$/.test(node.textContent);
    var blankWithSpaces = node.isBlank && hasLeading && hasTrailing;

    if (hasLeading && !isFlankedByWhitespace('left', node)) {
      leading = ' ';
    }

    if (!blankWithSpaces && hasTrailing && !isFlankedByWhitespace('right', node)) {
      trailing = ' ';
    }
  }

  return { leading: leading, trailing: trailing }
}

function isFlankedByWhitespace (side, node) {
  var sibling;
  var regExp;
  var isFlanked;

  if (side === 'left') {
    sibling = node.previousSibling;
    regExp = / $/;
  } else {
    sibling = node.nextSibling;
    regExp = /^ /;
  }

  if (sibling) {
    if (sibling.nodeType === 3) {
      isFlanked = regExp.test(sibling.nodeValue);
    } else if (sibling.nodeType === 1 && !isBlock(sibling)) {
      isFlanked = regExp.test(sibling.textContent);
    }
  }
  return isFlanked
}

var reduce = Array.prototype.reduce;
var leadingNewLinesRegExp = /^\n*/;
var trailingNewLinesRegExp = /\n*$/;
var escapes = [
  [/\\/g, '\\\\'],
  [/\*/g, '\\*'],
  [/^-/g, '\\-'],
  [/^\+ /g, '\\+ '],
  [/^(=+)/g, '\\$1'],
  [/^(#{1,6}) /g, '\\$1 '],
  [/`/g, '\\`'],
  [/^~~~/g, '\\~~~'],
  [/\[/g, '\\['],
  [/\]/g, '\\]'],
  [/^>/g, '\\>'],
  [/_/g, '\\_'],
  [/^(\d+)\. /g, '$1\\. ']
];

function TurndownService (options) {
  if (!(this instanceof TurndownService)) return new TurndownService(options)

  var defaults = {
    rules: rules,
    headingStyle: 'setext',
    hr: '* * *',
    bulletListMarker: '*',
    codeBlockStyle: 'indented',
    fence: '```',
    emDelimiter: '_',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    linkReferenceStyle: 'full',
    br: '  ',
    blankReplacement: function (content, node) {
      return node.isBlock ? '\n\n' : ''
    },
    keepReplacement: function (content, node) {
      return node.isBlock ? '\n\n' + node.outerHTML + '\n\n' : node.outerHTML
    },
    defaultReplacement: function (content, node) {
      return node.isBlock ? '\n\n' + content + '\n\n' : content
    }
  };
  this.options = extend({}, defaults, options);
  this.rules = new Rules(this.options);
}

TurndownService.prototype = {
  /**
   * The entry point for converting a string or DOM node to Markdown
   * @public
   * @param {String|HTMLElement} input The string or DOM node to convert
   * @returns A Markdown representation of the input
   * @type String
   */

  turndown: function (input) {
    if (!canConvert(input)) {
      throw new TypeError(
        input + ' is not a string, or an element/document/fragment node.'
      )
    }

    if (input === '') return ''

    var output = process.call(this, new RootNode(input));
    return postProcess.call(this, output)
  },

  /**
   * Add one or more plugins
   * @public
   * @param {Function|Array} plugin The plugin or array of plugins to add
   * @returns The Turndown instance for chaining
   * @type Object
   */

  use: function (plugin) {
    if (Array.isArray(plugin)) {
      for (var i = 0; i < plugin.length; i++) this.use(plugin[i]);
    } else if (typeof plugin === 'function') {
      plugin(this);
    } else {
      throw new TypeError('plugin must be a Function or an Array of Functions')
    }
    return this
  },

  /**
   * Adds a rule
   * @public
   * @param {String} key The unique key of the rule
   * @param {Object} rule The rule
   * @returns The Turndown instance for chaining
   * @type Object
   */

  addRule: function (key, rule) {
    this.rules.add(key, rule);
    return this
  },

  /**
   * Keep a node (as HTML) that matches the filter
   * @public
   * @param {String|Array|Function} filter The unique key of the rule
   * @returns The Turndown instance for chaining
   * @type Object
   */

  keep: function (filter) {
    this.rules.keep(filter);
    return this
  },

  /**
   * Remove a node that matches the filter
   * @public
   * @param {String|Array|Function} filter The unique key of the rule
   * @returns The Turndown instance for chaining
   * @type Object
   */

  remove: function (filter) {
    this.rules.remove(filter);
    return this
  },

  /**
   * Escapes Markdown syntax
   * @public
   * @param {String} string The string to escape
   * @returns A string with Markdown syntax escaped
   * @type String
   */

  escape: function (string) {
    return escapes.reduce(function (accumulator, escape) {
      return accumulator.replace(escape[0], escape[1])
    }, string)
  }
};

/**
 * Reduces a DOM node down to its Markdown string equivalent
 * @private
 * @param {HTMLElement} parentNode The node to convert
 * @returns A Markdown representation of the node
 * @type String
 */

function process (parentNode) {
  var self = this;
  return reduce.call(parentNode.childNodes, function (output, node) {
    node = new Node(node);

    var replacement = '';
    if (node.nodeType === 3) {
      replacement = node.isCode ? node.nodeValue : self.escape(node.nodeValue);
    } else if (node.nodeType === 1) {
      replacement = replacementForNode.call(self, node);
    }

    return join(output, replacement)
  }, '')
}

/**
 * Appends strings as each rule requires and trims the output
 * @private
 * @param {String} output The conversion output
 * @returns A trimmed version of the ouput
 * @type String
 */

function postProcess (output) {
  var self = this;
  this.rules.forEach(function (rule) {
    if (typeof rule.append === 'function') {
      output = join(output, rule.append(self.options));
    }
  });

  return output.replace(/^[\t\r\n]+/, '').replace(/[\t\r\n\s]+$/, '')
}

/**
 * Converts an element node to its Markdown equivalent
 * @private
 * @param {HTMLElement} node The node to convert
 * @returns A Markdown representation of the node
 * @type String
 */

function replacementForNode (node) {
  var rule = this.rules.forNode(node);
  var content = process.call(this, node);
  var whitespace = node.flankingWhitespace;
  if (whitespace.leading || whitespace.trailing) content = content.trim();
  return (
    whitespace.leading +
    rule.replacement(content, node, this.options) +
    whitespace.trailing
  )
}

/**
 * Determines the new lines between the current output and the replacement
 * @private
 * @param {String} output The current conversion output
 * @param {String} replacement The string to append to the output
 * @returns The whitespace to separate the current output and the replacement
 * @type String
 */

function separatingNewlines (output, replacement) {
  var newlines = [
    output.match(trailingNewLinesRegExp)[0],
    replacement.match(leadingNewLinesRegExp)[0]
  ].sort();
  var maxNewlines = newlines[newlines.length - 1];
  return maxNewlines.length < 2 ? maxNewlines : '\n\n'
}

function join (string1, string2) {
  var separator = separatingNewlines(string1, string2);

  // Remove trailing/leading newlines and replace with separator
  string1 = string1.replace(trailingNewLinesRegExp, '');
  string2 = string2.replace(leadingNewLinesRegExp, '');

  return string1 + separator + string2
}

/**
 * Determines whether an input can be converted
 * @private
 * @param {String|HTMLElement} input Describe this parameter
 * @returns Describe what it returns
 * @type String|Object|Array|Boolean|Number
 */

function canConvert (input) {
  return (
    input != null && (
      typeof input === 'string' ||
      (input.nodeType && (
        input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11
      ))
    )
  )
}

/* harmony default export */ __webpack_exports__["a"] = (TurndownService);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["CodeBlockToPlainText"] = CodeBlockToPlainText;
/* harmony export (immutable) */ __webpack_exports__["processDocCode"] = processDocCode;
/* harmony export (immutable) */ __webpack_exports__["makeImgVisible"] = makeImgVisible;
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getChildren(obj, count) {
  count++
  if (count > 4) return null
  if (obj.children().length > 1) return obj
  return getChildren(obj.children().eq(0), count)
}

function CodeBlockToPlainTextOther(pre) {
  var text = []
  var minSub = getChildren(pre, 0)
  var lines = minSub.children()
  for (let index = 0; index < lines.length; index++) {
    const element = lines.eq(index)
    const codeStr = element.text()
    text.push(escapeHtml(codeStr))
  }
  return text.join('\n')
}

function CodeBlockToPlainText(pre) {
  var text = []
  var minSub = getChildren(pre, 0)
  var lines = pre.find('code')
  if (lines.length > 1) {
    return CodeBlockToPlainTextOther(pre)
  }

  for (let index = 0; index < lines.length; index++) {
    const element = lines.eq(index)
    const codeStr = element[0].innerText
    console.log('codeStr', codeStr)
    var codeLines = codeStr.split('\n')
    codeLines.forEach((codeLine) => {
      text.push('<code>' + escapeHtml(codeLine) + '</code>')
    })
  }
  return text.join('\n')
}

function processDocCode(div) {
  var doc = div
  var pres = doc.find('pre')
  // console.log("find code blocks", pres.length, post);
  for (let mindex = 0; mindex < pres.length; mindex++) {
    const pre = pres.eq(mindex)
    try {
      var newHtml = CodeBlockToPlainText(pre, 0)
      if (newHtml) {
        console.log('processDocCode', newHtml)
        pre.html(newHtml)
      } else {
        console.log('processDocCode.failed')
      }
    } catch (e) {}
  }
}

function makeImgVisible(doc) {
  console.log('makeImgVisible')
  var pres = doc.find('img')
  for (let mindex = 0; mindex < pres.length; mindex++) {
    const item = pres.eq(mindex)
    const src = item.attr('data-src')
    if (src) {
      item.attr('src', src)
    }
  }
}


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["addCustomDriver"] = addCustomDriver;
/* harmony export (immutable) */ __webpack_exports__["getDriver"] = getDriver;
/* harmony export (immutable) */ __webpack_exports__["getPublicAccounts"] = getPublicAccounts;
/* harmony export (immutable) */ __webpack_exports__["getMeta"] = getMeta;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__jianshu__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__zhihu__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__wordpress__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__toutiao__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__weibo__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__segmentfault__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__juejin__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__csdn__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__cnblog__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__weixin__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__yidian__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__douban__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__bilibili__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__51cto__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__focus__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__Discuz__ = __webpack_require__(21);


















var _cacheState = {}
const _customDrivers = [];

function addCustomDriver(name, driverClass) {
  _customDrivers.push({
    name: name,
    handler: driverClass
  })
}

function getDriver(account) {
  if (account.type == 'wordpress') {
    return new __WEBPACK_IMPORTED_MODULE_2__wordpress__["a" /* default */](
      account.params.wpUrl,
      account.params.wpUser,
      account.params.wpPwd
    )
  }

  if (account.type == 'zhihu') {
    return new __WEBPACK_IMPORTED_MODULE_1__zhihu__["a" /* default */]()
  }

  if (account.type == 'jianshu') {
    return new __WEBPACK_IMPORTED_MODULE_0__jianshu__["a" /* default */]()
  }

  if (account.type == 'typecho') {
    return new __WEBPACK_IMPORTED_MODULE_2__wordpress__["a" /* default */](
      account.params.wpUrl,
      account.params.wpUser,
      account.params.wpPwd,
      true
    )
  }

  if (account.type == 'toutiao') {
    return new __WEBPACK_IMPORTED_MODULE_3__toutiao__["a" /* default */]()
  }

  if (account.type == 'bilibili') {
    return new __WEBPACK_IMPORTED_MODULE_12__bilibili__["a" /* default */]({
      globalState: _cacheState,
      state: _cacheState[account.type],
    })
  }

  if (account.type == 'weibo') {
    return new __WEBPACK_IMPORTED_MODULE_4__weibo__["a" /* default */]()
  }
  
  if (account.type == 'sohufocus') {
    return new __WEBPACK_IMPORTED_MODULE_14__focus__["a" /* default */]()
  }
  
  if (account.type == '51cto') {
    return new __WEBPACK_IMPORTED_MODULE_13__51cto__["a" /* default */]()
  }

  if (account.type == 'segmentfault') {
    return new __WEBPACK_IMPORTED_MODULE_5__segmentfault__["a" /* default */](account)
  }

  if (account.type == 'juejin') {
    return new __WEBPACK_IMPORTED_MODULE_6__juejin__["a" /* default */](account)
  }

  if (account.type == 'csdn') {
    return new __WEBPACK_IMPORTED_MODULE_7__csdn__["a" /* default */](account)
  }

  if (account.type == 'cnblog') {
    return new __WEBPACK_IMPORTED_MODULE_8__cnblog__["a" /* default */](account)
  }
  if (account.type == 'weixin') {
    return new __WEBPACK_IMPORTED_MODULE_9__weixin__["a" /* default */](account)
  }

  if (account.type == 'yidian') {
    return new __WEBPACK_IMPORTED_MODULE_10__yidian__["a" /* default */](account)
  }

  if(account.type == 'douban') {
    return new __WEBPACK_IMPORTED_MODULE_11__douban__["a" /* default */]({
      globalState: _cacheState,
      state: _cacheState[account.type],
    })
  }

  if(account.type == 'discuz') {
    console.log('discuz', account)
    return new __WEBPACK_IMPORTED_MODULE_15__Discuz__["a" /* default */](account.config)
  }

  const matchedDrivers = _customDrivers.filter(_ => _.name == account.type)
  if(matchedDrivers.length) {
    const driverInCustom = matchedDrivers[0]
    return new driverInCustom['handler'](account)
  }

  throw Error('not supprt account type')
}

async function getPublicAccounts() {
  console.log('getPublicAccounts')
  var drivers = [
    new __WEBPACK_IMPORTED_MODULE_5__segmentfault__["a" /* default */](),
    new __WEBPACK_IMPORTED_MODULE_7__csdn__["a" /* default */](),
    new __WEBPACK_IMPORTED_MODULE_6__juejin__["a" /* default */](),
    new __WEBPACK_IMPORTED_MODULE_8__cnblog__["a" /* default */](),
    new __WEBPACK_IMPORTED_MODULE_4__weibo__["a" /* default */](),
    new __WEBPACK_IMPORTED_MODULE_1__zhihu__["a" /* default */](),
    new __WEBPACK_IMPORTED_MODULE_0__jianshu__["a" /* default */](),
    new __WEBPACK_IMPORTED_MODULE_3__toutiao__["a" /* default */](),
    new __WEBPACK_IMPORTED_MODULE_9__weixin__["a" /* default */](),
    new __WEBPACK_IMPORTED_MODULE_10__yidian__["a" /* default */](),
    new __WEBPACK_IMPORTED_MODULE_11__douban__["a" /* default */](),
    new __WEBPACK_IMPORTED_MODULE_12__bilibili__["a" /* default */](),
    new __WEBPACK_IMPORTED_MODULE_13__51cto__["a" /* default */](),
    new __WEBPACK_IMPORTED_MODULE_14__focus__["a" /* default */](),
  ]

  var customDiscuzEndpoints = ['https://www.51hanghai.com'];
  customDiscuzEndpoints.forEach(_ => {
    drivers.push(new __WEBPACK_IMPORTED_MODULE_15__Discuz__["a" /* default */]({
      url: _,
   }));
  })

  for (let index = 0; index < _customDrivers.length; index++) {
    const _customDriver = _customDrivers[index];
    try {
      drivers.push(new _customDriver['handler']());
    } catch (e) {
      console.log('initlaze custom driver error', e)
    }
  }

  var users = []
  for (let index = 0; index < drivers.length; index++) {
    const driver = drivers[index]
    try {
      var user = await driver.getMetaData()
      users.push(user)
    } catch (e) {
      console.log(e)
    }
  }
  return users
}

function getCookie(name, cookieStr) {
  let arr,
    reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  if ((arr = cookieStr.match(reg))) {
    return unescape(arr[2])
  } else {
    return ''
  }
}

function urlHandler(details) {
  if (
    details.url.indexOf('api.bilibili.com') >
    -1
  ) {
    var cookieHeader = details.requestHeaders.filter(h => {
      return h.name.toLowerCase() == 'cookie'
    })

    if (cookieHeader.length) {
      var cookieStr = cookieHeader[0].value
      var bili_jct = getCookie('bili_jct', cookieStr)
      if (bili_jct) {
        _cacheState['bilibili'] = _cacheState['bilibili'] || {};
        Object.assign(_cacheState['bilibili'], {
          csrf: bili_jct,
        })
        console.log('bili_jct', bili_jct, details)
      }
    }
    // console.log('details.requestHeaders', details)
  }
  // https://music.douban.com/subject/24856133/new_review
  if (
    details.url.indexOf('music.douban.com') >
    -1
    && 
    details.url.indexOf('/new_review') >
    -1
  ) {
    _cacheState['douban'] = _cacheState['douban'] || {};
    Object.assign(_cacheState['douban'], {
      is_review: true,
      subject: 'music',
      url: details.url,
      id: details.url.replace('https://music.douban.com/subject/', '')
      .replace('/new_review', '')
    })
  }
}

function getMeta() {
  return {
    version: '0.0.11',
    versionNumber: 12,
    log: '',
    urlHandler: urlHandler,
    inspectUrls: ['*://api.bilibili.com/*', '*://music.douban.com/*'],
  }
}

// DEVTOOL_PLACEHOLDER_INSERT

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var NoteVersionCaches = {}
var defaultNoteBookId

class JianShuDriver {
  constructor() {
    this.name = 'jianshu'
    // chrome.cookies.getAll({ domain: "zhihu.com"},  function(cookies){
    //     console.log(cookies)
    // })
  }

  async getMetaData() {
    var res = await $.ajax({
      url: 'https://www.jianshu.com/settings/basic.json',
    })
    var notebooks = await $.get('https://www.jianshu.com/author/notebooks')
    // console.log(res);
    // https://upload.jianshu.io/users/upload_avatars/12192974/d02c5033-7f82-458f-9b3e-f4c4dbaa1221?imageMogr2/auto-orient/strip|imageView2/1/w/96/h/96
    return {
      uid: res.data.avatar.split('/')[5],
      title: res.data.nickname,
      avatar: res.data.avatar,
      type: 'jianshu',
      displayName: '简书',
      supportTypes: ['html'],
      home: 'https://www.jianshu.com/settings/basic',
      icon: 'https://www.jianshu.com/favicon.ico',
      notebooks: notebooks,
    }
  }

  async addPost(post) {
    var notebooks = await $.get('https://www.jianshu.com/author/notebooks')
    var firstNoteBook = notebooks[0]
    defaultNoteBookId = firstNoteBook.id
    var res = await $.ajax({
      url: 'https://www.jianshu.com/author/notes',
      type: 'POST',
      dataType: 'JSON',
      headers: {
        accept: 'application/json',
      },
      contentType: 'application/json',
      data: JSON.stringify({
        at_bottom: false,
        notebook_id: firstNoteBook.id,
        title: post.post_title,
      }),
    })
    console.log(res)
    return {
      status: 'success',
      post_id: res.id,
      notebook_id: firstNoteBook.id,
    }
  }

  async editPost(post_id, post) {
    var cacheVerions = NoteVersionCaches[post_id]
    var notebook_id = post.notebook_id ? post.notebook_id : defaultNoteBookId

    if (!cacheVerions) {
      var bookNotes = await $.get(
        'https://www.jianshu.com/author/notebooks/' + notebook_id + '/notes'
      )
      var currentNote = bookNotes.filter((t) => {
        return t.id == post_id
      })[0]

      console.log(post_id, bookNotes)
      NoteVersionCaches[post_id] = currentNote.autosave_control
      NoteVersionCaches[post_id]++
      cacheVerions = NoteVersionCaches[post_id]
    } else {
      NoteVersionCaches[post_id]++
      cacheVerions = NoteVersionCaches[post_id]
    }

    console.log('currentNote', cacheVerions)
    var requestData = {
      autosave_control: cacheVerions,
    }

    if (post.post_content) {
      requestData.content = post.post_content
    }

    if (post_id) {
      requestData.id = post_id
    }

    if (post.post_title) {
      requestData.title = post.post_title
    }

    // https://www.jianshu.com/author/notebooks/108908/notes
    var res = await $.ajax({
      url: 'https://www.jianshu.com/author/notes/' + post_id,
      type: 'PUT',
      dataType: 'JSON',
      contentType: 'application/json',
      headers: {
        accept: 'application/json',
      },
      data: JSON.stringify(requestData),
    })

    return {
      status: 'success',
      notebook_id: notebook_id,
      post_id: post_id,
      draftLink:
        'https://www.jianshu.com/writer#/notebooks/' +
        notebook_id +
        '/notes/' +
        post_id,
    }
  }

  async uploadFile(file) {
    const tokenReq = await axios.get('https://www.jianshu.com/upload_images/token.json?filename='+ new Date().getTime() +'.png')
    if(tokenReq.data.token) {
      var blob = new Blob([file.bits], {
        type: file.type
      });
      var formdata = new FormData()
      formdata.append('token', tokenReq.data.token)
      formdata.append('key', tokenReq.data.key)
      formdata.append('x:protocol', 'https')
      formdata.append('file', blob, new Date().getTime() + '.jpg')
      var res = await axios({
        url: 'https://upload.qiniup.com/',
        method: 'post',
        data: formdata,
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if(!res.data.url) {
        console.log(res.data);
        throw new Error('upload failed')
      }
      var url = res.data.url
      return [
        {
          id: tokenReq.data.key,
          object_key: tokenReq.data.key,
          url: url
        }
      ]
    }
    throw new Error('upload failed')
  }

  async uploadFileBySrc(file) {
    var src = file.src
    try {
      // jianshu not support webp
      if (src.indexOf('xitu.io') > -1) {
        src = src.replace('webp', 'png')
      }

      var res = await $.ajax({
        url: 'https://www.jianshu.com/upload_images/fetch',
        type: 'POST',
        contentType: 'application/json',
        xhrFields: {
          withCredentials: true,
        },
        headers: {
          accept: 'application/json',
        },
        data: JSON.stringify({
          url: src,
        }),
      })

      // http only
      console.log('uploadFile', res)
      return [res]
    } catch (e) {
      console.log('JianShuDriver.uploadFile', e)
      var error = e.responseJSON.error[0].message
      throw new Error(error)
    }
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)
    div.html(post.content)
    var doc = div
    var processEmptyLine = function (idx, el) {
      var $obj = $(this)
      var originalText = $obj.text()
      var img = $obj.find('img')
      var brs = $obj.find('br')
      if (originalText == '') {
        ;(function () {
          if (img.length) return
          if (!brs.length) return
          $obj.remove()
        })()
      }

      // try to replace as h2;
      var strongTag = $obj.find('strong').eq(0)
      var childStrongText = strongTag.text()
      if (originalText == childStrongText) {
        var strongSize = null
        var tagStart = strongTag
        var align = null
        for (let index = 0; index < 4; index++) {
          var fontSize = tagStart.css('font-size')
          var textAlign = tagStart.css('text-align')
          if (fontSize) {
            strongSize = fontSize
          }
          if (textAlign) {
            align = textAlign
          }
          if (align && strongSize) break
          if (tagStart == $obj) {
            console.log('near top')
            break
          }
          tagStart = tagStart.parent()
        }
        if (strongSize) {
          var theFontSize = parseInt(strongSize)
          if (theFontSize > 17 && align == 'center') {
            var newTag = $('<h2></h2>').append($obj.html())
            $obj.after(newTag).remove()
          }
        }
      }
    }

    // remove empty break line
    doc.find('p').each(processEmptyLine)
    doc.find('section').each(processEmptyLine)

    var processBr = function (idx, el) {
      var $obj = $(this)
      if (!$obj.next().length) {
        $obj.remove()
      }
    }
    doc.find('br').each(processBr)
    // table {
    //     margin-bottom: 10px;
    //     border-collapse: collapse;
    //     display: table;
    //     width: 100%!important;
    // }
    // td, th {
    //     word-wrap: break-word;
    //     word-break: break-all;
    //     padding: 5px 10px;
    //     border: 1px solid #DDD;
    // }

    // console.log('found table', doc.find('table'))
    var tempDoc = $('<div>').append(doc.clone())
    post.content =
      tempDoc.children('div').length == 1
        ? tempDoc.children('div').html()
        : tempDoc.html()
    // div.remove();
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = JianShuDriver;



/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getChildren(obj, count) {
  count++
  if (count > 4) return null
  if (obj.children().length > 1) return obj
  return getChildren(obj.children().eq(0), count)
}

function CodeBlockToPlainTextOther(pre) {
  var text = []
  var minSub = getChildren(pre, 0)
  var lines = minSub.children()
  for (let index = 0; index < lines.length; index++) {
    const element = lines.eq(index)
    const codeStr = element.text()
    text.push('<code>' + escapeHtml(codeStr) + '</code>')
  }
  return text.join('\n')
}

function CodeBlockToPlainText(pre) {
  var text = []
  var minSub = getChildren(pre, 0)
  var lines = pre.find('code')
  if (lines.length > 1) {
    return CodeBlockToPlainTextOther(pre)
  }

  for (let index = 0; index < lines.length; index++) {
    const element = lines.eq(index)
    const codeStr = element[0].innerText
    console.log('codeStr', codeStr)
    var codeLines = codeStr.split('\n')
    codeLines.forEach((codeLine) => {
      text.push('<code>' + escapeHtml(codeLine) + '</code>')
    })
  }
  return text.join('\n')
}

class ZhiHuDriver {
  constructor() {
    // this.skipReadImage = true
    this.version = '0.0.1'
    this.name = 'zhihu'
  }

  async getMetaData() {
    var res = await $.ajax({
      url:
        'https://www.zhihu.com/api/v4/me?include=account_status%2Cis_bind_phone%2Cis_force_renamed%2Cemail%2Crenamed_fullname',
    })
    // console.log(res);
    return {
      uid: res.uid,
      title: res.name,
      avatar: res.avatar_url,
      supportTypes: ['html'],
      type: 'zhihu',
      displayName: '知乎',
      home: 'https://www.zhihu.com/settings/account',
      icon: 'https://static.zhihu.com/static/favicon.ico',
    }
  }

  async addPost(post) {
    var res = await $.ajax({
      url: 'https://zhuanlan.zhihu.com/api/articles/drafts',
      type: 'POST',
      dataType: 'JSON',
      contentType: 'application/json',
      data: JSON.stringify({
        title: post.post_title,
        // content: post.post_content
      }),
    })
    console.log(res)
    return {
      status: 'success',
      post_id: res.id,
    }
    //
  }

  async editPost(post_id, post) {
    console.log('editPost', post.post_thumbnail)
    var res = await $.ajax({
      url: 'https://zhuanlan.zhihu.com/api/articles/' + post_id + '/draft',
      type: 'PATCH',
      contentType: 'application/json',
      data: JSON.stringify({
        title: post.post_title,
        content: post.post_content,
        isTitleImageFullScreen: false,
        titleImage: 'https://pic1.zhimg.com/' + post.post_thumbnail + '.png',
      }),
    })

    return {
      status: 'success',
      post_id: post_id,
      draftLink: 'https://zhuanlan.zhihu.com/p/' + post_id + '/edit',
    }
    // https://zhuanlan.zhihu.com/api/articles/68769713/draft
  }

  untiImageDone(image_id) {
    return new Promise(function(resolve, reject) {
      function waitToNext() {
        console.log('untiImageDone', image_id);
        (async () => {
          var imgDetail = await $.ajax({
            url: 'https://api.zhihu.com/images/' + image_id,
            type: 'GET',
          })
          console.log('imgDetail', imgDetail)
          if (imgDetail.status != 'processing') {
            console.log('all done')
            resolve(imgDetail)
          } else {
            // console.log('go next', waitToNext)
            setTimeout(waitToNext, 300)
          }
        })()
      }
      waitToNext()
    })
  }

  async _uploadFile(file) {
    var src = file.src
    var res = await $.ajax({
      url: 'https://zhuanlan.zhihu.com/api/uploaded_images',
      type: 'POST',
      headers: {
        accept: '*/*',
        'x-requested-with': 'fetch',
      },
      data: {
        url: src,
        source: 'article',
      },
    })

    return [
      {
        id: res.hash,
        object_key: res.hash,
        url: res.src,
      },
    ]
  }

  async uploadFile(file) {
    console.log('ZhiHuDriver.uploadFile', file, md5)
    var updateData = JSON.stringify({
      image_hash: md5(file.bits),
      source: 'article',
    })
    console.log('upload', updateData)
    var fileResp = await $.ajax({
      url: 'https://api.zhihu.com/images',
      type: 'POST',
      dataType: 'JSON',
      contentType: 'application/json',
      data: updateData,
    })

    console.log('upload', fileResp)

    var upload_file = fileResp.upload_file
    if (fileResp.upload_file.state == 1) {
      var imgDetail = await this.untiImageDone(upload_file.image_id)
      console.log('imgDetail', imgDetail)
      upload_file.object_key = imgDetail.original_hash
    } else {
      var token = fileResp.upload_token
      let client = new OSS({
        endpoint: 'https://zhihu-pics-upload.zhimg.com',
        accessKeyId: token.access_id,
        accessKeySecret: token.access_key,
        stsToken: token.access_token,
        cname: true,
        bucket: 'zhihu-pics',
      })
      var finalUrl = await client.put(
        upload_file.object_key,
        new Blob([file.bits])
      )
      console.log(client, finalUrl)
    }
    console.log(file, fileResp)

    if (file.type === 'image/gif') {
      // add extension for gif
      upload_file.object_key = upload_file.object_key + '.gif';
    }
    return [
      {
        id: upload_file.object_key,
        object_key: upload_file.object_key,
        url: 'https://pic4.zhimg.com/' + upload_file.object_key,
        // url: 'https://pic1.zhimg.com/80/' + upload_file.object_key + '_hd.png',
      },
    ]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    // post.content = post.content.replace(/\>\s+\</g,'');
    div.html(post.content)

    // var org = $(post.content);
    // var doc = $('<div>').append(org.clone());
    var doc = div
    var pres = doc.find('pre')
    console.log('find code blocks', pres.length, post)
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        var newHtml = CodeBlockToPlainText(pre, 0)
        if (newHtml) {
          console.log(newHtml)
          pre.html(newHtml)
        }
      } catch (e) {}
    }

    var processEmptyLine = function (idx, el) {
      var $obj = $(this)
      var originalText = $obj.text()
      var img = $obj.find('img')
      var brs = $obj.find('br')
      if (originalText == '') {
        ;(function () {
          if (img.length) return
          if (!brs.length) return
          $obj.remove()
        })()
      }

      // try to replace as h2;
      var strongTag = $obj.find('strong').eq(0)
      var childStrongText = strongTag.text()
      if (originalText == childStrongText) {
        var strongSize = null
        var tagStart = strongTag
        var align = null
        for (let index = 0; index < 4; index++) {
          var fontSize = tagStart.css('font-size')
          var textAlign = tagStart.css('text-align')
          if (fontSize) {
            strongSize = fontSize
          }
          if (textAlign) {
            align = textAlign
          }
          if (align && strongSize) break
          if (tagStart == $obj) {
            console.log('near top')
            break
          }
          tagStart = tagStart.parent()
        }
        if (strongSize) {
          var theFontSize = parseInt(strongSize)
          if (theFontSize > 17 && align == 'center') {
            var newTag = $('<h2></h2>').append($obj.html())
            $obj.after(newTag).remove()
          }
        }
      }
    }

    // remove empty break line
    doc.find('p').each(processEmptyLine)
    doc.find('section').each(processEmptyLine)

    var processBr = function (idx, el) {
      var $obj = $(this)
      if (!$obj.next().length) {
        $obj.remove()
      }
    }
    doc.find('br').each(processBr)
    // table {
    //     margin-bottom: 10px;
    //     border-collapse: collapse;
    //     display: table;
    //     width: 100%!important;
    // }
    // td, th {
    //     word-wrap: break-word;
    //     word-break: break-all;
    //     padding: 5px 10px;
    //     border: 1px solid #DDD;
    // }

    // console.log('found table', doc.find('table'))
    var tempDoc = $('<div>').append(doc.clone())
    post.content =
      tempDoc.children('div').length == 1
        ? tempDoc.children('div').html()
        : tempDoc.html()
    // div.remove();
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ZhiHuDriver;



/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function xmlrpcWrapper(conf) {
  return new Promise((resolve, reject) => {
    $.xmlrpc(conf).then(
      function (response, status, xhr) {
        resolve({
          response,
          status,
          xhr,
        })
      },
      function (jqXHR, status, error) {
        reject({
          jqXHR,
          status,
          error,
        })
      }
    )
  })
}

class WordpressDriver {
  constructor(url, user, pwd, isTypecho) {
    this.url = url
    this.user = user
    this.pwd = pwd
    this.isTypecho = isTypecho
  }

  getRPC() {
    var endPoint = this.url + '/xmlrpc.php'
    if (this.isTypecho) {
      endPoint = this.url + '/action/xmlrpc'
    }
    return endPoint
  }

  async getMetaData() {
    var params = [this.user, this.pwd]
    var res = await xmlrpcWrapper({
      url: this.getRPC(),
      methodName: 'wp.getUsersBlogs',
      params: params,
    })
    console.log('end');
    res.icon = chrome.extension.getURL('images/wordpress.ico')
    return res
  }

  addPost(post) {
    if (this.isTypecho) {
      return {
        status: 'success',
        post_id: '1',
      }
    }

    var params = [0, this.user, this.pwd, post]
    var end = this.url
    return xmlrpcWrapper({
      url: this.getRPC(),
      methodName: 'wp.newPost',
      params: params,
    })
  }

  editPost(post_id, post) {
    var params = [0, this.user, this.pwd, post]
    var endpoint = this.getRPC()
    var isTypecho = this.isTypecho
    if (isTypecho) {
      params.push(false)
      params[3] = {
        title: post['post_title'],
        // text: "!!!\n" + post['post_content'].trim() + "\n!!!",
        description: post['post_content'].trim(),
        // markdown: 1
      }
      console.log('params', params)
    } else {
      params[3] = post_id
      params.push(post)
    }
    return new Promise((resolve, reject) => {
      ;(async () => {
        try {
          var res = await xmlrpcWrapper({
            url: endpoint,
            methodName: isTypecho ? 'metaWeblog.newPost' : 'wp.editPost',
            params: params,
          })

          res.draftLink = this.url + '?p=' + post_id
          console.log('Wordpress', res)
          resolve(res)
        } catch (e) {
          reject(e)
        }
      })()
    })
  }

  //  'metaWeblog.getPost' => array($this, 'mwGetPost'),

  editImg(img, source) {
    // img.attr('web_uri', source.images[0].origin_web_uri)
    img.removeAttr('data-src');
  }

  uploadFile(file) {
    if (this.isTypecho) {
      file['bytes'] = file['bits']
      delete file['bits']
    }
    var params = [0, this.user, this.pwd, file]

    var end = this.url
    return $.xmlrpc({
      url: this.getRPC(),
      methodName: 'wp.uploadFile',
      params: params,
    })
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = WordpressDriver;


window.WordpressDriver = WordpressDriver


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// source: 0
// content: <p>testaaa</p>
// title: test
// search_creation_info: {"searchTopOne":0,"abstract":""}
// title_id: 1607584898506_1559572462858242
// extra: {"content_word_cnt":7,"gd_ext":{"entrance":"hotspots","from_page":"publisher_mp","enter_from":"PC","device_platform":"mp","is_message":0}}
// mp_editor_stat: {"a_justify":1}
// educluecard: 
// draft_form_data: {"coverType":2}
// pgc_feed_covers: []
// claim_origin: 0
// origin_debut_check_pgc_normal: 0
// is_fans_article: 0
// govern_forward: 0
// praise: 0
// disable_praise: 0
// article_ad_type: 2
// tree_plan_article: 0
// activity_tag: 0
// trends_writing_tag: 0
// community_sync: 0
// is_refute_rumor: 0
// save: 0
// timer_status: 0
// timer_time: 

class ToutiaoDriver {
  constructor() {
    // this.skipReadImage = true
    this.name = 'toutiao'
  }

  async getMetaData() {
    var res = await $.ajax({
      url: 'https://mp.toutiao.com/get_media_info/',
    })
    // console.log(res);
    return {
      uid: res.data.user.id,
      title: res.data.user.screen_name,
      avatar: res.data.user.https_avatar_url,
      supportTypes: ['html'],
      type: 'toutiao',
      displayName: '头条',
      home: 'https://mp.toutiao.com/profile_v3/graphic/publish',
      icon: 'https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png',
    }
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {
    var pgc_feed_covers = []
    if (post.post_thumbnail_raw && post.post_thumbnail_raw.images) {
      pgc_feed_covers.push({
        id: 0,
        url: post.post_thumbnail_raw.url,
        uri: post.post_thumbnail_raw.images[0].origin_web_uri,
        origin_uri: post.post_thumbnail_raw.images[0].origin_web_uri,
        ic_uri: '',
        thumb_width: post.post_thumbnail_raw.images[0].width,
        thumb_height: post.post_thumbnail_raw.images[0].height,
      })
    }

    await $.get('https://mp.toutiao.com/profile_v3/graphic/publish')

    var res = await $.ajax({
      // url:'https://mp.toutiao.com/core/article/edit_article_post/?source=mp&type=article',
      url: 'https://mp.toutiao.com/mp/agw/article/publish?source=mp&type=article',
      type: 'POST',
      dataType: 'JSON',
      data: {
        title: post.post_title,
        article_ad_type: 2,
        article_type: 0,
        from_diagnosis: 0,
        origin_debut_check_pgc_normal: 0,
        tree_plan_article: 0,
        save: 0,
        pgc_id: 0,
        content: post.post_content,
        pgc_feed_covers: JSON.stringify(pgc_feed_covers),
      },
    })

    if (!res.data) {
      throw new Error(res.message)
    }

    return {
      status: 'success',
      post_id: res.data.pgc_id,
      draftLink:
        'https://mp.toutiao.com/profile_v3/graphic/publish?pgc_id=' +
        res.data.pgc_id,
    }
  }

  async uploadFileBySrc(file) {
    var src = file.src
    var res = await $.ajax({
      url: 'https://mp.toutiao.com/tools/catch_picture/',
      type: 'POST',
      headers: {
        accept: '*/*',
      },
      data: {
        upfile: src,
        version: 2,
      },
    })

    // throw new Error('fuck');
    if (res.images && !res.images.length) {
      throw new Error('图片上传失败 ' + src)
    }

    // http only
    console.log('uploadFile', res)
    return [res]
  }

  async uploadFile(file) {
    var src = file.src
    var uploadUrl = 'https://mp.toutiao.com/mp/agw/article_material/photo/upload_picture?type=ueditor&pgc_watermark=1&action=uploadimage&encode=utf-8'
    // var blob = new Blob([file.bits], {
    //   type: file.type
    // });
    var file = new File([file.bits], 'temp', {
      type: file.type
    });
    var formdata = new FormData()
    formdata.append('upfile', file)
    var res = await axios({
      url: uploadUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (res.data.state != 'SUCCESS') {
      throw new Error('图片上传失败 ' + src)
    }
    // http only
    console.log('uploadFile', res)
    return [{
      id: res.data.original,
      object_key: res.data.original,
      url: res.data.url,
      images: [
        res.data
      ]
    }]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    div.html(post.content)

    // var org = $(post.content);
    // var doc = $('<div>').append(org.clone());

    var doc = div
    var pres = doc.find('a')
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        pre.after(pre.html()).remove()
      } catch (e) {}
    }

    var pres = doc.find('iframe')
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        pre.remove()
      } catch (e) {}
    }

    try {
      const images = doc.find('img')
      for (let index = 0; index < images.length; index++) {
        const image = images.eq(index)
        const imgSrc = image.attr('src')
        if (imgSrc && imgSrc.indexOf('.svg') > -1) {
          console.log('remove svg Image')
          image.remove()
        }
      }
      const qqm = doc.find('qqmusic')
      qqm.next().remove()
      qqm.remove()
    } catch (e) {}

    post.content = $('<div>').append(doc.clone()).html()
    console.log('post', post)
  }

  editImg(img, source) {
    img.attr('web_uri', source.images[0].origin_web_uri)
  }
  //   <img class="" src="http://p2.pstatp.com/large/pgc-image/bc0a9fc8e595453083d85deb947c3d6e" data-ic="false" data-ic-uri="" data-height="1333" data-width="1000" image_type="1" web_uri="pgc-image/bc0a9fc8e595453083d85deb947c3d6e" img_width="1000" img_height="1333"></img>
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ToutiaoDriver;



/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var cacheWeiboUser = null
// var Readability = require("../reader/Readability");

// fetch("https://card.weibo.com/article/v3/aj/editor/draft/save?uid=1820387812&id=402", { "credentials": "include", "headers": { "accept": "application/json, text/plain, */*", "accept-language": "zh-CN,zh;q=0.9", "content-type": "application/x-www-form-urlencoded" }, "referrer": "https://card.weibo.com/article/v3/editor", "referrerPolicy": "no-referrer-when-downgrade", "body": "id=402&title=aaaaaaaaaaa&updated=2019-10-10%2016%3A06%3A43&subtitle=&type=&status=0&publish_at=&error_msg=&error_code=0&collection=%5B%5D&free_content=&content=%3Cp%20align%3D%22justify%22%3Eaaaaaaaaaaaaa%3C%2Fp%3E&cover=https%3A%2F%2Fwx3.sinaimg.cn%2Flarge%2F6c80e9e4ly1g7t62jq7uzj202s01kdfz.jpg&summary=aaa&writer=&extra=null&is_word=0&article_recommend=%5B%5D&follow_to_read=1&isreward=1&pay_setting=%7B%22ispay%22%3A0%2C%22isvclub%22%3A0%7D&source=0&action=1&save=1", "method": "POST", "mode": "cors" });

class WeiboDriver {
  constructor() {
    this.name = 'weibo'
  }

  async getMetaData() {
    var html = await $.get('https://card.weibo.com/article/v3/editor')
    var configIndx = html.indexOf('$CONFIG')
    var lastIndex = html.indexOf('</script>', configIndx)
    var configStr = html.substring(configIndx - 12, lastIndex)

    if (configStr.indexOf('CONFIG') > -1) {
      var res = new Function(configStr + ' return $CONFIG;')()
      cacheWeiboUser = res
      return {
        uid: res.uid,
        title: res.nick,
        avatar: res.avatar_large,
        supportTypes: ['html'],
        displayName: '微博',
        type: 'weibo',
        home: 'https://card.weibo.com/article/v3/editor',
        icon: 'https://weibo.com/favicon.ico',
      }
    } else {
      throw new Error('not found')
    }
  }

  async addPost(post) {
    var res = await $.post(
      'https://card.weibo.com/article/v3/aj/editor/draft/create?uid=' +
        cacheWeiboUser.uid
    )
    if (res.code != 100000) {
      throw new Error(res.msg)
      return
    }

    console.log(res)
    var post_id = res.data.id

    var res = await $.ajax({
      url:
        'https://card.weibo.com/article/v3/aj/editor/draft/save?uid=' +
        cacheWeiboUser.uid +
        '&id=' +
        post_id,
      type: 'POST',
      dataType: 'JSON',
      headers: {
        accept: 'application/json',
      },
      data: {
        id: post_id,
        title: post.post_title,
        subtitle: '',
        type: '',
        status: '0',
        publish_at: '',
        error_msg: '',
        error_code: '0',
        collection: '[]',
        free_content: '',
        content: post.post_content,
        cover: '',
        summary: '',
        writer: '',
        extra: 'null',
        is_word: '0',
        article_recommend: '[]',
        follow_to_read: '1',
        isreward: '1',
        pay_setting: '{"ispay":0,"isvclub":0}',
        source: '0',
        action: '1',
        content_type: '0',
        save: '1',
      },
      // data: {
      //   id: post_id,
      //   title: post.post_title,
      //   status: 0,
      //   error_code: 0,
      //   content: post.post_content,
      //   cover: "",
      //   // summary: 'aaaab',
      //   writer: "",
      //   is_word: 0,
      //   article_recommend: [],
      //   follow_to_read: 1,
      //   isreward: 1,
      //   pay_setting: JSON.stringify({ ispay: 0, isvclub: 0 }),
      //   source: 0,
      //   action: 1,
      //   save: 1
      // }
    })
    console.log(res)
    return {
      status: 'success',
      post_id: post_id,
    }
  }

  async preEditPost(post) {
    // var div = $('<div>');
    // $('body').append(div);
    // div.html(post.content);

    // // var doc = div;
    // // doc.clone()
    // var documentClone = document.cloneNode(true);
    // var article = new Readability(documentClone).parse();

    // div.remove();
    // console.log(article);
    var rexp = new RegExp('>[\ts ]*<', 'g')
    var result = post.content.replace(rexp, '><')
    post.content = result
  }

  async editPost(post_id, post) {
    var res = await $.ajax({
      url:
        'https://card.weibo.com/article/v3/aj/editor/draft/save?uid=' +
        cacheWeiboUser.uid +
        '&id=' +
        post_id,
      type: 'POST',
      dataType: 'JSON',
      headers: {
        accept: 'application/json',
      },
      data: {
        id: post_id,
        title: post.post_title,
        subtitle: '',
        type: '',
        status: '0',
        publish_at: '',
        error_msg: '',
        error_code: '0',
        collection: '[]',
        free_content: '',
        content: post.post_content,
        cover: post.post_thumbnail_raw ? post.post_thumbnail_raw.url : '',
        summary: '',
        writer: '',
        extra: 'null',
        is_word: '0',
        article_recommend: '[]',
        follow_to_read: '1',
        isreward: '1',
        pay_setting: '{"ispay":0,"isvclub":0}',
        source: '0',
        action: '1',
        content_type: '0',
        save: '1',
      },
      // data: {
      //   id: post_id,
      //   title: post.post_title,
      //   status: 0,
      //   error_code: 0,
      //   content: post.post_content,
      //   cover: post.post_thumbnail_raw ? post.post_thumbnail_raw.url : "",
      //   // summary: 'aaaab',
      //   writer: "",
      //   is_word: 0,
      //   article_recommend: [],
      //   follow_to_read: 1,
      //   isreward: 1,
      //   pay_setting: JSON.stringify({ ispay: 0, isvclub: 0 }),
      //   source: 0,
      //   action: 1,
      //   save: 1
      // }
    })
    console.log(res)
    return {
      status: 'success',
      post_id: post_id,
      draftLink: 'https://card.weibo.com/article/v3/editor#/draft/' + post_id,
    }
  }

  untiImageDone(src) {
    return new Promise((resolve, reject) => {
      ;(async function loop() {
        var res = await $.ajax({
          url:
            'https://card.weibo.com/article/v3/aj/editor/plugins/asyncimginfo?uid=' +
            cacheWeiboUser.uid,
          type: 'POST',
          headers: {
            accept: '*/*',
            'x-requested-with': 'fetch',
          },
          data: {
            'urls[0]': src,
          },
        })

        var done = res.data[0].task_status_code == 1
        if (done) {
          resolve(res.data[0])
        } else {
          setTimeout(loop, 1000)
        }
      })()
    })
  }

  async uploadFileByUrl(file) {
    var src = file.src
    var res = await $.ajax({
      url:
        'https://card.weibo.com/article/v3/aj/editor/plugins/asyncuploadimg?uid=' +
        cacheWeiboUser.uid,
      type: 'POST',
      headers: {
        accept: '*/*',
        'x-requested-with': 'fetch',
      },
      data: {
        'urls[0]': src,
      },
    })

    // https://card.weibo.com/article/v3/aj/editor/plugins/asyncuploadimg?uid=1820387812
    var imgDetail = await this.untiImageDone(src)
    return [
      {
        id: imgDetail.pid,
        object_key: imgDetail.pid,
        url: imgDetail.url,
      },
    ]
  }

  async uploadFile(file) {
    var blob = new Blob([file.bits])
    console.log('uploadFile', file, blob)
    var uploadurl1 = `https://picupload.weibo.com/interface/pic_upload.php?app=miniblog&s=json&p=1&data=1&url=&markpos=1&logo=0&nick=&file_source=4`
    var uploadurl2 = 'https://picupload.weibo.com/interface/pic_upload.php?app=miniblog&s=json&p=1&data=1&url=&markpos=1&logo=0&nick='
    var fileResp = await $.ajax({
      url:
      uploadurl1,
      type: 'POST',
      processData: false,
      data: new Blob([file.bits]),
    })
    console.log(file, fileResp)
    return [
      {
        id: fileResp.data.pics.pic_1.pid,
        object_key: fileResp.data.pics.pic_1.pid,
        url:
          'https://wx3.sinaimg.cn/large/' +
          fileResp.data.pics.pic_1.pid +
          '.jpg',
      },
    ]
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = WeiboDriver;



/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_turndown__ = __webpack_require__(0);
const { processDocCode, makeImgVisible } = __webpack_require__(1)



class Segmentfault {
  constructor() {
    this.name = 'segmentfault'
  }

  async getMetaData() {
    var res = await $.get('https://segmentfault.com/user/settings')
    var parser = new DOMParser()
    var htmlDoc = parser.parseFromString(res, 'text/html')
    var link = htmlDoc.getElementsByClassName('user-avatar')[0]
    if (!link) {
      throw Error('not found')
    }

    var uid = link.href.split('/').pop()
    var avatar = link.style['background-image']
      .replace('url("', '')
      .replace('")', '')
    console.log(
      link.href,
      link.style['background-image'].replace('url("', '').replace('")', '')
    )

    // if (!segIframe) {
    //   segIframe = document.createElement('iframe')
    //   segIframe.src = 'https://segmentfault.com/write?freshman=1'
    //   document.body.append(segIframe)
    // }
    initliazeFrame('https://segmentfault.com/write?freshman=1', 'segment')

    return {
      uid: uid,
      title: uid,
      avatar: avatar,
      type: 'segmentfault',
      displayName: 'Segmentfault',
      supportTypes: ['markdown', 'html'],
      home: 'https://segmentfault.com/user/draft',
      icon:
        'https://imgcache.iyiou.com/Company/2016-05-11/cf-segmentfault.jpg',
    }
  }

  async addPost(post) {
    // console.log('addPost', segIframe)

    var turndownService = new __WEBPACK_IMPORTED_MODULE_0_turndown__["a" /* default */]()
    turndownService.addRule('codefor', {
      filter: ['pre'],
      replacement: function (content) {
        // content = content.replace(new RegExp("` ", "g"), "\n");
        // content = content.replace(new RegExp("`", "g"), "");
        return ['```', content, '```'].join('\n')
      },
    })

    var markdown = turndownService.turndown(post.post_content)
    post.markdown = markdown
    console.log(markdown)

    var data = await requestFrameMethod(
      {
        type: 'sendPost',
        data: {
          type: 1,
          url: '',
          blogId: 0,
          isTiming: 0,
          created: '',
          weibo: 0,
          license: 0,
          tags: '',
          title: post.post_title,
          text: post.markdown,
          articleId: '',
          draftId: '',
          id: '',
        },
      },
      'segment'
    )

    console.log('data', data)
    return {
      status: 'success',
      post_id: data.data,
    }
  }

  async editPost(post_id, post) {
    return {
      status: 'success',
      post_id: post_id,
      draftLink: 'https://segmentfault.com/write?draftId=' + post_id,
    }
  }

  async uploadFile(file) {
    var formdata = new FormData()
    var blob = new Blob([file.bits])
    formdata.append('image', blob)
    var res = await axios({
      url: 'https://segmentfault.com/img/upload/image',
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    var url = 'https://image-static.segmentfault.com/' + res.data[2]
    //  return url;
    return [
      {
        id: res.data[2],
        object_key: res.data[2],
        url: url,
      },
    ]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    try {
      // post.content = post.content.replace(/\>\s+\</g,'');
      console.log('zihu.Juejin')
      div.html(post.content)
      // var org = $(post.content);
      // var doc = $('<div>').append(org.clone());
      var doc = div
      // var pres = doc.find("pre");
      processDocCode(div)
      makeImgVisible(div)

      var tempDoc = $('<div>').append(doc.clone())
      post.content =
        tempDoc.children('div').length == 1
          ? tempDoc.children('div').html()
          : tempDoc.html()

      console.log('after.predEdit', post.content)
    } catch (e) {
      console.log('preEdit.error', e)
    }
  }

  async uploadFileByForm($file) {
    var formdata = new FormData()
    formdata.append('image', $file)
    var res = await axios({
      url: 'https://segmentfault.com/img/upload/image',
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    var url = 'https://image-static.segmentfault.com/' + res.data[2]
    return url
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Segmentfault;



/***/ }),
/* 9 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_turndown__ = __webpack_require__(0);
const { processDocCode, makeImgVisible } = __webpack_require__(1)


class Juejin {
  constructor(ac) {
    this.version = '0.0.1'
    this.name = 'juejin'
    this.account = ac
    this.skipUpload = true
    console.log('Juejin', 'initliaze', ac, this)
  }

  async getMetaData() {
    var data = await $.get('https://juejin.im/auth')
    console.log(data)
    return {
      uid: data.userId,
      title: data.user.username,
      avatar: data.user.avatarLarge,
      type: 'juejin',
      displayName: '掘金',
      raw: data,
      supportTypes: ['markdown', 'html'],
      home: 'https://juejin.im/editor/drafts',
      icon: 'https://gold-cdn.xitu.io/favicons/favicon.ico',
    }
  }

  async addPost(post, _instance) {
    // https://post-storage-api-ms.juejin.im/v1/draftStorage
    console.log('addPost', _instance)
    console.log(_instance.account, post.markdown)
    // var post_id = res.data.id;
    console.log('TurndownService', __WEBPACK_IMPORTED_MODULE_0_turndown__["a" /* default */])
    var turndownService = new __WEBPACK_IMPORTED_MODULE_0_turndown__["a" /* default */]()
    turndownService.addRule('codefor', {
      filter: ['pre'],
      replacement: function (content) {
        // content = content.replace(new RegExp("` ", "g"), "\n");
        // content = content.replace(new RegExp("`", "g"), "");
        return ['```', content, '```'].join('\n')
      },
    })

    var markdown = turndownService.turndown(post.post_content)
    console.log(markdown)
    var res = await $.ajax({
      url: 'https://post-storage-api-ms.juejin.im/v1/draftStorage',
      type: 'POST',
      dataType: 'JSON',
      headers: {
        accept: 'application/json',
      },
      data: {
        uid: _instance.account.uid,
        device_id: _instance.account.raw.clientId,
        token: _instance.account.raw.token,
        src: 'web',
        category: '5562b428e4b00c57d9b94b9d',
        content: '',
        // html: post.post_content,
        html: ``,
        markdown: markdown,
        screenshot: '',
        isTitleImageFullscreen: 0,
        tags: '',
        title: post.post_title,
        type: 'markdown',
      },
    })
    console.log(res)
    return {
      status: 'success',
      post_id: res.d[0],
    }
  }

  async editPost(post_id, post) {
    return {
      status: 'success',
      post_id: post_id,
      draftLink: 'https://juejin.im/editor/drafts/' + post_id,
    }
  }

  async uploadFile(file) {
    var src = file.src
    var res = await $.ajax({
      url: 'https://cdn-ms.juejin.im/v1/fetch',
      type: 'POST',
      contentType: 'application/json',
      xhrFields: {
        withCredentials: true,
      },
      headers: {
        accept: 'application/json',
      },
      data: JSON.stringify({
        bucket: 'gold-user-assets',
        url: src,
      }),
    })

    console.log(res)
    return [
      {
        id: res.dkey,
        object_key: res.dkey,
        url: res.d.url.https,
      },
    ]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    try {
      // post.content = post.content.replace(/\>\s+\</g,'');
      console.log('zihu.Juejin')
      div.html(post.content)

      // var org = $(post.content);
      // var doc = $('<div>').append(org.clone());
      var doc = div
      // var pres = doc.find("pre");
      processDocCode(div)
      makeImgVisible(div)

      var tempDoc = $('<div>').append(doc.clone())
      post.content =
        tempDoc.children('div').length == 1
          ? tempDoc.children('div').html()
          : tempDoc.html()

      console.log('after.predEdit', post.content)
    } catch (e) {
      console.log('preEdit.error', e)
    }
  }

  async uploadFileByForm($file) {
    var formdata = new FormData()
    formdata.append('file', $file)
    var res = await axios({
      url: 'https://cdn-ms.juejin.im/v1/upload?bucket=gold-user-assets',
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return res.data.d.url.http
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Juejin;



/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// https://mp.csdn.net/mdeditor/saveArticle
// title: 996.ICU项目Stars构成分析
// markdowncontent:
// 996.ICU项目Stars构成分析
// content: <p>996.ICU项目Stars构成分析</p>
// id:
// readType: public
// tags:
// status: 2
// categories:
// type:
// original_link:
// authorized_status: undefined
// articleedittype: 1
// Description:
// resource_url:
// csrf_token:

// https://me.csdn.net/api/user/show

class CSDN {
  constructor() {
    this.name = 'csdn'
  }

  async getMetaData() {
    var res = await $.get('https://me.csdn.net/api/user/show')
    return {
      uid: res.data.csdnid,
      title: res.data.username,
      avatar: res.data.avatarurl,
      type: 'csdn',
      displayName: 'CSDN',
      supportTypes: ['markdown'],
      home: 'https://mp.csdn.net/',
      icon: 'https://csdnimg.cn/public/favicon.ico',
    }
  }

  async addPost(post) {
    var res = await $.ajax({
      url: 'https://mp.csdn.net/mdeditor/saveArticle',
      type: 'POST',
      dataType: 'JSON',
      headers: {
        accept: 'application/json',
      },
      data: {
        title: post.post_title,
        markdowncontent: post.markdown,
        content: post.post_content,
        id: '',
        readType: 'public',
        tags: '',
        status: 2,
        categories: '',
        type: '',
        original_link: '',
        authorized_status: 'undefined',
        articleedittype: 1,
        Description: '',
        resource_url: '',
        csrf_token: '',
      },
    })
    console.log(res)
    return {
      status: 'success',
      post_id: res.data.id,
    }
  }

  async editPost(post_id, post) {
    return {
      status: 'success',
      post_id: post_id,
      draftLink: 'https://mp.csdn.net/mdeditor/' + post_id,
    }
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = CSDN;




/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// https://mp.csdn.net/mdeditor/saveArticle
// title: 996.ICU项目Stars构成分析
// markdowncontent:
// 996.ICU项目Stars构成分析
// content: <p>996.ICU项目Stars构成分析</p>
// id:
// readType: public
// tags:
// status: 2
// categories:
// type:
// original_link:
// authorized_status: undefined
// articleedittype: 1
// Description:
// resource_url:
// csrf_token:
// https://me.csdn.net/api/user/show
// https://passport.cnblogs.com/user/LoginInfo?callback=jQuery17083998854357229_1570784103705&_=1570784103764

class Cnblog {
  constructor() {
    this.name = 'cnblog'
  }

  async getMetaData() {
    var res = await $.get('https://home.cnblogs.com/user/CurrentUserInfo')
    var parser = new DOMParser()
    var htmlDoc = parser.parseFromString(res, 'text/html')
    var img = htmlDoc.getElementsByClassName('pfs')[0]
    var link = img.parentNode.href
    var pie = link.split('/')
    pie.pop()
    var uid = pie.pop()
    console.log(link)
    return {
      uid: uid,
      title: uid,
      avatar: img.src,
      type: 'cnblog',
      displayName: 'CnBlog',
      supportTypes: ['markdown'],
      home: 'https://i.cnblogs.com/EditArticles.aspx?IsDraft=1',
      icon: 'https://common.cnblogs.com/favicon.ico',
    }
  }

  async addPost(post) {
    var postId = null
    try {
      var res = await $.ajax({
        url: 'https://i.cnblogs.com/EditArticles.aspx?opt=1',
        type: 'POST',
        dataType: 'JSON',
        headers: {},
        data: {
          __VIEWSTATE: '',
          __VIEWSTATEGENERATOR: '',
          Editor$Edit$txbTitle: post.post_title,
          Editor$Edit$EditorBody: post.markdown,
          Editor$Edit$Advanced$ckbPublished: 'on',
          Editor$Edit$Advanced$chkDisplayHomePage: 'on',
          Editor$Edit$Advanced$chkComments: 'on',
          Editor$Edit$Advanced$chkMainSyndication: 'on',
          Editor$Edit$Advanced$txbEntryName: '',
          Editor$Edit$Advanced$txbExcerpt: '',
          Editor$Edit$Advanced$txbTag: '',
          Editor$Edit$Advanced$tbEnryPassword: '',
          Editor$Edit$lkbDraft: '存为草稿',
        },
      })
      console.log('CNBLOG addPost', res)
    } catch (e) {
      var parser = new DOMParser()
      var htmlDoc = parser.parseFromString(e.responseText, 'text/html')
      var editLink = htmlDoc.getElementById('TipsPanel_LinkEdit')
      var ErrorPanel = htmlDoc.getElementsByClassName('ErrorPanel')[0]
      if (editLink) {
        postId = editLink.href.split('postid=')[1]
        console.log('CNBLOG error', editLink, editLink.href.query)
      } else {
        if (ErrorPanel) {
          throw Error(ErrorPanel.innerText)
        }
      }
      console.log('CNBLOG error', e.responseText, htmlDoc, editLink)
    }

    return {
      status: 'success',
      post_id: postId,
    }
  }

  async editPost(post_id, post) {
    return {
      status: 'success',
      post_id: post_id,
      draftLink:
        'https://i.cnblogs.com/EditArticles.aspx?postid=' +
        post_id +
        '&update=1',
    }
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Cnblog;




/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var weixinMetaCache = null

class WeixinDriver {
  constructor() {
    this.meta = weixinMetaCache
    this.name = 'weixin'
  }

  async getMetaData() {
    var res = await $.ajax({ url: 'https://mp.weixin.qq.com/' })
    var innerDoc = $(res)
    var doc = $('<div>').append(innerDoc.clone())
    // console.log('WeixinDriver', res);
    var code = doc.find('script').eq(0).text()
    code = code.substring(code.indexOf('window.wx.commonData'))
    var wx = new Function(
      'window.wx = {}; window.handlerNickname = function(){};' +
        code +
        '; return window.wx;'
    )()
    console.log(code, wx)
    var commonData = Object.assign({}, wx.commonData)
    delete window.wx
    if (!commonData.data.t) {
      throw new Error('未登录')
    }
    var metadata = {
      uid: commonData.data.user_name,
      title: commonData.data.nick_name,
      token: commonData.data.t,
      commonData: commonData,
      avatar: doc.find('.weui-desktop-account__thumb').eq(0).attr('src'),
      type: 'weixin',
      supportTypes: ['html'],
      home: 'https://mp.weixin.qq.com',
      icon: 'https://mp.weixin.qq.com/favicon.ico',
    }
    weixinMetaCache = metadata
    console.log('weixinMetaCache', weixinMetaCache)
    return metadata
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async getArticle(data) {
    var token = weixinMetaCache.token || '442135330'
    const tempRespone = await $.get(
      `https://mp.weixin.qq.com/cgi-bin/appmsg?action=get_temp_url&appmsgid=${data.msgId}&itemidx=1&token=${token}&lang=zh_CN&f=json&ajax=1`
    )
    const { temp_url } = tempRespone
    const htmlData = await $.get(temp_url)
    const doc = $(htmlData)
    console.log('htmlData', htmlData)
    var post = {}

    const allMetas = doc
      .filter(function(index, el) {
        return $(el).attr('property') && $(el).attr('content')
      })
      .map(function() {
        return {
          name: $(this).attr('property'),
          content: $(this).attr('content'),
        }
      })
      .toArray()

    const metaObj = {}
    allMetas.forEach(obj => {
      metaObj[obj.name] = obj.content
    })

    post.title = metaObj['og:title']
    post.content = doc.find('#js_content').html()
    post.thumb = metaObj['og:image']
    post.desc = metaObj['og:description'] 
    post.link = metaObj['og:url'];
    console.log('post', post, doc)
    return post
  }

  async editPost(post_id, post) {
    console.log('editPost', post.post_thumbnail)
    var res = await $.ajax({
      url:
        'https://mp.weixin.qq.com/cgi-bin/operate_appmsg?t=ajax-response&sub=create&type=10&token=' +
        weixinMetaCache.token +
        '&lang=zh_CN',
      type: 'POST',
      dataType: 'JSON',
      data: {
        token: weixinMetaCache.token,
        lang: 'zh_CN',
        f: 'json',
        ajax: '1',
        random: Math.random(),
        AppMsgId: '',
        count: '1',
        data_seq: '0',
        operate_from: 'Chrome',
        isnew: '0',
        ad_video_transition0: '',
        can_reward0: '0',
        related_video0: '',
        is_video_recommend0: '-1',
        title0: post.post_title,
        author0: '',
        writerid0: '0',
        fileid0: '',
        digest0: post.post_title,
        auto_gen_digest0: '1',
        content0: post.post_content,
        sourceurl0: '',
        need_open_comment0: '1',
        only_fans_can_comment0: '0',
        cdn_url0: '',
        cdn_235_1_url0: '',
        cdn_1_1_url0: '',
        cdn_url_back0: '',
        crop_list0: '',
        music_id0: '',
        video_id0: '',
        voteid0: '',
        voteismlt0: '',
        supervoteid0: '',
        cardid0: '',
        cardquantity0: '',
        cardlimit0: '',
        vid_type0: '',
        show_cover_pic0: '0',
        shortvideofileid0: '',
        copyright_type0: '0',
        releasefirst0: '',
        platform0: '',
        reprint_permit_type0: '',
        allow_reprint0: '',
        allow_reprint_modify0: '',
        original_article_type0: '',
        ori_white_list0: '',
        free_content0: '',
        fee0: '0',
        ad_id0: '',
        guide_words0: '',
        is_share_copyright0: '0',
        share_copyright_url0: '',
        source_article_type0: '',
        reprint_recommend_title0: '',
        reprint_recommend_content0: '',
        share_page_type0: '0',
        share_imageinfo0: '{"list":[]}',
        share_video_id0: '',
        dot0: '{}',
        share_voice_id0: '',
        insert_ad_mode0: '',
        categories_list0: '[]',
        sections0:
          '[{"section_index":1000000,"text_content":"​kkk","section_type":9,"ad_available":false}]',
        compose_info0:
          '{"list":[{"blockIdx":1,"content":"<p>​kkk<br></p>","width":574,"height":27,"topMargin":0,"blockType":9,"background":"rgba(0, 0, 0, 0)","text":"kkk","textColor":"rgb(51, 51, 51)","textFontSize":"17px","textBackGround":"rgba(0, 0, 0, 0)"}]}',
      },
    })

    if (!res.appMsgId) {
      var err = formatError(res)
      console.log('error', err)
      throw new Error(
        '同步失败 错误内容：' + (err && err.errmsg ? err.errmsg : res.ret)
      )
    }
    return {
      status: 'success',
      post_id: res.appMsgId,
      draftLink:
        'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&type=10&appmsgid=' +
        res.appMsgId +
        '&token=' +
        weixinMetaCache.token +
        '&lang=zh_CN',
    }
    // https://zhuanlan.zhihu.com/api/articles/68769713/draft
  }

  async uploadFile(file) {
    var formdata = new FormData()
    var blob = new Blob([file.bits], {
        type: file.type
    });

    formdata.append('type', blob.type)
    formdata.append('id', new Date().getTime())
    formdata.append('name', new Date().getTime() + '.jpg')
    formdata.append('lastModifiedDate', new Date().toString())
    formdata.append('size', blob.size)
    formdata.append('file', blob, new Date().getTime() + '.jpg')
    
    var ticket_id = this.meta.commonData.data.user_name,
      ticket = this.meta.commonData.data.ticket,
      svr_time =  this.meta.commonData.data.time,
      token = this.meta.commonData.data.t,
      seq = new Date().getTime();

    var res = await axios({
      url: `https://mp.weixin.qq.com/cgi-bin/filetransfer?action=upload_material&f=json&scene=8&writetype=doublewrite&groupid=1&ticket_id=${ticket_id}&ticket=${ticket}&svr_time=${svr_time}&token=${token}&lang=zh_CN&seq=${seq}&t=` + Math.random(),
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    var url = res.data.cdn_url
    if(res.data.base_resp.err_msg != 'ok') {
      console.log(res.data);
      throw new Error('upload failed')
    }
    //  return url;
    return [
      {
        id: res.data.content,
        object_key: res.data.content,
        url: url,
      },
    ]
  }

  async uploadFileBySource(file) {
    var src = file.src
    var res = await $.ajax({
      url:
        'https://mp.weixin.qq.com/cgi-bin/uploadimg2cdn?lang=zh_CN&token=' +
        weixinMetaCache.token +
        '&t=' +
        Math.random(),
      type: 'POST',
      dataType: 'JSON',
      data: {
        imgurl: src,
        t: 'ajax-editor-upload-img',
        token: weixinMetaCache.token,
        lang: 'zh_CN',
        f: 'json',
        ajax: '1',
      },
    })

    if (res.errcode != 0) {
      throw new Error('图片上传失败' + src)
    }
    console.log(res)
    return [
      {
        id: 'aaa',
        object_key: 'aaa',
        url: res.url,
      },
    ]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    if (post.inline_content) {
      post.content = post.inline_content
    }

    div.html(post.content)

    var doc = div
    var tags = doc.find('p')
    for (let mindex = 0; mindex < tags.length; mindex++) {
      const tag = tags.eq(mindex)
      try {
        var nextHasImage = tag.next().children('img').length
        var span = $('<span></span>')
        span.html(tag.html())
        tag.html('')
        tag.append(span)
        // if (!tag.children("br").length) tag.css("margin-bottom", "20px");
        // tag.after("<p><br></p>");
        // span.css("color", "rgb(68, 68, 68)");
        // span.css("font-size", "16px");
      } catch (e) {}
    }

    var tags = doc.find('img')
    for (let mindex = 0; mindex < tags.length; mindex++) {
      const tag = tags.eq(mindex)
      const wraperTag = tag.parent()
      try {
        tag.removeAttr('_src')
        tag.attr('style', '')
        wraperTag.replaceWith('<p>' + wraperTag.html() + '</p>')
      } catch (e) {}
    }

    var pres = doc.find('a')
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        pre.after(pre.html()).remove()
      } catch (e) {}
    }

    var processEmptyLine = function (idx, el) {
      var $obj = $(this)
      var originalText = $obj.text()
      var img = $obj.find('img')
      var brs = $obj.find('br')
      if (originalText == '') {
        ;(function () {
          if (img.length) return
          if (!brs.length) return
          $obj.remove()
        })()
      }
    }

    var processListItem = function (idx, el) {
      var $obj = $(this)
      $obj.html($('<p></p>').append($obj.html()))
    }

    doc.find('li').each(processListItem)
    // remove empty break line
    doc.find('p').each(processEmptyLine)

    var processBr = function (idx, el) {
      var $obj = $(this)
      if (!$obj.next().length) {
        $obj.remove()
      }
    }

    doc.find('br').each(processBr)
    post.content = $('<div>')
      .append(
        "<section style='margin-left: 6px;margin-right: 6px;line-height: 1.75em;'>" +
          doc.clone().html() +
          '</section>'
      )
      .html()

    console.log('post.content', post.content)
    var inlineCssHTML = juice.inlineContent(
      post.content,
      `
    /**
    * common style
    */

   html, address,
   blockquote,
   body, dd, div,
   dl, dt, fieldset, form,
   frame, frameset,
   h1, h2, h3, h4,
   h5, h6, noframes,
   ol, p, ul, center,
   dir, hr, menu, pre   { display: block; unicode-bidi: embed }
   li              { display: list-item }
   head            { display: none }
   table           { display: table }
   tr              { display: table-row }
   thead           { display: table-header-group }
   tbody           { display: table-row-group }
   tfoot           { display: table-footer-group }
   col             { display: table-column }
   colgroup        { display: table-column-group }
   td, th          { display: table-cell }
   caption         { display: table-caption }
   th              { font-weight: bolder; text-align: center }
   caption         { text-align: center }
   body            { margin: 8px }
   h1              { font-size: 2em; margin: .67em 0 }
   h2              { font-size: 1.5em; margin: .75em 0 }
   h3              { font-size: 1.17em; margin: .83em 0 }
   h4, p,
   blockquote, ul,
   fieldset, form,
   ol, dl, dir,
   menu            { margin: 1.12em 0 }
   h5              { font-size: .83em; margin: 1.5em 0 }
   h6              { font-size: .75em; margin: 1.67em 0 }
   h1, h2, h3, h4,
   h5, h6, b,
   strong          { font-weight: bolder }
   blockquote      { margin-left: 40px; margin-right: 40px }
   i, cite, em,
   var, address    { font-style: italic }
   pre, tt, code,
   kbd, samp       { font-family: monospace }
   pre             { white-space: pre }
   button, textarea,
   input, select   { display: inline-block }
   big             { font-size: 1.17em }
   small, sub, sup { font-size: .83em }
   sub             { vertical-align: sub }
   sup             { vertical-align: super }
   table           { border-spacing: 2px; }
   thead, tbody,
   tfoot           { vertical-align: middle }
   td, th, tr      { vertical-align: inherit }
   s, strike, del  { text-decoration: line-through }
   hr              { border: 1px inset }
   ol, ul, dir,
   menu, dd        { margin-left: 40px }
   ol              { list-style-type: decimal }
   ol ul, ul ol,
   ul ul, ol ol    { margin-top: 0; margin-bottom: 0 }
   u, ins          { text-decoration: underline }
   br:before       { content: "\A"; white-space: pre-line }
   center          { text-align: center }
   :link, :visited { text-decoration: underline }
   :focus          { outline: thin dotted invert }
   
   /* Begin bidirectionality settings (do not change) */
   BDO[DIR="ltr"]  { direction: ltr; unicode-bidi: bidi-override }
   BDO[DIR="rtl"]  { direction: rtl; unicode-bidi: bidi-override }
   
   *[DIR="ltr"]    { direction: ltr; unicode-bidi: embed }
   *[DIR="rtl"]    { direction: rtl; unicode-bidi: embed }
   
   @media print {
     h1            { page-break-before: always }
     h1, h2, h3,
     h4, h5, h6    { page-break-after: avoid }
     ul, ol, dl    { page-break-before: avoid }
   }
   h1,
   h2,
   h3,
   h4,
   h5,
   h6 {
     font-weight: bold;
   }
   
   h1 {
     font-size: 1.25em;
     line-height: 1.4em;
   }
   
   h2 {
     font-size: 1.125em;
   }
   
   h3 {
     font-size: 1.05em;
   }
   
   h4,
   h5,
   h6 {
     font-size: 1em;
     margin: 1em 0;
   }

    p {
      color: rgb(51, 51, 51);
      font-size: 15px;
    }

    li p {
      margin: 0;
    }
   `
    )
    console.log('inlineCssHTML new', inlineCssHTML)
    post.content = inlineCssHTML
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = WeixinDriver;


function formatError(e) {
  var r,
    a = {
      errmsg: '',
      index: !1,
    }
  switch (
    ('undefined' != typeof e.ret
      ? (r = 1 * e.ret)
      : e.base_resp &&
        'undefined' != typeof e.base_resp.ret &&
        (r = 1 * e.base_resp.ret),
    1 * r)
  ) {
    case -8:
    case -6:
      ;(e.ret = '-6'), (a.errmsg = '请输入验证码')
      break

    case 62752:
      a.errmsg = '可能含有具备安全风险的链接，请检查'
      break

    case 64505:
      a.errmsg = '发送预览失败，请稍后再试'
      break

    case 64504:
      a.errmsg = '保存图文消息发送错误，请稍后再试'
      break

    case 64518:
      a.errmsg = '正文只能包含一个投票'
      break

    case 10704:
    case 10705:
      a.errmsg = '该素材已被删除'
      break

    case 10701:
      a.errmsg = '用户已被加入黑名单，无法向其发送消息'
      break

    case 10703:
      a.errmsg = '对方关闭了接收消息'
      break

    case 10700:
    case 64503:
      a.errmsg =
        '1.接收预览消息的微信尚未关注公众号，请先扫码关注<br /> 2.如果已经关注公众号，请查看微信的隐私设置（在手机微信的“我->设置->隐私->添加我的方式”中），并开启“可通过以下方式找到我”的“手机号”、“微信号”、“QQ号”，否则可能接收不到预览消息'
      break

    case 64502:
      a.errmsg = '你输入的微信号不存在，请重新输入'
      break

    case 64501:
      a.errmsg = '你输入的帐号不存在，请重新输入'
      break

    case 412:
      a.errmsg = '图文中含非法外链'
      break

    case 64515:
      a.errmsg = '当前素材非最新内容，请重新打开并编辑'
      break

    case 320001:
      a.errmsg = '该素材已被删除，无法保存'
      break

    case 64702:
      a.errmsg = '标题超出64字长度限制'
      break

    case 64703:
      a.errmsg = '摘要超出120字长度限制'
      break

    case 64704:
      a.errmsg = '推荐语超出300字长度限制'
      break

    case 64708:
      a.errmsg = '推荐语超出140字长度限制'
      break

    case 64515:
      a.errmsg = '当前素材非最新内容'
      break

    case 200041:
      a.errmsg = '此素材有文章存在违规，无法编辑'
      break

    case 64506:
      a.errmsg = '保存失败,链接不合法'
      break

    case 64507:
      a.errmsg =
        '内容不能包含外部链接，请输入http://或https://开头的公众号相关链接'
      break

    case 64510:
      a.errmsg = '内容不能包含音频，请调整'
      break

    case 64511:
      a.errmsg = '内容不能包多个音频，请调整'
      break

    case 64512:
      a.errmsg = '文章中音频错误,请使用音频添加按钮重新添加。'
      break

    case 64508:
      a.errmsg = '查看原文链接可能具备安全风险，请检查'
      break

    case 64550:
      a.errmsg = '请勿插入不合法的图文消息链接'
      break

    case 64558:
      a.errmsg = '请勿插入图文消息临时链接，链接会在短期失效'
      break

    case 64559:
      a.errmsg = '请勿插入未群发的图文消息链接'
      break

    case -99:
      a.errmsg = '内容超出字数，请调整'
      break

    case 64705:
      a.errmsg = '内容超出字数，请调整'
      break

    case -1:
      a.errmsg = '系统错误，请注意备份内容后重试'
      break

    case -2:
    case 200002:
      a.errmsg = '参数错误，请注意备份内容后重试'
      break

    case 64509:
      a.errmsg = '正文中不能包含超过3个视频，请重新编辑正文后再保存。'
      break

    case -5:
      a.errmsg = '服务错误，请注意备份内容后重试。'
      break

    case 64513:
      a.errmsg = '请从正文中选择封面，再尝试保存。'
      break

    case -206:
      a.errmsg = '目前，服务负荷过大，请稍后重试。'
      break

    case 10801:
      ;(a.errmsg =
        '标题不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑。'),
        (a.index = 1 * e.msg)
      break

    case 10802:
      ;(a.errmsg =
        '作者不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑。'),
        (a.index = 1 * e.msg)
      break

    case 10803:
      ;(a.errmsg = '敏感链接，请重新添加。'), (a.index = 1 * e.msg)
      break

    case 10804:
      ;(a.errmsg =
        '摘要不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑。'),
        (a.index = 1 * e.msg)
      break

    case 10806:
      ;(a.errmsg =
        '正文不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑。'),
        (a.index = 1 * e.msg)
      break

    case 10808:
      ;(a.errmsg =
        '推荐语不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑。'),
        (a.index = 1 * e.msg)
      break

    case 10807:
      a.errmsg = '内容不能违反公众平台协议、相关法律法规和政策，请重新编辑。'
      break

    case 200003:
      a.errmsg = '登录态超时，请重新登录。'
      break

    case 64513:
      a.errmsg = '封面必须存在正文中，请检查封面'
      break

    case 64551:
      a.errmsg = '请检查图文消息中的微视链接后重试。'
      break

    case 64552:
      a.errmsg = '请检查阅读原文中的链接后重试。'
      break

    case 64553:
      a.errmsg = '请不要在图文消息中插入超过5张卡券。请删减卡券后重试。'
      break

    case 64554:
      a.errmsg = '在当前情况下不允许在图文消息中插入卡券，请删除卡券后重试。'
      break

    case 64555:
      a.errmsg = '请检查图文消息卡片跳转的链接后重试。'
      break

    case 64556:
      a.errmsg = '卡券不属于该公众号，请删除后重试'
      break

    case 64557:
      a.errmsg = '卡券无效，请删除后重试。'
      break

    case 13002:
      ;(a.errmsg = '该广告卡片已过期，删除后才可保存成功'),
        (a.index = 1 * e.msg)
      break

    case 13003:
      ;(a.errmsg = '已有文章插入过该广告卡片，一个广告卡片仅可插入一篇文章'),
        (a.index = 1 * e.msg)
      break

    case 13004:
      ;(a.errmsg = '该广告卡片与图文消息位置不一致'), (a.index = 1 * e.msg)
      break

    case 15801:
    case 15802:
    case 15803:
    case 15804:
    case 15805:
    case 15806:
      a.errmsg =
        e.remind_wording ||
        '你所编辑的内容可能含有违反微信公众平台平台协议、相关法律法规和政策的内容'
      break

    case 1530503:
      a.errmsg = '请勿添加其他公众号的主页链接'
      break

    case 1530504:
      a.errmsg = '请勿添加其他公众号的主页链接'
      break

    case 1530510:
      a.errmsg = '链接已失效，请在手机端重新复制链接'
      break

    case 153007:
    case 153008:
    case 153009:
    case 153010:
      a.errmsg =
        '很抱歉，原创声明不成功|你的文章内容未达到声明原创的要求，满足以下任一条件可发起声明：<br />1、文章文字字数大于300字，且自己创作的内容大于引用内容<br />2、文章文字字数小于300字，无视频，且图片（包括封面图）均为你已成功声明原创的图片<br />说明：上述要求中，文章文字字数不包含标点符号和空格，请知悉。'
      break

    case 153200:
      a.errmsg = '无权限声明原创，取消声明后重试'
      break

    case 1530511:
      a.errmsg = '链接已失效，请在手机端重新复制链接'
      break

    case 220001:
      a.errmsg = '"素材管理"中的存储数量已达到上限，请删除后再操作。'
      break

    case 220002:
      a.errmsg = '你的图片库已达到存储上限，请进行清理。'
      break

    case 153012:
      a.errmsg = '请设置转载类型'
      break

    case 200042:
      a.errmsg = '图文中包含的小程序素材不能多于50个、小程序帐号不能多于10个'
      break

    case 200043:
      a.errmsg = '图文中包含没有关联的小程序，请删除后再保存'
      break

    case 64601:
      a.errmsg = '一篇文章只能插入一个广告卡片'
      break

    case 64602:
      a.errmsg = '尚未开通文中广告位，但文章中有广告'
      break

    case 64603:
      a.errmsg = '文中广告前不足300字'
      break

    case 64604:
      a.errmsg = '文中广告后不足300字'
      break

    case 64605:
      a.errmsg = '文中不能同时插入文中广告和互选广告'
      break

    case 65101:
      a.errmsg = '图文模版数量已达到上限，请删除后再操作'
      break

    case 64560:
      a.errmsg = '请勿插入历史图文消息页链接'
      break

    case 64561:
      a.errmsg = '请勿插入mp.weixin.qq.com域名下的非图文消息链接'
      break

    case 64562:
      a.errmsg = '请勿插入非mp.weixin.qq.com域名的链接'
      break

    case 153013:
      a.errmsg = '文章内含有投票，不能设置为开放转载'
      break

    case 153014:
      a.errmsg = '文章内含有卡券，不能设置为开放转载'
      break

    case 153015:
      a.errmsg = '文章内含有小程序链接，不能设置为开放转载'
      break

    case 153016:
      a.errmsg = '文章内含有小程序链接，不能设置为开放转载'
      break

    case 153017:
      a.errmsg = '文章内含有小程序卡片，不能设置为开放转载'
      break

    case 153018:
      a.errmsg = '文章内含有商品，不能设置为开放转载'
      break

    case 153019:
      a.errmsg = '文章内含有广告卡片，不能设置为开放转载'
      break

    case 153020:
      a.errmsg = '文章内含有广告卡片，不能设置为开放转载'
      break

    case 153021:
      a.errmsg = '文章内含有广告卡片，不能设置为开放转载'
      break

    case 153101:
      a.errmsg = '含有原文已删除的转载文章，请删除后重试'
      break

    case 64707:
      a.errmsg = '赞赏账户授权失效或者状态异常'
      break

    case 420001:
      a.errmsg = '封面图不支持GIF，请更换'
      break

    case 353004:
      a.errmsg = '不支持添加商品，请删除后重试'
      break

    case 442001:
      a.errmsg = '帐号新建/编辑素材能力已被封禁，暂不可使用。'
      break

    default:
      a.errmsg = '系统繁忙，请稍后重试'
  }
  return a
}


/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class YiDian {
  constructor() {
    this.skipReadImage = true
  }

  async getMetaData() {
    var res = await $.ajax({ url: 'https://mp.yidianzixun.com' })
    var innerDoc = $(res)
    var doc = $('<div>').append(innerDoc.clone())
    var code = doc.find('#__val_').text()
    console.log('YiDian', code)
    // code = code.substring(code.indexOf("window.mpuser"));
    // eval(code);
    var mpuser = new Function(code + '; return window.mpuser;')()
    var commonData = Object.assign({}, mpuser)
    console.log(commonData)
    if (!commonData.id) {
      throw new Error('未登录')
    }
    var metadata = {
      uid: commonData.id,
      title: commonData.media_name,
      commonData: commonData,
      avatar: commonData.media_pic,
      type: 'yidian',
      supportTypes: ['html'],
      home: 'https://mp.yidianzixun.com',
      icon: 'https://www.yidianzixun.com/favicon.ico',
    }
    return metadata
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {
    var res = await $.ajax({
      url: 'https://mp.yidianzixun.com/model/Article',
      type: 'POST',
      dataType: 'JSON',
      data: {
        title: post.post_title,
        cate: '',
        cateB: '',
        coverType: 'default',
        covers: [],
        content: post.post_content,
        hasSubTitle: 0,
        subTitle: '',
        original: 0,
        reward: 0,
        videos: [],
        audios: [],
        votes: {
          vote_id: '',
          vote_options: [],
          vote_end_time: '',
          vote_title: '',
          vote_type: 1,
          isAdded: false,
        },
        images: [],
        goods: [],
        is_mobile: 0,
        status: 0,
        import_url: '',
        import_hash: '',
        image_urls: {},
        minTimingHour: 3,
        maxTimingDay: 7,
        tags: [],
        isPubed: false,
        lastSaveTime: '',
        dirty: false,
        editorType: 'articleEditor',
        activity_id: 0,
        join_activity: 0,
        notSaveToStore: true,
      },
    })

    if (!res.id) {
      throw new Error('同步错误' + JSON.stringify(res))
    }
    return {
      status: 'success',
      post_id: res.id,
      draftLink: 'https://mp.yidianzixun.com/#/Writing/' + res.id,
    }
  }

  async uploadFile(file) {
    var src = file.src
    var res = await $.get(
      'https://mp.yidianzixun.com/api/getImageFromUrl?src=' +
        encodeURIComponent(src)
    )
    // throw new Error('fuck');
    if (res.status != 'success') {
      throw new Error('图片上传失败 ' + src)
    }
    // http only
    console.log('uploadFile', res)
    return [
      {
        id: '',
        object_key: '',
        url: res.inner_addr,
      },
    ]
  }

  async preEditPost(post) {
    // var div = $("<div>");
    // $("body").append(div);
    // div.html(post.content);
    // // var org = $(post.content);
    // // var doc = $('<div>').append(org.clone());
    // var doc = div;
    // var pres = doc.find("a");
    // for (let mindex = 0; mindex < pres.length; mindex++) {
    //   const pre = pres.eq(mindex);
    //   try {
    //     pre.after(pre.html()).remove();
    //   } catch (e) {}
    // }
    // var pres = doc.find("iframe");
    // for (let mindex = 0; mindex < pres.length; mindex++) {
    //   const pre = pres.eq(mindex);
    //   try {
    //     pre.remove();
    //   } catch (e) {}
    // }
    // post.content = $("<div>")
    //   .append(doc.clone())
    //   .html();
    // console.log("post", post);
  }

  //   editImg(img, source) {
  //     img.attr("web_uri", source.images[0].origin_web_uri);
  //   }
  //   <img class="" src="http://p2.pstatp.com/large/pgc-image/bc0a9fc8e595453083d85deb947c3d6e" data-ic="false" data-ic-uri="" data-height="1333" data-width="1000" image_type="1" web_uri="pgc-image/bc0a9fc8e595453083d85deb947c3d6e" img_width="1000" img_height="1333"></img>
}
/* harmony export (immutable) */ __webpack_exports__["a"] = YiDian;



/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_turndown__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__tools_mtd__ = __webpack_require__(16);
var metaCache = null


// import { markdownToDraft } from 'markdown-draft-js';

// const axios = require('axios');
const draftJs = window.draftJs;
// const convertToRaw = draftJs.convertToRaw
// const htmlToDraft = require('html-to-draftjs').default
// const ContentState = draftJs.ContentState


const ImageRegexp = /^!\[([^\]]*)]\s*\(([^)"]+)( "([^)"]+)")?\)/
const imageBlock = (remarkable) => {
  remarkable.block.ruler.before('paragraph', 'image', (state, startLine, endLine, silent) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]

    if (pos >= max) {
      return false
    }
    if (!state.src) {
      return false
    }
    if (state.src[pos] !== '!') {
      return false
    }

    var match = ImageRegexp.exec(state.src.slice(pos))
    if (!match) {
      return false
    }

    // in silent mode it shouldn't output any tokens or modify pending
    if (!silent) {
      state.tokens.push({
        type: 'image_open',
        src: match[2],
        alt: match[1],
        lines: [ startLine, state.line ],
        level: state.level
      })

      state.tokens.push({
        type: 'image_close',
        level: state.level
      })
    }

    state.line = startLine + 1

    return true
  })
}


function covertHTMLToDraftJs(html) {
    const blocksFromHtml = htmlToDraft(html)
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    const contentStateString = JSON.stringify(convertToRaw(contentState))
    console.log('contentStateString', contentStateString)
    return contentStateString
}

function getFormData(obj) {
    var map = {};
    obj.find('input').each(function() {
        map[$(this).attr("name")] = $(this).val();
    });
    return map
}


class Douban {
  constructor(config) {
    this.config = config
    this.meta = metaCache
    this.name = 'douban'
  }

  async getMetaData() {
    var res = await $.ajax({ url: 'https://www.douban.com/note/create' })
    var innerDoc = $(res)
    var doc = $('<div>').append(innerDoc.clone())
    var configScript = innerDoc.filter(function(index, el){ return $(el).text().indexOf('_POST_PARAMS') > -1 });
    if(configScript.length == 0) {
        throw new Error('未登录')
    }
    var code = configScript.text()
    var wx = new Function(
        'Do ={}; Do.add = function() {} '+ code +
        '; return {_USER_AVATAR: _USER_AVATAR, _USER_NAME: _USER_NAME, _NOTE_ID: _NOTE_ID, _TAGS: _TAGS, _POST_PARAMS: _POST_PARAMS};'
    )();
    console.log(code, wx)

    var metadata = {
      uid: wx._USER_NAME,
      title: wx._USER_NAME,
      commonData: wx,
      avatar: wx._USER_AVATAR,
      type: 'douban',
      supportTypes: ['html'],
      home: 'https://www.douban.com/note/create',
      icon: 'https://img3.doubanio.com/favicon.ico',
      form: getFormData(doc.find('#note-editor-form')),
      _POST_PARAMS: wx._POST_PARAMS
    }
    metaCache = metadata
    this.meta = metaCache
    console.log('metaCache', metaCache)
    return metadata
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {
    // console.log('editPost', post.post_thumbnail)
    var turndownService = new __WEBPACK_IMPORTED_MODULE_0_turndown__["a" /* default */]()
    var markdown = turndownService.turndown(post.post_content)
    console
      .log(markdown)

    // 保证图片换行
    markdown = markdown.split("\n").map(_ => {
      const imageBlocks = _.split('![]');
      return imageBlocks.length > 1 ? imageBlocks.join('\n![]') : _
    }).join("\n");

    const draftjsState = JSON.stringify(Object(__WEBPACK_IMPORTED_MODULE_1__tools_mtd__["a" /* default */])(markdown, {
      remarkablePlugins: [imageBlock],
      blockTypes: {
        image_open: function(item, generateUniqueKey) {
          console.log('image_open', 'blockTypes', item)
          var key = generateUniqueKey()
          var blockEntities = {}
          // ?#
          var sourcePair =  item.src.split("?#")
          var rawSrc = sourcePair[0]
          var sourceId = sourcePair[1]
          if(sourcePair.length) {
            item.src = rawSrc
          }
          var imageTemplate = {
            id: sourceId,
            src:  item.src,
            thumb: item.src,
            url: item.src,
          }

          blockEntities[key] = {
            type: 'IMAGE',
            mutability: 'IMMUTABLE',
            data: imageTemplate,
          }
          return {
            type: 'atomic',
            blockEntities: blockEntities,
            inlineStyleRanges: [],
            // "data": {
            //     "page": 0
            // },
            entityRanges: [
              {
                offset: 0,
                length: 1,
                key: key,
              },
            ],
            text: ' ',
          }
        }
      },
      blockEntities: {
        image: function (item) {
          var sourcePair =  item.src.split("?#")
          if(sourcePair.length) {
            var rawSrc = sourcePair[0]
            var sourceId = sourcePair[1]
            item.id = sourceId
            item.src = rawSrc
          }
          console.log('image_open', 'blockEntities', item)
          return {
            type: 'IMAGE',
            mutability: 'IMMUTABLE',
            data: item
          }
        }
      }
    }));
    console.log(draftjsState)

    var state = this.config.state;

    var requestUrl = 'https://www.douban.com/j/note/autosave';
    var draftLink = 'https://www.douban.com/note/create';
    var requestBody = {
      is_rich: 1,
      note_id: this.meta.form.note_id,
      note_title: post.post_title,
      note_text: draftjsState,
      introduction: '',
      note_privacy: 'P',
      cannot_reply: null,
      author_tags: null,
      accept_donation: null,
      donation_notice: null,
      is_original: null,
      ck: this.meta.form.ck
    }

    // https://music.douban.com/subject/24856133/new_review
    // music review
    // https://music.douban.com/j/review/create
    // is_rich: 1
    // topic_id: 
    // review[subject_id]: 24856133
    // review[title]: aaa
    // review[introduction]: 
    // review[text]: {"entityMap":{},"blocks":[{"key":"9riq1","text":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"page":0}}]}
    // review[rating]: 
    // review[spoiler]: 
    // review[donate]: 
    // review[original]: 
    // ck: O4jk
    if(state.is_review) {
      if(state.subject == 'music') {
        draftLink = state.url;
        requestUrl = 'https://music.douban.com/j/review/create'
        requestBody = {
          is_rich: 1,
          topic_id: '',
          review: {
            subject_id: state.id,
            title:  post.post_title,
            introduction: '',
            text: draftjsState,
            rating: '',
            spoiler: '',
            donate: '',
            original: ''
          },
          ck: this.meta.form.ck
        }
      }
    }
    console.log('state', requestBody)
    // return {
    //   status: 'success',
    //   post_id: 'test',
    //   draftLink: draftLink,
    // }
    // const draftjsState = covertHTMLToDraftJs(post.post_content)
    var res = await $.ajax({
      url: requestUrl,
      type: 'POST',
      dataType: 'JSON',
      data: requestBody,
    })

    if(res.url) {
      draftLink = res.url
    }

    return {
      status: 'success',
      post_id: this.meta.form.note_id,
      draftLink: draftLink,
    }
  }

  editImg(img, source) {
    img.attr('raw-data', JSON.stringify(source.raw))
  }

  async uploadFile(file) {

    // https://music.douban.com/j/review/upload_image
    var requestUrl = 'https://www.douban.com/j/note/add_photo';
    var state = this.config.state;
    var formdata = new FormData()
    var blob = new Blob([file.bits], {
      type: file.type
    });

    if(state.is_review) {
      if(state.subject == 'music') {
        requestUrl =  'https://music.douban.com/j/review/upload_image';
        formdata.append('review_id', '')
        formdata.append('picfile', blob)
      }
    } else {
      formdata.append('note_id', this.meta.form.note_id)
      formdata.append('image_file', blob)
    }

    formdata.append('ck', this.meta.form.ck)
    formdata.append('upload_auth_token', this.meta._POST_PARAMS.siteCookie.value)
   
    var res = await axios({
      url: requestUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    var url = res.data.photo.url
    if(!res.data.photo) {
        console.log(res.data);
        throw new Error('upload failed')
    }
    //  return url;
    return [
      {
        id: res.data.photo.id,
        object_key: res.data.photo.id,
        url: url + "?#" + res.data.photo.id,
        raw: res.data
      },
    ]
  }

}
/* harmony export (immutable) */ __webpack_exports__["a"] = Douban;



/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_remarkable__ = __webpack_require__(17);


const TRAILING_NEW_LINE = /\n$/;

// In DraftJS, string lengths are calculated differently than in JS itself (due
// to surrogate pairs). Instead of importing the entire UnicodeUtils file from
// FBJS, we use a simpler alternative, in the form of `Array.from`.
//
// Alternative:  const { strlen } = require('fbjs/lib/UnicodeUtils');
function strlen(str) {
  return Array.from(str).length;
}

// Block level items, key is Remarkable's key for them, value returned is
// A function that generates the raw draftjs key and block data.
//
// Why a function? Because in some cases (headers) we need additional information
// before we can determine the exact key to return. And blocks may also return data
const DefaultBlockTypes = {
  paragraph_open: function (item) {
    return {
      type: 'unstyled',
      text: '',
      entityRanges: [],
      inlineStyleRanges: []
    };
  },

  blockquote_open: function (item) {
    return {
      type: 'blockquote',
      text: ''
    };
  },

  ordered_list_item_open: function () {
    return {
      type: 'ordered-list-item',
      text: ''
    };
  },

  unordered_list_item_open: function () {
    return {
      type: 'unordered-list-item',
      text: ''
    };
  },

  fence: function (item) {
    return {
      type: 'code-block',
      data: {
        language: item.params || ''
      },
      text: (item.content || '').replace(TRAILING_NEW_LINE, ''), // remarkable seems to always append an erronious trailing newline to its codeblock content, so we need to trim it out.
      entityRanges: [],
      inlineStyleRanges: []
    };
  },

  heading_open: function (item) {
    var type = 'header-' + ({
      1: 'one',
      2: 'two',
      3: 'three',
      4: 'four',
      5: 'five',
      6: 'six'
    })[item.hLevel];

    return {
      type: type,
      text: ''
    };
  }
};

// Entity types. These are things like links or images that require
// additional data and will be added to the `entityMap`
// again. In this case, key is remarkable key, value is
// meethod that returns the draftjs key + any data needed.
const DefaultBlockEntities = {
  link_open: function (item) {
    return {
      type: 'LINK',
      mutability: 'MUTABLE',
      data: {
        url: item.href,
        href: item.href
      }
    };
  }
};

// Entity styles. Simple Inline styles that aren't added to entityMap
// key is remarkable key, value is draftjs raw key
const DefaultBlockStyles = {
  strong_open: 'BOLD',
  em_open: 'ITALIC',
  code: 'CODE'
};

// Key generator for entityMap items
var idCounter = -1;
function generateUniqueKey() {
  idCounter++;
  return idCounter;
}

/*
 * Handle inline content in a block level item
 * parses for BlockEntities (links, images) and BlockStyles (em, strong)
 * doesn't handle block level items (blockquote, ordered list, etc)
 *
 * @param <Object> inlineItem - single object from remarkable data representation of markdown
 * @param <Object> BlockEntities - key-value object of mappable block entity items. Passed in as param so users can include their own custom stuff
 * @param <Object> BlockStyles - key-value object of mappable block styles items. Passed in as param so users can include their own custom stuff
 *
 * @return <Object>
 *  content: Entire text content for the inline item,
 *  blockEntities: New block eneities to be added to global block entity map
 *  blockEntityRanges: block-level representation of block entities including key to access the block entity from the global map
 *  blockStyleRanges: block-level representation of styles (eg strong, em)
*/
function parseInline(inlineItem, BlockEntities, BlockStyles) {
  var content = '', blockEntities = {}, blockEntityRanges = [], blockInlineStyleRanges = [];
  inlineItem.children.forEach(function (child) {
    if (child.type === 'text') {
      content += child.content;
    } else if (child.type === 'softbreak') {
      content += '\n';
    } else if (child.type === 'hardbreak') {
      content += '\n';
    } else if (BlockStyles[child.type]) {
      var key = generateUniqueKey();
      var styleBlock = {
        offset: strlen(content) || 0,
        length: 0,
        style: BlockStyles[child.type]
      };

      // Edge case hack because code items don't have inline content or open/close, unlike everything else
      if (child.type === 'code') {
        styleBlock.length = strlen(child.content);
        content += child.content;
      }

      blockInlineStyleRanges.push(styleBlock);
    } else if (BlockEntities[child.type]) {
      var key = generateUniqueKey();

      blockEntities[key] = BlockEntities[child.type](child);

      blockEntityRanges.push({
        offset: strlen(content) || 0,
        length: 0,
        key: key
      });
    } else if (child.type.indexOf('_close') !== -1 && BlockEntities[child.type.replace('_close', '_open')]) {
      blockEntityRanges[blockEntityRanges.length - 1].length = strlen(content) - blockEntityRanges[blockEntityRanges.length - 1].offset;
    } else if (child.type.indexOf('_close') !== -1 && BlockStyles[child.type.replace('_close', '_open')]) {
      var type = BlockStyles[child.type.replace('_close', '_open')]
      blockInlineStyleRanges = blockInlineStyleRanges
        .map(style => {
          if (style.length === 0 && style.style === type) {
            style.length = strlen(content) - style.offset;
          }
          return style;
        });
    }
  });

  return {content, blockEntities, blockEntityRanges, blockInlineStyleRanges};
}

/**
 * Convert markdown into raw draftjs object
 *
 * @param {String} markdown - markdown to convert into raw draftjs object
 * @param {Object} options - optional additional data, see readme for what options can be passed in.
 *
 * @return {Object} rawDraftObject
**/
function markdownToDraft(string, options = {}) {
  const remarkablePreset = options.remarkablePreset || options.remarkableOptions;
  const remarkableOptions = typeof options.remarkableOptions === 'object' ? options.remarkableOptions : null;
  const md = new __WEBPACK_IMPORTED_MODULE_0_remarkable__["a" /* Remarkable */](remarkablePreset, remarkableOptions);

  // if tables are not explicitly enabled, disable them by default
  if (
    !remarkableOptions ||
    !remarkableOptions.enable ||
    !remarkableOptions.enable.block ||
    remarkableOptions.enable.block !== 'table' ||
    remarkableOptions.enable.block.includes('table') === false
  ) {
    md.block.ruler.disable('table');
  }

  // disable the specified rules
  if (remarkableOptions && remarkableOptions.disable) {
    for (let [key, value] of Object.entries(remarkableOptions.disable)) {
      md[key].ruler.disable(value);
    }
  }

  // enable the specified rules
  if (remarkableOptions && remarkableOptions.enable) {
    for (let [key, value] of Object.entries(remarkableOptions.enable)) {
      md[key].ruler.enable(value);
    }
  }

  // If users want to define custom remarkable plugins for custom markdown, they can be added here
  if (options.remarkablePlugins) {
    options.remarkablePlugins.forEach(function (plugin) {
      md.use(plugin, {});
    });
  }

  var blocks = []; // blocks will be returned as part of the final draftjs raw object
  var entityMap = {}; // entitymap will be returned as part of the final draftjs raw object
  var parsedData = md.parse(string, {}); // remarkable js takes markdown and makes it an array of style objects for us to easily parse
  var currentListType = null; // Because of how remarkable's data is formatted, we need to cache what kind of list we're currently dealing with
  var previousBlockEndingLine = 0;

  // Allow user to define custom BlockTypes and Entities if they so wish
  const BlockTypes = Object.assign({}, DefaultBlockTypes, options.blockTypes || {});
  const BlockEntities = Object.assign({}, DefaultBlockEntities, options.blockEntities || {});
  const BlockStyles = Object.assign({}, DefaultBlockStyles, options.blockStyles || {});

  console.log('parsedData', parsedData)

  parsedData.forEach(function (item) {
    // Because of how remarkable's data is formatted, we need to cache what kind of list we're currently dealing with
    if (item.type === 'bullet_list_open') {
      currentListType = 'unordered_list_item_open';
    } else if (item.type === 'ordered_list_open') {
      currentListType = 'ordered_list_item_open';
    }

    var itemType = item.type;
    if (itemType === 'list_item_open') {
      itemType = currentListType;
    }

    if (itemType === 'inline') {
      // Parse inline content and apply it to the most recently created block level item,
      // which is where the inline content will belong.
      var {content, blockEntities, blockEntityRanges, blockInlineStyleRanges} = parseInline(item, BlockEntities, BlockStyles);
      var blockToModify = blocks[blocks.length - 1];
      blockToModify.text = content;
      blockToModify.inlineStyleRanges = blockInlineStyleRanges;
      blockToModify.entityRanges = blockEntityRanges;

      // The entity map is a master object separate from the block so just add any entities created for this block to the master object
      Object.assign(entityMap, blockEntities);
    } else if ((itemType.indexOf('_open') !== -1 || itemType === 'fence' || itemType === 'hr') && BlockTypes[itemType]) {
      var depth = 0;
      var block;

      if (item.level > 0) {
        depth = Math.floor(item.level / 2);
      }

      // var key = generateUniqueKey();
      // blockEntities[key] = BlockEntities[child.type](child);
      // blockEntityRanges.push({
      //   offset: strlen(content) || 0,
      //   length: 0,
      //   key: key
      // });
      // Draftjs only supports 1 level of blocks, hence the item.level === 0 check
      // List items will always be at least `level==1` though so we need a separate check for that
      // If there’s nested block level items deeper than that, we need to make sure we capture this by cloning the topmost block
      // otherwise we’ll accidentally overwrite its text. (eg if there's a blockquote with 3 nested paragraphs with inline text, without this check, only the last paragraph would be reflected)
      if (item.level === 0 || item.type === 'list_item_open') {
        block = Object.assign({
          depth: depth
        }, BlockTypes[itemType](item, generateUniqueKey));
        
        if(block.blockEntities) {
          Object.assign(entityMap, block.blockEntities);
          delete block.blockEntities
        }
      } else if (item.level > 0 && blocks[blocks.length - 1].text) {
        block = Object.assign({}, blocks[blocks.length - 1]);
      }

      if (block && options.preserveNewlines) {
        // Re: previousBlockEndingLine.... omg.
        // So remarkable strips out empty newlines and doesn't make any entities to parse to restore them
        // the only solution I could find is that there's a 2-value array on each block item called "lines" which is the start and end line of the block element.
        // by keeping track of the PREVIOUS block element ending line and the NEXT block element starting line, we can find the difference between the new lines and insert
        // an appropriate number of extra paragraphs to re-create those newlines in draftjs.
        // This is probably my least favourite thing in this file, but not sure what could be better.
        var totalEmptyParagraphsToCreate = item.lines[0] - previousBlockEndingLine;
        for (var i = 0; i < totalEmptyParagraphsToCreate; i++) {
          blocks.push(DefaultBlockTypes.paragraph_open());
        }
      }

      if (block) {
        previousBlockEndingLine = item.lines[1];
        blocks.push(block);
      }
    }

  });

  // EditorState.createWithContent will error if there's no blocks defined
  // Remarkable returns an empty array though. So we have to generate a 'fake'
  // empty block in this case. 😑
  if (!blocks.length) {
    blocks.push(DefaultBlockTypes.paragraph_open());
  }

  return {
    entityMap,
    blocks
  };
}

/* harmony default export */ __webpack_exports__["a"] = (markdownToDraft);

/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Remarkable; });
/* unused harmony export utils */
var textarea;

function decodeEntity(name) {
  textarea = textarea || document.createElement('textarea');
  textarea.innerHTML = '&' + name + ';';
  return textarea.value;
}

/**
 * Utility functions
 */

function typeOf(obj) {
  return Object.prototype.toString.call(obj);
}

function isString(obj) {
  return typeOf(obj) === '[object String]';
}

var hasOwn = Object.prototype.hasOwnProperty;

function has(object, key) {
  return object
    ? hasOwn.call(object, key)
    : false;
}

// Extend objects
//
function assign(obj /*from1, from2, from3, ...*/) {
  var sources = [].slice.call(arguments, 1);

  sources.forEach(function (source) {
    if (!source) { return; }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be object');
    }

    Object.keys(source).forEach(function (key) {
      obj[key] = source[key];
    });
  });

  return obj;
}

////////////////////////////////////////////////////////////////////////////////

var UNESCAPE_MD_RE = /\\([\\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;

function unescapeMd(str) {
  if (str.indexOf('\\') < 0) { return str; }
  return str.replace(UNESCAPE_MD_RE, '$1');
}

////////////////////////////////////////////////////////////////////////////////

function isValidEntityCode(c) {
  /*eslint no-bitwise:0*/
  // broken sequence
  if (c >= 0xD800 && c <= 0xDFFF) { return false; }
  // never used
  if (c >= 0xFDD0 && c <= 0xFDEF) { return false; }
  if ((c & 0xFFFF) === 0xFFFF || (c & 0xFFFF) === 0xFFFE) { return false; }
  // control codes
  if (c >= 0x00 && c <= 0x08) { return false; }
  if (c === 0x0B) { return false; }
  if (c >= 0x0E && c <= 0x1F) { return false; }
  if (c >= 0x7F && c <= 0x9F) { return false; }
  // out of range
  if (c > 0x10FFFF) { return false; }
  return true;
}

function fromCodePoint(c) {
  /*eslint no-bitwise:0*/
  if (c > 0xffff) {
    c -= 0x10000;
    var surrogate1 = 0xd800 + (c >> 10),
        surrogate2 = 0xdc00 + (c & 0x3ff);

    return String.fromCharCode(surrogate1, surrogate2);
  }
  return String.fromCharCode(c);
}

var NAMED_ENTITY_RE   = /&([a-z#][a-z0-9]{1,31});/gi;
var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))/i;

function replaceEntityPattern(match, name) {
  var code = 0;
  var decoded = decodeEntity(name);

  if (name !== decoded) {
    return decoded;
  } else if (name.charCodeAt(0) === 0x23/* # */ && DIGITAL_ENTITY_TEST_RE.test(name)) {
    code = name[1].toLowerCase() === 'x' ?
      parseInt(name.slice(2), 16)
    :
      parseInt(name.slice(1), 10);
    if (isValidEntityCode(code)) {
      return fromCodePoint(code);
    }
  }
  return match;
}

function replaceEntities(str) {
  if (str.indexOf('&') < 0) { return str; }

  return str.replace(NAMED_ENTITY_RE, replaceEntityPattern);
}

////////////////////////////////////////////////////////////////////////////////

var HTML_ESCAPE_TEST_RE = /[&<>"]/;
var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
var HTML_REPLACEMENTS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};

function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}

function escapeHtml(str) {
  if (HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }
  return str;
}

var utils = /*#__PURE__*/Object.freeze({
  isString: isString,
  has: has,
  assign: assign,
  unescapeMd: unescapeMd,
  isValidEntityCode: isValidEntityCode,
  fromCodePoint: fromCodePoint,
  replaceEntities: replaceEntities,
  escapeHtml: escapeHtml
});

/**
 * Renderer rules cache
 */

var rules = {};

/**
 * Blockquotes
 */

rules.blockquote_open = function(/* tokens, idx, options, env */) {
  return '<blockquote>\n';
};

rules.blockquote_close = function(tokens, idx /*, options, env */) {
  return '</blockquote>' + getBreak(tokens, idx);
};

/**
 * Code
 */

rules.code = function(tokens, idx /*, options, env */) {
  if (tokens[idx].block) {
    return '<pre><code>' + escapeHtml(tokens[idx].content) + '</code></pre>' + getBreak(tokens, idx);
  }
  return '<code>' + escapeHtml(tokens[idx].content) + '</code>';
};

/**
 * Fenced code blocks
 */

rules.fence = function(tokens, idx, options, env, instance) {
  var token = tokens[idx];
  var langClass = '';
  var langPrefix = options.langPrefix;
  var langName = '', fences, fenceName;
  var highlighted;

  if (token.params) {

    //
    // ```foo bar
    //
    // Try custom renderer "foo" first. That will simplify overwrite
    // for diagrams, latex, and any other fenced block with custom look
    //

    fences = token.params.split(/\s+/g);
    fenceName = fences.join(' ');

    if (has(instance.rules.fence_custom, fences[0])) {
      return instance.rules.fence_custom[fences[0]](tokens, idx, options, env, instance);
    }

    langName = escapeHtml(replaceEntities(unescapeMd(fenceName)));
    langClass = ' class="' + langPrefix + langName + '"';
  }

  if (options.highlight) {
    highlighted = options.highlight.apply(options.highlight, [ token.content ].concat(fences))
      || escapeHtml(token.content);
  } else {
    highlighted = escapeHtml(token.content);
  }

  return '<pre><code' + langClass + '>'
        + highlighted
        + '</code></pre>'
        + getBreak(tokens, idx);
};

rules.fence_custom = {};

/**
 * Headings
 */

rules.heading_open = function(tokens, idx /*, options, env */) {
  return '<h' + tokens[idx].hLevel + '>';
};
rules.heading_close = function(tokens, idx /*, options, env */) {
  return '</h' + tokens[idx].hLevel + '>\n';
};

/**
 * Horizontal rules
 */

rules.hr = function(tokens, idx, options /*, env */) {
  return (options.xhtmlOut ? '<hr />' : '<hr>') + getBreak(tokens, idx);
};

/**
 * Bullets
 */

rules.bullet_list_open = function(/* tokens, idx, options, env */) {
  return '<ul>\n';
};
rules.bullet_list_close = function(tokens, idx /*, options, env */) {
  return '</ul>' + getBreak(tokens, idx);
};

/**
 * List items
 */

rules.list_item_open = function(/* tokens, idx, options, env */) {
  return '<li>';
};
rules.list_item_close = function(/* tokens, idx, options, env */) {
  return '</li>\n';
};

/**
 * Ordered list items
 */

rules.ordered_list_open = function(tokens, idx /*, options, env */) {
  var token = tokens[idx];
  var order = token.order > 1 ? ' start="' + token.order + '"' : '';
  return '<ol' + order + '>\n';
};
rules.ordered_list_close = function(tokens, idx /*, options, env */) {
  return '</ol>' + getBreak(tokens, idx);
};

/**
 * Paragraphs
 */

rules.paragraph_open = function(tokens, idx /*, options, env */) {
  return tokens[idx].tight ? '' : '<p>';
};
rules.paragraph_close = function(tokens, idx /*, options, env */) {
  var addBreak = !(tokens[idx].tight && idx && tokens[idx - 1].type === 'inline' && !tokens[idx - 1].content);
  return (tokens[idx].tight ? '' : '</p>') + (addBreak ? getBreak(tokens, idx) : '');
};

/**
 * Links
 */

rules.link_open = function(tokens, idx, options /* env */) {
  var title = tokens[idx].title ? (' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"') : '';
  var target = options.linkTarget ? (' target="' + options.linkTarget + '"') : '';
  return '<a href="' + escapeHtml(tokens[idx].href) + '"' + title + target + '>';
};
rules.link_close = function(/* tokens, idx, options, env */) {
  return '</a>';
};

/**
 * Images
 */

rules.image = function(tokens, idx, options /*, env */) {
  var src = ' src="' + escapeHtml(tokens[idx].src) + '"';
  var title = tokens[idx].title ? (' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"') : '';
  var alt = ' alt="' + (tokens[idx].alt ? escapeHtml(replaceEntities(unescapeMd(tokens[idx].alt))) : '') + '"';
  var suffix = options.xhtmlOut ? ' /' : '';
  return '<img' + src + alt + title + suffix + '>';
};

/**
 * Tables
 */

rules.table_open = function(/* tokens, idx, options, env */) {
  return '<table>\n';
};
rules.table_close = function(/* tokens, idx, options, env */) {
  return '</table>\n';
};
rules.thead_open = function(/* tokens, idx, options, env */) {
  return '<thead>\n';
};
rules.thead_close = function(/* tokens, idx, options, env */) {
  return '</thead>\n';
};
rules.tbody_open = function(/* tokens, idx, options, env */) {
  return '<tbody>\n';
};
rules.tbody_close = function(/* tokens, idx, options, env */) {
  return '</tbody>\n';
};
rules.tr_open = function(/* tokens, idx, options, env */) {
  return '<tr>';
};
rules.tr_close = function(/* tokens, idx, options, env */) {
  return '</tr>\n';
};
rules.th_open = function(tokens, idx /*, options, env */) {
  var token = tokens[idx];
  return '<th'
    + (token.align ? ' style="text-align:' + token.align + '"' : '')
    + '>';
};
rules.th_close = function(/* tokens, idx, options, env */) {
  return '</th>';
};
rules.td_open = function(tokens, idx /*, options, env */) {
  var token = tokens[idx];
  return '<td'
    + (token.align ? ' style="text-align:' + token.align + '"' : '')
    + '>';
};
rules.td_close = function(/* tokens, idx, options, env */) {
  return '</td>';
};

/**
 * Bold
 */

rules.strong_open = function(/* tokens, idx, options, env */) {
  return '<strong>';
};
rules.strong_close = function(/* tokens, idx, options, env */) {
  return '</strong>';
};

/**
 * Italicize
 */

rules.em_open = function(/* tokens, idx, options, env */) {
  return '<em>';
};
rules.em_close = function(/* tokens, idx, options, env */) {
  return '</em>';
};

/**
 * Strikethrough
 */

rules.del_open = function(/* tokens, idx, options, env */) {
  return '<del>';
};
rules.del_close = function(/* tokens, idx, options, env */) {
  return '</del>';
};

/**
 * Insert
 */

rules.ins_open = function(/* tokens, idx, options, env */) {
  return '<ins>';
};
rules.ins_close = function(/* tokens, idx, options, env */) {
  return '</ins>';
};

/**
 * Highlight
 */

rules.mark_open = function(/* tokens, idx, options, env */) {
  return '<mark>';
};
rules.mark_close = function(/* tokens, idx, options, env */) {
  return '</mark>';
};

/**
 * Super- and sub-script
 */

rules.sub = function(tokens, idx /*, options, env */) {
  return '<sub>' + escapeHtml(tokens[idx].content) + '</sub>';
};
rules.sup = function(tokens, idx /*, options, env */) {
  return '<sup>' + escapeHtml(tokens[idx].content) + '</sup>';
};

/**
 * Breaks
 */

rules.hardbreak = function(tokens, idx, options /*, env */) {
  return options.xhtmlOut ? '<br />\n' : '<br>\n';
};
rules.softbreak = function(tokens, idx, options /*, env */) {
  return options.breaks ? (options.xhtmlOut ? '<br />\n' : '<br>\n') : '\n';
};

/**
 * Text
 */

rules.text = function(tokens, idx /*, options, env */) {
  return escapeHtml(tokens[idx].content);
};

/**
 * Content
 */

rules.htmlblock = function(tokens, idx /*, options, env */) {
  return tokens[idx].content;
};
rules.htmltag = function(tokens, idx /*, options, env */) {
  return tokens[idx].content;
};

/**
 * Abbreviations, initialism
 */

rules.abbr_open = function(tokens, idx /*, options, env */) {
  return '<abbr title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '">';
};
rules.abbr_close = function(/* tokens, idx, options, env */) {
  return '</abbr>';
};

/**
 * Footnotes
 */

rules.footnote_ref = function(tokens, idx) {
  var n = Number(tokens[idx].id + 1).toString();
  var id = 'fnref' + n;
  if (tokens[idx].subId > 0) {
    id += ':' + tokens[idx].subId;
  }
  return '<sup class="footnote-ref"><a href="#fn' + n + '" id="' + id + '">[' + n + ']</a></sup>';
};
rules.footnote_block_open = function(tokens, idx, options) {
  var hr = options.xhtmlOut
    ? '<hr class="footnotes-sep" />\n'
    : '<hr class="footnotes-sep">\n';
  return hr + '<section class="footnotes">\n<ol class="footnotes-list">\n';
};
rules.footnote_block_close = function() {
  return '</ol>\n</section>\n';
};
rules.footnote_open = function(tokens, idx) {
  var id = Number(tokens[idx].id + 1).toString();
  return '<li id="fn' + id + '"  class="footnote-item">';
};
rules.footnote_close = function() {
  return '</li>\n';
};
rules.footnote_anchor = function(tokens, idx) {
  var n = Number(tokens[idx].id + 1).toString();
  var id = 'fnref' + n;
  if (tokens[idx].subId > 0) {
    id += ':' + tokens[idx].subId;
  }
  return ' <a href="#' + id + '" class="footnote-backref">↩</a>';
};

/**
 * Definition lists
 */

rules.dl_open = function() {
  return '<dl>\n';
};
rules.dt_open = function() {
  return '<dt>';
};
rules.dd_open = function() {
  return '<dd>';
};
rules.dl_close = function() {
  return '</dl>\n';
};
rules.dt_close = function() {
  return '</dt>\n';
};
rules.dd_close = function() {
  return '</dd>\n';
};

/**
 * Helper functions
 */

function nextToken(tokens, idx) {
  if (++idx >= tokens.length - 2) {
    return idx;
  }
  if ((tokens[idx].type === 'paragraph_open' && tokens[idx].tight) &&
      (tokens[idx + 1].type === 'inline' && tokens[idx + 1].content.length === 0) &&
      (tokens[idx + 2].type === 'paragraph_close' && tokens[idx + 2].tight)) {
    return nextToken(tokens, idx + 2);
  }
  return idx;
}

/**
 * Check to see if `\n` is needed before the next token.
 *
 * @param  {Array} `tokens`
 * @param  {Number} `idx`
 * @return {String} Empty string or newline
 * @api private
 */

var getBreak = rules.getBreak = function getBreak(tokens, idx) {
  idx = nextToken(tokens, idx);
  if (idx < tokens.length && tokens[idx].type === 'list_item_close') {
    return '';
  }
  return '\n';
};

/**
 * Renderer class. Renders HTML and exposes `rules` to allow
 * local modifications.
 */

function Renderer() {
  this.rules = assign({}, rules);

  // exported helper, for custom rules only
  this.getBreak = rules.getBreak;
}

/**
 * Render a string of inline HTML with the given `tokens` and
 * `options`.
 *
 * @param  {Array} `tokens`
 * @param  {Object} `options`
 * @param  {Object} `env`
 * @return {String}
 * @api public
 */

Renderer.prototype.renderInline = function (tokens, options, env) {
  var _rules = this.rules;
  var len = tokens.length, i = 0;
  var result = '';

  while (len--) {
    result += _rules[tokens[i].type](tokens, i++, options, env, this);
  }

  return result;
};

/**
 * Render a string of HTML with the given `tokens` and
 * `options`.
 *
 * @param  {Array} `tokens`
 * @param  {Object} `options`
 * @param  {Object} `env`
 * @return {String}
 * @api public
 */

Renderer.prototype.render = function (tokens, options, env) {
  var _rules = this.rules;
  var len = tokens.length, i = -1;
  var result = '';

  while (++i < len) {
    if (tokens[i].type === 'inline') {
      result += this.renderInline(tokens[i].children, options, env);
    } else {
      result += _rules[tokens[i].type](tokens, i, options, env, this);
    }
  }
  return result;
};

/**
 * Ruler is a helper class for building responsibility chains from
 * parse rules. It allows:
 *
 *   - easy stack rules chains
 *   - getting main chain and named chains content (as arrays of functions)
 *
 * Helper methods, should not be used directly.
 * @api private
 */

function Ruler() {
  // List of added rules. Each element is:
  //
  // { name: XXX,
  //   enabled: Boolean,
  //   fn: Function(),
  //   alt: [ name2, name3 ] }
  //
  this.__rules__ = [];

  // Cached rule chains.
  //
  // First level - chain name, '' for default.
  // Second level - digital anchor for fast filtering by charcodes.
  //
  this.__cache__ = null;
}

/**
 * Find the index of a rule by `name`.
 *
 * @param  {String} `name`
 * @return {Number} Index of the given `name`
 * @api private
 */

Ruler.prototype.__find__ = function (name) {
  var len = this.__rules__.length;
  var i = -1;

  while (len--) {
    if (this.__rules__[++i].name === name) {
      return i;
    }
  }
  return -1;
};

/**
 * Build the rules lookup cache
 *
 * @api private
 */

Ruler.prototype.__compile__ = function () {
  var self = this;
  var chains = [ '' ];

  // collect unique names
  self.__rules__.forEach(function (rule) {
    if (!rule.enabled) {
      return;
    }

    rule.alt.forEach(function (altName) {
      if (chains.indexOf(altName) < 0) {
        chains.push(altName);
      }
    });
  });

  self.__cache__ = {};

  chains.forEach(function (chain) {
    self.__cache__[chain] = [];
    self.__rules__.forEach(function (rule) {
      if (!rule.enabled) {
        return;
      }

      if (chain && rule.alt.indexOf(chain) < 0) {
        return;
      }
      self.__cache__[chain].push(rule.fn);
    });
  });
};

/**
 * Ruler public methods
 * ------------------------------------------------
 */

/**
 * Replace rule function
 *
 * @param  {String} `name` Rule name
 * @param  {Function `fn`
 * @param  {Object} `options`
 * @api private
 */

Ruler.prototype.at = function (name, fn, options) {
  var idx = this.__find__(name);
  var opt = options || {};

  if (idx === -1) {
    throw new Error('Parser rule not found: ' + name);
  }

  this.__rules__[idx].fn = fn;
  this.__rules__[idx].alt = opt.alt || [];
  this.__cache__ = null;
};

/**
 * Add a rule to the chain before given the `ruleName`.
 *
 * @param  {String}   `beforeName`
 * @param  {String}   `ruleName`
 * @param  {Function} `fn`
 * @param  {Object}   `options`
 * @api private
 */

Ruler.prototype.before = function (beforeName, ruleName, fn, options) {
  var idx = this.__find__(beforeName);
  var opt = options || {};

  if (idx === -1) {
    throw new Error('Parser rule not found: ' + beforeName);
  }

  this.__rules__.splice(idx, 0, {
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};

/**
 * Add a rule to the chain after the given `ruleName`.
 *
 * @param  {String}   `afterName`
 * @param  {String}   `ruleName`
 * @param  {Function} `fn`
 * @param  {Object}   `options`
 * @api private
 */

Ruler.prototype.after = function (afterName, ruleName, fn, options) {
  var idx = this.__find__(afterName);
  var opt = options || {};

  if (idx === -1) {
    throw new Error('Parser rule not found: ' + afterName);
  }

  this.__rules__.splice(idx + 1, 0, {
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};

/**
 * Add a rule to the end of chain.
 *
 * @param  {String}   `ruleName`
 * @param  {Function} `fn`
 * @param  {Object}   `options`
 * @return {String}
 */

Ruler.prototype.push = function (ruleName, fn, options) {
  var opt = options || {};

  this.__rules__.push({
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};

/**
 * Enable a rule or list of rules.
 *
 * @param  {String|Array} `list` Name or array of rule names to enable
 * @param  {Boolean} `strict` If `true`, all non listed rules will be disabled.
 * @api private
 */

Ruler.prototype.enable = function (list, strict) {
  list = !Array.isArray(list)
    ? [ list ]
    : list;

  // In strict mode disable all existing rules first
  if (strict) {
    this.__rules__.forEach(function (rule) {
      rule.enabled = false;
    });
  }

  // Search by name and enable
  list.forEach(function (name) {
    var idx = this.__find__(name);
    if (idx < 0) {
      throw new Error('Rules manager: invalid rule name ' + name);
    }
    this.__rules__[idx].enabled = true;
  }, this);

  this.__cache__ = null;
};


/**
 * Disable a rule or list of rules.
 *
 * @param  {String|Array} `list` Name or array of rule names to disable
 * @api private
 */

Ruler.prototype.disable = function (list) {
  list = !Array.isArray(list)
    ? [ list ]
    : list;

  // Search by name and disable
  list.forEach(function (name) {
    var idx = this.__find__(name);
    if (idx < 0) {
      throw new Error('Rules manager: invalid rule name ' + name);
    }
    this.__rules__[idx].enabled = false;
  }, this);

  this.__cache__ = null;
};

/**
 * Get a rules list as an array of functions.
 *
 * @param  {String} `chainName`
 * @return {Object}
 * @api private
 */

Ruler.prototype.getRules = function (chainName) {
  if (this.__cache__ === null) {
    this.__compile__();
  }
  return this.__cache__[chainName] || [];
};

function block(state) {

  if (state.inlineMode) {
    state.tokens.push({
      type: 'inline',
      content: state.src.replace(/\n/g, ' ').trim(),
      level: 0,
      lines: [ 0, 1 ],
      children: []
    });

  } else {
    state.block.parse(state.src, state.options, state.env, state.tokens);
  }
}

// Inline parser state

function StateInline(src, parserInline, options, env, outTokens) {
  this.src = src;
  this.env = env;
  this.options = options;
  this.parser = parserInline;
  this.tokens = outTokens;
  this.pos = 0;
  this.posMax = this.src.length;
  this.level = 0;
  this.pending = '';
  this.pendingLevel = 0;

  this.cache = [];        // Stores { start: end } pairs. Useful for backtrack
                          // optimization of pairs parse (emphasis, strikes).

  // Link parser state vars

  this.isInLabel = false; // Set true when seek link label - we should disable
                          // "paired" rules (emphasis, strikes) to not skip
                          // tailing `]`

  this.linkLevel = 0;     // Increment for each nesting link. Used to prevent
                          // nesting in definitions

  this.linkContent = '';  // Temporary storage for link url

  this.labelUnmatchedScopes = 0; // Track unpaired `[` for link labels
                                 // (backtrack optimization)
}

// Flush pending text
//
StateInline.prototype.pushPending = function () {
  this.tokens.push({
    type: 'text',
    content: this.pending,
    level: this.pendingLevel
  });
  this.pending = '';
};

// Push new token to "stream".
// If pending text exists - flush it as text token
//
StateInline.prototype.push = function (token) {
  if (this.pending) {
    this.pushPending();
  }

  this.tokens.push(token);
  this.pendingLevel = this.level;
};

// Store value to cache.
// !!! Implementation has parser-specific optimizations
// !!! keys MUST be integer, >= 0; values MUST be integer, > 0
//
StateInline.prototype.cacheSet = function (key, val) {
  for (var i = this.cache.length; i <= key; i++) {
    this.cache.push(0);
  }

  this.cache[key] = val;
};

// Get cache value
//
StateInline.prototype.cacheGet = function (key) {
  return key < this.cache.length ? this.cache[key] : 0;
};

/**
 * Parse link labels
 *
 * This function assumes that first character (`[`) already matches;
 * returns the end of the label.
 *
 * @param  {Object} state
 * @param  {Number} start
 * @api private
 */

function parseLinkLabel(state, start) {
  var level, found, marker,
      labelEnd = -1,
      max = state.posMax,
      oldPos = state.pos,
      oldFlag = state.isInLabel;

  if (state.isInLabel) { return -1; }

  if (state.labelUnmatchedScopes) {
    state.labelUnmatchedScopes--;
    return -1;
  }

  state.pos = start + 1;
  state.isInLabel = true;
  level = 1;

  while (state.pos < max) {
    marker = state.src.charCodeAt(state.pos);
    if (marker === 0x5B /* [ */) {
      level++;
    } else if (marker === 0x5D /* ] */) {
      level--;
      if (level === 0) {
        found = true;
        break;
      }
    }

    state.parser.skipToken(state);
  }

  if (found) {
    labelEnd = state.pos;
    state.labelUnmatchedScopes = 0;
  } else {
    state.labelUnmatchedScopes = level - 1;
  }

  // restore old state
  state.pos = oldPos;
  state.isInLabel = oldFlag;

  return labelEnd;
}

// Parse abbreviation definitions, i.e. `*[abbr]: description`


function parseAbbr(str, parserInline, options, env) {
  var state, labelEnd, pos, max, label, title;

  if (str.charCodeAt(0) !== 0x2A/* * */) { return -1; }
  if (str.charCodeAt(1) !== 0x5B/* [ */) { return -1; }

  if (str.indexOf(']:') === -1) { return -1; }

  state = new StateInline(str, parserInline, options, env, []);
  labelEnd = parseLinkLabel(state, 1);

  if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 0x3A/* : */) { return -1; }

  max = state.posMax;

  // abbr title is always one line, so looking for ending "\n" here
  for (pos = labelEnd + 2; pos < max; pos++) {
    if (state.src.charCodeAt(pos) === 0x0A) { break; }
  }

  label = str.slice(2, labelEnd);
  title = str.slice(labelEnd + 2, pos).trim();
  if (title.length === 0) { return -1; }
  if (!env.abbreviations) { env.abbreviations = {}; }
  // prepend ':' to avoid conflict with Object.prototype members
  if (typeof env.abbreviations[':' + label] === 'undefined') {
    env.abbreviations[':' + label] = title;
  }

  return pos;
}

function abbr(state) {
  var tokens = state.tokens, i, l, content, pos;

  if (state.inlineMode) {
    return;
  }

  // Parse inlines
  for (i = 1, l = tokens.length - 1; i < l; i++) {
    if (tokens[i - 1].type === 'paragraph_open' &&
        tokens[i].type === 'inline' &&
        tokens[i + 1].type === 'paragraph_close') {

      content = tokens[i].content;
      while (content.length) {
        pos = parseAbbr(content, state.inline, state.options, state.env);
        if (pos < 0) { break; }
        content = content.slice(pos).trim();
      }

      tokens[i].content = content;
      if (!content.length) {
        tokens[i - 1].tight = true;
        tokens[i + 1].tight = true;
      }
    }
  }
}

function normalizeLink(url) {
  var normalized = replaceEntities(url);
  // We shouldn't care about the result of malformed URIs,
  // and should not throw an exception.
  try {
    normalized = decodeURI(normalized);
  } catch (err) {}
  return encodeURI(normalized);
}

/**
 * Parse link destination
 *
 *   - on success it returns a string and updates state.pos;
 *   - on failure it returns null
 *
 * @param  {Object} state
 * @param  {Number} pos
 * @api private
 */

function parseLinkDestination(state, pos) {
  var code, level, link,
      start = pos,
      max = state.posMax;

  if (state.src.charCodeAt(pos) === 0x3C /* < */) {
    pos++;
    while (pos < max) {
      code = state.src.charCodeAt(pos);
      if (code === 0x0A /* \n */) { return false; }
      if (code === 0x3E /* > */) {
        link = normalizeLink(unescapeMd(state.src.slice(start + 1, pos)));
        if (!state.parser.validateLink(link)) { return false; }
        state.pos = pos + 1;
        state.linkContent = link;
        return true;
      }
      if (code === 0x5C /* \ */ && pos + 1 < max) {
        pos += 2;
        continue;
      }

      pos++;
    }

    // no closing '>'
    return false;
  }

  // this should be ... } else { ... branch

  level = 0;
  while (pos < max) {
    code = state.src.charCodeAt(pos);

    if (code === 0x20) { break; }

    // ascii control chars
    if (code < 0x20 || code === 0x7F) { break; }

    if (code === 0x5C /* \ */ && pos + 1 < max) {
      pos += 2;
      continue;
    }

    if (code === 0x28 /* ( */) {
      level++;
      if (level > 1) { break; }
    }

    if (code === 0x29 /* ) */) {
      level--;
      if (level < 0) { break; }
    }

    pos++;
  }

  if (start === pos) { return false; }

  link = unescapeMd(state.src.slice(start, pos));
  if (!state.parser.validateLink(link)) { return false; }

  state.linkContent = link;
  state.pos = pos;
  return true;
}

/**
 * Parse link title
 *
 *   - on success it returns a string and updates state.pos;
 *   - on failure it returns null
 *
 * @param  {Object} state
 * @param  {Number} pos
 * @api private
 */

function parseLinkTitle(state, pos) {
  var code,
      start = pos,
      max = state.posMax,
      marker = state.src.charCodeAt(pos);

  if (marker !== 0x22 /* " */ && marker !== 0x27 /* ' */ && marker !== 0x28 /* ( */) { return false; }

  pos++;

  // if opening marker is "(", switch it to closing marker ")"
  if (marker === 0x28) { marker = 0x29; }

  while (pos < max) {
    code = state.src.charCodeAt(pos);
    if (code === marker) {
      state.pos = pos + 1;
      state.linkContent = unescapeMd(state.src.slice(start + 1, pos));
      return true;
    }
    if (code === 0x5C /* \ */ && pos + 1 < max) {
      pos += 2;
      continue;
    }

    pos++;
  }

  return false;
}

function normalizeReference(str) {
  // use .toUpperCase() instead of .toLowerCase()
  // here to avoid a conflict with Object.prototype
  // members (most notably, `__proto__`)
  return str.trim().replace(/\s+/g, ' ').toUpperCase();
}

function parseReference(str, parser, options, env) {
  var state, labelEnd, pos, max, code, start, href, title, label;

  if (str.charCodeAt(0) !== 0x5B/* [ */) { return -1; }

  if (str.indexOf(']:') === -1) { return -1; }

  state = new StateInline(str, parser, options, env, []);
  labelEnd = parseLinkLabel(state, 0);

  if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 0x3A/* : */) { return -1; }

  max = state.posMax;

  // [label]:   destination   'title'
  //         ^^^ skip optional whitespace here
  for (pos = labelEnd + 2; pos < max; pos++) {
    code = state.src.charCodeAt(pos);
    if (code !== 0x20 && code !== 0x0A) { break; }
  }

  // [label]:   destination   'title'
  //            ^^^^^^^^^^^ parse this
  if (!parseLinkDestination(state, pos)) { return -1; }
  href = state.linkContent;
  pos = state.pos;

  // [label]:   destination   'title'
  //                       ^^^ skipping those spaces
  start = pos;
  for (pos = pos + 1; pos < max; pos++) {
    code = state.src.charCodeAt(pos);
    if (code !== 0x20 && code !== 0x0A) { break; }
  }

  // [label]:   destination   'title'
  //                          ^^^^^^^ parse this
  if (pos < max && start !== pos && parseLinkTitle(state, pos)) {
    title = state.linkContent;
    pos = state.pos;
  } else {
    title = '';
    pos = start;
  }

  // ensure that the end of the line is empty
  while (pos < max && state.src.charCodeAt(pos) === 0x20/* space */) { pos++; }
  if (pos < max && state.src.charCodeAt(pos) !== 0x0A) { return -1; }

  label = normalizeReference(str.slice(1, labelEnd));
  if (typeof env.references[label] === 'undefined') {
    env.references[label] = { title: title, href: href };
  }

  return pos;
}


function references(state) {
  var tokens = state.tokens, i, l, content, pos;

  state.env.references = state.env.references || {};

  if (state.inlineMode) {
    return;
  }

  // Scan definitions in paragraph inlines
  for (i = 1, l = tokens.length - 1; i < l; i++) {
    if (tokens[i].type === 'inline' &&
        tokens[i - 1].type === 'paragraph_open' &&
        tokens[i + 1].type === 'paragraph_close') {

      content = tokens[i].content;
      while (content.length) {
        pos = parseReference(content, state.inline, state.options, state.env);
        if (pos < 0) { break; }
        content = content.slice(pos).trim();
      }

      tokens[i].content = content;
      if (!content.length) {
        tokens[i - 1].tight = true;
        tokens[i + 1].tight = true;
      }
    }
  }
}

function inline(state) {
  var tokens = state.tokens, tok, i, l;

  // Parse inlines
  for (i = 0, l = tokens.length; i < l; i++) {
    tok = tokens[i];
    if (tok.type === 'inline') {
      state.inline.parse(tok.content, state.options, state.env, tok.children);
    }
  }
}

function footnote_block(state) {
  var i, l, j, t, lastParagraph, list, tokens, current, currentLabel,
      level = 0,
      insideRef = false,
      refTokens = {};

  if (!state.env.footnotes) { return; }

  state.tokens = state.tokens.filter(function(tok) {
    if (tok.type === 'footnote_reference_open') {
      insideRef = true;
      current = [];
      currentLabel = tok.label;
      return false;
    }
    if (tok.type === 'footnote_reference_close') {
      insideRef = false;
      // prepend ':' to avoid conflict with Object.prototype members
      refTokens[':' + currentLabel] = current;
      return false;
    }
    if (insideRef) { current.push(tok); }
    return !insideRef;
  });

  if (!state.env.footnotes.list) { return; }
  list = state.env.footnotes.list;

  state.tokens.push({
    type: 'footnote_block_open',
    level: level++
  });
  for (i = 0, l = list.length; i < l; i++) {
    state.tokens.push({
      type: 'footnote_open',
      id: i,
      level: level++
    });

    if (list[i].tokens) {
      tokens = [];
      tokens.push({
        type: 'paragraph_open',
        tight: false,
        level: level++
      });
      tokens.push({
        type: 'inline',
        content: '',
        level: level,
        children: list[i].tokens
      });
      tokens.push({
        type: 'paragraph_close',
        tight: false,
        level: --level
      });
    } else if (list[i].label) {
      tokens = refTokens[':' + list[i].label];
    }

    state.tokens = state.tokens.concat(tokens);
    if (state.tokens[state.tokens.length - 1].type === 'paragraph_close') {
      lastParagraph = state.tokens.pop();
    } else {
      lastParagraph = null;
    }

    t = list[i].count > 0 ? list[i].count : 1;
    for (j = 0; j < t; j++) {
      state.tokens.push({
        type: 'footnote_anchor',
        id: i,
        subId: j,
        level: level
      });
    }

    if (lastParagraph) {
      state.tokens.push(lastParagraph);
    }

    state.tokens.push({
      type: 'footnote_close',
      level: --level
    });
  }
  state.tokens.push({
    type: 'footnote_block_close',
    level: --level
  });
}

// Enclose abbreviations in <abbr> tags
//

var PUNCT_CHARS = ' \n()[]\'".,!?-';


// from Google closure library
// http://closure-library.googlecode.com/git-history/docs/local_closure_goog_string_string.js.source.html#line1021
function regEscape(s) {
  return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1');
}


function abbr2(state) {
  var i, j, l, tokens, token, text, nodes, pos, level, reg, m, regText,
      blockTokens = state.tokens;

  if (!state.env.abbreviations) { return; }
  if (!state.env.abbrRegExp) {
    regText = '(^|[' + PUNCT_CHARS.split('').map(regEscape).join('') + '])'
            + '(' + Object.keys(state.env.abbreviations).map(function (x) {
                      return x.substr(1);
                    }).sort(function (a, b) {
                      return b.length - a.length;
                    }).map(regEscape).join('|') + ')'
            + '($|[' + PUNCT_CHARS.split('').map(regEscape).join('') + '])';
    state.env.abbrRegExp = new RegExp(regText, 'g');
  }
  reg = state.env.abbrRegExp;

  for (j = 0, l = blockTokens.length; j < l; j++) {
    if (blockTokens[j].type !== 'inline') { continue; }
    tokens = blockTokens[j].children;

    // We scan from the end, to keep position when new tags added.
    for (i = tokens.length - 1; i >= 0; i--) {
      token = tokens[i];
      if (token.type !== 'text') { continue; }

      pos = 0;
      text = token.content;
      reg.lastIndex = 0;
      level = token.level;
      nodes = [];

      while ((m = reg.exec(text))) {
        if (reg.lastIndex > pos) {
          nodes.push({
            type: 'text',
            content: text.slice(pos, m.index + m[1].length),
            level: level
          });
        }

        nodes.push({
          type: 'abbr_open',
          title: state.env.abbreviations[':' + m[2]],
          level: level++
        });
        nodes.push({
          type: 'text',
          content: m[2],
          level: level
        });
        nodes.push({
          type: 'abbr_close',
          level: --level
        });
        pos = reg.lastIndex - m[3].length;
      }

      if (!nodes.length) { continue; }

      if (pos < text.length) {
        nodes.push({
          type: 'text',
          content: text.slice(pos),
          level: level
        });
      }

      // replace current node
      blockTokens[j].children = tokens = [].concat(tokens.slice(0, i), nodes, tokens.slice(i + 1));
    }
  }
}

// Simple typographical replacements
//
// TODO:
// - fractionals 1/2, 1/4, 3/4 -> ½, ¼, ¾
// - miltiplication 2 x 4 -> 2 × 4

var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;

var SCOPED_ABBR_RE = /\((c|tm|r|p)\)/ig;
var SCOPED_ABBR = {
  'c': '©',
  'r': '®',
  'p': '§',
  'tm': '™'
};

function replaceScopedAbbr(str) {
  if (str.indexOf('(') < 0) { return str; }

  return str.replace(SCOPED_ABBR_RE, function(match, name) {
    return SCOPED_ABBR[name.toLowerCase()];
  });
}


function replace(state) {
  var i, token, text, inlineTokens, blkIdx;

  if (!state.options.typographer) { return; }

  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

    if (state.tokens[blkIdx].type !== 'inline') { continue; }

    inlineTokens = state.tokens[blkIdx].children;

    for (i = inlineTokens.length - 1; i >= 0; i--) {
      token = inlineTokens[i];
      if (token.type === 'text') {
        text = token.content;

        text = replaceScopedAbbr(text);

        if (RARE_RE.test(text)) {
          text = text
            .replace(/\+-/g, '±')
            // .., ..., ....... -> …
            // but ?..... & !..... -> ?.. & !..
            .replace(/\.{2,}/g, '…').replace(/([?!])…/g, '$1..')
            .replace(/([?!]){4,}/g, '$1$1$1').replace(/,{2,}/g, ',')
            // em-dash
            .replace(/(^|[^-])---([^-]|$)/mg, '$1\u2014$2')
            // en-dash
            .replace(/(^|\s)--(\s|$)/mg, '$1\u2013$2')
            .replace(/(^|[^-\s])--([^-\s]|$)/mg, '$1\u2013$2');
        }

        token.content = text;
      }
    }
  }
}

// Convert straight quotation marks to typographic ones
//

var QUOTE_TEST_RE = /['"]/;
var QUOTE_RE = /['"]/g;
var PUNCT_RE = /[-\s()\[\]]/;
var APOSTROPHE = '’';

// This function returns true if the character at `pos`
// could be inside a word.
function isLetter(str, pos) {
  if (pos < 0 || pos >= str.length) { return false; }
  return !PUNCT_RE.test(str[pos]);
}


function replaceAt(str, index, ch) {
  return str.substr(0, index) + ch + str.substr(index + 1);
}


function smartquotes(state) {
  /*eslint max-depth:0*/
  var i, token, text, t, pos, max, thisLevel, lastSpace, nextSpace, item,
      canOpen, canClose, j, isSingle, blkIdx, tokens,
      stack;

  if (!state.options.typographer) { return; }

  stack = [];

  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

    if (state.tokens[blkIdx].type !== 'inline') { continue; }

    tokens = state.tokens[blkIdx].children;
    stack.length = 0;

    for (i = 0; i < tokens.length; i++) {
      token = tokens[i];

      if (token.type !== 'text' || QUOTE_TEST_RE.test(token.text)) { continue; }

      thisLevel = tokens[i].level;

      for (j = stack.length - 1; j >= 0; j--) {
        if (stack[j].level <= thisLevel) { break; }
      }
      stack.length = j + 1;

      text = token.content;
      pos = 0;
      max = text.length;

      /*eslint no-labels:0,block-scoped-var:0*/
      OUTER:
      while (pos < max) {
        QUOTE_RE.lastIndex = pos;
        t = QUOTE_RE.exec(text);
        if (!t) { break; }

        lastSpace = !isLetter(text, t.index - 1);
        pos = t.index + 1;
        isSingle = (t[0] === "'");
        nextSpace = !isLetter(text, pos);

        if (!nextSpace && !lastSpace) {
          // middle of word
          if (isSingle) {
            token.content = replaceAt(token.content, t.index, APOSTROPHE);
          }
          continue;
        }

        canOpen = !nextSpace;
        canClose = !lastSpace;

        if (canClose) {
          // this could be a closing quote, rewind the stack to get a match
          for (j = stack.length - 1; j >= 0; j--) {
            item = stack[j];
            if (stack[j].level < thisLevel) { break; }
            if (item.single === isSingle && stack[j].level === thisLevel) {
              item = stack[j];
              if (isSingle) {
                tokens[item.token].content = replaceAt(tokens[item.token].content, item.pos, state.options.quotes[2]);
                token.content = replaceAt(token.content, t.index, state.options.quotes[3]);
              } else {
                tokens[item.token].content = replaceAt(tokens[item.token].content, item.pos, state.options.quotes[0]);
                token.content = replaceAt(token.content, t.index, state.options.quotes[1]);
              }
              stack.length = j;
              continue OUTER;
            }
          }
        }

        if (canOpen) {
          stack.push({
            token: i,
            pos: t.index,
            single: isSingle,
            level: thisLevel
          });
        } else if (canClose && isSingle) {
          token.content = replaceAt(token.content, t.index, APOSTROPHE);
        }
      }
    }
  }
}

/**
 * Core parser `rules`
 */

var _rules = [
  [ 'block',          block          ],
  [ 'abbr',           abbr           ],
  [ 'references',     references     ],
  [ 'inline',         inline         ],
  [ 'footnote_tail',  footnote_block  ],
  [ 'abbr2',          abbr2          ],
  [ 'replacements',   replace   ],
  [ 'smartquotes',    smartquotes    ],
];

/**
 * Class for top level (`core`) parser rules
 *
 * @api private
 */

function Core() {
  this.options = {};
  this.ruler = new Ruler();
  for (var i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1]);
  }
}

/**
 * Process rules with the given `state`
 *
 * @param  {Object} `state`
 * @api private
 */

Core.prototype.process = function (state) {
  var i, l, rules;
  rules = this.ruler.getRules('');
  for (i = 0, l = rules.length; i < l; i++) {
    rules[i](state);
  }
};

// Parser state class

function StateBlock(src, parser, options, env, tokens) {
  var ch, s, start, pos, len, indent, indent_found;

  this.src = src;

  // Shortcuts to simplify nested calls
  this.parser = parser;

  this.options = options;

  this.env = env;

  //
  // Internal state vartiables
  //

  this.tokens = tokens;

  this.bMarks = [];  // line begin offsets for fast jumps
  this.eMarks = [];  // line end offsets for fast jumps
  this.tShift = [];  // indent for each line

  // block parser variables
  this.blkIndent  = 0; // required block content indent
                       // (for example, if we are in list)
  this.line       = 0; // line index in src
  this.lineMax    = 0; // lines count
  this.tight      = false;  // loose/tight mode for lists
  this.parentType = 'root'; // if `list`, block parser stops on two newlines
  this.ddIndent   = -1; // indent of the current dd block (-1 if there isn't any)

  this.level = 0;

  // renderer
  this.result = '';

  // Create caches
  // Generate markers.
  s = this.src;
  indent = 0;
  indent_found = false;

  for (start = pos = indent = 0, len = s.length; pos < len; pos++) {
    ch = s.charCodeAt(pos);

    if (!indent_found) {
      if (ch === 0x20/* space */) {
        indent++;
        continue;
      } else {
        indent_found = true;
      }
    }

    if (ch === 0x0A || pos === len - 1) {
      if (ch !== 0x0A) { pos++; }
      this.bMarks.push(start);
      this.eMarks.push(pos);
      this.tShift.push(indent);

      indent_found = false;
      indent = 0;
      start = pos + 1;
    }
  }

  // Push fake entry to simplify cache bounds checks
  this.bMarks.push(s.length);
  this.eMarks.push(s.length);
  this.tShift.push(0);

  this.lineMax = this.bMarks.length - 1; // don't count last fake line
}

StateBlock.prototype.isEmpty = function isEmpty(line) {
  return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
};

StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
  for (var max = this.lineMax; from < max; from++) {
    if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
      break;
    }
  }
  return from;
};

// Skip spaces from given position.
StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
  for (var max = this.src.length; pos < max; pos++) {
    if (this.src.charCodeAt(pos) !== 0x20/* space */) { break; }
  }
  return pos;
};

// Skip char codes from given position
StateBlock.prototype.skipChars = function skipChars(pos, code) {
  for (var max = this.src.length; pos < max; pos++) {
    if (this.src.charCodeAt(pos) !== code) { break; }
  }
  return pos;
};

// Skip char codes reverse from given position - 1
StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code, min) {
  if (pos <= min) { return pos; }

  while (pos > min) {
    if (code !== this.src.charCodeAt(--pos)) { return pos + 1; }
  }
  return pos;
};

// cut lines range from source.
StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
  var i, first, last, queue, shift,
      line = begin;

  if (begin >= end) {
    return '';
  }

  // Opt: don't use push queue for single line;
  if (line + 1 === end) {
    first = this.bMarks[line] + Math.min(this.tShift[line], indent);
    last = keepLastLF ? this.eMarks[line] + 1 : this.eMarks[line];
    return this.src.slice(first, last);
  }

  queue = new Array(end - begin);

  for (i = 0; line < end; line++, i++) {
    shift = this.tShift[line];
    if (shift > indent) { shift = indent; }
    if (shift < 0) { shift = 0; }

    first = this.bMarks[line] + shift;

    if (line + 1 < end || keepLastLF) {
      // No need for bounds check because we have fake entry on tail.
      last = this.eMarks[line] + 1;
    } else {
      last = this.eMarks[line];
    }

    queue[i] = this.src.slice(first, last);
  }

  return queue.join('');
};

// Code block (4 spaces padded)

function code(state, startLine, endLine/*, silent*/) {
  var nextLine, last;

  if (state.tShift[startLine] - state.blkIndent < 4) { return false; }

  last = nextLine = startLine + 1;

  while (nextLine < endLine) {
    if (state.isEmpty(nextLine)) {
      nextLine++;
      continue;
    }
    if (state.tShift[nextLine] - state.blkIndent >= 4) {
      nextLine++;
      last = nextLine;
      continue;
    }
    break;
  }

  state.line = nextLine;
  state.tokens.push({
    type: 'code',
    content: state.getLines(startLine, last, 4 + state.blkIndent, true),
    block: true,
    lines: [ startLine, state.line ],
    level: state.level
  });

  return true;
}

// fences (``` lang, ~~~ lang)

function fences(state, startLine, endLine, silent) {
  var marker, len, params, nextLine, mem,
      haveEndMarker = false,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  if (pos + 3 > max) { return false; }

  marker = state.src.charCodeAt(pos);

  if (marker !== 0x7E/* ~ */ && marker !== 0x60 /* ` */) {
    return false;
  }

  // scan marker length
  mem = pos;
  pos = state.skipChars(pos, marker);

  len = pos - mem;

  if (len < 3) { return false; }

  params = state.src.slice(pos, max).trim();

  if (params.indexOf('`') >= 0) { return false; }

  // Since start is found, we can report success here in validation mode
  if (silent) { return true; }

  // search end of block
  nextLine = startLine;

  for (;;) {
    nextLine++;
    if (nextLine >= endLine) {
      // unclosed block should be autoclosed by end of document.
      // also block seems to be autoclosed by end of parent
      break;
    }

    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (pos < max && state.tShift[nextLine] < state.blkIndent) {
      // non-empty line with negative indent should stop the list:
      // - ```
      //  test
      break;
    }

    if (state.src.charCodeAt(pos) !== marker) { continue; }

    if (state.tShift[nextLine] - state.blkIndent >= 4) {
      // closing fence should be indented less than 4 spaces
      continue;
    }

    pos = state.skipChars(pos, marker);

    // closing code fence must be at least as long as the opening one
    if (pos - mem < len) { continue; }

    // make sure tail has spaces only
    pos = state.skipSpaces(pos);

    if (pos < max) { continue; }

    haveEndMarker = true;
    // found!
    break;
  }

  // If a fence has heading spaces, they should be removed from its inner block
  len = state.tShift[startLine];

  state.line = nextLine + (haveEndMarker ? 1 : 0);
  state.tokens.push({
    type: 'fence',
    params: params,
    content: state.getLines(startLine + 1, nextLine, len, true),
    lines: [ startLine, state.line ],
    level: state.level
  });

  return true;
}

// Block quotes

function blockquote(state, startLine, endLine, silent) {
  var nextLine, lastLineEmpty, oldTShift, oldBMarks, oldIndent, oldParentType, lines,
      terminatorRules,
      i, l, terminate,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  if (pos > max) { return false; }

  // check the block quote marker
  if (state.src.charCodeAt(pos++) !== 0x3E/* > */) { return false; }

  if (state.level >= state.options.maxNesting) { return false; }

  // we know that it's going to be a valid blockquote,
  // so no point trying to find the end of it in silent mode
  if (silent) { return true; }

  // skip one optional space after '>'
  if (state.src.charCodeAt(pos) === 0x20) { pos++; }

  oldIndent = state.blkIndent;
  state.blkIndent = 0;

  oldBMarks = [ state.bMarks[startLine] ];
  state.bMarks[startLine] = pos;

  // check if we have an empty blockquote
  pos = pos < max ? state.skipSpaces(pos) : pos;
  lastLineEmpty = pos >= max;

  oldTShift = [ state.tShift[startLine] ];
  state.tShift[startLine] = pos - state.bMarks[startLine];

  terminatorRules = state.parser.ruler.getRules('blockquote');

  // Search the end of the block
  //
  // Block ends with either:
  //  1. an empty line outside:
  //     ```
  //     > test
  //
  //     ```
  //  2. an empty line inside:
  //     ```
  //     >
  //     test
  //     ```
  //  3. another tag
  //     ```
  //     > test
  //      - - -
  //     ```
  for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (pos >= max) {
      // Case 1: line is not inside the blockquote, and this line is empty.
      break;
    }

    if (state.src.charCodeAt(pos++) === 0x3E/* > */) {
      // This line is inside the blockquote.

      // skip one optional space after '>'
      if (state.src.charCodeAt(pos) === 0x20) { pos++; }

      oldBMarks.push(state.bMarks[nextLine]);
      state.bMarks[nextLine] = pos;

      pos = pos < max ? state.skipSpaces(pos) : pos;
      lastLineEmpty = pos >= max;

      oldTShift.push(state.tShift[nextLine]);
      state.tShift[nextLine] = pos - state.bMarks[nextLine];
      continue;
    }

    // Case 2: line is not inside the blockquote, and the last line was empty.
    if (lastLineEmpty) { break; }

    // Case 3: another tag found.
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }

    oldBMarks.push(state.bMarks[nextLine]);
    oldTShift.push(state.tShift[nextLine]);

    // A negative number means that this is a paragraph continuation;
    //
    // Any negative number will do the job here, but it's better for it
    // to be large enough to make any bugs obvious.
    state.tShift[nextLine] = -1337;
  }

  oldParentType = state.parentType;
  state.parentType = 'blockquote';
  state.tokens.push({
    type: 'blockquote_open',
    lines: lines = [ startLine, 0 ],
    level: state.level++
  });
  state.parser.tokenize(state, startLine, nextLine);
  state.tokens.push({
    type: 'blockquote_close',
    level: --state.level
  });
  state.parentType = oldParentType;
  lines[1] = state.line;

  // Restore original tShift; this might not be necessary since the parser
  // has already been here, but just to make sure we can do that.
  for (i = 0; i < oldTShift.length; i++) {
    state.bMarks[i + startLine] = oldBMarks[i];
    state.tShift[i + startLine] = oldTShift[i];
  }
  state.blkIndent = oldIndent;

  return true;
}

// Horizontal rule

function hr(state, startLine, endLine, silent) {
  var marker, cnt, ch,
      pos = state.bMarks[startLine],
      max = state.eMarks[startLine];

  pos += state.tShift[startLine];

  if (pos > max) { return false; }

  marker = state.src.charCodeAt(pos++);

  // Check hr marker
  if (marker !== 0x2A/* * */ &&
      marker !== 0x2D/* - */ &&
      marker !== 0x5F/* _ */) {
    return false;
  }

  // markers can be mixed with spaces, but there should be at least 3 one

  cnt = 1;
  while (pos < max) {
    ch = state.src.charCodeAt(pos++);
    if (ch !== marker && ch !== 0x20/* space */) { return false; }
    if (ch === marker) { cnt++; }
  }

  if (cnt < 3) { return false; }

  if (silent) { return true; }

  state.line = startLine + 1;
  state.tokens.push({
    type: 'hr',
    lines: [ startLine, state.line ],
    level: state.level
  });

  return true;
}

// Lists

// Search `[-+*][\n ]`, returns next pos arter marker on success
// or -1 on fail.
function skipBulletListMarker(state, startLine) {
  var marker, pos, max;

  pos = state.bMarks[startLine] + state.tShift[startLine];
  max = state.eMarks[startLine];

  if (pos >= max) { return -1; }

  marker = state.src.charCodeAt(pos++);
  // Check bullet
  if (marker !== 0x2A/* * */ &&
      marker !== 0x2D/* - */ &&
      marker !== 0x2B/* + */) {
    return -1;
  }

  if (pos < max && state.src.charCodeAt(pos) !== 0x20) {
    // " 1.test " - is not a list item
    return -1;
  }

  return pos;
}

// Search `\d+[.)][\n ]`, returns next pos arter marker on success
// or -1 on fail.
function skipOrderedListMarker(state, startLine) {
  var ch,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  if (pos + 1 >= max) { return -1; }

  ch = state.src.charCodeAt(pos++);

  if (ch < 0x30/* 0 */ || ch > 0x39/* 9 */) { return -1; }

  for (;;) {
    // EOL -> fail
    if (pos >= max) { return -1; }

    ch = state.src.charCodeAt(pos++);

    if (ch >= 0x30/* 0 */ && ch <= 0x39/* 9 */) {
      continue;
    }

    // found valid marker
    if (ch === 0x29/* ) */ || ch === 0x2e/* . */) {
      break;
    }

    return -1;
  }


  if (pos < max && state.src.charCodeAt(pos) !== 0x20/* space */) {
    // " 1.test " - is not a list item
    return -1;
  }
  return pos;
}

function markTightParagraphs(state, idx) {
  var i, l,
      level = state.level + 2;

  for (i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
    if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
      state.tokens[i + 2].tight = true;
      state.tokens[i].tight = true;
      i += 2;
    }
  }
}


function list(state, startLine, endLine, silent) {
  var nextLine,
      indent,
      oldTShift,
      oldIndent,
      oldTight,
      oldParentType,
      start,
      posAfterMarker,
      max,
      indentAfterMarker,
      markerValue,
      markerCharCode,
      isOrdered,
      contentStart,
      listTokIdx,
      prevEmptyEnd,
      listLines,
      itemLines,
      tight = true,
      terminatorRules,
      i, l, terminate;

  // Detect list type and position after marker
  if ((posAfterMarker = skipOrderedListMarker(state, startLine)) >= 0) {
    isOrdered = true;
  } else if ((posAfterMarker = skipBulletListMarker(state, startLine)) >= 0) {
    isOrdered = false;
  } else {
    return false;
  }

  if (state.level >= state.options.maxNesting) { return false; }

  // We should terminate list on style change. Remember first one to compare.
  markerCharCode = state.src.charCodeAt(posAfterMarker - 1);

  // For validation mode we can terminate immediately
  if (silent) { return true; }

  // Start list
  listTokIdx = state.tokens.length;

  if (isOrdered) {
    start = state.bMarks[startLine] + state.tShift[startLine];
    markerValue = Number(state.src.substr(start, posAfterMarker - start - 1));

    state.tokens.push({
      type: 'ordered_list_open',
      order: markerValue,
      lines: listLines = [ startLine, 0 ],
      level: state.level++
    });

  } else {
    state.tokens.push({
      type: 'bullet_list_open',
      lines: listLines = [ startLine, 0 ],
      level: state.level++
    });
  }

  //
  // Iterate list items
  //

  nextLine = startLine;
  prevEmptyEnd = false;
  terminatorRules = state.parser.ruler.getRules('list');

  while (nextLine < endLine) {
    contentStart = state.skipSpaces(posAfterMarker);
    max = state.eMarks[nextLine];

    if (contentStart >= max) {
      // trimming space in "-    \n  3" case, indent is 1 here
      indentAfterMarker = 1;
    } else {
      indentAfterMarker = contentStart - posAfterMarker;
    }

    // If we have more than 4 spaces, the indent is 1
    // (the rest is just indented code block)
    if (indentAfterMarker > 4) { indentAfterMarker = 1; }

    // If indent is less than 1, assume that it's one, example:
    //  "-\n  test"
    if (indentAfterMarker < 1) { indentAfterMarker = 1; }

    // "  -  test"
    //  ^^^^^ - calculating total length of this thing
    indent = (posAfterMarker - state.bMarks[nextLine]) + indentAfterMarker;

    // Run subparser & write tokens
    state.tokens.push({
      type: 'list_item_open',
      lines: itemLines = [ startLine, 0 ],
      level: state.level++
    });

    oldIndent = state.blkIndent;
    oldTight = state.tight;
    oldTShift = state.tShift[startLine];
    oldParentType = state.parentType;
    state.tShift[startLine] = contentStart - state.bMarks[startLine];
    state.blkIndent = indent;
    state.tight = true;
    state.parentType = 'list';

    state.parser.tokenize(state, startLine, endLine, true);

    // If any of list item is tight, mark list as tight
    if (!state.tight || prevEmptyEnd) {
      tight = false;
    }
    // Item become loose if finish with empty line,
    // but we should filter last element, because it means list finish
    prevEmptyEnd = (state.line - startLine) > 1 && state.isEmpty(state.line - 1);

    state.blkIndent = oldIndent;
    state.tShift[startLine] = oldTShift;
    state.tight = oldTight;
    state.parentType = oldParentType;

    state.tokens.push({
      type: 'list_item_close',
      level: --state.level
    });

    nextLine = startLine = state.line;
    itemLines[1] = nextLine;
    contentStart = state.bMarks[startLine];

    if (nextLine >= endLine) { break; }

    if (state.isEmpty(nextLine)) {
      break;
    }

    //
    // Try to check if list is terminated or continued.
    //
    if (state.tShift[nextLine] < state.blkIndent) { break; }

    // fail if terminating block found
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }

    // fail if list has another type
    if (isOrdered) {
      posAfterMarker = skipOrderedListMarker(state, nextLine);
      if (posAfterMarker < 0) { break; }
    } else {
      posAfterMarker = skipBulletListMarker(state, nextLine);
      if (posAfterMarker < 0) { break; }
    }

    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) { break; }
  }

  // Finilize list
  state.tokens.push({
    type: isOrdered ? 'ordered_list_close' : 'bullet_list_close',
    level: --state.level
  });
  listLines[1] = nextLine;

  state.line = nextLine;

  // mark paragraphs tight if needed
  if (tight) {
    markTightParagraphs(state, listTokIdx);
  }

  return true;
}

// Process footnote reference list

function footnote(state, startLine, endLine, silent) {
  var oldBMark, oldTShift, oldParentType, pos, label,
      start = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  // line should be at least 5 chars - "[^x]:"
  if (start + 4 > max) { return false; }

  if (state.src.charCodeAt(start) !== 0x5B/* [ */) { return false; }
  if (state.src.charCodeAt(start + 1) !== 0x5E/* ^ */) { return false; }
  if (state.level >= state.options.maxNesting) { return false; }

  for (pos = start + 2; pos < max; pos++) {
    if (state.src.charCodeAt(pos) === 0x20) { return false; }
    if (state.src.charCodeAt(pos) === 0x5D /* ] */) {
      break;
    }
  }

  if (pos === start + 2) { return false; } // no empty footnote labels
  if (pos + 1 >= max || state.src.charCodeAt(++pos) !== 0x3A /* : */) { return false; }
  if (silent) { return true; }
  pos++;

  if (!state.env.footnotes) { state.env.footnotes = {}; }
  if (!state.env.footnotes.refs) { state.env.footnotes.refs = {}; }
  label = state.src.slice(start + 2, pos - 2);
  state.env.footnotes.refs[':' + label] = -1;

  state.tokens.push({
    type: 'footnote_reference_open',
    label: label,
    level: state.level++
  });

  oldBMark = state.bMarks[startLine];
  oldTShift = state.tShift[startLine];
  oldParentType = state.parentType;
  state.tShift[startLine] = state.skipSpaces(pos) - pos;
  state.bMarks[startLine] = pos;
  state.blkIndent += 4;
  state.parentType = 'footnote';

  if (state.tShift[startLine] < state.blkIndent) {
    state.tShift[startLine] += state.blkIndent;
    state.bMarks[startLine] -= state.blkIndent;
  }

  state.parser.tokenize(state, startLine, endLine, true);

  state.parentType = oldParentType;
  state.blkIndent -= 4;
  state.tShift[startLine] = oldTShift;
  state.bMarks[startLine] = oldBMark;

  state.tokens.push({
    type: 'footnote_reference_close',
    level: --state.level
  });

  return true;
}

// heading (#, ##, ...)

function heading(state, startLine, endLine, silent) {
  var ch, level, tmp,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  if (pos >= max) { return false; }

  ch  = state.src.charCodeAt(pos);

  if (ch !== 0x23/* # */ || pos >= max) { return false; }

  // count heading level
  level = 1;
  ch = state.src.charCodeAt(++pos);
  while (ch === 0x23/* # */ && pos < max && level <= 6) {
    level++;
    ch = state.src.charCodeAt(++pos);
  }

  if (level > 6 || (pos < max && ch !== 0x20/* space */)) { return false; }

  if (silent) { return true; }

  // Let's cut tails like '    ###  ' from the end of string

  max = state.skipCharsBack(max, 0x20, pos); // space
  tmp = state.skipCharsBack(max, 0x23, pos); // #
  if (tmp > pos && state.src.charCodeAt(tmp - 1) === 0x20/* space */) {
    max = tmp;
  }

  state.line = startLine + 1;

  state.tokens.push({ type: 'heading_open',
    hLevel: level,
    lines: [ startLine, state.line ],
    level: state.level
  });

  // only if header is not empty
  if (pos < max) {
    state.tokens.push({
      type: 'inline',
      content: state.src.slice(pos, max).trim(),
      level: state.level + 1,
      lines: [ startLine, state.line ],
      children: []
    });
  }
  state.tokens.push({ type: 'heading_close', hLevel: level, level: state.level });

  return true;
}

// lheading (---, ===)

function lheading(state, startLine, endLine/*, silent*/) {
  var marker, pos, max,
      next = startLine + 1;

  if (next >= endLine) { return false; }
  if (state.tShift[next] < state.blkIndent) { return false; }

  // Scan next line

  if (state.tShift[next] - state.blkIndent > 3) { return false; }

  pos = state.bMarks[next] + state.tShift[next];
  max = state.eMarks[next];

  if (pos >= max) { return false; }

  marker = state.src.charCodeAt(pos);

  if (marker !== 0x2D/* - */ && marker !== 0x3D/* = */) { return false; }

  pos = state.skipChars(pos, marker);

  pos = state.skipSpaces(pos);

  if (pos < max) { return false; }

  pos = state.bMarks[startLine] + state.tShift[startLine];

  state.line = next + 1;
  state.tokens.push({
    type: 'heading_open',
    hLevel: marker === 0x3D/* = */ ? 1 : 2,
    lines: [ startLine, state.line ],
    level: state.level
  });
  state.tokens.push({
    type: 'inline',
    content: state.src.slice(pos, state.eMarks[startLine]).trim(),
    level: state.level + 1,
    lines: [ startLine, state.line - 1 ],
    children: []
  });
  state.tokens.push({
    type: 'heading_close',
    hLevel: marker === 0x3D/* = */ ? 1 : 2,
    level: state.level
  });

  return true;
}

// List of valid html blocks names, accorting to commonmark spec
// http://jgm.github.io/CommonMark/spec.html#html-blocks

var html_blocks = {};

[
  'article',
  'aside',
  'button',
  'blockquote',
  'body',
  'canvas',
  'caption',
  'col',
  'colgroup',
  'dd',
  'div',
  'dl',
  'dt',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'hr',
  'iframe',
  'li',
  'map',
  'object',
  'ol',
  'output',
  'p',
  'pre',
  'progress',
  'script',
  'section',
  'style',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'tr',
  'thead',
  'ul',
  'video'
].forEach(function (name) { html_blocks[name] = true; });

// HTML block


var HTML_TAG_OPEN_RE = /^<([a-zA-Z]{1,15})[\s\/>]/;
var HTML_TAG_CLOSE_RE = /^<\/([a-zA-Z]{1,15})[\s>]/;

function isLetter$1(ch) {
  /*eslint no-bitwise:0*/
  var lc = ch | 0x20; // to lower case
  return (lc >= 0x61/* a */) && (lc <= 0x7a/* z */);
}

function htmlblock(state, startLine, endLine, silent) {
  var ch, match, nextLine,
      pos = state.bMarks[startLine],
      max = state.eMarks[startLine],
      shift = state.tShift[startLine];

  pos += shift;

  if (!state.options.html) { return false; }

  if (shift > 3 || pos + 2 >= max) { return false; }

  if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false; }

  ch = state.src.charCodeAt(pos + 1);

  if (ch === 0x21/* ! */ || ch === 0x3F/* ? */) {
    // Directive start / comment start / processing instruction start
    if (silent) { return true; }

  } else if (ch === 0x2F/* / */ || isLetter$1(ch)) {

    // Probably start or end of tag
    if (ch === 0x2F/* \ */) {
      // closing tag
      match = state.src.slice(pos, max).match(HTML_TAG_CLOSE_RE);
      if (!match) { return false; }
    } else {
      // opening tag
      match = state.src.slice(pos, max).match(HTML_TAG_OPEN_RE);
      if (!match) { return false; }
    }
    // Make sure tag name is valid
    if (html_blocks[match[1].toLowerCase()] !== true) { return false; }
    if (silent) { return true; }

  } else {
    return false;
  }

  // If we are here - we detected HTML block.
  // Let's roll down till empty line (block end).
  nextLine = startLine + 1;
  while (nextLine < state.lineMax && !state.isEmpty(nextLine)) {
    nextLine++;
  }

  state.line = nextLine;
  state.tokens.push({
    type: 'htmlblock',
    level: state.level,
    lines: [ startLine, state.line ],
    content: state.getLines(startLine, nextLine, 0, true)
  });

  return true;
}

// GFM table, non-standard

function getLine(state, line) {
  var pos = state.bMarks[line] + state.blkIndent,
      max = state.eMarks[line];

  return state.src.substr(pos, max - pos);
}

function table(state, startLine, endLine, silent) {
  var ch, lineText, pos, i, nextLine, rows, cell,
      aligns, t, tableLines, tbodyLines;

  // should have at least three lines
  if (startLine + 2 > endLine) { return false; }

  nextLine = startLine + 1;

  if (state.tShift[nextLine] < state.blkIndent) { return false; }

  // first character of the second line should be '|' or '-'

  pos = state.bMarks[nextLine] + state.tShift[nextLine];
  if (pos >= state.eMarks[nextLine]) { return false; }

  ch = state.src.charCodeAt(pos);
  if (ch !== 0x7C/* | */ && ch !== 0x2D/* - */ && ch !== 0x3A/* : */) { return false; }

  lineText = getLine(state, startLine + 1);
  if (!/^[-:| ]+$/.test(lineText)) { return false; }

  rows = lineText.split('|');
  if (rows <= 2) { return false; }
  aligns = [];
  for (i = 0; i < rows.length; i++) {
    t = rows[i].trim();
    if (!t) {
      // allow empty columns before and after table, but not in between columns;
      // e.g. allow ` |---| `, disallow ` ---||--- `
      if (i === 0 || i === rows.length - 1) {
        continue;
      } else {
        return false;
      }
    }

    if (!/^:?-+:?$/.test(t)) { return false; }
    if (t.charCodeAt(t.length - 1) === 0x3A/* : */) {
      aligns.push(t.charCodeAt(0) === 0x3A/* : */ ? 'center' : 'right');
    } else if (t.charCodeAt(0) === 0x3A/* : */) {
      aligns.push('left');
    } else {
      aligns.push('');
    }
  }

  lineText = getLine(state, startLine).trim();
  if (lineText.indexOf('|') === -1) { return false; }
  rows = lineText.replace(/^\||\|$/g, '').split('|');
  if (aligns.length !== rows.length) { return false; }
  if (silent) { return true; }

  state.tokens.push({
    type: 'table_open',
    lines: tableLines = [ startLine, 0 ],
    level: state.level++
  });
  state.tokens.push({
    type: 'thead_open',
    lines: [ startLine, startLine + 1 ],
    level: state.level++
  });

  state.tokens.push({
    type: 'tr_open',
    lines: [ startLine, startLine + 1 ],
    level: state.level++
  });
  for (i = 0; i < rows.length; i++) {
    state.tokens.push({
      type: 'th_open',
      align: aligns[i],
      lines: [ startLine, startLine + 1 ],
      level: state.level++
    });
    state.tokens.push({
      type: 'inline',
      content: rows[i].trim(),
      lines: [ startLine, startLine + 1 ],
      level: state.level,
      children: []
    });
    state.tokens.push({ type: 'th_close', level: --state.level });
  }
  state.tokens.push({ type: 'tr_close', level: --state.level });
  state.tokens.push({ type: 'thead_close', level: --state.level });

  state.tokens.push({
    type: 'tbody_open',
    lines: tbodyLines = [ startLine + 2, 0 ],
    level: state.level++
  });

  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.tShift[nextLine] < state.blkIndent) { break; }

    lineText = getLine(state, nextLine).trim();
    if (lineText.indexOf('|') === -1) { break; }
    rows = lineText.replace(/^\||\|$/g, '').split('|');

    state.tokens.push({ type: 'tr_open', level: state.level++ });
    for (i = 0; i < rows.length; i++) {
      state.tokens.push({ type: 'td_open', align: aligns[i], level: state.level++ });
      // 0x7c === '|'
      cell = rows[i].substring(
          rows[i].charCodeAt(0) === 0x7c ? 1 : 0,
          rows[i].charCodeAt(rows[i].length - 1) === 0x7c ? rows[i].length - 1 : rows[i].length
      ).trim();
      state.tokens.push({
        type: 'inline',
        content: cell,
        level: state.level,
        children: []
      });
      state.tokens.push({ type: 'td_close', level: --state.level });
    }
    state.tokens.push({ type: 'tr_close', level: --state.level });
  }
  state.tokens.push({ type: 'tbody_close', level: --state.level });
  state.tokens.push({ type: 'table_close', level: --state.level });

  tableLines[1] = tbodyLines[1] = nextLine;
  state.line = nextLine;
  return true;
}

// Definition lists

// Search `[:~][\n ]`, returns next pos after marker on success
// or -1 on fail.
function skipMarker(state, line) {
  var pos, marker,
      start = state.bMarks[line] + state.tShift[line],
      max = state.eMarks[line];

  if (start >= max) { return -1; }

  // Check bullet
  marker = state.src.charCodeAt(start++);
  if (marker !== 0x7E/* ~ */ && marker !== 0x3A/* : */) { return -1; }

  pos = state.skipSpaces(start);

  // require space after ":"
  if (start === pos) { return -1; }

  // no empty definitions, e.g. "  : "
  if (pos >= max) { return -1; }

  return pos;
}

function markTightParagraphs$1(state, idx) {
  var i, l,
      level = state.level + 2;

  for (i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
    if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
      state.tokens[i + 2].tight = true;
      state.tokens[i].tight = true;
      i += 2;
    }
  }
}

function deflist(state, startLine, endLine, silent) {
  var contentStart,
      ddLine,
      dtLine,
      itemLines,
      listLines,
      listTokIdx,
      nextLine,
      oldIndent,
      oldDDIndent,
      oldParentType,
      oldTShift,
      oldTight,
      prevEmptyEnd,
      tight;

  if (silent) {
    // quirk: validation mode validates a dd block only, not a whole deflist
    if (state.ddIndent < 0) { return false; }
    return skipMarker(state, startLine) >= 0;
  }

  nextLine = startLine + 1;
  if (state.isEmpty(nextLine)) {
    if (++nextLine > endLine) { return false; }
  }

  if (state.tShift[nextLine] < state.blkIndent) { return false; }
  contentStart = skipMarker(state, nextLine);
  if (contentStart < 0) { return false; }

  if (state.level >= state.options.maxNesting) { return false; }

  // Start list
  listTokIdx = state.tokens.length;

  state.tokens.push({
    type: 'dl_open',
    lines: listLines = [ startLine, 0 ],
    level: state.level++
  });

  //
  // Iterate list items
  //

  dtLine = startLine;
  ddLine = nextLine;

  // One definition list can contain multiple DTs,
  // and one DT can be followed by multiple DDs.
  //
  // Thus, there is two loops here, and label is
  // needed to break out of the second one
  //
  /*eslint no-labels:0,block-scoped-var:0*/
  OUTER:
  for (;;) {
    tight = true;
    prevEmptyEnd = false;

    state.tokens.push({
      type: 'dt_open',
      lines: [ dtLine, dtLine ],
      level: state.level++
    });
    state.tokens.push({
      type: 'inline',
      content: state.getLines(dtLine, dtLine + 1, state.blkIndent, false).trim(),
      level: state.level + 1,
      lines: [ dtLine, dtLine ],
      children: []
    });
    state.tokens.push({
      type: 'dt_close',
      level: --state.level
    });

    for (;;) {
      state.tokens.push({
        type: 'dd_open',
        lines: itemLines = [ nextLine, 0 ],
        level: state.level++
      });

      oldTight = state.tight;
      oldDDIndent = state.ddIndent;
      oldIndent = state.blkIndent;
      oldTShift = state.tShift[ddLine];
      oldParentType = state.parentType;
      state.blkIndent = state.ddIndent = state.tShift[ddLine] + 2;
      state.tShift[ddLine] = contentStart - state.bMarks[ddLine];
      state.tight = true;
      state.parentType = 'deflist';

      state.parser.tokenize(state, ddLine, endLine, true);

      // If any of list item is tight, mark list as tight
      if (!state.tight || prevEmptyEnd) {
        tight = false;
      }
      // Item become loose if finish with empty line,
      // but we should filter last element, because it means list finish
      prevEmptyEnd = (state.line - ddLine) > 1 && state.isEmpty(state.line - 1);

      state.tShift[ddLine] = oldTShift;
      state.tight = oldTight;
      state.parentType = oldParentType;
      state.blkIndent = oldIndent;
      state.ddIndent = oldDDIndent;

      state.tokens.push({
        type: 'dd_close',
        level: --state.level
      });

      itemLines[1] = nextLine = state.line;

      if (nextLine >= endLine) { break OUTER; }

      if (state.tShift[nextLine] < state.blkIndent) { break OUTER; }
      contentStart = skipMarker(state, nextLine);
      if (contentStart < 0) { break; }

      ddLine = nextLine;

      // go to the next loop iteration:
      // insert DD tag and repeat checking
    }

    if (nextLine >= endLine) { break; }
    dtLine = nextLine;

    if (state.isEmpty(dtLine)) { break; }
    if (state.tShift[dtLine] < state.blkIndent) { break; }

    ddLine = dtLine + 1;
    if (ddLine >= endLine) { break; }
    if (state.isEmpty(ddLine)) { ddLine++; }
    if (ddLine >= endLine) { break; }

    if (state.tShift[ddLine] < state.blkIndent) { break; }
    contentStart = skipMarker(state, ddLine);
    if (contentStart < 0) { break; }

    // go to the next loop iteration:
    // insert DT and DD tags and repeat checking
  }

  // Finilize list
  state.tokens.push({
    type: 'dl_close',
    level: --state.level
  });
  listLines[1] = nextLine;

  state.line = nextLine;

  // mark paragraphs tight if needed
  if (tight) {
    markTightParagraphs$1(state, listTokIdx);
  }

  return true;
}

// Paragraph

function paragraph(state, startLine/*, endLine*/) {
  var endLine, content, terminate, i, l,
      nextLine = startLine + 1,
      terminatorRules;

  endLine = state.lineMax;

  // jump line-by-line until empty one or EOF
  if (nextLine < endLine && !state.isEmpty(nextLine)) {
    terminatorRules = state.parser.ruler.getRules('paragraph');

    for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
      // this would be a code block normally, but after paragraph
      // it's considered a lazy continuation regardless of what's there
      if (state.tShift[nextLine] - state.blkIndent > 3) { continue; }

      // Some tags can terminate paragraph without empty line.
      terminate = false;
      for (i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }
      }
      if (terminate) { break; }
    }
  }

  content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();

  state.line = nextLine;
  if (content.length) {
    state.tokens.push({
      type: 'paragraph_open',
      tight: false,
      lines: [ startLine, state.line ],
      level: state.level
    });
    state.tokens.push({
      type: 'inline',
      content: content,
      level: state.level + 1,
      lines: [ startLine, state.line ],
      children: []
    });
    state.tokens.push({
      type: 'paragraph_close',
      tight: false,
      level: state.level
    });
  }

  return true;
}

/**
 * Parser rules
 */

var _rules$1 = [
  [ 'code',       code ],
  [ 'fences',     fences,     [ 'paragraph', 'blockquote', 'list' ] ],
  [ 'blockquote', blockquote, [ 'paragraph', 'blockquote', 'list' ] ],
  [ 'hr',         hr,         [ 'paragraph', 'blockquote', 'list' ] ],
  [ 'list',       list,       [ 'paragraph', 'blockquote' ] ],
  [ 'footnote',   footnote,   [ 'paragraph' ] ],
  [ 'heading',    heading,    [ 'paragraph', 'blockquote' ] ],
  [ 'lheading',   lheading ],
  [ 'htmlblock',  htmlblock,  [ 'paragraph', 'blockquote' ] ],
  [ 'table',      table,      [ 'paragraph' ] ],
  [ 'deflist',    deflist,    [ 'paragraph' ] ],
  [ 'paragraph',  paragraph ]
];

/**
 * Block Parser class
 *
 * @api private
 */

function ParserBlock() {
  this.ruler = new Ruler();
  for (var i = 0; i < _rules$1.length; i++) {
    this.ruler.push(_rules$1[i][0], _rules$1[i][1], {
      alt: (_rules$1[i][2] || []).slice()
    });
  }
}

/**
 * Generate tokens for the given input range.
 *
 * @param  {Object} `state` Has properties like `src`, `parser`, `options` etc
 * @param  {Number} `startLine`
 * @param  {Number} `endLine`
 * @api private
 */

ParserBlock.prototype.tokenize = function (state, startLine, endLine) {
  var rules = this.ruler.getRules('');
  var len = rules.length;
  var line = startLine;
  var hasEmptyLines = false;
  var ok, i;

  while (line < endLine) {
    state.line = line = state.skipEmptyLines(line);
    if (line >= endLine) {
      break;
    }

    // Termination condition for nested calls.
    // Nested calls currently used for blockquotes & lists
    if (state.tShift[line] < state.blkIndent) {
      break;
    }

    // Try all possible rules.
    // On success, rule should:
    //
    // - update `state.line`
    // - update `state.tokens`
    // - return true

    for (i = 0; i < len; i++) {
      ok = rules[i](state, line, endLine, false);
      if (ok) {
        break;
      }
    }

    // set state.tight iff we had an empty line before current tag
    // i.e. latest empty line should not count
    state.tight = !hasEmptyLines;

    // paragraph might "eat" one newline after it in nested lists
    if (state.isEmpty(state.line - 1)) {
      hasEmptyLines = true;
    }

    line = state.line;

    if (line < endLine && state.isEmpty(line)) {
      hasEmptyLines = true;
      line++;

      // two empty lines should stop the parser in list mode
      if (line < endLine && state.parentType === 'list' && state.isEmpty(line)) { break; }
      state.line = line;
    }
  }
};

var TABS_SCAN_RE = /[\n\t]/g;
var NEWLINES_RE  = /\r[\n\u0085]|[\u2424\u2028\u0085]/g;
var SPACES_RE    = /\u00a0/g;

/**
 * Tokenize the given `str`.
 *
 * @param  {String} `str` Source string
 * @param  {Object} `options`
 * @param  {Object} `env`
 * @param  {Array} `outTokens`
 * @api private
 */

ParserBlock.prototype.parse = function (str, options, env, outTokens) {
  var state, lineStart = 0, lastTabPos = 0;
  if (!str) { return []; }

  // Normalize spaces
  str = str.replace(SPACES_RE, ' ');

  // Normalize newlines
  str = str.replace(NEWLINES_RE, '\n');

  // Replace tabs with proper number of spaces (1..4)
  if (str.indexOf('\t') >= 0) {
    str = str.replace(TABS_SCAN_RE, function (match, offset) {
      var result;
      if (str.charCodeAt(offset) === 0x0A) {
        lineStart = offset + 1;
        lastTabPos = 0;
        return match;
      }
      result = '    '.slice((offset - lineStart - lastTabPos) % 4);
      lastTabPos = offset - lineStart + 1;
      return result;
    });
  }

  state = new StateBlock(str, this, options, env, outTokens);
  this.tokenize(state, state.line, state.lineMax);
};

// Skip text characters for text token, place those to pending buffer
// and increment current pos

// Rule to skip pure text
// '{}$%@~+=:' reserved for extentions

function isTerminatorChar(ch) {
  switch (ch) {
    case 0x0A/* \n */:
    case 0x5C/* \ */:
    case 0x60/* ` */:
    case 0x2A/* * */:
    case 0x5F/* _ */:
    case 0x5E/* ^ */:
    case 0x5B/* [ */:
    case 0x5D/* ] */:
    case 0x21/* ! */:
    case 0x26/* & */:
    case 0x3C/* < */:
    case 0x3E/* > */:
    case 0x7B/* { */:
    case 0x7D/* } */:
    case 0x24/* $ */:
    case 0x25/* % */:
    case 0x40/* @ */:
    case 0x7E/* ~ */:
    case 0x2B/* + */:
    case 0x3D/* = */:
    case 0x3A/* : */:
      return true;
    default:
      return false;
  }
}

function text(state, silent) {
  var pos = state.pos;

  while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
    pos++;
  }

  if (pos === state.pos) { return false; }

  if (!silent) { state.pending += state.src.slice(state.pos, pos); }

  state.pos = pos;

  return true;
}

// Proceess '\n'

function newline(state, silent) {
  var pmax, max, pos = state.pos;

  if (state.src.charCodeAt(pos) !== 0x0A/* \n */) { return false; }

  pmax = state.pending.length - 1;
  max = state.posMax;

  // '  \n' -> hardbreak
  // Lookup in pending chars is bad practice! Don't copy to other rules!
  // Pending string is stored in concat mode, indexed lookups will cause
  // convertion to flat mode.
  if (!silent) {
    if (pmax >= 0 && state.pending.charCodeAt(pmax) === 0x20) {
      if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 0x20) {
        // Strip out all trailing spaces on this line.
        for (var i = pmax - 2; i >= 0; i--) {
          if (state.pending.charCodeAt(i) !== 0x20) {
            state.pending = state.pending.substring(0, i + 1);
            break;
          }
        }
        state.push({
          type: 'hardbreak',
          level: state.level
        });
      } else {
        state.pending = state.pending.slice(0, -1);
        state.push({
          type: 'softbreak',
          level: state.level
        });
      }

    } else {
      state.push({
        type: 'softbreak',
        level: state.level
      });
    }
  }

  pos++;

  // skip heading spaces for next line
  while (pos < max && state.src.charCodeAt(pos) === 0x20) { pos++; }

  state.pos = pos;
  return true;
}

// Proceess escaped chars and hardbreaks

var ESCAPED = [];

for (var i = 0; i < 256; i++) { ESCAPED.push(0); }

'\\!"#$%&\'()*+,./:;<=>?@[]^_`{|}~-'
  .split('').forEach(function(ch) { ESCAPED[ch.charCodeAt(0)] = 1; });


function escape(state, silent) {
  var ch, pos = state.pos, max = state.posMax;

  if (state.src.charCodeAt(pos) !== 0x5C/* \ */) { return false; }

  pos++;

  if (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (ch < 256 && ESCAPED[ch] !== 0) {
      if (!silent) { state.pending += state.src[pos]; }
      state.pos += 2;
      return true;
    }

    if (ch === 0x0A) {
      if (!silent) {
        state.push({
          type: 'hardbreak',
          level: state.level
        });
      }

      pos++;
      // skip leading whitespaces from next line
      while (pos < max && state.src.charCodeAt(pos) === 0x20) { pos++; }

      state.pos = pos;
      return true;
    }
  }

  if (!silent) { state.pending += '\\'; }
  state.pos++;
  return true;
}

// Parse backticks

function backticks(state, silent) {
  var start, max, marker, matchStart, matchEnd,
      pos = state.pos,
      ch = state.src.charCodeAt(pos);

  if (ch !== 0x60/* ` */) { return false; }

  start = pos;
  pos++;
  max = state.posMax;

  while (pos < max && state.src.charCodeAt(pos) === 0x60/* ` */) { pos++; }

  marker = state.src.slice(start, pos);

  matchStart = matchEnd = pos;

  while ((matchStart = state.src.indexOf('`', matchEnd)) !== -1) {
    matchEnd = matchStart + 1;

    while (matchEnd < max && state.src.charCodeAt(matchEnd) === 0x60/* ` */) { matchEnd++; }

    if (matchEnd - matchStart === marker.length) {
      if (!silent) {
        state.push({
          type: 'code',
          content: state.src.slice(pos, matchStart)
                              .replace(/[ \n]+/g, ' ')
                              .trim(),
          block: false,
          level: state.level
        });
      }
      state.pos = matchEnd;
      return true;
    }
  }

  if (!silent) { state.pending += marker; }
  state.pos += marker.length;
  return true;
}

// Process ~~deleted text~~

function del(state, silent) {
  var found,
      pos,
      stack,
      max = state.posMax,
      start = state.pos,
      lastChar,
      nextChar;

  if (state.src.charCodeAt(start) !== 0x7E/* ~ */) { return false; }
  if (silent) { return false; } // don't run any pairs in validation mode
  if (start + 4 >= max) { return false; }
  if (state.src.charCodeAt(start + 1) !== 0x7E/* ~ */) { return false; }
  if (state.level >= state.options.maxNesting) { return false; }

  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : -1;
  nextChar = state.src.charCodeAt(start + 2);

  if (lastChar === 0x7E/* ~ */) { return false; }
  if (nextChar === 0x7E/* ~ */) { return false; }
  if (nextChar === 0x20 || nextChar === 0x0A) { return false; }

  pos = start + 2;
  while (pos < max && state.src.charCodeAt(pos) === 0x7E/* ~ */) { pos++; }
  if (pos > start + 3) {
    // sequence of 4+ markers taking as literal, same as in a emphasis
    state.pos += pos - start;
    if (!silent) { state.pending += state.src.slice(start, pos); }
    return true;
  }

  state.pos = start + 2;
  stack = 1;

  while (state.pos + 1 < max) {
    if (state.src.charCodeAt(state.pos) === 0x7E/* ~ */) {
      if (state.src.charCodeAt(state.pos + 1) === 0x7E/* ~ */) {
        lastChar = state.src.charCodeAt(state.pos - 1);
        nextChar = state.pos + 2 < max ? state.src.charCodeAt(state.pos + 2) : -1;
        if (nextChar !== 0x7E/* ~ */ && lastChar !== 0x7E/* ~ */) {
          if (lastChar !== 0x20 && lastChar !== 0x0A) {
            // closing '~~'
            stack--;
          } else if (nextChar !== 0x20 && nextChar !== 0x0A) {
            // opening '~~'
            stack++;
          } // else {
            //  // standalone ' ~~ ' indented with spaces
            // }
          if (stack <= 0) {
            found = true;
            break;
          }
        }
      }
    }

    state.parser.skipToken(state);
  }

  if (!found) {
    // parser failed to find ending tag, so it's not valid emphasis
    state.pos = start;
    return false;
  }

  // found!
  state.posMax = state.pos;
  state.pos = start + 2;

  if (!silent) {
    state.push({ type: 'del_open', level: state.level++ });
    state.parser.tokenize(state);
    state.push({ type: 'del_close', level: --state.level });
  }

  state.pos = state.posMax + 2;
  state.posMax = max;
  return true;
}

// Process ++inserted text++

function ins(state, silent) {
  var found,
      pos,
      stack,
      max = state.posMax,
      start = state.pos,
      lastChar,
      nextChar;

  if (state.src.charCodeAt(start) !== 0x2B/* + */) { return false; }
  if (silent) { return false; } // don't run any pairs in validation mode
  if (start + 4 >= max) { return false; }
  if (state.src.charCodeAt(start + 1) !== 0x2B/* + */) { return false; }
  if (state.level >= state.options.maxNesting) { return false; }

  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : -1;
  nextChar = state.src.charCodeAt(start + 2);

  if (lastChar === 0x2B/* + */) { return false; }
  if (nextChar === 0x2B/* + */) { return false; }
  if (nextChar === 0x20 || nextChar === 0x0A) { return false; }

  pos = start + 2;
  while (pos < max && state.src.charCodeAt(pos) === 0x2B/* + */) { pos++; }
  if (pos !== start + 2) {
    // sequence of 3+ markers taking as literal, same as in a emphasis
    state.pos += pos - start;
    if (!silent) { state.pending += state.src.slice(start, pos); }
    return true;
  }

  state.pos = start + 2;
  stack = 1;

  while (state.pos + 1 < max) {
    if (state.src.charCodeAt(state.pos) === 0x2B/* + */) {
      if (state.src.charCodeAt(state.pos + 1) === 0x2B/* + */) {
        lastChar = state.src.charCodeAt(state.pos - 1);
        nextChar = state.pos + 2 < max ? state.src.charCodeAt(state.pos + 2) : -1;
        if (nextChar !== 0x2B/* + */ && lastChar !== 0x2B/* + */) {
          if (lastChar !== 0x20 && lastChar !== 0x0A) {
            // closing '++'
            stack--;
          } else if (nextChar !== 0x20 && nextChar !== 0x0A) {
            // opening '++'
            stack++;
          } // else {
            //  // standalone ' ++ ' indented with spaces
            // }
          if (stack <= 0) {
            found = true;
            break;
          }
        }
      }
    }

    state.parser.skipToken(state);
  }

  if (!found) {
    // parser failed to find ending tag, so it's not valid emphasis
    state.pos = start;
    return false;
  }

  // found!
  state.posMax = state.pos;
  state.pos = start + 2;

  if (!silent) {
    state.push({ type: 'ins_open', level: state.level++ });
    state.parser.tokenize(state);
    state.push({ type: 'ins_close', level: --state.level });
  }

  state.pos = state.posMax + 2;
  state.posMax = max;
  return true;
}

// Process ==highlighted text==

function mark(state, silent) {
  var found,
      pos,
      stack,
      max = state.posMax,
      start = state.pos,
      lastChar,
      nextChar;

  if (state.src.charCodeAt(start) !== 0x3D/* = */) { return false; }
  if (silent) { return false; } // don't run any pairs in validation mode
  if (start + 4 >= max) { return false; }
  if (state.src.charCodeAt(start + 1) !== 0x3D/* = */) { return false; }
  if (state.level >= state.options.maxNesting) { return false; }

  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : -1;
  nextChar = state.src.charCodeAt(start + 2);

  if (lastChar === 0x3D/* = */) { return false; }
  if (nextChar === 0x3D/* = */) { return false; }
  if (nextChar === 0x20 || nextChar === 0x0A) { return false; }

  pos = start + 2;
  while (pos < max && state.src.charCodeAt(pos) === 0x3D/* = */) { pos++; }
  if (pos !== start + 2) {
    // sequence of 3+ markers taking as literal, same as in a emphasis
    state.pos += pos - start;
    if (!silent) { state.pending += state.src.slice(start, pos); }
    return true;
  }

  state.pos = start + 2;
  stack = 1;

  while (state.pos + 1 < max) {
    if (state.src.charCodeAt(state.pos) === 0x3D/* = */) {
      if (state.src.charCodeAt(state.pos + 1) === 0x3D/* = */) {
        lastChar = state.src.charCodeAt(state.pos - 1);
        nextChar = state.pos + 2 < max ? state.src.charCodeAt(state.pos + 2) : -1;
        if (nextChar !== 0x3D/* = */ && lastChar !== 0x3D/* = */) {
          if (lastChar !== 0x20 && lastChar !== 0x0A) {
            // closing '=='
            stack--;
          } else if (nextChar !== 0x20 && nextChar !== 0x0A) {
            // opening '=='
            stack++;
          } // else {
            //  // standalone ' == ' indented with spaces
            // }
          if (stack <= 0) {
            found = true;
            break;
          }
        }
      }
    }

    state.parser.skipToken(state);
  }

  if (!found) {
    // parser failed to find ending tag, so it's not valid emphasis
    state.pos = start;
    return false;
  }

  // found!
  state.posMax = state.pos;
  state.pos = start + 2;

  if (!silent) {
    state.push({ type: 'mark_open', level: state.level++ });
    state.parser.tokenize(state);
    state.push({ type: 'mark_close', level: --state.level });
  }

  state.pos = state.posMax + 2;
  state.posMax = max;
  return true;
}

// Process *this* and _that_

function isAlphaNum(code) {
  return (code >= 0x30 /* 0 */ && code <= 0x39 /* 9 */) ||
         (code >= 0x41 /* A */ && code <= 0x5A /* Z */) ||
         (code >= 0x61 /* a */ && code <= 0x7A /* z */);
}

// parse sequence of emphasis markers,
// "start" should point at a valid marker
function scanDelims(state, start) {
  var pos = start, lastChar, nextChar, count,
      can_open = true,
      can_close = true,
      max = state.posMax,
      marker = state.src.charCodeAt(start);

  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : -1;

  while (pos < max && state.src.charCodeAt(pos) === marker) { pos++; }
  if (pos >= max) { can_open = false; }
  count = pos - start;

  if (count >= 4) {
    // sequence of four or more unescaped markers can't start/end an emphasis
    can_open = can_close = false;
  } else {
    nextChar = pos < max ? state.src.charCodeAt(pos) : -1;

    // check whitespace conditions
    if (nextChar === 0x20 || nextChar === 0x0A) { can_open = false; }
    if (lastChar === 0x20 || lastChar === 0x0A) { can_close = false; }

    if (marker === 0x5F /* _ */) {
      // check if we aren't inside the word
      if (isAlphaNum(lastChar)) { can_open = false; }
      if (isAlphaNum(nextChar)) { can_close = false; }
    }
  }

  return {
    can_open: can_open,
    can_close: can_close,
    delims: count
  };
}

function emphasis(state, silent) {
  var startCount,
      count,
      found,
      oldCount,
      newCount,
      stack,
      res,
      max = state.posMax,
      start = state.pos,
      marker = state.src.charCodeAt(start);

  if (marker !== 0x5F/* _ */ && marker !== 0x2A /* * */) { return false; }
  if (silent) { return false; } // don't run any pairs in validation mode

  res = scanDelims(state, start);
  startCount = res.delims;
  if (!res.can_open) {
    state.pos += startCount;
    if (!silent) { state.pending += state.src.slice(start, state.pos); }
    return true;
  }

  if (state.level >= state.options.maxNesting) { return false; }

  state.pos = start + startCount;
  stack = [ startCount ];

  while (state.pos < max) {
    if (state.src.charCodeAt(state.pos) === marker) {
      res = scanDelims(state, state.pos);
      count = res.delims;
      if (res.can_close) {
        oldCount = stack.pop();
        newCount = count;

        while (oldCount !== newCount) {
          if (newCount < oldCount) {
            stack.push(oldCount - newCount);
            break;
          }

          // assert(newCount > oldCount)
          newCount -= oldCount;

          if (stack.length === 0) { break; }
          state.pos += oldCount;
          oldCount = stack.pop();
        }

        if (stack.length === 0) {
          startCount = oldCount;
          found = true;
          break;
        }
        state.pos += count;
        continue;
      }

      if (res.can_open) { stack.push(count); }
      state.pos += count;
      continue;
    }

    state.parser.skipToken(state);
  }

  if (!found) {
    // parser failed to find ending tag, so it's not valid emphasis
    state.pos = start;
    return false;
  }

  // found!
  state.posMax = state.pos;
  state.pos = start + startCount;

  if (!silent) {
    if (startCount === 2 || startCount === 3) {
      state.push({ type: 'strong_open', level: state.level++ });
    }
    if (startCount === 1 || startCount === 3) {
      state.push({ type: 'em_open', level: state.level++ });
    }

    state.parser.tokenize(state);

    if (startCount === 1 || startCount === 3) {
      state.push({ type: 'em_close', level: --state.level });
    }
    if (startCount === 2 || startCount === 3) {
      state.push({ type: 'strong_close', level: --state.level });
    }
  }

  state.pos = state.posMax + startCount;
  state.posMax = max;
  return true;
}

// Process ~subscript~

// same as UNESCAPE_MD_RE plus a space
var UNESCAPE_RE = /\\([ \\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;

function sub(state, silent) {
  var found,
      content,
      max = state.posMax,
      start = state.pos;

  if (state.src.charCodeAt(start) !== 0x7E/* ~ */) { return false; }
  if (silent) { return false; } // don't run any pairs in validation mode
  if (start + 2 >= max) { return false; }
  if (state.level >= state.options.maxNesting) { return false; }

  state.pos = start + 1;

  while (state.pos < max) {
    if (state.src.charCodeAt(state.pos) === 0x7E/* ~ */) {
      found = true;
      break;
    }

    state.parser.skipToken(state);
  }

  if (!found || start + 1 === state.pos) {
    state.pos = start;
    return false;
  }

  content = state.src.slice(start + 1, state.pos);

  // don't allow unescaped spaces/newlines inside
  if (content.match(/(^|[^\\])(\\\\)*\s/)) {
    state.pos = start;
    return false;
  }

  // found!
  state.posMax = state.pos;
  state.pos = start + 1;

  if (!silent) {
    state.push({
      type: 'sub',
      level: state.level,
      content: content.replace(UNESCAPE_RE, '$1')
    });
  }

  state.pos = state.posMax + 1;
  state.posMax = max;
  return true;
}

// Process ^superscript^

// same as UNESCAPE_MD_RE plus a space
var UNESCAPE_RE$1 = /\\([ \\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;

function sup(state, silent) {
  var found,
      content,
      max = state.posMax,
      start = state.pos;

  if (state.src.charCodeAt(start) !== 0x5E/* ^ */) { return false; }
  if (silent) { return false; } // don't run any pairs in validation mode
  if (start + 2 >= max) { return false; }
  if (state.level >= state.options.maxNesting) { return false; }

  state.pos = start + 1;

  while (state.pos < max) {
    if (state.src.charCodeAt(state.pos) === 0x5E/* ^ */) {
      found = true;
      break;
    }

    state.parser.skipToken(state);
  }

  if (!found || start + 1 === state.pos) {
    state.pos = start;
    return false;
  }

  content = state.src.slice(start + 1, state.pos);

  // don't allow unescaped spaces/newlines inside
  if (content.match(/(^|[^\\])(\\\\)*\s/)) {
    state.pos = start;
    return false;
  }

  // found!
  state.posMax = state.pos;
  state.pos = start + 1;

  if (!silent) {
    state.push({
      type: 'sup',
      level: state.level,
      content: content.replace(UNESCAPE_RE$1, '$1')
    });
  }

  state.pos = state.posMax + 1;
  state.posMax = max;
  return true;
}

// Process [links](<to> "stuff")


function links(state, silent) {
  var labelStart,
      labelEnd,
      label,
      href,
      title,
      pos,
      ref,
      code,
      isImage = false,
      oldPos = state.pos,
      max = state.posMax,
      start = state.pos,
      marker = state.src.charCodeAt(start);

  if (marker === 0x21/* ! */) {
    isImage = true;
    marker = state.src.charCodeAt(++start);
  }

  if (marker !== 0x5B/* [ */) { return false; }
  if (state.level >= state.options.maxNesting) { return false; }

  labelStart = start + 1;
  labelEnd = parseLinkLabel(state, start);

  // parser failed to find ']', so it's not a valid link
  if (labelEnd < 0) { return false; }

  pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {
    //
    // Inline link
    //

    // [link](  <href>  "title"  )
    //        ^^ skipping these spaces
    pos++;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (code !== 0x20 && code !== 0x0A) { break; }
    }
    if (pos >= max) { return false; }

    // [link](  <href>  "title"  )
    //          ^^^^^^ parsing link destination
    start = pos;
    if (parseLinkDestination(state, pos)) {
      href = state.linkContent;
      pos = state.pos;
    } else {
      href = '';
    }

    // [link](  <href>  "title"  )
    //                ^^ skipping these spaces
    start = pos;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (code !== 0x20 && code !== 0x0A) { break; }
    }

    // [link](  <href>  "title"  )
    //                  ^^^^^^^ parsing link title
    if (pos < max && start !== pos && parseLinkTitle(state, pos)) {
      title = state.linkContent;
      pos = state.pos;

      // [link](  <href>  "title"  )
      //                         ^^ skipping these spaces
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (code !== 0x20 && code !== 0x0A) { break; }
      }
    } else {
      title = '';
    }

    if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
      state.pos = oldPos;
      return false;
    }
    pos++;
  } else {
    //
    // Link reference
    //

    // do not allow nested reference links
    if (state.linkLevel > 0) { return false; }

    // [foo]  [bar]
    //      ^^ optional whitespace (can include newlines)
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (code !== 0x20 && code !== 0x0A) { break; }
    }

    if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
      start = pos + 1;
      pos = parseLinkLabel(state, pos);
      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = start - 1;
      }
    }

    // covers label === '' and label === undefined
    // (collapsed reference link and shortcut reference link respectively)
    if (!label) {
      if (typeof label === 'undefined') {
        pos = labelEnd + 1;
      }
      label = state.src.slice(labelStart, labelEnd);
    }

    ref = state.env.references[normalizeReference(label)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }

  //
  // We found the end of the link, and know for a fact it's a valid link;
  // so all that's left to do is to call tokenizer.
  //
  if (!silent) {
    state.pos = labelStart;
    state.posMax = labelEnd;

    if (isImage) {
      state.push({
        type: 'image',
        src: href,
        title: title,
        alt: state.src.substr(labelStart, labelEnd - labelStart),
        level: state.level
      });
    } else {
      state.push({
        type: 'link_open',
        href: href,
        title: title,
        level: state.level++
      });
      state.linkLevel++;
      state.parser.tokenize(state);
      state.linkLevel--;
      state.push({ type: 'link_close', level: --state.level });
    }
  }

  state.pos = pos;
  state.posMax = max;
  return true;
}

// Process inline footnotes (^[...])


function footnote_inline(state, silent) {
  var labelStart,
      labelEnd,
      footnoteId,
      oldLength,
      max = state.posMax,
      start = state.pos;

  if (start + 2 >= max) { return false; }
  if (state.src.charCodeAt(start) !== 0x5E/* ^ */) { return false; }
  if (state.src.charCodeAt(start + 1) !== 0x5B/* [ */) { return false; }
  if (state.level >= state.options.maxNesting) { return false; }

  labelStart = start + 2;
  labelEnd = parseLinkLabel(state, start + 1);

  // parser failed to find ']', so it's not a valid note
  if (labelEnd < 0) { return false; }

  // We found the end of the link, and know for a fact it's a valid link;
  // so all that's left to do is to call tokenizer.
  //
  if (!silent) {
    if (!state.env.footnotes) { state.env.footnotes = {}; }
    if (!state.env.footnotes.list) { state.env.footnotes.list = []; }
    footnoteId = state.env.footnotes.list.length;

    state.pos = labelStart;
    state.posMax = labelEnd;

    state.push({
      type: 'footnote_ref',
      id: footnoteId,
      level: state.level
    });
    state.linkLevel++;
    oldLength = state.tokens.length;
    state.parser.tokenize(state);
    state.env.footnotes.list[footnoteId] = { tokens: state.tokens.splice(oldLength) };
    state.linkLevel--;
  }

  state.pos = labelEnd + 1;
  state.posMax = max;
  return true;
}

// Process footnote references ([^...])

function footnote_ref(state, silent) {
  var label,
      pos,
      footnoteId,
      footnoteSubId,
      max = state.posMax,
      start = state.pos;

  // should be at least 4 chars - "[^x]"
  if (start + 3 > max) { return false; }

  if (!state.env.footnotes || !state.env.footnotes.refs) { return false; }
  if (state.src.charCodeAt(start) !== 0x5B/* [ */) { return false; }
  if (state.src.charCodeAt(start + 1) !== 0x5E/* ^ */) { return false; }
  if (state.level >= state.options.maxNesting) { return false; }

  for (pos = start + 2; pos < max; pos++) {
    if (state.src.charCodeAt(pos) === 0x20) { return false; }
    if (state.src.charCodeAt(pos) === 0x0A) { return false; }
    if (state.src.charCodeAt(pos) === 0x5D /* ] */) {
      break;
    }
  }

  if (pos === start + 2) { return false; } // no empty footnote labels
  if (pos >= max) { return false; }
  pos++;

  label = state.src.slice(start + 2, pos - 1);
  if (typeof state.env.footnotes.refs[':' + label] === 'undefined') { return false; }

  if (!silent) {
    if (!state.env.footnotes.list) { state.env.footnotes.list = []; }

    if (state.env.footnotes.refs[':' + label] < 0) {
      footnoteId = state.env.footnotes.list.length;
      state.env.footnotes.list[footnoteId] = { label: label, count: 0 };
      state.env.footnotes.refs[':' + label] = footnoteId;
    } else {
      footnoteId = state.env.footnotes.refs[':' + label];
    }

    footnoteSubId = state.env.footnotes.list[footnoteId].count;
    state.env.footnotes.list[footnoteId].count++;

    state.push({
      type: 'footnote_ref',
      id: footnoteId,
      subId: footnoteSubId,
      level: state.level
    });
  }

  state.pos = pos;
  state.posMax = max;
  return true;
}

// List of valid url schemas, accorting to commonmark spec
// http://jgm.github.io/CommonMark/spec.html#autolinks

var url_schemas = [
  'coap',
  'doi',
  'javascript',
  'aaa',
  'aaas',
  'about',
  'acap',
  'cap',
  'cid',
  'crid',
  'data',
  'dav',
  'dict',
  'dns',
  'file',
  'ftp',
  'geo',
  'go',
  'gopher',
  'h323',
  'http',
  'https',
  'iax',
  'icap',
  'im',
  'imap',
  'info',
  'ipp',
  'iris',
  'iris.beep',
  'iris.xpc',
  'iris.xpcs',
  'iris.lwz',
  'ldap',
  'mailto',
  'mid',
  'msrp',
  'msrps',
  'mtqp',
  'mupdate',
  'news',
  'nfs',
  'ni',
  'nih',
  'nntp',
  'opaquelocktoken',
  'pop',
  'pres',
  'rtsp',
  'service',
  'session',
  'shttp',
  'sieve',
  'sip',
  'sips',
  'sms',
  'snmp',
  'soap.beep',
  'soap.beeps',
  'tag',
  'tel',
  'telnet',
  'tftp',
  'thismessage',
  'tn3270',
  'tip',
  'tv',
  'urn',
  'vemmi',
  'ws',
  'wss',
  'xcon',
  'xcon-userid',
  'xmlrpc.beep',
  'xmlrpc.beeps',
  'xmpp',
  'z39.50r',
  'z39.50s',
  'adiumxtra',
  'afp',
  'afs',
  'aim',
  'apt',
  'attachment',
  'aw',
  'beshare',
  'bitcoin',
  'bolo',
  'callto',
  'chrome',
  'chrome-extension',
  'com-eventbrite-attendee',
  'content',
  'cvs',
  'dlna-playsingle',
  'dlna-playcontainer',
  'dtn',
  'dvb',
  'ed2k',
  'facetime',
  'feed',
  'finger',
  'fish',
  'gg',
  'git',
  'gizmoproject',
  'gtalk',
  'hcp',
  'icon',
  'ipn',
  'irc',
  'irc6',
  'ircs',
  'itms',
  'jar',
  'jms',
  'keyparc',
  'lastfm',
  'ldaps',
  'magnet',
  'maps',
  'market',
  'message',
  'mms',
  'ms-help',
  'msnim',
  'mumble',
  'mvn',
  'notes',
  'oid',
  'palm',
  'paparazzi',
  'platform',
  'proxy',
  'psyc',
  'query',
  'res',
  'resource',
  'rmi',
  'rsync',
  'rtmp',
  'secondlife',
  'sftp',
  'sgn',
  'skype',
  'smb',
  'soldat',
  'spotify',
  'ssh',
  'steam',
  'svn',
  'teamspeak',
  'things',
  'udp',
  'unreal',
  'ut2004',
  'ventrilo',
  'view-source',
  'webcal',
  'wtai',
  'wyciwyg',
  'xfire',
  'xri',
  'ymsgr'
];

// Process autolinks '<protocol:...>'


/*eslint max-len:0*/
var EMAIL_RE    = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;
var AUTOLINK_RE = /^<([a-zA-Z.\-]{1,25}):([^<>\x00-\x20]*)>/;


function autolink(state, silent) {
  var tail, linkMatch, emailMatch, url, fullUrl, pos = state.pos;

  if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false; }

  tail = state.src.slice(pos);

  if (tail.indexOf('>') < 0) { return false; }

  linkMatch = tail.match(AUTOLINK_RE);

  if (linkMatch) {
    if (url_schemas.indexOf(linkMatch[1].toLowerCase()) < 0) { return false; }

    url = linkMatch[0].slice(1, -1);
    fullUrl = normalizeLink(url);
    if (!state.parser.validateLink(url)) { return false; }

    if (!silent) {
      state.push({
        type: 'link_open',
        href: fullUrl,
        level: state.level
      });
      state.push({
        type: 'text',
        content: url,
        level: state.level + 1
      });
      state.push({ type: 'link_close', level: state.level });
    }

    state.pos += linkMatch[0].length;
    return true;
  }

  emailMatch = tail.match(EMAIL_RE);

  if (emailMatch) {

    url = emailMatch[0].slice(1, -1);

    fullUrl = normalizeLink('mailto:' + url);
    if (!state.parser.validateLink(fullUrl)) { return false; }

    if (!silent) {
      state.push({
        type: 'link_open',
        href: fullUrl,
        level: state.level
      });
      state.push({
        type: 'text',
        content: url,
        level: state.level + 1
      });
      state.push({ type: 'link_close', level: state.level });
    }

    state.pos += emailMatch[0].length;
    return true;
  }

  return false;
}

// Regexps to match html elements

function replace$1(regex, options) {
  regex = regex.source;
  options = options || '';

  return function self(name, val) {
    if (!name) {
      return new RegExp(regex, options);
    }
    val = val.source || val;
    regex = regex.replace(name, val);
    return self;
  };
}


var attr_name     = /[a-zA-Z_:][a-zA-Z0-9:._-]*/;

var unquoted      = /[^"'=<>`\x00-\x20]+/;
var single_quoted = /'[^']*'/;
var double_quoted = /"[^"]*"/;

/*eslint no-spaced-func:0*/
var attr_value  = replace$1(/(?:unquoted|single_quoted|double_quoted)/)
                    ('unquoted', unquoted)
                    ('single_quoted', single_quoted)
                    ('double_quoted', double_quoted)
                    ();

var attribute   = replace$1(/(?:\s+attr_name(?:\s*=\s*attr_value)?)/)
                    ('attr_name', attr_name)
                    ('attr_value', attr_value)
                    ();

var open_tag    = replace$1(/<[A-Za-z][A-Za-z0-9]*attribute*\s*\/?>/)
                    ('attribute', attribute)
                    ();

var close_tag   = /<\/[A-Za-z][A-Za-z0-9]*\s*>/;
var comment     = /<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->/;
var processing  = /<[?].*?[?]>/;
var declaration = /<![A-Z]+\s+[^>]*>/;
var cdata       = /<!\[CDATA\[[\s\S]*?\]\]>/;

var HTML_TAG_RE = replace$1(/^(?:open_tag|close_tag|comment|processing|declaration|cdata)/)
  ('open_tag', open_tag)
  ('close_tag', close_tag)
  ('comment', comment)
  ('processing', processing)
  ('declaration', declaration)
  ('cdata', cdata)
  ();

// Process html tags


function isLetter$2(ch) {
  /*eslint no-bitwise:0*/
  var lc = ch | 0x20; // to lower case
  return (lc >= 0x61/* a */) && (lc <= 0x7a/* z */);
}


function htmltag(state, silent) {
  var ch, match, max, pos = state.pos;

  if (!state.options.html) { return false; }

  // Check start
  max = state.posMax;
  if (state.src.charCodeAt(pos) !== 0x3C/* < */ ||
      pos + 2 >= max) {
    return false;
  }

  // Quick fail on second char
  ch = state.src.charCodeAt(pos + 1);
  if (ch !== 0x21/* ! */ &&
      ch !== 0x3F/* ? */ &&
      ch !== 0x2F/* / */ &&
      !isLetter$2(ch)) {
    return false;
  }

  match = state.src.slice(pos).match(HTML_TAG_RE);
  if (!match) { return false; }

  if (!silent) {
    state.push({
      type: 'htmltag',
      content: state.src.slice(pos, pos + match[0].length),
      level: state.level
    });
  }
  state.pos += match[0].length;
  return true;
}

// Process html entity - &#123;, &#xAF;, &quot;, ...


var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,8}|[0-9]{1,8}));/i;
var NAMED_RE   = /^&([a-z][a-z0-9]{1,31});/i;


function entity(state, silent) {
  var ch, code, match, pos = state.pos, max = state.posMax;

  if (state.src.charCodeAt(pos) !== 0x26/* & */) { return false; }

  if (pos + 1 < max) {
    ch = state.src.charCodeAt(pos + 1);

    if (ch === 0x23 /* # */) {
      match = state.src.slice(pos).match(DIGITAL_RE);
      if (match) {
        if (!silent) {
          code = match[1][0].toLowerCase() === 'x' ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
          state.pending += isValidEntityCode(code) ? fromCodePoint(code) : fromCodePoint(0xFFFD);
        }
        state.pos += match[0].length;
        return true;
      }
    } else {
      match = state.src.slice(pos).match(NAMED_RE);
      if (match) {
        var decoded = decodeEntity(match[1]);
        if (match[1] !== decoded) {
          if (!silent) { state.pending += decoded; }
          state.pos += match[0].length;
          return true;
        }
      }
    }
  }

  if (!silent) { state.pending += '&'; }
  state.pos++;
  return true;
}

/**
 * Inline Parser `rules`
 */

var _rules$2 = [
  [ 'text',            text ],
  [ 'newline',         newline ],
  [ 'escape',          escape ],
  [ 'backticks',       backticks ],
  [ 'del',             del ],
  [ 'ins',             ins ],
  [ 'mark',            mark ],
  [ 'emphasis',        emphasis ],
  [ 'sub',             sub ],
  [ 'sup',             sup ],
  [ 'links',           links ],
  [ 'footnote_inline', footnote_inline ],
  [ 'footnote_ref',    footnote_ref ],
  [ 'autolink',        autolink ],
  [ 'htmltag',         htmltag ],
  [ 'entity',          entity ]
];

/**
 * Inline Parser class. Note that link validation is stricter
 * in Remarkable than what is specified by CommonMark. If you
 * want to change this you can use a custom validator.
 *
 * @api private
 */

function ParserInline() {
  this.ruler = new Ruler();
  for (var i = 0; i < _rules$2.length; i++) {
    this.ruler.push(_rules$2[i][0], _rules$2[i][1]);
  }

  // Can be overridden with a custom validator
  this.validateLink = validateLink;
}

/**
 * Skip a single token by running all rules in validation mode.
 * Returns `true` if any rule reports success.
 *
 * @param  {Object} `state`
 * @api privage
 */

ParserInline.prototype.skipToken = function (state) {
  var rules = this.ruler.getRules('');
  var len = rules.length;
  var pos = state.pos;
  var i, cached_pos;

  if ((cached_pos = state.cacheGet(pos)) > 0) {
    state.pos = cached_pos;
    return;
  }

  for (i = 0; i < len; i++) {
    if (rules[i](state, true)) {
      state.cacheSet(pos, state.pos);
      return;
    }
  }

  state.pos++;
  state.cacheSet(pos, state.pos);
};

/**
 * Generate tokens for the given input range.
 *
 * @param  {Object} `state`
 * @api private
 */

ParserInline.prototype.tokenize = function (state) {
  var rules = this.ruler.getRules('');
  var len = rules.length;
  var end = state.posMax;
  var ok, i;

  while (state.pos < end) {

    // Try all possible rules.
    // On success, the rule should:
    //
    // - update `state.pos`
    // - update `state.tokens`
    // - return true
    for (i = 0; i < len; i++) {
      ok = rules[i](state, false);

      if (ok) {
        break;
      }
    }

    if (ok) {
      if (state.pos >= end) { break; }
      continue;
    }

    state.pending += state.src[state.pos++];
  }

  if (state.pending) {
    state.pushPending();
  }
};

/**
 * Parse the given input string.
 *
 * @param  {String} `str`
 * @param  {Object} `options`
 * @param  {Object} `env`
 * @param  {Array} `outTokens`
 * @api private
 */

ParserInline.prototype.parse = function (str, options, env, outTokens) {
  var state = new StateInline(str, this, options, env, outTokens);
  this.tokenize(state);
};

/**
 * Validate the given `url` by checking for bad protocols.
 *
 * @param  {String} `url`
 * @return {Boolean}
 */

function validateLink(url) {
  var BAD_PROTOCOLS = [ 'vbscript', 'javascript', 'file', 'data' ];
  var str = url.trim().toLowerCase();
  // Care about digital entities "javascript&#x3A;alert(1)"
  str = replaceEntities(str);
  if (str.indexOf(':') !== -1 && BAD_PROTOCOLS.indexOf(str.split(':')[0]) !== -1) {
    return false;
  }
  return true;
}

// Remarkable default options

var defaultConfig = {
  options: {
    html:         false,        // Enable HTML tags in source
    xhtmlOut:     false,        // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkTarget:   '',           // set target to open link in

    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: '“”‘’',

    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,

    maxNesting:   20            // Internal protection, recursion limit
  },

  components: {

    core: {
      rules: [
        'block',
        'inline',
        'references',
        'replacements',
        'smartquotes',
        'references',
        'abbr2',
        'footnote_tail'
      ]
    },

    block: {
      rules: [
        'blockquote',
        'code',
        'fences',
        'footnote',
        'heading',
        'hr',
        'htmlblock',
        'lheading',
        'list',
        'paragraph',
        'table'
      ]
    },

    inline: {
      rules: [
        'autolink',
        'backticks',
        'del',
        'emphasis',
        'entity',
        'escape',
        'footnote_ref',
        'htmltag',
        'links',
        'newline',
        'text'
      ]
    }
  }
};

// Remarkable default options

var fullConfig = {
  options: {
    html:         false,        // Enable HTML tags in source
    xhtmlOut:     false,        // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkTarget:   '',           // set target to open link in

    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes:       '“”‘’',

    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight:     null,

    maxNesting:    20            // Internal protection, recursion limit
  },

  components: {
    // Don't restrict core/block/inline rules
    core: {},
    block: {},
    inline: {}
  }
};

// Commonmark default options

var commonmarkConfig = {
  options: {
    html:         true,         // Enable HTML tags in source
    xhtmlOut:     true,         // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkTarget:   '',           // set target to open link in

    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: '“”‘’',

    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,

    maxNesting:   20            // Internal protection, recursion limit
  },

  components: {

    core: {
      rules: [
        'block',
        'inline',
        'references',
        'abbr2'
      ]
    },

    block: {
      rules: [
        'blockquote',
        'code',
        'fences',
        'heading',
        'hr',
        'htmlblock',
        'lheading',
        'list',
        'paragraph'
      ]
    },

    inline: {
      rules: [
        'autolink',
        'backticks',
        'emphasis',
        'entity',
        'escape',
        'htmltag',
        'links',
        'newline',
        'text'
      ]
    }
  }
};

/**
 * Preset configs
 */

var config = {
  'default': defaultConfig,
  'full': fullConfig,
  'commonmark': commonmarkConfig
};

/**
 * The `StateCore` class manages state.
 *
 * @param {Object} `instance` Remarkable instance
 * @param {String} `str` Markdown string
 * @param {Object} `env`
 */

function StateCore(instance, str, env) {
  this.src = str;
  this.env = env;
  this.options = instance.options;
  this.tokens = [];
  this.inlineMode = false;

  this.inline = instance.inline;
  this.block = instance.block;
  this.renderer = instance.renderer;
  this.typographer = instance.typographer;
}

/**
 * The main `Remarkable` class. Create an instance of
 * `Remarkable` with a `preset` and/or `options`.
 *
 * @param {String} `preset` If no preset is given, `default` is used.
 * @param {Object} `options`
 */

function Remarkable(preset, options) {
  if (typeof preset !== 'string') {
    options = preset;
    preset = 'default';
  }

  if (options && options.linkify != null) {
    console.warn(
      'linkify option is removed. Use linkify plugin instead:\n\n' +
      'import Remarkable from \'remarkable\';\n' +
      'import linkify from \'remarkable/linkify\';\n' +
      'new Remarkable().use(linkify)\n'
    );
  }

  this.inline   = new ParserInline();
  this.block    = new ParserBlock();
  this.core     = new Core();
  this.renderer = new Renderer();
  this.ruler    = new Ruler();

  this.options  = {};
  this.configure(config[preset]);
  this.set(options || {});
}

/**
 * Set options as an alternative to passing them
 * to the constructor.
 *
 * ```js
 * md.set({typographer: true});
 * ```
 * @param {Object} `options`
 * @api public
 */

Remarkable.prototype.set = function (options) {
  assign(this.options, options);
};

/**
 * Batch loader for components rules states, and options
 *
 * @param  {Object} `presets`
 */

Remarkable.prototype.configure = function (presets) {
  var self = this;

  if (!presets) { throw new Error('Wrong `remarkable` preset, check name/content'); }
  if (presets.options) { self.set(presets.options); }
  if (presets.components) {
    Object.keys(presets.components).forEach(function (name) {
      if (presets.components[name].rules) {
        self[name].ruler.enable(presets.components[name].rules, true);
      }
    });
  }
};

/**
 * Use a plugin.
 *
 * ```js
 * var md = new Remarkable();
 *
 * md.use(plugin1)
 *   .use(plugin2, opts)
 *   .use(plugin3);
 * ```
 *
 * @param  {Function} `plugin`
 * @param  {Object} `options`
 * @return {Object} `Remarkable` for chaining
 */

Remarkable.prototype.use = function (plugin, options) {
  plugin(this, options);
  return this;
};


/**
 * Parse the input `string` and return a tokens array.
 * Modifies `env` with definitions data.
 *
 * @param  {String} `string`
 * @param  {Object} `env`
 * @return {Array} Array of tokens
 */

Remarkable.prototype.parse = function (str, env) {
  var state = new StateCore(this, str, env);
  this.core.process(state);
  return state.tokens;
};

/**
 * The main `.render()` method that does all the magic :)
 *
 * @param  {String} `string`
 * @param  {Object} `env`
 * @return {String} Rendered HTML.
 */

Remarkable.prototype.render = function (str, env) {
  env = env || {};
  return this.renderer.render(this.parse(str, env), this.options, env);
};

/**
 * Parse the given content `string` as a single string.
 *
 * @param  {String} `string`
 * @param  {Object} `env`
 * @return {Array} Array of tokens
 */

Remarkable.prototype.parseInline = function (str, env) {
  var state = new StateCore(this, str, env);
  state.inlineMode = true;
  this.core.process(state);
  return state.tokens;
};

/**
 * Render a single content `string`, without wrapping it
 * to paragraphs
 *
 * @param  {String} `str`
 * @param  {Object} `env`
 * @return {String}
 */

Remarkable.prototype.renderInline = function (str, env) {
  env = env || {};
  return this.renderer.render(this.parseInline(str, env), this.options, env);
};




/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class Bilibili {
  constructor(config) {
    // this.skipReadImage = true
    this.config = config
    this.name = 'bilibili'
  }

  async getMetaData() {
    var res = await $.ajax({
      url: 'https://api.bilibili.com/x/web-interface/nav?build=0&mobi_app=web',
    })
    // console.log(res);
    return {
      uid: res.data.mid,
      title: res.data.uname,
      avatar: res.data.face,
      supportTypes: ['html'],
      type: 'bilibili',
      displayName: '哔哩哔哩',
      home: 'https://member.bilibili.com/platform/upload/text',
      icon: 'https://www.bilibili.com/favicon.ico',
    }
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {
    // var pgc_feed_covers = []
    // if (post.post_thumbnail_raw && post.post_thumbnail_raw.images) {
    //   pgc_feed_covers.push({
    //     id: 0,
    //     url: post.post_thumbnail_raw.url,
    //     uri: post.post_thumbnail_raw.images[0].origin_web_uri,
    //     origin_uri: post.post_thumbnail_raw.images[0].origin_web_uri,
    //     ic_uri: '',
    //     thumb_width: post.post_thumbnail_raw.images[0].width,
    //     thumb_height: post.post_thumbnail_raw.images[0].height,
    //   })
    // }

    var csrf = this.config.state.csrf;
    var res = await $.ajax({
      url: 'https://api.bilibili.com/x/article/creative/draft/addupdate',
      type: 'POST',
      dataType: 'JSON',
      data: {
        tid: 4,
        title: post.post_title,
        save: 0,
        pgc_id: 0,
        content: post.post_content,
        csrf: csrf,
        // pgc_feed_covers: JSON.stringify(pgc_feed_covers),
      },
    })

    if (!res.data) {
      throw new Error(res.message)
    }

    return {
      status: 'success',
      post_id: res.data.aid,
      draftLink:
        'https://member.bilibili.com/platform/upload/text/edit?aid=' +
        res.data.aid,
    }
  }


  async uploadFile(file) {
    var src = file.src
    var csrf = this.config.state.csrf
    
    var uploadUrl ='https://api.bilibili.com/x/article/creative/article/upcover'  
    var file = new File([file.bits], 'temp', {
      type: file.type,
    })
    var formdata = new FormData()
    formdata.append('binary', file)
    formdata.append('csrf', csrf)
    var res = await axios({
      url: uploadUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (res.data.code != 0) {
      throw new Error('图片上传失败 ' + src)
    }
    // http only
    console.log('uploadFile', res)
    var id = Math.floor(Math.random() * 100000)
    return [
      {
        id: id,
        object_key: id,
        url: res.data.data.url,
        size: res.data.data.size,
        // images: [res.data],
      },
    ]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    div.html(post.content)
    // var org = $(post.content);
    // var doc = $('<div>').append(org.clone());
    var doc = div
    var pres = doc.find('a')
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        pre.after(pre.html()).remove()
      } catch (e) {}
    }

    var pres = doc.find('iframe')
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        pre.remove()
      } catch (e) {}
    }

    try {
      const images = doc.find('img')
      for (let index = 0; index < images.length; index++) {
        const image = images.eq(index)
        const imgSrc = image.attr('src')
        if (imgSrc && imgSrc.indexOf('.svg') > -1) {
          console.log('remove svg Image')
          image.remove()
        }
      }
      const qqm = doc.find('qqmusic')
      qqm.next().remove()
      qqm.remove()
    } catch (e) {}

    post.content = $('<div>')
      .append(doc.clone())
      .html()
    console.log('post', post)
  }

  editImg(img, source) {
    img.attr('size', source.size)
  }
  //   <img class="" src="http://p2.pstatp.com/large/pgc-image/bc0a9fc8e595453083d85deb947c3d6e" data-ic="false" data-ic-uri="" data-height="1333" data-width="1000" image_type="1" web_uri="pgc-image/bc0a9fc8e595453083d85deb947c3d6e" img_width="1000" img_height="1333"></img>
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Bilibili;



/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var _cacheMeta = null

class B51Cto {
  constructor(config) {
    // this.skipReadImage = true
    this.config = config
    this.name = '51cto'
  }

  async getMetaData() {
    var res = await $.get('https://blog.51cto.com/blogger/publish')
    var parser = new DOMParser()
    var htmlDoc = parser.parseFromString(res, 'text/html')
    var img = htmlDoc.querySelector('li.more.user > a > img')
    var link = img.parentNode.href
    var pie = link.split('/')
    // pie.pop()
    var uid = pie.pop()
    console.log(link)
    var scrs = [].slice
      .call(htmlDoc.querySelectorAll('script'))
      .filter(_ => _.innerText.indexOf('sign') > -1)

    var uploadSign = null;
    if (scrs.length) {
      try {
        var dataStr = scrs[0].innerText
        var rawStr = dataStr.substring(
          dataStr.indexOf('sign'),
          dataStr.indexOf('uploadUrl', dataStr.indexOf('sign'))
        )
        var signStr = rawStr
          .replace('var', '')
          .trim()
          .replace("sign = '", '')
          .replace("';", '')
          .trim()
          uploadSign = signStr
      } catch (e) {
        console.log('51cto', e)
      }
    }
      _cacheMeta = {
        rawStr: rawStr,
        uploadSign: uploadSign,
        csrf: htmlDoc
          .querySelector('meta[name=csrf-token]')
          .getAttribute('content'),
      }
    console.log('51cto', _cacheMeta)
    return {
      uid: uid,
      title: uid,
      avatar: img.src,
      type: '51cto',
      displayName: '51CTO',
      supportTypes: ['markdown', 'html'],
      home: 'https://blog.51cto.com/blogger/publish',
      icon: 'https://blog.51cto.com/favicon.ico',
    }
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {
    // var pgc_feed_covers = []
    // if (post.post_thumbnail_raw && post.post_thumbnail_raw.images) {
    //   pgc_feed_covers.push({
    //     id: 0,
    //     url: post.post_thumbnail_raw.url,
    //     uri: post.post_thumbnail_raw.images[0].origin_web_uri,
    //     origin_uri: post.post_thumbnail_raw.images[0].origin_web_uri,
    //     ic_uri: '',
    //     thumb_width: post.post_thumbnail_raw.images[0].width,
    //     thumb_height: post.post_thumbnail_raw.images[0].height,
    //   })
    // }
    // var csrf = this.config.state.csrf
    var postStruct = {}

    if (post.markdown) {
      postStruct = {
        title: post.post_title,
        copy_code: 1,
        is_old: 0,
        content: post.markdown,
        _csrf: _cacheMeta.csrf,
      }
    } else {
      postStruct = {
        blog_type: null,
        title: post.post_title,
        copy_code: 1,
        content: post.post_content,
        pid: '',
        cate_id: '',
        custom_id: '',
        tag: '',
        abstract:'', 
        is_hide: 0,
        did: '',
        blog_id: '', 
        is_old: 1,
        _csrf: _cacheMeta.csrf,
        // editorValue: null,
      }
    }

    var res = await $.ajax({
      url: 'https://blog.51cto.com/blogger/draft',
      type: 'POST',
      dataType: 'JSON',
      data: postStruct,
    })

    if (!res.data) {
      throw new Error(res.message)
    }

    return {
      status: 'success',
      post_id: res.data.did,
      draftLink: 'https://blog.51cto.com/blogger/draft/' + res.data.did,
    }
  }

  async uploadFile(file) {
    var src = file.src
    // var csrf = this.config.state.csrf
    var uploadUrl = 'https://upload.51cto.com/index.php?c=upload&m=upimg&orig=b'
    var file = new File([file.bits], 'temp', {
      type: file.type,
    })
    var formdata = new FormData()

    formdata.append('sign', _cacheMeta.uploadSign)
    // formdata.append('file', file)
    formdata.append('file', file, new Date().getTime() + '.jpg')
    formdata.append('type', file.type)
    formdata.append('id', 'WU_FILE_1')
    formdata.append('fileid', `uploadm-` + Math.floor(Math.random() * 1000000))
    // formdata.append('name', new Date().getTime() + '.jpg')
    formdata.append('lastModifiedDate', new Date().toString())
    formdata.append('size', file.size)
    var res = await axios({
      url: uploadUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (res.data.status === false) {
      throw new Error('图片上传失败 ' + src)
    }
    // http only
    console.log('uploadFile', res)
    var id = Math.floor(Math.random() * 100000)
    return [
      {
        id: id,
        object_key: id,
        url: `https://s4.51cto.com/` + res.data.data,
        // size: res.data.data.size,
        // images: [res.data],
      },
    ]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    div.html(post.content)
    // var org = $(post.content);
    // var doc = $('<div>').append(org.clone());
    var doc = div
    var pres = doc.find('a')
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        pre.after(pre.html()).remove()
      } catch (e) {}
    }

    var pres = doc.find('iframe')
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        pre.remove()
      } catch (e) {}
    }

    try {
      const images = doc.find('img')
      for (let index = 0; index < images.length; index++) {
        const image = images.eq(index)
        const imgSrc = image.attr('src')
        if (imgSrc && imgSrc.indexOf('.svg') > -1) {
          console.log('remove svg Image')
          image.remove()
        }
      }
      const qqm = doc.find('qqmusic')
      qqm.next().remove()
      qqm.remove()
    } catch (e) {}

    post.content = $('<div>')
      .append(doc.clone())
      .html()
    console.log('post', post)
  }

  // editImg(img, source) {
  //   img.attr('size', source.size)
  // }
  //   <img class="" src="http://p2.pstatp.com/large/pgc-image/bc0a9fc8e595453083d85deb947c3d6e" data-ic="false" data-ic-uri="" data-height="1333" data-width="1000" image_type="1" web_uri="pgc-image/bc0a9fc8e595453083d85deb947c3d6e" img_width="1000" img_height="1333"></img>
}
/* harmony export (immutable) */ __webpack_exports__["a"] = B51Cto;



/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

class FocusDriver {
  constructor() {
    this.name = 'weibo'
  }

  async getMetaData() {
    var res = await $.get('https://mp-fe-pc.focus.cn//user/status?')
    return {
        uid: res.data.uid,
        title: res.data.accountName,
        avatar: null,
        supportTypes: ['html'],
        displayName: '搜狐焦点',
        type: 'sohufocus',
        home: 'https://mp.focus.cn/fe/index.html#/info/draft',
        icon: 'https://mp.focus.cn/favicon.ico',
      }
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }


  async preEditPost(post) {
    // var div = $('<div>');
    // $('body').append(div);
    // div.html(post.content);

    // // var doc = div;
    // // doc.clone()
    // var documentClone = document.cloneNode(true);
    // var article = new Readability(documentClone).parse();

    // div.remove();
    // console.log(article);
    var rexp = new RegExp('>[\ts ]*<', 'g')
    var result = post.content.replace(rexp, '><')
    post.content = result
  }

  async editPost(post_id, post) {
    var res = await axios.post('https://mp-fe-pc.focus.cn/news/info/publishNewsInfo', {
        "projectIds": [],
        "newsBasic": {
          "id": "",
          "cityId": 0,
          "title": post.post_title,
          "category": 1,
          "headImg": "",
          "newsAbstract": "",
          "isGuide": 0,
          "status": 4
        },
        "newsContent": {
          "content": post.post_content
        },
        "videoIds": []
    })
    // console.log(res)
    var aId = res.data.data.id
    return {
      status: 'success',
      post_id: aId,
      draftLink: 'https://mp.focus.cn/fe/index.html#/info/subinfo/' + aId,
    }
  }

  async uploadFile(file) {
    var formdata = new FormData()
    var blob = new Blob([file.bits], {
        type: file.type
    });

    formdata.append('image', blob, new Date().getTime() + '.jpg')
    var res = await axios({
      url: `https://mp-fe-pc.focus.cn/common/image/upload?type=2`,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
   
    if(res.data.code != 200) {
      console.log(res.data);
      throw new Error('upload failed')
    }
    var url = `https://t-img.51f.com/sh740wsh${res.data.data}`
    return [
      {
        id: res.data.data,
        object_key: res.data.data,
        url: url,
      },
    ]
  }

}
/* harmony export (immutable) */ __webpack_exports__["a"] = FocusDriver;



/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// https://www.51hanghai.com/portal.php?mod=portalcp&ac=article
var _cacheMeta = null;

class Discuz {
  constructor(config) {
    this.config = config || {}
    var url = this.config.url
    this.pubUrl = `${url}/portal.php?mod=portalcp&ac=article`
    // this.upUrl = `${url}/misc.php?mod=swfupload&action=swfupload&operation=portal`
    this.upUrl = `${url}/misc.php?mod=swfupload&action=swfupload&operation=upload`
    this.name = 'discuz'
    
    // this.skipReadImage = true
  }

  async getMetaData() {
    var url = this.config.url;
    console.log('disduz', this.config)
    var postUrl = `${url}/portal.php?mod=portalcp&ac=article`
    var favIcon = `${url}/favicon.ico`
    var res = await $.get(postUrl)
    var parser = new DOMParser()
    var htmlDoc = parser.parseFromString(res, 'text/html')
    var nickname = htmlDoc.querySelector('.vwmy').innerText
    var img = htmlDoc.querySelector('.avt img').src

    _cacheMeta = {
      uid: img.split('uid=')[1].split('&size')[0],
      title: nickname,
      avatar: img,
      type: 'discuz',
      displayName: 'Discuz',
      supportTypes: ['html'],
      config: this.config,
      home: postUrl,
      icon: favIcon,
    }

    var uploadSrciptBlocks = [].slice.apply(htmlDoc.querySelectorAll('script')).filter(_ => _.innerText.indexOf('SWFUpload') > -1);
    if(uploadSrciptBlocks.length) {
      var scripText = uploadSrciptBlocks[0].innerText
      var startTag = 'post_params:'
      var strIndex =  scripText.indexOf(startTag)
      var dataStr = scripText.substring(strIndex + startTag.length, scripText.indexOf('},', strIndex) + 1);
      var post_params = new Function(
        'var config = ' +
        dataStr +
          '; return config;'
      )();
      _cacheMeta.uploadToken = post_params.hash
      _cacheMeta.raw = post_params
    }
    // var parser = new DOMParser()
    // var htmlDoc = parser.parseFromString(res, 'text/html')
    // var img = htmlDoc.querySelector('li.more.user > a > img')
    return _cacheMeta
  }

  async addPost(post) {
    return {
      status: 'success',
      post_id: 0,
    }
  }

  async editPost(post_id, post) {
    var postStruct = {}

    if (post.markdown) {
      postStruct = {
        title: post.post_title,
        catid: 24,
        content: post.markdown,
        romotepic: 1,
      }
    } else {
      postStruct = {
        title: post.post_title,
        catid: 24,
        romotepic: 1,
        content: post.post_content,
      }
    }

    // title: test
    // highlight_style[0]: 
    // highlight_style[1]: 
    // highlight_style[2]: 
    // highlight_style[3]: 
    // htmlname: 
    // oldhtmlname: 
    // pagetitle: 
    // catid: 24
    // from: 
    postStruct.fromurl = null
    postStruct.dateline = null
    postStruct.from_idtyp = `tid`
    postStruct.from_id = 0
    postStruct.id = 0
    postStruct.idtype = `tid`;
    postStruct.url = null; 
    postStruct.author = null;
    // conver: a:3:{s:3:"pic";s:0:"";s:5:"thumb";i:0;s:6:"remote";i:0;}
    // file: (binary)
    // file: (binary)
    // content: test
    // romotepic: 1
    // summary: 
    // aid: 
    // cid: 
    // attach_ids: 
    // articlesubmit: true
    postStruct.articlesubmit = true;
    postStruct.formhash = `caa4c6cb`
    postStruct.conver = `a:3:{s:3:"pic";s:0:"";s:5:"thumb";i:0;s:6:"remote";i:0;}`;
    // var res = await $.ajax({
    //   url: this.pubUrl,
    //   type: 'POST',
    //   dataType: 'JSON',
    //   data: postStruct,
    // })
    // if (!res.data) {
    //   throw new Error(res.message)
    // }
    setCache('discuz_cache', JSON.stringify(postStruct))

    return {
      status: 'success',
      post_id: 0,
      draftLink: `${this.config.url}/forum.php?mod=guide&view=my&loaddraft`,
    }
  }

  async uploadFile(file) {
    var id = Date.now() + Math.floor(Math.random()* 1000);
    return [
      {
        id: id,
        object_key: id,
        url: file.src,
      },
    ]
    var src = file.src
    // var file = new File([file.bits], 'temp', {
    //   type: file.type,
    // })
    var blob = new Blob([file.bits], {
      type: file.type,
    })
    var formdata = new FormData()

    formdata.append('uid', _cacheMeta.uid)
    formdata.append('hash', _cacheMeta.uploadToken)
    formdata.append('filetype', '.jpg')
    formdata.append('type', 'image')
    formdata.append('aid', '0')
    // formdata.append('catid', '19')
    // formdata.append('Filedata', blob)
    formdata.append('Filedata', blob, new Date().getTime() + '.jpg')
    formdata.append('size', blob.size)
    formdata.append('id', 'WU_FILE_1')
    var res = await axios({
      url: this.upUrl,
      method: 'post',
      data: formdata,
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    var imageHtmlRes = await axios.get(`${this.config.url}/forum.php?mod=ajax&action=imagelist&type=single&pid=0&aids=` + res.data)
    var parser = new DOMParser()
    var htmlDoc = parser.parseFromString(imageHtmlRes.data, 'text/html')
    var imgSrc = `${this.config.url}/` + htmlDoc.querySelector("img").getAttribute('src')
    console.log('upload.res', imageHtmlRes)
    var imageId = Date.now() +Math.floor( Math.random() * 10);
    // if (res.data.aid === false) {
    //   throw new Error('图片上传失败 ' + src)
    // }
    // http only
    console.log('uploadFile', res)
    return [
       {
        id: imageId,
        object_key: imageId,
        url: imgSrc
      },
      // {
      //   id: res.data.aid,
      //   object_key: res.data.aid,
      //   url: res.data.bigimg,
      //   // size: res.data.data.size,
      //   // images: [res.data],
      // },
    ]
  }

  async preEditPost(post) {
    var div = $('<div>')
    $('body').append(div)

    div.html(post.content)
    // var org = $(post.content);
    // var doc = $('<div>').append(org.clone());
    var doc = div
    var pres = doc.find('a')
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        pre.after(pre.html()).remove()
      } catch (e) {}
    }

    var pres = doc.find('iframe')
    for (let mindex = 0; mindex < pres.length; mindex++) {
      const pre = pres.eq(mindex)
      try {
        pre.remove()
      } catch (e) {}
    }

    try {
      const images = doc.find('img')
      for (let index = 0; index < images.length; index++) {
        const image = images.eq(index)
        const imgSrc = image.attr('src')
        if (imgSrc && imgSrc.indexOf('.svg') > -1) {
          console.log('remove svg Image')
          image.remove()
        }
      }
      const qqm = doc.find('qqmusic')
      qqm.next().remove()
      qqm.remove()
    } catch (e) {}

    post.content = $('<div>')
      .append(doc.clone())
      .html()
    console.log('post', post)
  }

  editImg(img, source) {
    img.removeAttr('crossorigin')
    img.attr('referrerpolicy', "no-referrer")
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Discuz;



/***/ })
/******/ ]);