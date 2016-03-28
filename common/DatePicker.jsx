import React from 'react';
import classNames from 'classnames';
import {getSizingClass} from '../bootstrap/bootstrapPropUtils';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

// make it take a "value" prop instead of "selected" so that it's consistent with
// inputs, and works with Autoform
// and add bootstrap classes
export default props => {
  let {className} = props;
  let sizingClass = getSizingClass(props);
  className = classNames(className, 'form-control', sizingClass && 'input-' + sizingClass);
  return <DatePicker {...props} selected={props.value} className={className}/>;
};
