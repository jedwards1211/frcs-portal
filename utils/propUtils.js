/* @flow */

export function getEnumProp(
  props: Object,
  constants: {[key: string]: string},
  shortcutProp?: ?string): ?string
{
  if (props[shortcutProp] && constants[props[shortcutProp]]) {
    return constants[props[shortcutProp]]
  }
  for (let constant in constants) {
    if (props[constant]) return constants[constant]
  }
}

export const LEFT_RIGHT = {
  left: 'left',
  right: 'right'
}

export function getLeftRight(props: Object, shortcutProp?: string = 'side'): ?string {
  return getEnumProp(props, LEFT_RIGHT, shortcutProp)
}

export const TOP_BOTTOM = {
  top: 'top',
  bottom: 'bottom'
}

export function getTopBottom(props: Object, shortcutProp?: string = 'side'): ?string {
  return getEnumProp(props, TOP_BOTTOM, shortcutProp)
}

export const SIDES = {
  top: 'top',
  left: 'left',
  right: 'right',
  bottom: 'bottom'
}

export function getSide(props: Object, shortcutProp?: string = 'side'): ?string {
  return getEnumProp(props, SIDES, shortcutProp)
}

export const DIRECTIONS = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right'
}

export function getDirection(props: Object, shortcutProp?: string = 'direction'): ?string {
  return getEnumProp(props, DIRECTIONS, shortcutProp)
}
