export default function (store) {
  return {
    path: 'changeEmail',
    component: require('react-router!../modules/auth/containers/ChangeEmail/ChangeEmailContainer')
  }
}
