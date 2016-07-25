import React, {PropTypes, Component} from 'react'
import {Map as iMap} from 'immutable'
import {connect} from 'react-redux'
import {ensureState} from 'redux-optimistic-ui'
import {fetchSettings} from '../redux/settings'

@connect(mapStateToProps)
export default class SettingsContainer extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    settings: PropTypes.object.isRequired,
    children: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  componentWillMount() {
    const {dispatch, isAuthenticated} = this.props
    if (isAuthenticated) dispatch(fetchSettings())
  }

  componentWillReceiveProps(nextProps) {
    const {dispatch, isAuthenticated, user} = nextProps
    if (isAuthenticated !== this.props.isAuthenticated || user !== this.props.user) dispatch(fetchSettings())
  }

  render() {
    const {children} = this.props
    return children(this.props)
  }
}

function mapStateToProps(state) {
  const settings = ensureState(state).get('settings') || iMap()
  return {
    user: ensureState(state).getIn(['auth', 'user']),
    isAuthenticated: ensureState(state).getIn(['auth', 'isAuthenticated']),
    settings: settings.toJS()
  }
}
