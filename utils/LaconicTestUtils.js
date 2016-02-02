import {Component} from 'react';
import TestUtils from 'react-addons-test-utils';

// who wants to type the long method names in TestUtils all the time??

export default function $(tree) {
  return {
    findOne(selector) {
      if (selector.prototype instanceof Component) {
        return TestUtils.findRenderedComponentWithType(tree, selector);
      }
      else if (selector instanceof Function) {
        let results = TestUtils.findAllInRenderedTree(tree, selector);
        if (results.length !== 1) {
          throw new Error('expected to find only one component, instead found: ' + (results.length ?
            '\n  ' + results.join('\n  ') : '(no components)'));
        }
        return results[0];
      }
      else if (typeof selector === 'string') {
        selector = selector.trim();
        if (selector[0] === '.') {
          return TestUtils.findRenderedDOMComponentWithClass(tree, selector.substring(1));
        }
        else {
          return TestUtils.findRenderedDOMComponentWithTag(tree, selector);
        }
      }
    },
    find(selector) {
      if (selector.prototype instanceof Component) {
        console.log('Test 1');
        return TestUtils.scryRenderedComponentsWithType(tree, selector);
      }
      else if (selector instanceof Function) {
        console.log('Test 2');
        return TestUtils.findAllInRenderedTree(tree, selector);
      }
      else if (typeof selector === 'string') {
        selector = selector.trim();
        if (selector[0] === '.') {
          console.log('Test 3');
          return TestUtils.scryRenderedDOMComponentsWithClass(tree, selector.substring(1));
        }
        else {
          console.log('Test 4');
          return TestUtils.scryRenderedDOMComponentsWithTag(tree, selector);
        }
      }
    }
  };
}
