import {createSkinnableComponent} from 'react-skin';

import './View.sass';

export const View = createSkinnableComponent('View', {
  defaultComponent: 'div',
  defaultClassName: 'mf-default-view',
  className:        'skinnable-view',
});
export const Header = createSkinnableComponent('Header', {
  defaultComponent: 'div',
  defaultClassName: 'mf-default-header',
  className:        'skinnable-header',
});
export const Body   = createSkinnableComponent('Body', {
  defaultComponent: 'div',
  defaultClassName: 'mf-default-body',
  className:        'skinnable-body',
});
export const Title  = createSkinnableComponent('Title', {
  defaultComponent: 'h3',
  defaultClassName: 'mf-default-title',
  className:        'skinnable-title',
});
export const Footer = createSkinnableComponent('Footer', {
  defaultComponent: 'div',
  defaultClassName: 'mf-default-footer',
  className:        'skinnable-footer',
});
export const Link   = createSkinnableComponent('Link', {
  defaultComponent: 'a',
});
