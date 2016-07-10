/* @flow */

import React, {Component} from 'react'
import * as Immutable from 'immutable'
import classNames from 'classnames'
import Promise from 'bluebird'
import _ from 'lodash'

import Glyphicon from '../bootstrap/Glyphicon'
import Button from '../bootstrap/Button'
import DeleteButton from '../bootstrap/DeleteButton'
import Spinner from './../common/Spinner'
import AlertGroup from './../common/AlertGroup'
import {Nav} from './../common/View'

import {createSkinDecorator} from 'react-skin'

import CatchUnsavedChangesModal from './../common/CatchUnsavedChangesModal'

import './DocumentView.sass'

export type FooterButtonProps = {
  leaveAfterCancel?: Function,
  leaveAfterCreating?: Function,
  leaveAfterSaving: Function,
  mode: 'create' | 'edit',
  disabled?: boolean,
  save: () => Promise,
  saving?: boolean,
}

type DefaultProps = {
  mode: 'create' | 'edit',
  hasUnsavedChanges: (initDocument: any, document: any) => boolean,
  documentDisplayName: string,
  documentDisplayPronoun: string,
  FooterButtons: (props: FooterButtonProps) => React.Element,
};

type Props = {
  className?: string,
  loading?: boolean,
  loadError?: Error,
  disabled?: boolean,
  mode: 'create' | 'edit',
  documentDisplayName: string,
  documentDisplayPronoun: string,
  createDocument?: (document: any) => Promise,
  saveDocument: (document: any) => Promise,
  deleteDocument?: () => Promise,
  setDocument: (document: any) => any,
  setUpdatedTimestamp: (timestamp: ?Date) => any,
  setSaving: (saving: boolean) => any,
  setSaved: (saved: boolean) => any,
  setSaveError: (error: ?Error) => any,
  setDeleting: (deleting: boolean) => any,
  setDeleteError: (error: ?Error) => any,
  setAskToLeave: (askToLeave: boolean) => any,
  leave?: Function,
  leaveAfterCancel?: Function,
  leaveAfterCreating?: Function,
  leaveAfterSaving: Function,
  leaveAfterDeleting?: Function,
  effectiveDocument?: any, // the document that is in effect
  effectiveUpdatedTimestamp?: Date, // time that the document in effect was last changed
  updatedTimestamp?: Date, // time that the document in effect was last changed by this client
  initDocument?: any,
  document?: any,       // the document with in-progress edits made by the user
  hasUnsavedChanges: (initDocument: any, document: any) => boolean,
  validate?: (document: any) => {valid: boolean},
  askToLeave?: boolean,
  saving?: boolean,
  saved?: boolean,
  deleting?: boolean,
  saveError?: Error,
  deleteError?: Error,
  children?: any,
  FooterButtons: (props: FooterButtonProps) => React.Element,
};

const DefaultFooterButtons: (props: FooterButtonProps) => React.Element = props => {
  const {leaveAfterCancel, leaveAfterCreating, leaveAfterSaving, mode, disabled, save, saving} = props
  return (
    <span>
      <Button onClick={leaveAfterCancel}>Cancel</Button>
      {mode === 'edit' &&
        <Button disabled={disabled} onClick={save}>Apply</Button>
      }
      {mode !== 'none' &&
        <Button primary disabled={disabled}
            onClick={() => save().then(mode === 'create' ? leaveAfterCreating : leaveAfterSaving)}
        >
          {saving ? <span><Spinner /> Saving...</span> : mode === 'create' ? 'Create' : 'OK'}
        </Button>
      }
    </span>
  )
}

export const SaveButtonOnly: (props: FooterButtonProps) => React.Element = props => {
  const {leaveAfterSaving, disabled, save, saving} = props
  return (
    <span>
      <Button primary disabled={disabled} onClick={() => save().then(leaveAfterSaving)}>
        {saving ? <span><Spinner /> Saving...</span> : 'Save'}
      </Button>
    </span>
  )
}


/**
 * Implements logic common to views where the user edits something and then saves it or discards changes.
 * Optional create and delete workflows are also supported (based upon whether the createDocument and deleteDocument
 * actions are provided).
 * Includes hooks to display confirmation dialogs when the user will leave this view that ask if they want to
 * stay here, discard changes, or save changes.
 * This will inject alerts, cancel, apply, and OK buttons into the child component via skins.
 */
export default class DocumentView extends Component<DefaultProps, Props, void> {
  static defaultProps = {
    mode: 'edit',
    hasUnsavedChanges: (initDocument, document) => (
      Immutable.Iterable.isIterable(document)
        ? !Immutable.is(initDocument, document)
        : !_.deepEquals(initDocument, document)
    ),
    documentDisplayName: 'document',
    documentDisplayPronoun: 'it',
    FooterButtons: DefaultFooterButtons
  };

  savedTimeout: ?number;

  componentWillMount() {
    if (this.props.mode === 'edit') {
      let {mode, loading, loadError, effectiveDocument, effectiveUpdatedTimestamp,
        setDocument, setUpdatedTimestamp, setSaving, setSaved, setSaveError, setDeleting, setDeleteError,
        setAskToLeave} = this.props
      setSaving(false)
      setSaved(false)
      setSaveError(undefined)
      setDeleting(false)
      setDeleteError(undefined)
      setAskToLeave(false)
      if (mode === 'edit' && !loading && !loadError && effectiveDocument) {
        setDocument(effectiveDocument)
        setUpdatedTimestamp(effectiveUpdatedTimestamp)
      }
      else {
        setDocument(undefined)
        setUpdatedTimestamp(undefined)
      }
    }
  }
  componentWillReceiveProps(nextProps: Props) {
    let {loading, loadError, document, mode, saving, deleting, effectiveDocument, effectiveUpdatedTimestamp,
      setDocument, setUpdatedTimestamp} = nextProps
    if (mode === 'edit' && !saving && !deleting && !loading && !loadError && effectiveDocument) {
      if (!document) {
        setDocument(effectiveDocument)
        setUpdatedTimestamp(effectiveUpdatedTimestamp)
      }
    }
  }
  componentWillUnmount() {
    if (this.savedTimeout) clearTimeout(this.savedTimeout)
    this.closeAskToLeaveDialog()
  }

  getLeaveCallbacks: () => Object = () => {
    let {leave, leaveAfterCancel, leaveAfterSaving, leaveAfterCreating, leaveAfterDeleting} = this.props

    if (!leave) leave = (() => {})

    return {
      leaveAfterCancel:   leaveAfterCancel || leave,
      leaveAfterSaving:   leaveAfterSaving || leaveAfterCancel || leave,
      leaveAfterCreating: leaveAfterCreating || leaveAfterCancel || leave,
      leaveAfterDeleting: leaveAfterDeleting || leaveAfterCancel || leave
    }
  };

  isExternallyChanged: () => ?boolean = () => {
    let {mode, loading, loadError, saving, effectiveUpdatedTimestamp, updatedTimestamp} = this.props
    return mode === 'edit' && !loading && !loadError && !saving && effectiveUpdatedTimestamp && updatedTimestamp &&
        effectiveUpdatedTimestamp.getTime() > updatedTimestamp.getTime()
  };

  isExternallyDeleted: () => boolean = () => {
    let {mode, loading, loadError, effectiveDocument, document} = this.props
    return !!(mode === 'edit' && !loading && !loadError && document && !effectiveDocument)
  };

  save: () => Promise = () => {
    let {mode, document, setSaving, setSaved, setSaveError, createDocument, saveDocument,
      setDocument, setUpdatedTimestamp} = this.props

    if (this.savedTimeout != null) clearTimeout(this.savedTimeout)
    setSaved(false)
    setSaving(true)
    setSaveError(undefined)

    let promise
    if (mode === 'create' || this.isExternallyDeleted()) {
      if (createDocument) {
        promise = createDocument(document)
      }
      else {
        promise = Promise.reject(new Error('missing createDocument'))
      }
    }
    else {
      promise = saveDocument(document)
    }
    return promise.then(updatedTimestamp => {
      // update initDocument so that nothing mistakenly thinks there are unsaved changes
      setDocument(document)
      if (updatedTimestamp instanceof Date) {
        setUpdatedTimestamp(updatedTimestamp)
      }
      setSaved(true)
      this.savedTimeout = setTimeout(() => setSaved(false), 5000)
    }).catch(err => {
      setSaveError(err)
      throw err
    }).finally(() => setSaving(false))
  };

  delete: () => Promise = () => {
    let {setDeleting, setDeleteError, deleteDocument} = this.props

    if (deleteDocument) {
      setDeleting(true)
      setDeleteError(undefined)

      return deleteDocument().catch(err => {
        setDeleteError(err)
        throw err
      })
        .finally(() => setDeleting(false))
    }
  };

  hasUnsavedChanges: () => ?boolean = () => {
    let {mode, document, initDocument, hasUnsavedChanges} = this.props
    return mode === 'edit' && document && hasUnsavedChanges && hasUnsavedChanges(initDocument, document)
  };

  closeAskToLeaveDialog:  Function = () => {
    let {askToLeave, setAskToLeave} = this.props
    if (askToLeave) setAskToLeave(false)
  };

  abortLeaving:           Function = () => this.closeAskToLeaveDialog();
  discardChangesAndLeave: (leave: Function) => void = (leave) => {
    this.closeAskToLeaveDialog()
    leave()
  };
  saveChangesAndLeave:    (leave: Function) => void = (leave) => {
    this.save().then(() => {
      this.closeAskToLeaveDialog()
      leave()
    }).catch(this.abortLeaving)
  };

  validate: () => boolean = () => {
    let {validate, document} = this.props
    return validate && document ? validate(document).valid : !validate
  };

  ContentDecorator: any = createSkinDecorator({
    Title: (Title:any, props:Props) => {
      let {mode, disabled, saving, deleting, loading, loadError, deleteDocument} = this.props
      let {children} = props

      let {leaveAfterDeleting} = this.getLeaveCallbacks()

      disabled = disabled || saving || deleting || loading || loadError

      return <Title {...props}>
        {deleteDocument && mode === 'edit' && <Nav right>
          <DeleteButton disabled={disabled} onArmedClick={() => this.delete().then(leaveAfterDeleting)}
              deleting={deleting} deletingText="Deleting..."
          />
        </Nav>}
        {children}
      </Title>
    },

    Body: (Body:any, props:Props) => {
      let {loading, loadError, effectiveDocument, effectiveUpdatedTimestamp, mode, document,
          setDocument, setUpdatedTimestamp, createDocument, documentDisplayName, documentDisplayPronoun} = this.props
      let {children} = props

      let alerts = {}
      if (loading) {
        alerts.loading = {info: <span><Spinner /> Loading...</span>}
      }
      else if (loadError) {
        alerts.loadError = {error: loadError}
      }
      if (this.isExternallyChanged()) {
        alerts.externallyChanged = {
          warning: <span>
          <Button warning className="alert-btn-right" onClick={() => {
            setDocument(effectiveDocument)
            setUpdatedTimestamp(effectiveUpdatedTimestamp)
          }}
          >Load Changes</Button>
          Someone else changed {documentDisplayName}.
        </span>
        }
      }
      if (this.isExternallyDeleted()) {
        alerts.externallyDeleted = {
          warning: <span>
            Someone else deleted {documentDisplayName}.
              {createDocument && `  You may recreate ${documentDisplayPronoun} by pressing the Create button.`}
          </span>
        }
      }

      return <Body {...props}>
        <AlertGroup alerts={alerts} animated={false} />
        {!loading && !loadError && (document || mode === 'create') && children}
      </Body>
    },

    Footer: (Footer:any, props:Props) => {
      let {children} = props
      let {disabled, document, loading, loadError, mode, FooterButtons,
        saveError, saving, saved, deleteError, deleting, createDocument} = this.props

      let {leaveAfterCancel, leaveAfterCreating, leaveAfterSaving} = this.getLeaveCallbacks()

      let footerMode = this.isExternallyDeleted() ? (createDocument ? 'create' : 'none') : mode

      let alerts = {}
      let valid = this.validate()
      if (!valid && !loading && !loadError && document) {
        alerts.invalid = {error: 'Please fix the errors highlighted above before continuing'}
      }
      if (saved) {
        alerts.saved = {
          success: <span><Glyphicon ok /> Your changes have been saved.</span>
        }
      }
      if (saveError) {
        alerts.saveError = {error: saveError, children: `Failed to ${mode === 'create' ? 'create' : 'save changes'}: `}
      }
      if (deleteError) {
        alerts.deleteError = {error: deleteError, children: 'Failed to delete: '}
      }

      disabled = disabled || !valid || saving || deleting || loading || !!loadError

      return <Footer {...props}>
        <AlertGroup alerts={alerts} />
        <FooterButtons leaveAfterCancel={leaveAfterCancel} leaveAfterCreating={leaveAfterCreating}
            leaveAfterSaving={leaveAfterSaving} mode={footerMode} saving={saving} disabled={disabled}
            save={this.save}
        />
        {children}
      </Footer>
    }
  });

  render(): React.Element {
    let {className, askToLeave, saving, deleting, document, setAskToLeave} = this.props

    className = classNames(className, 'mf-DocumentView')

    let children: any = this.props.children

    let valid = this.validate()

    let {ContentDecorator} = this

    return <ContentDecorator>
      <div {...this.props} className={className}>
        {React.isValidElement(children)
          ? React.cloneElement(children, {
              document,
              disabled: saving || deleting
            })
          : children({
              document,
              disabled: saving || deleting
            })
        }
        <CatchUnsavedChangesModal open={askToLeave} saving={saving} valid={valid}
            hasUnsavedChanges={this.hasUnsavedChanges()}
            onOpenChange={open => setAskToLeave(open)}
            onStayHereClick={this.abortLeaving}
            onDiscardChangesClick={this.discardChangesAndLeave}
            onSaveChangesClick={this.saveChangesAndLeave}
        />
      </div>
    </ContentDecorator>
  }
}
