import 'whatwg-fetch';
import promise from 'es6-promise';
import "jspolyfill-array.prototype.find";
import "classlist-polyfill";
import elementClosest from 'element-closest';
import "array.prototype.fill";
import assign from 'es6-object-assign';

assign.polyfill();

elementClosest(window); // this is used to reference window.Element

promise.polyfill();

const roundValue = 1000000;

function log10(n) {
  return Math.round(roundValue * Math.log(n) / Math.LN10) / roundValue;
}

Math.log10 = log10;
