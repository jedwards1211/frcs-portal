import React, {Component} from 'react';
import classNames from 'classnames';

import InputGroup from '../bootstrap/InputGroup';
import Button from '../bootstrap/Button';

export default class CopyToClipboardInput extends Component {
  onCopyToClipboardClick = () => {
    this.input.select();
    if (!document.execCommand('copy')) {
      // TODO
    }
  };
  render() {
    let {className} = this.props;
    className = classNames('form-control', className);

    return <InputGroup>
      <input {...this.props} ref={c => this.input = c} className={className}/>
      <InputGroup.Button>
        <Button onClick={this.onCopyToClipboardClick}>
          <i className="glyphicon glyphicon-copy"/> Copy
        </Button>
      </InputGroup.Button>
    </InputGroup>;
  }  
}
