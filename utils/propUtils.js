/* @flow */

export function getEnumProp(
  props: Object,
  constants: {[key: string]: string},
  shortcutProp?: ?string): ?string
{
  if (props[shortcutProp] && constants[props[shortcutProp]]) {
    return constants[props[shortcutProp]];
  }
  for (let constant in constants) {
    if (props[constant]) return constants[constant];
  }
}

export const SIDES = {
  top: 'top',
  left: 'left',
  right: 'right',
  bottom: 'bottom',
};

export function getSide(props: Object, shortcutProp?: string = 'side'): ?string {
  return getEnumProp(props, SIDES, shortcutProp);
}
