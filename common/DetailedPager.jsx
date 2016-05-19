/* @flow */

import React, {Component} from 'react'
import Pager from './Pager.jsx'
import _ from 'lodash'

import './DetailedPager.sass'

type Props = {
  children?: (content: any[]) => React.Element,
  className?: string,
  page?: number,
  onPageChange?: (value: number) => any,
  offset?: number,
  numItems: number,
  itemsPerPage: number,
  numButtons?: number
};

export default class DetailedPager extends Component<void, Props, void> {
  render(): React.Element {
    let {children, numItems, page, itemsPerPage, offset} = this.props

    if (!_.isFinite(numItems) || !_.isFinite(page) || !_.isFinite(itemsPerPage) ||
        !_.isFinite(offset)) {
      return <span className="mf-detailed-pager" />
    }

    let from, to
    if (page != null) {
      from = Math.min(page * itemsPerPage + 1, numItems)
      to = Math.min(from + itemsPerPage - 1, numItems)
    }
    let numPages = Math.ceil(numItems / itemsPerPage)

    const content = []
    if (page != null) content.push(
      <span className="mf-detailed-pager-items">{`Showing ${from}-${to} of ${numItems}`}</span>
    )
    if (numPages > 1) content.push(
      <Pager {...this.props} numPages={numPages} />
    )

    if (children) return children(content)
    return <span className="mf-detailed-pager">{content}</span>
  }
}
