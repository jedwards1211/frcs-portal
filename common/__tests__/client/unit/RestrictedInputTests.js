import React from 'react';
import {findDOMNode} from 'react-dom';
import RestrictedInput from '../../../RestrictedInput.jsx';

import {mount} from 'enzyme';

describe('RestrictedInput', () => {
  describe('with decimalNumber', () => {
    it('removes letters and second decimal places', () => {
      let event;
      let input = mount(<RestrictedInput decimalNumber value="" onChange={e => event = e}/>);

      findDOMNode(input.instance()).value = '123.45one6.78two9';
      input.simulate('change');
      expect(event.target.value).toBe('123.456789');
    });
  });
});
