"use strict";

/**
 * precisebs.js - precise bullshit (I mean, precise binary search)
 *
 * Several binary-search based functions
 */

const DEFAULT_COMPARATOR = (a, b) => a - b;

/**
 * Finds the index of an element in an array using a binary search.
 * If the element is not present, the insertion index (index of the next
 * greater element or <code>array.length</code>) is returned.
 *
 * @param {array} the array to search in.
 * @param {find} the element to search for.
 * @param {low} the lower bound of the range in <code>array</code> to
 *      search in (defaults to 0)
 * @param {high} the upper bound of the range in <code>array</code> to
 *      search in (defaults to <code>array.length - 1</code>)
 * @param {comparator} two-argument function that returns &lt; 0 if 
 *      the first argument is less than the second; &gt; 0 if the first
 *      argument is greater; and 0 otherwise. (defaults to <code>a - b</code>)
 */
function binarySearch(array, find, low, high, comparator) {
  if(low === undefined) low = 0;
  if(high === undefined) high = array.length;
  if(comparator === undefined) comparator = DEFAULT_COMPARATOR;
  var i, comparison;
  while (low <= high) {
    i = Math.floor((low + high) / 2);
    comparison = comparator(array[i], find);
    if (comparison < 0) { low = i + 1; continue; }
    if (comparison > 0) { high = i - 1; continue; }
    return i;
  }
  return low;
}

/**
 * Finds the index of the greatest element less than a given element in an array 
 * using a binary search.  If the given element is less than or equal to all elements in the
 * array, returns -1.
 *
 * @param {array} the array to search in.
 * @param {find} the element to search for.
 * @param {low} the lower bound of the range in <code>array</code> to
 *      search in (defaults to 0)
 * @param {high} the upper bound of the range in <code>array</code> to
 *      search in (defaults to <code>array.length - 1</code>)
 * @param {comparator} two-argument function that returns &lt; 0 if 
 *      the first argument is less than the second; &gt; 0 if the first
 *      argument is greater; and 0 otherwise. (defaults to <code>a - b</code>)
 */
function lowerIndex(array, find, low, high, comparator) {
  if(comparator === undefined) comparator = DEFAULT_COMPARATOR;
  var i = binarySearch(array, find, low, high, comparator);
  return i === array.length || comparator(array[i], find) >= 0 ? i - 1 : i;
}

/**
 * Finds the index of the greatest element less than or equal to a given element in an array 
 * using a binary search.  If the given element is less than all elements in the
 * array, returns -1.
 *
 * @param {array} the array to search in.
 * @param {find} the element to search for.
 * @param {low} the lower bound of the range in <code>array</code> to
 *      search in (defaults to 0)
 * @param {high} the upper bound of the range in <code>array</code> to
 *      search in (defaults to <code>array.length - 1</code>)
 * @param {comparator} two-argument function that returns &lt; 0 if 
 *      the first argument is less than the second; &gt; 0 if the first
 *      argument is greater; and 0 otherwise. (defaults to <code>a - b</code>)
 */
function floorIndex(array, find, low, high, comparator) {
  if(comparator === undefined) comparator = DEFAULT_COMPARATOR;
  var i = binarySearch(array, find, low, high, comparator);
  return i === array.length || comparator(array[i], find) > 0 ? i - 1 : i;
}

function floorValue(array, find, low, high, comparator) {
  return array[floorIndex(array, find, low, high, comparator)];
}

/**
 * Finds the index of the least element greater than or equal to a given element in an array 
 * using a binary search.  If the given element is greater than all elements in the
 * array, returns the length of the array.
 *
 * @param {array} the array to search in.
 * @param {find} the element to search for.
 * @param {low} the lower bound of the range in <code>array</code> to
 *      search in (defaults to 0)
 * @param {high} the upper bound of the range in <code>array</code> to
 *      search in (defaults to <code>array.length - 1</code>)
 * @param {comparator} two-argument function that returns &lt; 0 if 
 *      the first argument is less than the second; &gt; 0 if the first
 *      argument is greater; and 0 otherwise. (defaults to <code>a - b</code>)
 */
function ceilingIndex(array, find, low, high, comparator) {
  if(comparator === undefined) comparator = DEFAULT_COMPARATOR;
  var i = binarySearch(array, find, low, high, comparator);
  return i < array.length && comparator(array[i], find) < 0 ? i + 1 : i;
}

/**
 * Finds the index of the least element greater than a given element in an array 
 * using a binary search.  If the given element is greater than or equal to all elements in the
 * array, returns the length of the array.
 *
 * @param {array} the array to search in.
 * @param {find} the element to search for.
 * @param {low} the lower bound of the range in <code>array</code> to
 *      search in (defaults to 0)
 * @param {high} the upper bound of the range in <code>array</code> to
 *      search in (defaults to <code>array.length - 1</code>)
 * @param {comparator} two-argument function that returns &lt; 0 if 
 *      the first argument is less than the second; &gt; 0 if the first
 *      argument is greater; and 0 otherwise. (defaults to <code>a - b</code>)
 */
function higherIndex(array, find, low, high, comparator) {
  if(comparator === undefined) comparator = DEFAULT_COMPARATOR;
  var i = binarySearch(array, find, low, high, comparator);
   return i < array.length && comparator(array[i], find) <= 0 ? i + 1 : i;
}

module.exports = {
  binarySearch: binarySearch,
  lowerIndex:   lowerIndex,
  floorIndex:   floorIndex,
  floorValue:   floorValue,
  ceilingIndex: ceilingIndex,
  higherIndex:  higherIndex
};
