import HomeContainer from 'universal/modules/landing/containers/Home/HomeContainer'
import LandingContainer from 'universal/modules/landing/containers/Landing/LandingContainer'

export default {
  path: '/',
  component: LandingContainer,
  indexRoute: {
    component: HomeContainer,
  },
  childRoutes: []
}
