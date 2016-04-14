/* @flow */

import React, {Component} from 'react';
import Immutable from 'immutable';
import Promise from 'bluebird';
import {connect} from 'react-redux';

import DocumentView from './DocumentView.jsx';

import type {Dispatch} from '../flowtypes/reduxTypes';

import * as actions from './DocumentViewActions';

type InputProps = {
  mode: 'create' | 'edit',
  reduxPath: Array<string | number>,
  effectiveDocument?: any, // the document that is actually in effect
  createDocument?: (document: any) => Promise,
  saveDocument: (document: any) => Promise,
  deleteDocument?: () => Promise,
  leave?: Function,
  leaveAfterCancel?: Function,
  leaveAfterCreating?: Function,
  leaveAfterSaving: Function,
  leaveAfterDeleting?: Function,
  hasUnsavedChanges?: (initDocument: any, document: any) => boolean,
  validate?: (document: any) => {valid: boolean},
  children?: any
};

type ReduxProps = {
  initDocument?: any,   // what the document was when this view mounted or the user last successfully Applied
  document?: any,       // the document with in-progress edits made by the user
  askToLeave?: boolean,
  saving?: boolean,
  deleting?: boolean,
  saveError?: Error,
  dispatch: Dispatch
};

type Props = InputProps & ReduxProps;

class ReduxDocumentView extends Component<void,Props,void> {
  render(): React.Element {
    let {dispatch, reduxPath} = this.props;
    let meta = {reduxPath};
    
    return <DocumentView {...this.props}
            setSaving={saving => dispatch(actions.setSaving(saving, meta))}
            setSaveError={error => dispatch(actions.setSaveError(error, meta))}
            setDeleting={deleting => dispatch(actions.setDeleting(deleting, meta))}
            setDeleteError={error => dispatch(actions.setDeleteError(error, meta))}
            setAskToLeave={askToLeave => dispatch(actions.setAskToLeave(askToLeave, meta))}
            setDocument={document => dispatch(actions.setDocument(document, meta))}
            setUpdatedTimestamp={updatedTimestamp => dispatch(actions.setUpdatedTimestamp(updatedTimestamp, meta))}/>;
  }
}

function select(state: Immutable.Map, props: InputProps): ReduxProps {
  return (state.getIn(props.reduxPath) || Immutable.Map()).toObject();
}

export default connect(select)(ReduxDocumentView);
