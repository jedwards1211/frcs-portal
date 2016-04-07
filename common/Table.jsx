import React from 'react';
import {createSkinnableComponent} from 'react-skin';

import './View.sass';


/* 
 * These components all correspond to <table> and its subelements, and render to them by default.
 * However, they may be skinned to provide bells and whistles, for example wrapping a <Table> in
 * a <ScrollableTable> skin makes it scroll nicely with fixed column and row headers.
 */

const TableProps = {
  defaultComponent: 'table',
  className:        'skinnable-table'
};
export const Table = createSkinnableComponent('Table', TableProps);

const THeadProps = {
  defaultComponent: 'thead',
  className:        'skinnable-thead'
};
export const THead = createSkinnableComponent('THead', THeadProps);

const TBodyProps = {
  defaultComponent: 'tbody',
  className:        'skinnable-tbody'
};
export const TBody = createSkinnableComponent('TBody', TBodyProps);

const TRProps = {
  defaultComponent: 'tr',
  className:        'skinnable-tr'
};
export const TR = createSkinnableComponent('TR', TRProps);

const THProps = {
  defaultComponent: 'th',
  className:        'skinnable-th'
};
export const TH = createSkinnableComponent('TH', THProps);

const TDProps = {
  defaultComponent: 'td',
  className:        'skinnable-td'
};
export const TD = createSkinnableComponent('TD', TDProps);
