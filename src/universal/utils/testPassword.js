import owasp from 'owasp-password-strength-test'

owasp.config({
  allowPassphrases       : true,
  maxLength              : 128,
  minLength              : 10,
  minPhraseLength        : 20,
  minOptionalTestsToPass : 3
});

export default password => owasp.test(password)
