import LandingContainer from '../modules/landing/containers/Landing/LandingContainer'

export default function (store) {
  return {
    path: 'account',
    component: LandingContainer,
    childRoutes: [
      require('./changePassword')(store),
      require('./changeEmail')(store),
    ]
  }
}
