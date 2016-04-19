import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';

/**
 * This is a skin for the skinnable Table (see ./Table.jsx) that splits it up into multiple tables, wrapping the rows
 * just like rows of text in a multi-column article flow.
 */
export default class SplitTable extends Component {
  render() {
    let {className, numParts, children} = this.props;
    className = classNames(className, 'mf-SplitTable');
    
    let width = (100 / numParts) + '%';

    let tables = [];
    for (let part = 0; part < numParts; part++) {
      tables.push(<PartialTable key={part} part={part} numParts={numParts} children={children}
                                style={{display: 'inline-block', verticalAlign: 'top', width}}/>);
    }

    return <div {...this.props} className={className} children={tables}/>;
  }
}

class PartialTable extends Component {
  static childContextTypes = {
    TBodySkin: PropTypes.any.isRequired,
    part: PropTypes.number.isRequired,
    numParts: PropTypes.number.isRequired
  };
  getChildContext() {
    let {part, numParts} = this.props;
    return {TBodySkin, part, numParts};
  }
  render() {
    return <div {...this.props}/>;
  }
}

class TBodySkin extends Component {
  static contextTypes = {
    part: PropTypes.number.isRequired,
    numParts: PropTypes.number.isRequired
  };
  render() {
    let {part, numParts} = this.context;
    let {children} = this.props;

    let childArray = React.Children.toArray(children);
    let start = Math.ceil(childArray.length * part / numParts);
    let end = Math.ceil(childArray.length * (part + 1) / numParts);

    return <tbody {...this.props} children={childArray.slice(start, end)}/>;
  }
}
