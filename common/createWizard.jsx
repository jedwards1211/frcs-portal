import React, {Component} from 'react';
import classNames from 'classnames';

import PageSlider from 'mindfront-react-components/common/PageSlider';
import BSModal from 'mindfront-react-components/bootstrap/Modal';

export default function createWizard({Steps, title, baseClassName, propTypes, defaultProps}) {
  class Body extends Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    render() {
      let {activeIndex} = this.props;

      return <PageSlider className={baseClassName + '-body'} activeIndex={activeIndex}>
        {Steps.map(Step => (<Step key={Step.name} {...this.props}/>))}
      </PageSlider>;
    }
  }

  class Buttons extends Component {
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

  class Modal extends Component {
    render() {
      let {className} = this.props;
      className = classNames(className, baseClassName + '-modal');

      return <BSModal {...this.props} className={className}>
        <BSModal.Header>
          <BSModal.Title>{title}</BSModal.Title>
        </BSModal.Header>
        <BSModal.Body>
          <Body {...this.props}/>
        </BSModal.Body>
        <BSModal.Footer>
          <Buttons {...this.props}/>
        </BSModal.Footer>
      </BSModal>;
    }
  }

  return {Body, Buttons, Modal};
}