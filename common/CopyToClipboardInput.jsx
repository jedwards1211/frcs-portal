import React, {Component} from 'react';
import classNames from 'classnames';

import InputGroup from '../bootstrap/InputGroup';
import Alert from '../bootstrap/Alert';
import Button from '../bootstrap/Button';
import CloseButton from '../bootstrap/CloseButton';
import InterruptibleCSSTransitionGroup from '../transition/InterruptibleCSSTransitionGroup';

import './CopyToClipboardInput.sass';

export default class CopyToClipboardInput extends Component {
  state = {};
  componentWillMount() {
    this.mounted = true;
  }
  componentWillUnmount() {
    this.mounted = false;
  }
  onCopyToClipboardClick = () => {
    this.input.select();
    if (this.props.fakeCopyToClipboardFailure || !document.execCommand('copy')) {
      this.setState({showErrorMessage: true});
      setTimeout(() => {
        if (this.mounted) {
          this.setState({showErrorMessage: false});
        }
      }, 5000);
    }
  };
  onCloseErrorMessageClick = () => this.setState({showErrorMessage: false});
  render() {
    let {className} = this.props;
    let {showErrorMessage} = this.state;

    className = classNames('form-control', className);

    return <div className="mf-copy-to-clipboard-input">
      <InputGroup>
        <input {...this.props} ref={c => this.input = c} className={className}/>
        <InputGroup.Button>
          <Button onClick={this.onCopyToClipboardClick}>
            <i className="glyphicon glyphicon-copy"/> Copy
          </Button>
        </InputGroup.Button>
      </InputGroup>
      <InterruptibleCSSTransitionGroup component="div" transitionName="error">
        {showErrorMessage && <Alert error={<span>
          <CloseButton onClick={this.onCloseErrorMessageClick}/>
          {"Failed to copy to clipboard; this feature isn't supported on older browsers"}
        </span>}/>}
      </InterruptibleCSSTransitionGroup>
    </div>;
  }  
}
