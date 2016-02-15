import React, {Component} from 'react';
import classNames from 'classnames';

import PageSlider from './PageSlider';
import {Header, Title, Body, Footer} from '../bootstrap/Content.jsx';
import Modal from '../bootstrap/Modal';

export default function createWizard({Steps, title, baseClassName, propTypes, defaultProps}) {
  class WizardBody extends Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    render() {
      let {activeIndex} = this.props;

      return <PageSlider className={baseClassName + '-body'} activeIndex={activeIndex}>
        {Steps.map(Step => (<Step key={Step.name} {...this.props}/>))}
      </PageSlider>;
    }
  }

  class WizardButtons extends Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    render() {
      let {activeIndex} = this.props;
      let Step = Steps[activeIndex];

      return <div className={baseClassName + '-buttons'}>
        {Step && Step.renderButtons && Step.renderButtons(this.props)}
      </div>;
    }
  }

  class WizardModal extends Component {
    render() {
      let {className} = this.props;
      className = classNames(className, baseClassName + '-modal');

      return <Modal {...this.props} className={className}>
        <Header>
          <Title>{title}</Title>
        </Header>
        <Body>
          <WizardBody {...this.props}/>
        </Body>
        <Footer>
          <WizardButtons {...this.props}/>
        </Footer>
      </Modal>;
    }
  }

  return {Body: WizardBody, Buttons: WizardButtons, Modal: WizardModal};
}