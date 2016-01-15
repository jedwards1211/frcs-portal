import React, {PropTypes} from 'react';
import classNames from 'classnames';

import Modal from '../bootstrap/Modal';
import Alert from '../bootstrap/Alert';
import CloseButton from '../bootstrap/CloseButton';
import Button from '../bootstrap/Button';
import Spinner from '../common/Spinner';
import AutoAlertGroup from '../common/AutoAlertGroup';

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
    cancelText:             PropTypes.string,
    disabled:               PropTypes.bool,
    OKdisabled:             PropTypes.bool,
    onOK:                   PropTypes.func,
    onCancel:               PropTypes.func,
    onOutsideClick:         PropTypes.func,
    onCloseButtonClick:     PropTypes.func,
    saving:                 PropTypes.bool,
    error:                  Alert.Auto.propTypes.error,
    errors:                 PropTypes.object,
    footerAlerts:           AutoAlertGroup.propTypes.alerts,
  }
  static defaultProps = {
    showOK:     true,
    showCancel: true,
    footerAlerts: {},
  }
  onOK = () => {
    let {saving, OKdisabled, onOK} = this.props;
    if (!saving && !OKdisabled && onOK) {
      onOK();
    }
  }
  render() {
    let {title, header, beforeButtons, buttons, afterButtons, disabled, OKdisabled, OKtext,
        showOK, showCancel, cancelText, onCancel, onOutsideClick = onCancel, onCloseButtonClick = onCancel, 
        saving, error, errors, footerAlerts, className, children} = this.props;

    if (errors) {
      for (let key in errors) {
        footerAlerts[key] = {error: errors[key]};
      }
    }
    if (error) {
      footerAlerts.error = {error};
    }

    className = classNames(className, 'mf-typical-modal');

    if (!buttons) {
      buttons = [];
      if (showCancel) {
        buttons.unshift(<Button key="cancel" onClick={onCancel} disabled={disabled}>{cancelText || 'Cancel'}</Button>);
      }
      if (showOK) {
        buttons.push(<Button.Primary key="OK" onClick={this.onOK} disabled={saving || disabled || OKdisabled}>
          {saving ? <span><Spinner /> Saving...</span> : OKtext || 'OK'}
        </Button.Primary>);
      }
    }

    return <Modal {...this.props} className={className} onOutsideClick={onOutsideClick}>
      <Modal.Header>
        <CloseButton onClick={onCloseButtonClick} disabled={disabled}/>
        {title && <Modal.Title>{title}</Modal.Title>}
        {header}
      </Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
      <Modal.Footer>
        <AutoAlertGroup alerts={footerAlerts}/>
        {beforeButtons}
        {buttons}
        {afterButtons}
      </Modal.Footer>
    </Modal>;
  }
}

