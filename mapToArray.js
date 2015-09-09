export default function mapToArray(imm, iteratee) {
  let result = [];
  imm.forEach((...args) => result.push(iteratee(...args)));
  return result;
}