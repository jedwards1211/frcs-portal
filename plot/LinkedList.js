/**
 * A node of a LinkedList.
 */
class Node {
  constructor(list, elem, prev, next) {
    this.list = list;
    this.elem = elem;
    this.prev = prev;
    this.next = next;
  }

  /**
   * Removes this node from its parent LinkedList.
   * @throws {Error} if this node has already been removed.
   */
  remove() {
    var {list, prev, next} = this;
    list.size--;
    this.list = this.next = this.prev = undefined;
    if (prev) prev.next = next;
    if (next) next.prev = prev;
    if (list.head === this) list.head = next;
    if (list.tail === this) list.tail = prev;
  }

  moveToHead() {
    var {list, prev, next} = this;
    if (list.head !== this) {
      if (prev) prev.next = next;
      if (next) next.prev = prev;
      if (list.tail === this) list.tail = prev;
      this.prev = undefined;
      this.next = list.head;
      list.head.prev = list.head = this;
    }
  }
}

export default class LinkedList {
  constructor() {
    this.size = 0;
  }

  /**
   * Adds the element to the tail of the list.
   * @return {Node} the node created for the element.
   */
  append(elem) {
    this.size++;
    if (!this.tail) {
      return this.head = this.tail = new Node(this, elem);
    }
    return this.tail = this.tail.next = new Node(this, elem, this.tail);
  }

  /**
   * Adds the element to head of the list.
   * @return {Node} the node created for the element.
   */
  prepend(elem) {
      this.size++;
      if (!this.head) {
        return this.head = this.tail = new Node(this, elem);
      }
      return this.head = this.head.prev = new Node(this, elem, undefined, this.head);
  }

  integrityCheck() {
    var prev;
    var node = this.head;
    var count = 0;
    while (node) {
      count++;
      if (node.prev !== prev) {
        throw new Error("node.prev !== prev");
      }
      if (prev && prev.next !== node) {
        throw new Error("prev.next !== node");
      }
      prev = node;
      node = node.next;
    }
    if (prev !== this.tail) {
      throw new Error("prev !== this.tail");
    }
    if (count !== this.size) {
      throw new Error("count !== this.size");
    }
  }
}