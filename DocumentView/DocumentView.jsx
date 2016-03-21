/* @flow */

import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import Promise from 'bluebird';

import Button from '../bootstrap/Button.jsx';
import DeleteButton from '../bootstrap/DeleteButton.jsx';
import Spinner from './../common/Spinner.jsx';
import AlertGroup from './../common/AlertGroup';
import {Nav} from './../common/View.jsx';

import createOrCloneElement from '../utils/createOrCloneElement';

import CatchUnsavedChangesModal from './../common/CatchUnsavedChangesModal.jsx';

type Props = {
  className?: string,
  mode: 'create' | 'edit',
  actions: {
    createDocument?: (document: any) => Promise,
    saveDocument: (document: any) => Promise,
    deleteDocument?: () => Promise,
    setDocument: (document: any) => any,
    setSaving: (saving: boolean) => any,
    setSaveError: (error: ?Error) => any,
    setDeleting: (deleting: boolean) => any,
    setAskToLeave: (askToLeave: boolean) => any,
    leaveAfterCancel?: Function,
    leaveAfterCreating?: Function,
    leaveAfterSaving: Function,
    leaveAfterDeleting?: Function
  },
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
export default class EditDocumentView extends Component<void,Props,State> {
  static contextTypes = {
    TitleSkin: PropTypes.any.isRequired,
    BodySkin: PropTypes.any.isRequired,
    FooterSkin: PropTypes.any.isRequired
  };
  
  static childContextTypes = {
    TitleSkin: PropTypes.any.isRequired,
    BodySkin: PropTypes.any.isRequired,
    FooterSkin: PropTypes.any.isRequired
  };
  
  getChildContext(): Object {
    let {TitleSkin, BodySkin, FooterSkin} = this;
    return {TitleSkin, BodySkin, FooterSkin};
  }
   
  state: State = {};
  componentWillMount() {
    if (this.props.mode === 'edit') {
      let {actualDocument, actions} = this.props;
      actions.setDocument(actualDocument);
    }
  }
  componentWillReceiveProps(nextProps: Props) {
    if (this.props.actualDocument !== nextProps.actualDocument) {
      let {document, mode, saving, deleting, actualDocument, actions: {setDocument}} = nextProps;
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
        else {
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

  save: () => Promise = () => {
    let {mode, document, actions: {setSaving, setSaveError, createDocument, saveDocument, setDocument}} = this.props;

    setSaving(true);
    setSaveError(undefined);

    let promise;
    if (mode === 'create') {
      if (createDocument) {
        promise = createDocument(document);
      }
      else {
        promise = Promise.reject(new Error('missing actions.createDocument'))
      }
    }
    else {
      promise = saveDocument(document);
    }
    return promise.then(() => {
      // update initDocument so there are no seemingly unsaved changes
      setDocument(document);
    }).catch(err => {
      setSaveError(err);
      throw err;
    }).finally(() => setSaving(false));
  };

  delete: () => Promise = () => {
    let {actions: {setDeleting, setSaveError, deleteDocument}} = this.props;

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
    let {askToLeave, actions: {setAskToLeave}} = this.props;
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

  TitleSkin: (props: Props) => ReactElement = props => {
    let {saving, deleting, actions: {leaveAfterDeleting}} = this.props;
    let {children} = props;
    let Title = this.context.TitleSkin; // get parent skin
    return <Title {...props}>
      <Nav right>
        <DeleteButton disabled={saving || deleting} onArmedClick={() => this.delete().then(leaveAfterDeleting)}
                      deleting={deleting} deletingText="Deleting..."/>
      </Nav>
      {children}
    </Title>;
  };

  BodySkin: (props: Props) => ReactElement = props => {
    let {actualDocument, actions: {setDocument}} = this.props;
    let {children} = props;
    let {externallyChanged, externallyDeleted} = this.state;
    let Body = this.context.BodySkin; // get parent skin

    let alerts = {};
    if (externallyChanged && actualDocument) {
      alerts.externallyChanged = {warning: <span>
        <Button warning className="alert-btn-right" onClick={() => {
          setDocument(actualDocument);
          this.setState({externallyChanged: false});
        }}>Load Changes</Button>
        Someone else changed this document.
      </span>};
    }
    if (externallyDeleted) {
      alerts.externallyDeleted = {warning: <span>
        Someone else deleted this document.  You may recreate it by pressing the Create button.
      </span>};
    }

    return <Body {...props}>
      <AlertGroup alerts={alerts}/>
      {children}
    </Body>;
  };

  FooterSkin: (props: Props) => ReactElement = props => {
    let {children} = props;
    let {mode, validate, saveError, saving, deleting,
        actions: {leaveAfterCancel, leaveAfterCreating, leaveAfterSaving}} = this.props;
    let {externallyDeleted} = this.state;
    let Footer = this.context.FooterSkin; // get parent skin
    
    let footerMode = externallyDeleted ? 'create' : mode;

    let alerts = {};
    let {valid} = validate ? validate(document) : {valid: true};
    if (!valid) {
      alerts.invalid = {error: 'Please fix the errors highlighted above before continuing'};
    }
    if (saveError) {
      alerts.saveError = {error: saveError};
    }
    return <Footer {...props}>
      <AlertGroup alerts={alerts}/>
      <Button onClick={leaveAfterCancel}>Cancel</Button>
      {footerMode !== 'create' && <Button key="apply" disabled={!valid || saving || deleting}
                                          onClick={this.save}>Apply</Button>}
      <Button primary key="ok" disabled={!valid || saving || deleting}
              onClick={() => this.save().then(footerMode === 'create' ? leaveAfterCreating : leaveAfterSaving)}>
        {saving ? <span><Spinner/> Saving...</span> : footerMode === 'create' ? 'Create' : 'OK'}
      </Button>
      {children}
    </Footer>;
  };

  render(): ReactElement {
    let {className, askToLeave, saving, deleting, document, validate, actions: {setAskToLeave}} = this.props;

    className = classNames(className, 'mf-document-view');

    let children: any = this.props.children;
    let {valid} = validate ? validate(document) : {valid: true};

    return <div {...this.props} className={className}>
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
    </div>;
  }
}
