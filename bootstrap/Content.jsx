import {createSkinnableComponent} from 'react-skin';

import './Content.sass';

export const Container = createSkinnableComponent('Container', {
  defaultComponent: 'div',
  defaultClassName: 'mf-default-container',
  className:        'skinnable-container',
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
