import React, {Children, Component, PropTypes, isValidElement, cloneElement} from 'react';
import classNames from 'classnames';

import Autocollapse from 'mindfront-react-components/common/Autocollapse';

class Group extends Component {
  static propTypes = {
    labelClass:   PropTypes.string,
    controlClass: PropTypes.string,
    label:        PropTypes.any,
    error:        PropTypes.any,
    warning:      PropTypes.any,
    success:      PropTypes.any,
  }
  render() {
    let {labelClass, controlClass, className, label, children} = this.props;

    let validationClassNames = {};
    let validationMessages = [];

    ['error', 'warning', 'success'].forEach(type => {
      let val = this.props[type];
      if (val) {
        validationClassNames[`has-${type}`] = true;
        this[`last-${type}`] = val;
      }
      if (this[`last-${type}`]) {
        validationMessages.push(<Autocollapse key={type}>
          {val && <div className={`control-label ${type}-message`}>{val}</div>}
        </Autocollapse>);
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

    return <div {...this.props} className={className}>
      {label}
      <div className={controlClass}>
        {Children.map(children, child => {
          if (React.isValidElement(child)) {
            let className = classNames(child.props.className, 'form-control');
            return cloneElement(child, {className});
          }
          return child;
        })}
        {validationMessages}
      </div>
    </div>;
  }
}

export default class TypicalForm extends Component {
  static propTypes = {
    labelClass:   PropTypes.string.isRequired,
    controlClass: PropTypes.string.isRequired,
  }
  static defaultProps = {
    labelClass:   "col-sm-4 control-label",
    controlClass: "col-sm-8",
  }
  render() {
    let {labelClass, controlClass, className, children} = this.props;

    className = classNames(className, "form-horizontal");

    return <div {...this.props} className={className}>
      {Children.map(children, child => cloneElement(child, {labelClass, controlClass}))}
    </div>;
  }
}

TypicalForm.Group = Group;
