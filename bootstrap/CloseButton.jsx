import React from 'react';

export default React.createClass({
  render() {
    return <button {...this.props} type="button" className="close" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>;
  }
});
