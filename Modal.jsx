'use strict';

import React from 'react';
import {addons} from 'react/addons';
import classNames from 'classnames';
import _ from 'lodash';
import { addClass, removeClass } from './nojquery';

var ModalHeader = React.createClass({
  mixins: [addons.PureRenderMixin],
  render() {
    return (
      <div key="modal-header" className="modal-header">
        {this.props.children}
      </div>
    );
  }
});

var ModalBody = React.createClass({
  mixins: [addons.PureRenderMixin],
  render() {
    return (
      <div key="modal-body" className="modal-body">
        {this.props.children}
      </div>
    );
  }
});

var ModalFooter = React.createClass({
  mixins: [addons.PureRenderMixin],
  render() {
    return (
      <div key="modal-footer" className="modal-footer">
        {this.props.children}
      </div>
    );
  }
});

/**
 * Wrapper for a Bootstrap Modal.  Instead of showing it with a Bootstrap data-target
 * attribute, you should show it by setting its 'show' prop to true.  You should provide
 * an 'onHide' handler that sets the 'show' prop back to false, because Bootstrap
 * automatically hides the modal when the user clicks outside of it, and you will not
 * be able to show it again until the 'show' prop is set to false and then back to true.
 */
var Modal = React.createClass({
  mixins: [addons.PureRenderMixin],
  propTypes: {
    id: React.PropTypes.string,
    'aria-labelledby': React.PropTypes.string,
    'aria-label': React.PropTypes.string,
    show: React.PropTypes.bool,
    onRequestHide: React.PropTypes.func,
    onHidden: React.PropTypes.func,
  },
  getInitialState() {
    return {
      'actuallyShow': false,
      'in': false
    };
  },
  update(show) {
    if (show) {
      addClass(document.body, 'modal-open');
      if (!this.state.actuallyShow) {
        this.setState({actuallyShow: true}, () => {
          setTimeout(() => {
            this.update(this.props.show);
          }, 0);
        });
      }
      else if (!this.state['in']) {
        this.setState({'in': show});
      }
    }
    else {
      removeClass(document.body, 'modal-open');
      if (this.state['in'])  {
        this.setState({'in': false}, () => {
          setTimeout(() => {
            this.update(this.props.show);
          }, 200);
        });
      }
      else if (this.state.actuallyShow) {
        this.setState({actuallyShow: false});
        this.props.onHidden && this.props.onHidden();
      }
    }
  },
  componentWillReceiveProps(newProps) {
    if (newProps.show !== this.props.show) {
      this.update(newProps.show);
    }
  },
  componentDidMount() {
    this.update(this.props.show);
  },
  onModalClick(event) {
    if (event.target == React.findDOMNode(this.refs.modal)) {
      this.props.onRequestHide && this.props.onRequestHide();
    }
  },
  render() {
    var otherProps = _.clone(this.props);
    delete otherProps.className;
    delete otherProps.key;
    return (
      <div key={this.props.key}>
        <div key="backdrop" className={classNames('modal-backdrop', 'fade', {'in': this.state['in']})}
          style={{display: this.state.actuallyShow ? 'block' : 'none'}} />
        <div key="modal" ref="modal" className={classNames('modal', 'fade', this.props.className, {'in': this.state['in']})} 
          style={{display: this.state.actuallyShow ? 'block' : 'none'}} role="dialog" aria-hidden={!this.state.actuallyShow} 
          onClick={this.onModalClick} {...otherProps}>
          <div key="modal-dialog" className="modal-dialog">
            <div className="modal-content">
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
});

export { Modal, ModalHeader, ModalBody, ModalFooter };