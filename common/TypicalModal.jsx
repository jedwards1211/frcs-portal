import React, {PropTypes} from 'react';
import classNames from 'classnames';

import Modal from '../bootstrap/Modal';
import CloseButton from '../bootstrap/CloseButton';
import Collapse from '../bootstrap/Collapse';
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
    afterError:             PropTypes.node,
    OKdisabled:             PropTypes.bool,
    onOK:                   PropTypes.func,
    onCancel:               PropTypes.func,
    saving:                 PropTypes.bool,
    error:                  PropTypes.instanceOf(Error),
  }
  render() {
    let {title, header, beforeButtons, afterButtons, afterError,
        OKdisabled, onOK, onCancel, saving, error, children} = this.props;

    if (error) this.lastError = error;

    let className = classNames(className, 'mf-typical-modal');

    return <Modal {...this.props} className={className}>
      <Modal.Header>
        <CloseButton onClick={onCancel}/>
        {title && <Modal.Title>{title}</Modal.Title>}
        {header}
      </Modal.Header>
      <Modal.Body>
        {children}
        <Collapse component="div" open={!!error}>
          <Alert.Danger>{this.lastError && this.lastError.toString()}</Alert.Danger>
        </Collapse>
        {afterError}
      </Modal.Body>
      <Modal.Footer>
        {beforeButtons}
        <Button onClick={onCancel}>Cancel</Button>
        <Button.Primary onClick={onOK} disabled={saving || OKdisabled}>
          {saving ? <span><Spinner /> Saving...</span> : 'OK'}
        </Button.Primary>
        {afterButtons}
      </Modal.Footer>
    </Modal>;
  }
}

