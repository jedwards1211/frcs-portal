/* @flow */

import type {Action} from '../../mindfront-react-components/flowtypes/reduxTypes';

export const DOCUMENT_VIEW = 'DOCUMENT_VIEW';
export const SET_ASK_TO_LEAVE = DOCUMENT_VIEW + '.SET_ASK_TO_LEAVE';
export const SET_DOCUMENT = DOCUMENT_VIEW + '.SET_DOCUMENT';
export const SET_SAVING = DOCUMENT_VIEW + '.SET_SAVING';
export const SET_SAVE_ERROR = DOCUMENT_VIEW + '.SET_SAVE_ERROR';
export const SET_DELETING = DOCUMENT_VIEW + '.SET_DELETING';
export const SET_DELETE_ERROR = DOCUMENT_VIEW + '.SET_DELETE_ERROR';
export const SET_UPDATED_TIMESTAMP = DOCUMENT_VIEW + '.SET_UPDATED_TIMESTAMP';


type Meta = {
  reduxPath: Array<string | number>
};

function createSetter(type: string):  (payload: any, meta: Meta) => Action {
  return (payload: any, meta: Meta) => ({type, payload, meta});
}

export const setAskToLeave = createSetter(SET_ASK_TO_LEAVE);
export const setDocument = createSetter(SET_DOCUMENT);
export const setSaving = createSetter(SET_SAVING);
export const setSaveError = createSetter(SET_SAVE_ERROR);
export const setDeleting = createSetter(SET_DELETING);
export const setDeleteError = createSetter(SET_DELETE_ERROR);
export const setUpdatedTimestamp = createSetter(SET_UPDATED_TIMESTAMP);
