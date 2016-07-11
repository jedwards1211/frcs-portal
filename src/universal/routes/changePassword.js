export default function (store) {
  return {
    path: 'changePassword',
    component: require('react-router!../modules/auth/containers/ChangePassword/ChangePasswordContainer')
  }
}
