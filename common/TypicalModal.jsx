import React, {PropTypes} from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import CollapseTransitionGroup from '../transition/CollapseTransitionGroup';

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
    OKdisabled:             PropTypes.bool,
    onOK:                   PropTypes.func,
    onCancel:               PropTypes.func,
    saving:                 PropTypes.bool,
    error:                  PropTypes.instanceOf(Error),
    errors:                 PropTypes.objectOf(PropTypes.any),
  }
  static defaultProps = {
    errors: {},
  }
  constructor(props) {
    super(props);
    this.lastErrors = props.errors;
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.errors !== nextProps.errors) {
      this.lastErrors = this.props.errors;
    }
  }
  render() {
    let {title, header, beforeButtons, afterButtons, OKdisabled, onOK, 
        onCancel, saving, error, errors, className, children} = this.props;

    if (error) this.lastError = error;

    // let errorAlerts = _.uniq(_.keys(this.lastErrors).concat(_.keys(errors))).map(key => {
    //   let lastError = this.lastErrors[key];
    //   let error     = errors[key];
    //   let message   = (lastError && lastError.toString()) || (error && error.toString());
    //   return <Collapse key={key} component="div" className="error-collapse" open={!!error}>
    //     <Alert.Danger>{message}</Alert.Danger>
    //   </Collapse>;
    // });

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
        <Collapse component="div" className="error-collapse" open={!!error}>
          <Alert.Danger>{this.lastError && this.lastError.toString()}</Alert.Danger>
        </Collapse>
        {errorAlerts}
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

