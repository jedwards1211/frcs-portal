/**
 * Forwards calls to ReactTransitionGroup child methods to this.refs[ref].
 */
export default function forwardTransitionsTo(ref) {
  return function decorator(target) {
    target.prototype.componentWillAppear = function(callback) {
      let target = this.refs[ref];
      if (target.componentWillAppear) {
        target.componentWillAppear(callback);
      }
    }
    target.prototype.componentDidAppear = function() {
      let target = this.refs[ref];
      if (target.componentDidAppear) {
        target.componentDidAppear();
      }
    }
    target.prototype.componentWillEnter = function(callback) {
      let target = this.refs[ref];
      if (target.componentWillEnter) {
        target.componentWillEnter(callback);
      }
    }
    target.prototype.componentDidEnter = function() {
      let target = this.refs[ref];
      if (target.componentDidEnter) {
        target.componentDidEnter();
      }
    }
    target.prototype.componentWillLeave = function(callback) {
      let target = this.refs[ref];
      if (target.componentWillLeave) {
        target.componentWillLeave(callback);
      }
    }
    target.prototype.componentDidLeave = function() {
      let target = this.refs[ref];
      if (target.componentDidLeave) {
        target.componentDidLeave();
      }
    }
    return target;
  }
}