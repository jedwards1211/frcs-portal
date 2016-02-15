import {createSkinnableComponent, createSkinComponent} from 'react-skin';

import './Content.sass';

export const Header = createSkinnableComponent('Header', {
  defaultComponent: createSkinComponent('DefaultHeader', {component: 'div', className: 'mf-default-header'})
});
export const Body   = createSkinnableComponent('Body', {
  defaultComponent: createSkinComponent('DefaultBody'  , {component: 'div', className: 'mf-default-body'  })
});
export const Title  = createSkinnableComponent('Title', {
  defaultComponent: createSkinComponent('DefaultTitle' , {component: 'h1' , className: 'mf-default-title' })
});
export const Footer = createSkinnableComponent('Footer', {
  defaultComponent: createSkinComponent('DefaultFooter', {component: 'div', className: 'mf-default-footer'})
});
