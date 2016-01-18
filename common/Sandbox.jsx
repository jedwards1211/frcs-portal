import React, {Component, PropTypes} from 'react';
import {Router, Route, Redirect} from 'react-router';

import createHistory from 'history/lib/createHashHistory';

import SidebarView from 'mindfront-react-components/common/SidebarView';
import Tree from 'mindfront-react-components/common/Tree';

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
  render() {
    let {sidebarOpen} = this.state;
    let {requireContext, location: {pathname}, children} = this.props;

    let sidebar = <Tree>
      {requireContext.keys().map(key => {
        if (key === './Sandbox.jsx') return;
        return <Tree.Node key={key} cell={key.substring(2)}
          className={key.substring(1) === pathname ? 'selected' : ''}
          onClick={() => history.pushState(null, key.substring(1))}/>;
      })}
    </Tree>;

    // let content = children && React.createElement(children);
    // let content = <div/>;

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
