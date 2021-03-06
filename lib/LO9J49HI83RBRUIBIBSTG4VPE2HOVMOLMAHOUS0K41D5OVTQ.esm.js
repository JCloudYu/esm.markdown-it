/**
Copyright (c) 2014 Vitaly Puzrin, Alex Kocharin.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
**/


const _module_map = {};
const _require	  = function(module){ return _module_map[module]; };
const _module	  = {exports:{}};

(function(require, module, exports){
	let _module_map = undefined, _require = undefined, _module = undefined;
	return (function(require,module,exports){

'use strict';


/* eslint-disable no-bitwise */

var decodeCache = {};

function getDecodeCache(exclude) {
  var i, ch, cache = decodeCache[exclude];
  if (cache) { return cache; }

  cache = decodeCache[exclude] = [];

  for (i = 0; i < 128; i++) {
	ch = String.fromCharCode(i);
	cache.push(ch);
  }

  for (i = 0; i < exclude.length; i++) {
	ch = exclude.charCodeAt(i);
	cache[ch] = '%' + ('0' + ch.toString(16).toUpperCase()).slice(-2);
  }

  return cache;
}


// Decode percent-encoded string.
//
function decode(string, exclude) {
  var cache;

  if (typeof exclude !== 'string') {
	exclude = decode.defaultChars;
  }

  cache = getDecodeCache(exclude);

  return string.replace(/(%[a-f0-9]{2})+/gi, function(seq) {
	var i, l, b1, b2, b3, b4, chr,
		result = '';

	for (i = 0, l = seq.length; i < l; i += 3) {
	  b1 = parseInt(seq.slice(i + 1, i + 3), 16);

	  if (b1 < 0x80) {
		result += cache[b1];
		continue;
	  }

	  if ((b1 & 0xE0) === 0xC0 && (i + 3 < l)) {
		// 110xxxxx 10xxxxxx
		b2 = parseInt(seq.slice(i + 4, i + 6), 16);

		if ((b2 & 0xC0) === 0x80) {
		  chr = ((b1 << 6) & 0x7C0) | (b2 & 0x3F);

		  if (chr < 0x80) {
			result += '\ufffd\ufffd';
		  } else {
			result += String.fromCharCode(chr);
		  }

		  i += 3;
		  continue;
		}
	  }

	  if ((b1 & 0xF0) === 0xE0 && (i + 6 < l)) {
		// 1110xxxx 10xxxxxx 10xxxxxx
		b2 = parseInt(seq.slice(i + 4, i + 6), 16);
		b3 = parseInt(seq.slice(i + 7, i + 9), 16);

		if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
		  chr = ((b1 << 12) & 0xF000) | ((b2 << 6) & 0xFC0) | (b3 & 0x3F);

		  if (chr < 0x800 || (chr >= 0xD800 && chr <= 0xDFFF)) {
			result += '\ufffd\ufffd\ufffd';
		  } else {
			result += String.fromCharCode(chr);
		  }

		  i += 6;
		  continue;
		}
	  }

	  if ((b1 & 0xF8) === 0xF0 && (i + 9 < l)) {
		// 111110xx 10xxxxxx 10xxxxxx 10xxxxxx
		b2 = parseInt(seq.slice(i + 4, i + 6), 16);
		b3 = parseInt(seq.slice(i + 7, i + 9), 16);
		b4 = parseInt(seq.slice(i + 10, i + 12), 16);

		if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80 && (b4 & 0xC0) === 0x80) {
		  chr = ((b1 << 18) & 0x1C0000) | ((b2 << 12) & 0x3F000) | ((b3 << 6) & 0xFC0) | (b4 & 0x3F);

		  if (chr < 0x10000 || chr > 0x10FFFF) {
			result += '\ufffd\ufffd\ufffd\ufffd';
		  } else {
			chr -= 0x10000;
			result += String.fromCharCode(0xD800 + (chr >> 10), 0xDC00 + (chr & 0x3FF));
		  }

		  i += 9;
		  continue;
		}
	  }

	  result += '\ufffd';
	}

	return result;
  });
}


decode.defaultChars   = ';/?:@&=+$,#';
decode.componentChars = '';


module.exports = decode;

})(require, module, exports);
})(_require, _module, _module.exports);

export default _module.exports;
