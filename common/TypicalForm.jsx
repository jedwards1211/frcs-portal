import React, {Children, Component, PropTypes, isValidElement, cloneElement} from 'react';
import classNames from 'classnames';

import CollapseTransitionGroup from '../transition/CollapseTransitionGroup';

import {errorMessage} from '../utils/reactErrorUtils';

class Group extends Component {
  static propTypes = {
    component:    PropTypes.any,
    labelClass:   PropTypes.string,
    controlClass: PropTypes.string,
    label:        PropTypes.any,
    error:        PropTypes.any,
    warning:      PropTypes.any,
    success:      PropTypes.any,
    noFormControlClass: PropTypes.bool,
    useSingleValidationMessage: PropTypes.any,
  };
  render() {
    let {labelClass, noFormControlClass, controlClass, className, label, children} = this.props;
    let Comp = this.props.component || 'div';

    let validationClassNames = {};
    let validationMessages = [];

    ['error', 'warning', 'success'].forEach(type => {
      let val = this.props[type];
      if (val) {
        validationClassNames[`has-${type}`] = true;
        if (val !== true) {
          if ('useSingleValidationMessage' in this.props) {
            validationMessages = <div className={`control-label ${type}-message`}>{errorMessage(val)}</div>;
          }
          else {
            validationMessages.push(<div key={type}
                                         className={`control-label ${type}-message`}>{errorMessage(val)}</div>);
          }
        }
      }
    });

    className = classNames(className, 'form-group', validationClassNames);

    if (isValidElement(label)) {
      let className = classNames(label.props.className, labelClass);
      label = cloneElement(label, {className});
    }
    else {
      label = <label className={labelClass}>{label}</label>;
    }

    return <Comp {...this.props} className={className}>
      {label}
      <div className={controlClass}>
        {noFormControlClass || !React.isValidElement(children) ?
          children :
          cloneElement(children, {className: classNames(children.props.className, 'form-control')})}
        <CollapseTransitionGroup component="div">
          {validationMessages}
        </CollapseTransitionGroup>
      </div>
    </Comp>;
  }
}

export default class TypicalForm extends Component {
  static propTypes = {
    labelClass:   PropTypes.string.isRequired,
    controlClass: PropTypes.string.isRequired,
  };
  static defaultProps = {
    labelClass:   "col-sm-4 control-label",
    controlClass: "col-sm-8",
  };
  render() {
    let {labelClass, controlClass, className, children} = this.props;

    className = classNames(className, "form-horizontal");

    return <form {...this.props} className={className}>
      {Children.map(children, child => child && cloneElement(child, {labelClass, controlClass}))}
    </form>;
  }
}

TypicalForm.Group = Group;
