import React from 'react';
import Modal from './Modal';
import {Header, Title, Body, Footer} from './../common/View';
import Button from './Button';
import CloseButton from './CloseButton';

export default class ModalExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {modalVisible: false};
  }
  showModal = () => {
    this.setState({modalVisible: true});
  };
  hideModal = () => {
    this.setState({modalVisible: false});
  };
  onOK = () => {
    console.log('You clicked OK!');
    this.hideModal();
  };
  render() {
    var {modalVisible} = this.state;

    var modal, backdrop;

    if (modalVisible) {
      // don't forget to put keys on Modal and Modal.Backdrop!
      // Modal.TransitionGroup needs keys to handle the transitions.
      // otherwise they won't show up.

      // note the onClick handler -- you have to set this manually.
      // Modal.Backdrop won't automatically hide any Modal when you
      // click it.
      backdrop = <Modal.Backdrop key="backdrop" onClick={this.hideModal}/>;

      // note below that again we define onClick handlers for all
      // the buttons manually.  All of the elements inside Modal
      // are optional.
      modal = <Modal key="modal">
        <Header>
          {/* the CloseButton must come first for correct layout, unfortunately */}
          <CloseButton onClick={this.hideModal}/>
          <Title>Example Modal</Title>
        </Header>
        <Body>
          Body text
        </Body>
        <Footer>
          <Button onClick={this.hideModal}>Cancel</Button>
          <Button primary onClick={this.onOK}>OK</Button>
        </Footer>
      </Modal>;
    }

    return <div>
      <Button onClick={this.showModal}>Show Modal</Button>
      <Modal.TransitionGroup>
        {/* note that these will be undefined if modalVisible is falsey.
          * So when you want to make the modal visible, make sure it's a child
          * of Modal.TransitionGroup; when you want it to be hidden, make sure
          * it's not a child.
          */}
        {backdrop}
        {modal}
      </Modal.TransitionGroup>
    </div>;
  }
}
