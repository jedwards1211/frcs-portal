// efficient for extending React props like inline style
// e.g. let style = propAssign(this.props.style, {paddingLeft: depth * 10});
export default function propAssign(a, b) {
  return a ? Object.assign({}, a, b) : b;
}
