import React, {PropTypes} from 'react';

import Modal from 'mindfront-react-components/bootstrap/Modal';
import CloseButton from 'mindfront-react-components/bootstrap/CloseButton';
import Collapse from 'mindfront-react-components/bootstrap/Collapse';
import Alert from 'mindfront-react-components/bootstrap/Alert';
import Button from 'mindfront-react-components/bootstrap/Button';
import Spinner from 'mindfront-react-components/Spinner';

export default class TypicalModal extends React.Component {
  static propTypes = {
    title:                  PropTypes.node,
    header:                 PropTypes.node,
    beforeButtons:          PropTypes.node,
    afterButtons:           PropTypes.node,
    afterError:             PropTypes.node,
    onOK:                   PropTypes.func,
    onCancel:               PropTypes.func,
    saving:                 PropTypes.bool,
    error:                  PropTypes.instanceOf(Error),
  }
  render() {
    let {title, header, beforeButtons, afterButtons, afterError,
        onOK, onCancel, saving, error, children} = this.props;

    if (error) this.lastError = error;

    return <Modal ref="modal" {...this.props}>
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
        <Button.Primary onClick={onOK} disabled={saving}>
          {saving ? <span><Spinner /> Saving...</span> : 'OK'}
        </Button.Primary>
        {afterButtons}
      </Modal.Footer>
    </Modal>;
  }
}

