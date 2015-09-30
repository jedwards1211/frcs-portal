import React from 'react';
import classNames from 'classnames';

import './CornerKnob.sass';

export default props => (<div {...props} className={classNames(props.className, 'corner-knob')}/>);