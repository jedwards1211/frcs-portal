/* eslint-disable no-console */

import {shouldComponentUpdate} from 'react-addons-pure-render-mixin';
import unequalPaths from './unequalPaths';

export default function diagnosticShouldComponentUpdate(log = console.log.bind(console)) {
  return function(...args) {
    if (shouldComponentUpdate.apply(this, args)) {
      log('component updating: ' + this);
      let nextProps = args[0]; 
      for (var prop in this.props) {
        if (nextProps[prop] !== this.props[prop]) {
          log('  prop changed: ' + prop);
          let paths = unequalPaths(this.props[prop], nextProps[prop]);
          if (paths.length) {
            log('    unequal paths:');
            log(paths.map(path => '      ' + JSON.stringify(path, null, 2)).join('\n'));
          }
        }
      }
      return true;
    }  
    return false;
  };
}
