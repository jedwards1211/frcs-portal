import classNames from 'classnames';

export default function validationClassNames(validation) {
  if (validation) {
    return classNames({
      'has-error':   !!(validation.error || validation.alarm || validation.danger),
      'has-warning': !!validation.warning,
      'has-info':    !!validation.info,
      'has-success': !!(validation.success || validation.ok),
    });
  }
  return '';
}
