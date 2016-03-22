/* @flow */

import React, {Component, PropTypes} from 'react';
import Promise from 'bluebird';
import {connect} from 'react-redux';

import DocumentView from './DocumentView.jsx';

import {Dispatch} from '../flowtypes/reduxTypes';

import * as actions from './DocumentViewActions';

type InputProps = {
  mode: 'create' | 'edit',
  reduxPath: Array<string | number>,
  createDocument?: (document: any) => Promise,
  saveDocument: (document: any) => Promise,
  deleteDocument?: () => Promise,
  leaveAfterCancel?: Function,
  leaveAfterCreating?: Function,
  leaveAfterSaving: Function,
  leaveAfterDeleting?: Function,
  hasUnsavedChanges?: (initDocument: any, document: any) => boolean,
  validate?: (document: any) => {valid: boolean},
  children?: any
};

type ReduxProps = {
  actualDocument?: any, // the document that is actually in effect
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
  render(): ReactElement {
    let {dispatch, reduxPath} = this.props;
    let meta = {reduxPath};
    
    return <DocumentView {...this.props}
            setSaving={saving => dispatch(actions.setSaving(saving, meta))} 
            setDeleting={deleting => dispatch(actions.setDeleting(deleting, meta))}
            setAskToLeave={askToLeave => dispatch(actions.setAskToLeave(askToLeave, meta))}
            setDocument={document => dispatch(actions.setDocument(document, meta))}
            setSaveError={error => dispatch(actions.setSaveError(error, meta))}/>;
  }
}

function select(state: Immutable.Map, props: InputProps): ReduxProps {
  return (state.getIn(props.reduxPath) || Immutable.Map()).toObject();
}

export default connect(select)(ReduxDocumentView);
