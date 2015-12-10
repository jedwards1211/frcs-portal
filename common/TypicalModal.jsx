import React, {PropTypes} from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import CollapseTransitionGroup from '../transition/CollapseTransitionGroup';

import Modal from '../bootstrap/Modal';
import CloseButton from '../bootstrap/CloseButton';
import Alert from '../bootstrap/Alert';
import Button from '../bootstrap/Button';
import Spinner from '../common/Spinner';

import './TypicalModal.sass';

export default class TypicalModal extends React.Component {
  static propTypes = {
    title:                  PropTypes.node,
    header:                 PropTypes.node,
    beforeButtons:          PropTypes.node,
    buttons:                PropTypes.node,
    afterButtons:           PropTypes.node,
    showOK:                 PropTypes.bool,
    showCancel:             PropTypes.bool,
    // overrides the text of the OK button
    OKtext:                 PropTypes.string,
    disabled:               PropTypes.bool,
    OKdisabled:             PropTypes.bool,
    onOK:                   PropTypes.func,
    onCancel:               PropTypes.func,
    saving:                 PropTypes.bool,
    error:                  PropTypes.instanceOf(Error),
    errors:                 PropTypes.objectOf(PropTypes.node),
  }
  static defaultProps = {
    showCancel: true,
    errors: {},
  }
  onOK = () => {
    let {saving, OKdisabled, onOK} = this.props;
    if (!saving && !OKdisabled && onOK) {
      onOK();
    }
  }
  render() {
    let {title, header, beforeButtons, buttons, afterButtons, disabled, OKdisabled, OKtext,
        showOK, showCancel, onCancel, saving, error, errors, className, children} = this.props;

    if (error) {
      errors.__singleError = error;
    }

    let errorAlerts = <CollapseTransitionGroup component="div" collapseProps={{className: 'error-collapse'}}>
      {_.map(errors, (error, key) => {
        if (React.isValidElement(error)) return error;
        else if (error) return <Alert.Danger key={key}>{error && error.toString()}</Alert.Danger>;
      })}
    </CollapseTransitionGroup>;

    className = classNames(className, 'mf-typical-modal');

    if (!buttons) {
      buttons = [];
      if (showCancel) {
        buttons.unshift(<Button key="cancel" onClick={onCancel} disabled={disabled}>Cancel</Button>);
      }
      if (showOK) {
        buttons.push(<Button.Primary key="OK" onClick={this.onOK} disabled={saving || disabled || OKdisabled}>
          {saving ? <span><Spinner /> Saving...</span> : OKtext || 'OK'}
        </Button.Primary>);
      }
    }

    return <Modal {...this.props} className={className}>
      <Modal.Header>
        <CloseButton onClick={onCancel} disabled={disabled}/>
        {title && <Modal.Title>{title}</Modal.Title>}
        {header}
      </Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
      <Modal.Footer>
        {errorAlerts}
        {beforeButtons}
        {buttons}
        {afterButtons}
      </Modal.Footer>
    </Modal>;
  }
}

