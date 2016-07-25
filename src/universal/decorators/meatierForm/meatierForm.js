import {reduxForm} from 'redux-form'
import {getFormState} from 'universal/redux/helpers'

/**
 * A small wrapper for reduxForm that can (optionally) inject a validate method based on the Joi `schema` prop in the
 * options, and also injects the necessary `getFormState` for `redux-optimistic-ui`.
 */
export default function meatierForm(options) {
  return reduxForm(Object.assign(
    options,
    {getFormState}
  ))
}
