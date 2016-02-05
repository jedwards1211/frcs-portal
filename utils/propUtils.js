/* @flow */

export function getEnumProp(props: Object, constants: Array<string> | {[key: string]: string}): ?string {
  if (constants instanceof Array) {
    for (let constant of constants) {
      if (props.hasOwnProperty(constant)) return constant;
    }
  }
  else {
    for (let constant in constants) {
      if (props.hasOwnProperty(constant)) return constants[constant];
    }
  }
}
