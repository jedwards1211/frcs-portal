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
    afterButtons:           PropTypes.node,
    showCancel:             PropTypes.bool,
    // overrides the text of the OK button
    OKtext:                 PropTypes.string,
    OKdisabled:             PropTypes.bool,
    onOK:                   PropTypes.func,
    onCancel:               PropTypes.func,
    saving:                 PropTypes.bool,
    error:                  PropTypes.instanceOf(Error),
    errors:                 PropTypes.objectOf(PropTypes.node.isRequired),
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
    let {title, header, beforeButtons, afterButtons, OKdisabled, OKtext,
        showCancel, onCancel, saving, error, errors, className, children} = this.props;

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

    return <Modal {...this.props} className={className}>
      <Modal.Header>
        <CloseButton onClick={onCancel}/>
        {title && <Modal.Title>{title}</Modal.Title>}
        {header}
      </Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
      <Modal.Footer>
        {errorAlerts}
        {beforeButtons}
        {showCancel && <Button onClick={onCancel}>Cancel</Button>}
        <Button.Primary onClick={this.onOK} disabled={saving || OKdisabled}>
          {saving ? <span><Spinner /> Saving...</span> : OKtext || 'OK'}
        </Button.Primary>
        {afterButtons}
      </Modal.Footer>
    </Modal>;
  }
}

