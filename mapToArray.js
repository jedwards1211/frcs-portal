export default function mapToArray(imm, iteratee) {
  let result = [];
  if (imm) imm.forEach((...args) => result.push(iteratee(...args)));
  return result;
}