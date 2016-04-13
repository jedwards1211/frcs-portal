/* @flow */

import React, {Component} from 'react';

import Alert from '../../mindfront-react-components/bootstrap/Alert.jsx';
import ListGroup from '../../mindfront-react-components/bootstrap/ListGroup.jsx';
import Glyphicon from '../../mindfront-react-components/bootstrap/Glyphicon.jsx';
import Spinner from '../../mindfront-react-components/common/Spinner.jsx';

import {View, Header, Title, Body, Footer} from '../../mindfront-react-components/common/View.jsx';

export type NonDefaultProps = {
  title: string,
  itemPluralDisplayName: string,
  loading?: boolean,
  loadError?: boolean,
  children?: Array<any>,
};

type DefaultProps = {
  ItemLink: ReactTag
};

// export type Props = DefaultProps & NonDefaultProps;

export type Props = {
  ItemLink: ReactTag,
  title: string,
  itemPluralDisplayName: string,
  loading?: boolean,
  loadError?: boolean,
  children?: Array<any>
};

export default class DrilldownListView extends Component<DefaultProps,Props,void> {
  static defaultProps = {
    ItemLink: 'a'
  };
  render(): React.Element {
    let {loading, loadError, title, children, itemPluralDisplayName} = this.props;
    let ItemLink: any = this.props.ItemLink;

    let body;
    if (loading) {
      body = <Alert info><Spinner/> Loading {itemPluralDisplayName}...</Alert>;
    }
    else if (loadError) {
      body = <Alert error={loadError}/>;
    }
    else {
      body = <ListGroup>
        {children && children.map((item, key) => {
          return <ItemLink key={key} item={item}>
            <Glyphicon menuRight float="right"/>
          </ItemLink>;
        })}
      </ListGroup>;
    }

    return <View {...this.props}>
      <Header>
        <Title>{title}</Title>
      </Header>
      <Body>{body}</Body>
      <Footer/>
    </View>;
  }
}
