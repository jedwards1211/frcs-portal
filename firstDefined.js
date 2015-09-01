export default function firstDefined() {
  return Array.prototype.find.call(arguments, e => e !== undefined);
}
