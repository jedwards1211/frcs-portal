import React, {Component, PropTypes} from 'react';
import {Router, Route, Redirect} from 'react-router';
import shallowEqual from 'fbjs/lib/shallowEqual';

import createHistory from 'history/lib/createHashHistory';

import SidebarView from './SidebarView';
import Tree from './Tree';

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
  adapter = {
    shouldUpdate: (oldNode, newNode) => !shallowEqual(oldNode, newNode),
    hasChildren: node => node.children && node.children.length > 0,
    mapChildren: (node, iteratee) => node.children && node.children.map(iteratee),
    isExpanded: node => this.adapter.hasChildren(node),
    render: (node, props) => {
      return <Tree.Cell {...props} {...node}>
        {node.text}
      </Tree.Cell>;
    }
  };
  render() {
    let {sidebarOpen} = this.state;
    let {requireContext, location: {pathname}, children} = this.props;

    let root = {
      children: requireContext.keys().filter(key => key !== './Sandbox.jsx').map(key => {
        return {
          text: key,
          selected: key.substring(1) === pathname,
          onClick: () => history.pushState(null, key.substring(1)),
        };
      }),
    };

    let sidebar = <Tree root={root} adapter={this.adapter}/>;

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
