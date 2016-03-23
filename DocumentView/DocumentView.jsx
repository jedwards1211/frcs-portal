/* @flow */

import React, {Component} from 'react';
import classNames from 'classnames';
import Promise from 'bluebird';

import Button from '../bootstrap/Button.jsx';
import DeleteButton from '../bootstrap/DeleteButton.jsx';
import Spinner from './../common/Spinner.jsx';
import AlertGroup from './../common/AlertGroup';
import {Nav} from './../common/View.jsx';

import {createSkinDecorator} from 'react-skin';

import createOrCloneElement from '../utils/createOrCloneElement';

import CatchUnsavedChangesModal from './../common/CatchUnsavedChangesModal.jsx';

type DefaultProps = {
  typeDisplayName: string,
  typeDisplayPronoun: string
};

type Props = {
  className?: string,
  loading?: boolean,
  loadError?: Error,
  disabled?: boolean,
  mode: 'create' | 'edit',
  typeDisplayName: string,
  typeDisplayPronoun: string,
  createDocument?: (document: any) => Promise,
  saveDocument: (document: any) => Promise,
  deleteDocument?: () => Promise,
  setDocument: (document: any) => any,
  setSaving: (saving: boolean) => any,
  setSaveError: (error: ?Error) => any,
  setDeleting: (deleting: boolean) => any,
  setAskToLeave: (askToLeave: boolean) => any,
  leave?: Function,
  leaveAfterCancel?: Function,
  leaveAfterCreating?: Function,
  leaveAfterSaving: Function,
  leaveAfterDeleting?: Function,
  actualDocument?: any, // the document that is actually in effect
  initDocument?: any,   // what the document was when this view mounted or the user last successfully Applied
  document?: any,       // the document with in-progress edits made by the user
  hasUnsavedChanges?: (initDocument: any, document: any) => boolean,
  validate?: (document: any) => {valid: boolean},
  askToLeave?: boolean,
  saving?: boolean,
  deleting?: boolean,
  saveError?: Error,
  children?: any
};

type State = {
  externallyChanged?: boolean,
  externallyDeleted?: boolean
};

/**
 * Implements logic common to views where the user edits something and then saves it or discards changes.
 * Optional create and delete workflows are also supported (based upon whether the createDocument and deleteDocument
 * actions are provided).
 * Includes hooks to display confirmation dialogs when the user will leave this view that ask if they want to
 * stay here, discard changes, or save changes.
 * This will inject alerts, cancel, apply, and OK buttons into the child component via skins.
 */
export default class DocumentView extends Component<DefaultProps,Props,State> {
  static defaultProps = {
    typeDisplayName: 'document',
    typeDisplayPronoun: 'it'
  };
  state: State = {};
  componentWillMount() {
    if (this.props.mode === 'edit') {
      let {actualDocument, setDocument, setSaving, setDeleting, setSaveError} = this.props;
      setSaving(false);
      setDeleting(false);
      setSaveError(undefined);
      setAskToLeave(false);
      setDocument(actualDocument);
    }
  }
  componentWillReceiveProps(nextProps: Props) {
    if (this.props.actualDocument !== nextProps.actualDocument) {
      let {document, mode, saving, deleting, actualDocument, setDocument} = nextProps;
      if (mode === 'edit' && !saving && !deleting) {
        if (!actualDocument) {
          this.setState({
            externallyChanged: false,
            externallyDeleted: true
          });
        }
        else if (!document) {
          setDocument(actualDocument);
        }
        else if (this.props.actualDocument) {
          this.setState({
            externallyChanged: true,
            externallyDeleted: false
          });
        }
      }
    }
  }
  componentWillUnmount() {
    this.closeAskToLeaveDialog();
  }

  getLeaveCallbacks: () => Object = () => {
    let {leave, leaveAfterCancel, leaveAfterSaving, leaveAfterCreating, leaveAfterDeleting} = this.props;

    return {
      leaveAfterCancel:   leaveAfterCancel || leave,
      leaveAfterSaving:   leaveAfterSaving || leaveAfterCancel || leave,
      leaveAfterCreating: leaveAfterCreating || leaveAfterCancel || leave,
      leaveAfterDeleting: leaveAfterDeleting || leaveAfterCancel || leave
    };
  };

  save: () => Promise = () => {
    let {mode, document, setSaving, setSaveError, createDocument, saveDocument, setDocument} = this.props;
    let {externallyDeleted} = this.state;

    setSaving(true);
    setSaveError(undefined);

    let promise;
    if (mode === 'create' || externallyDeleted) {
      if (createDocument) {
        promise = createDocument(document);
      }
      else {
        promise = Promise.reject(new Error('missing createDocument'))
      }
    }
    else {
      promise = saveDocument(document);
    }
    return promise.then(() => {
      // update initDocument so there are no seemingly unsaved changes
      setDocument(document);
      this.setState({externallyChanged: false, externallyDeleted: false});
    }).catch(err => {
      setSaveError(err);
      throw err;
    }).finally(() => setSaving(false));
  };

  delete: () => Promise = () => {
    let {setDeleting, setSaveError, deleteDocument} = this.props;

    if (deleteDocument) {
      setDeleting(true);
      setSaveError(undefined);

      return deleteDocument().catch(err => {
          setSaveError(err);
          throw err;
        })
        .finally(() => setDeleting(false));
    }
  };

  hasUnsavedChanges: () => ?boolean = () => {
    let {mode, document, initDocument, hasUnsavedChanges} = this.props;
    return mode === 'edit' && document && hasUnsavedChanges && !hasUnsavedChanges(initDocument, document);
  };

  closeAskToLeaveDialog:  Function = () => {
    let {askToLeave, setAskToLeave} = this.props;
    if (askToLeave) setAskToLeave(false);
  };

  abortLeaving:           Function = () => this.closeAskToLeaveDialog();
  discardChangesAndLeave: (leave: Function) => void = (leave) => {
    this.closeAskToLeaveDialog();
    leave();
  };
  saveChangesAndLeave:    (leave: Function) => void = (leave) => {
    this.save().then(() => {
      this.closeAskToLeaveDialog();
      leave();
    }).catch(this.abortLeaving);
  };

  ContentDecorator: any = createSkinDecorator({
    Title: (Title:any, props:Props) => {
      let {disabled, saving, deleting, loading, loadError, deleteDocument} = this.props;
      let {children} = props;

      let {leaveAfterDeleting} = this.getLeaveCallbacks();
      
      disabled = disabled || saving || deleting || loading || loadError;

      return <Title {...props}>
        {deleteDocument && <Nav right>
          <DeleteButton disabled={disabled} onArmedClick={() => this.delete().then(leaveAfterDeleting)}
                        deleting={deleting} deletingText="Deleting..."/>
        </Nav>}
        {children}
      </Title>;
    },

    Body: (Body:any, props:Props) => {
      let {loading, loadError, actualDocument, setDocument, createDocument, 
          typeDisplayName, typeDisplayPronoun} = this.props;
      let {children} = props;
      let {externallyChanged, externallyDeleted} = this.state;

      let alerts = {};
      if (loading) {
        alerts.loading = {info: <span><Spinner/> Loading...</span>}
      }
      else if (loadError) {
        alerts.loadError = {error: loadError};
      }
      if (!loading && !loadError) {
        if (externallyChanged && actualDocument) {
          alerts.externallyChanged = {
            warning: <span>
              <Button warning className="alert-btn-right" onClick={() => {
                setDocument(actualDocument);
                this.setState({externallyChanged: false});
              }}>Load Changes</Button>
              Someone else changed this {typeDisplayName}.
            </span>
          };
        }
        if (externallyDeleted) {
          alerts.externallyDeleted = {
            warning: <span>
              Someone else deleted this {typeDisplayName}.
              {createDocument && `  You may recreate ${typeDisplayPronoun} by pressing the Create button.`}
            </span>
          };
        }
      }

      return <Body {...props}>
        <AlertGroup alerts={alerts}/>
        {!loading && !loadError && children}
      </Body>;
    },

    Footer: (Footer:any, props:Props) => {
      let {children} = props;
      let {disabled, loading, loadError, mode, validate, saveError, saving, deleting, createDocument} = this.props;
      let {externallyDeleted} = this.state;
      
      let {leaveAfterCancel, leaveAfterCreating, leaveAfterSaving} = this.getLeaveCallbacks();

      let footerMode = externallyDeleted ? (createDocument ? 'create' : 'none') : mode;

      let alerts = {};
      let {valid} = validate ? validate(document) : {valid: true};
      if (!valid) {
        alerts.invalid = {error: 'Please fix the errors highlighted above before continuing'};
      }
      if (saveError) {
        alerts.saveError = {error: saveError};
      }
      
      disabled = disabled || !valid || saving || deleting || loading || loadError;
      
      return <Footer {...props}>
        <AlertGroup alerts={alerts}/>
        <Button onClick={leaveAfterCancel}>Cancel</Button>
        {footerMode === 'edit' && <Button key="apply" disabled={disabled}
                                            onClick={this.save}>Apply</Button>}
        {footerMode !== 'none' && <Button primary key="ok" disabled={disabled}
                onClick={() => this.save().then(footerMode === 'create' ? leaveAfterCreating : leaveAfterSaving)}>
          {saving ? <span><Spinner/> Saving...</span> : footerMode === 'create' ? 'Create' : 'OK'}
        </Button>}
        {children}
      </Footer>;
    }
  });

  render(): ReactElement {
    let {className, askToLeave, saving, deleting, document, validate, setAskToLeave} = this.props;

    className = classNames(className, 'mf-document-view');

    let children: any = this.props.children;
    let {valid} = validate ? validate(document) : {valid: true};

    let {ContentDecorator} = this;

    return <ContentDecorator>
      <div {...this.props} className={className}>
        {createOrCloneElement(children, {
          document,
          disabled: saving || deleting
        })}
        <CatchUnsavedChangesModal open={askToLeave} saving={saving} valid={valid}
                                  hasUnsavedChanges={this.hasUnsavedChanges()}
                                  onOpenChange={open => setAskToLeave(open)}
                                  onStayHereClick={this.abortLeaving}
                                  onDiscardChangesClick={this.discardChangesAndLeave}
                                  onSaveChangesClick={this.saveChangesAndLeave}/>
      </div>
    </ContentDecorator>;
  }
}
