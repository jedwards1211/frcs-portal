/* @flow */

import React, {Component} from 'react';
import classNames from 'classnames';

type DefaultProps = {
  numButtons: number,
  onChange: (value: number) => any,
  onOffsetChange: (offset: number) => any,
};

type Props = {
  className?: string,
  value?: number,
  onChange: (value: number) => any,
  onOffsetChange: (offset: number) => any,
  numPages: number,
  offset: number,
  numButtons: number
};

export default class Pager extends Component<DefaultProps,Props,void> {
  static defaultProps = {
    numButtons: 5,
    onChange() {},
    onOffsetChange() {}
  };
  setOffset: (offset: number) => void = offset => {
    let {onOffsetChange, numButtons, numPages} = this.props;
    onOffsetChange(Math.max(0, Math.min(numPages - numButtons, offset)));
  };
  render(): ReactElement {
    let {className, value, onChange, numPages, offset, numButtons} = this.props;
    let {setOffset} = this;

    let buttons = [
      <li key="previous" className={offset <= 0 ? 'disabled' : undefined}>
        <a onClick={() => setOffset(offset - numButtons)} ariaLabel="Previous">
          <span ariaHidden="true">&laquo;</span>
        </a>
      </li>
    ];

    for (let page = Math.max(0, offset); page < offset + numButtons && page < numPages; page++) {
      let content = page + 1;
      if (page === value) {
        content = <span>{page + 1} <span className="sr-only">(current)</span></span>;
      }
      buttons.push(<li key={page} className={page === value ? 'active' : undefined}>
        <a onClick={() => onChange(page)}>{content}</a>
      </li>);
    }

    buttons.push(<li key="next" className={offset + numButtons >= numPages ? 'disabled' : undefined}>
      <a onClick={() => setOffset(offset + numButtons)} arialLabel="Next">
        <span ariaHidden="true">&raquo;</span>
      </a>
    </li>);

    className = classNames(className, 'pagination');

    return <ul {...this.props} className={className}>
      {buttons}
    </ul>;
  }
}
