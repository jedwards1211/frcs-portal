export default function paddingHeight(element) {
  let style = getComputedStyle(element)
  return parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
}
