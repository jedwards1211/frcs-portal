import React, {Component, PropTypes} from 'react';
import {Router, Route, Redirect} from 'react-router';

import createHistory from 'history/lib/createHashHistory';

import SidebarView from './SidebarView';
import Tree from './Tree';
import {BasicNode} from './TreeModel';

import './Sandbox.sass';

let history = createHistory();

class Shell extends Component {
  static propTypes = {
    requireContext: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      sidebarOpen: true,
    };
  }
  renderTreeNode = (node, props) => {
    return <Tree.Cell {...props} node={node} onClick={() => history.pushState(null, node.data.module.substring(1))}>
      {node.data.module}
    </Tree.Cell>;
  };
  render() {
    let {sidebarOpen} = this.state;
    let {requireContext, location: {pathname}, children} = this.props;

    let root = new BasicNode({
      expanded: true,
      children: requireContext.keys().filter(key => key !== './Sandbox.jsx').map(module => {
        return {
          module,
          selected: module.substring(1) === pathname,
          //onClick: () => history.pushState(null, key.substring(1)),
        };
      }),
    });

    let sidebar = <Tree root={root} renderNode={this.renderTreeNode}/>;

    return <SidebarView className="mf-sandbox" sidebarOpen={sidebarOpen} 
      onCloseSidebarClick={() => this.setState({sidebarOpen: false})}
      onOpenSidebarClick={() => this.setState({sidebarOpen: true})}
      sidebar={sidebar} content={children}/>;
  }
}

export default class Sandbox extends Component {
  static propTypes = {
    requireContext: PropTypes.func,
  };
  render() {
    let {requireContext} = this.props;

    return <Router history={history} requireContext={requireContext}>
      <Route component={(props) => <Shell {...props} requireContext={requireContext}/>}>
        {requireContext.keys().map(key => {
          let sourceComponent = requireContext(key);
          if (sourceComponent.__esModule) {
            sourceComponent = sourceComponent.default;
          }
          let component = sourceComponent;
          if (React.isValidElement(sourceComponent)) {
            component = props => React.cloneElement(sourceComponent, {...props, ...sourceComponent.props});
          }
          return <Route key={key} path={key.substring(1)} 
            component={component}/>;
        })}
        <Route path="/" component="div" />
        <Redirect from="/*" to="/" />
      </Route>
    </Router>;
  } 
}
