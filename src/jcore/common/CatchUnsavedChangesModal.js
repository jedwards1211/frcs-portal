/* @flow */

import React, {Component, PropTypes} from 'react'
import Portal from 'react-portal'

import Button from '../bootstrap/Button.jsx'
import Modal from '../bootstrap/Modal.jsx'
import Spinner from './Spinner.jsx'
import {Header, Title, Body, Footer} from './View.jsx'

type Props = {
  open?: boolean,
  title?: any,
  message?: any,
  valid?: boolean,
  saving?: boolean,
  hasUnsavedChanges: ?boolean,
  beforeUnloadMessage?: string,
  onOpenChange: (open: boolean) => any,
  onOutsideClick?: Function,
  onStayHereClick?: Function,
  onDiscardChangesClick?: (leave: Function) => any,
  onSaveChangesClick?: (leave: Function) => any
};

export default class CatchUnsavedChangesModal extends Component<void, Props, void> {
  leaveCallback: ?Function;

  static contextTypes = {
    router: PropTypes.object.isRequired,
    addLeaveHook: PropTypes.func,
    removeLeaveHook: PropTypes.func
  };

  componentDidMount() {
    let {addLeaveHook} = this.context
    addLeaveHook && addLeaveHook(this.onLeave)
    window.addEventListener('beforeunload', this.onBeforeUnload)
  }
  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onBeforeUnload)
    let {removeLeaveHook} = this.context
    removeLeaveHook && removeLeaveHook(this.onLeave)
  }

  onBeforeUnload: (e: any) => any = (e) => {
    let {hasUnsavedChanges} = this.props
    let beforeUnloadMessage = this.props.beforeUnloadMessage || 'You have unsaved changes.'
    e = e || window.event
    if (hasUnsavedChanges) {
      e.returnValue = beforeUnloadMessage
      return beforeUnloadMessage
    }
  };

  onLeave: (leave: Function) => ?boolean = leave => {
    let {hasUnsavedChanges, onOpenChange} = this.props
    if (hasUnsavedChanges) {
      onOpenChange(true)
      this.leaveCallback = () => {
        let {removeLeaveHook} = this.context
        removeLeaveHook && removeLeaveHook(this.onLeave)
        leave()
      }
      return false
    }
  };

  render(): React.Element {
    let {open, title, message, valid, saving, onOutsideClick,
        onStayHereClick, onDiscardChangesClick, onSaveChangesClick} = this.props

    if (open) {
      title = title || 'Unsaved Changes'

      message = message || <div>
        <p>You are trying to leave but you have unsaved changes.</p>
        {!valid && <p>However, some of the changes are invalid.</p>}
        <p>What do you want to do?</p>
      </div>
    }

    const leave = this.leaveCallback || (() => {})

    return <Portal isOpened {...this.props}>
      <Modal.TransitionGroup autoBackdrop>
        {open && <Modal key="askToLeave" onOutsideClick={onOutsideClick || onStayHereClick}>
          <Header><Title>{title}</Title></Header>
          <Body>{message}</Body>
          <Footer>
            <Button onClick={onStayHereClick}>Stay Here</Button>
            <Button onClick={() => onDiscardChangesClick && onDiscardChangesClick(leave)}>
              Discard Changes
            </Button>
            {valid && <Button primary onClick={() => onSaveChangesClick && onSaveChangesClick(leave)}
                disabled={saving}
                      >
              {saving ? <span><Spinner /> Saving...</span> : 'Save Changes'}
            </Button>}
          </Footer>
        </Modal>}
      </Modal.TransitionGroup>
    </Portal>
  }
}
