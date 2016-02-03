import {Component} from 'react';
import TestUtils from 'react-addons-test-utils';

// there are currently multiple issues getting enzyme to work with webpack.
// it's possible, but in the meantime this allows us to at least write tests with a subset of its interface.

export function mount(element) {
  let tree = TestUtils.renderIntoDocument(element);
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
        return TestUtils.scryRenderedComponentsWithType(tree, selector);
      }
      else if (selector instanceof Function) {
        return TestUtils.findAllInRenderedTree(tree, selector);
      }
      else if (typeof selector === 'string') {
        selector = selector.trim();
        if (selector[0] === '.') {
          return TestUtils.scryRenderedDOMComponentsWithClass(tree, selector.substring(1));
        }
        else {
          return TestUtils.scryRenderedDOMComponentsWithTag(tree, selector);
        }
      }
    }
  };
}
