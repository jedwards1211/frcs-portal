import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Immutable from 'immutable';

import BlockGrid from './BlockGrid';
import Block from './Block';
import DragHandle from './DragHandle';
import ResizeHandle from './ResizeHandle';
import CornerKnob from './CornerKnob';
import TouchHoldDragRecognizer from './TouchHoldDragRecognizer';

import {hslGenerator, restrictLuminance, generateColors} from '../colorGenerators';

export default class BlockGridTest extends Component {
  static propTypes = {
    numBlocks: React.PropTypes.number,
  }
  static defaultProps = {
    numBlocks: 20,
  }
  constructor(props) {
    super(props);

    let generator = restrictLuminance(
      hslGenerator({
        hRange: [180, 240],
        sRange: [10, 80],
      }), [0.2, 0.8]);

    let colors = generateColors({
      generator,
      numColors: props.numBlocks, 
    });

    this.state = {
      blocks: Immutable.fromJS(colors).map((color, key) => Immutable.Map({
        color,
        key,
        colSpan: Math.floor(Math.random() * 8) + 1,
        rowSpan: Math.floor(Math.random() * 8) + 1,
      })),
    };
  }
  onResizeBlock = (key, newSize) => {
    let {blocks} = this.state;

    let index = blocks.findIndex(b => b.get('key') == key);

    if (index >= 0) {
      blocks = blocks.mergeDeepIn([index], Immutable.fromJS(newSize));
      this.setState({blocks});
    }
  }
  onReorderBlocks = (newOrder) => {
    var {blocks} = this.state;

    var blockMap = {};
    blocks.forEach(block => blockMap[block.get('key')] = block);

    let nextBlocks = Immutable.List(newOrder.map(id => blockMap[id]));

    this.setState({blocks: nextBlocks});
  }
  onReorderFinished = () => {
  }
  onResizeFinished = () => {
  }
  renderBlock = (block) => {
    return <Block key={block.get('key')} {...block.toJS()}>
      <DragHandle touchDragRecognizer={TouchHoldDragRecognizer}>
        <div style={{backgroundColor: block.get('color'), height: '100%'}}/>
      </DragHandle>
      <ResizeHandle><CornerKnob/></ResizeHandle>
    </Block>;
  }
  render() {
    var {blocks} = this.state;

    return (
      <BlockGrid {...this.props}
        maxWidth={1200} 
        onResizeBlock={this.onResizeBlock}
        onReorderBlocks={this.onReorderBlocks}
        onReorderFinished={this.onReorderFinished}
        onResizeFinished={this.onResizeFinished}>
        {blocks.map(this.renderBlock).toArray()}
      </BlockGrid>
    );
  }
}

ReactDOM.render(<BlockGridTest/>, document.getElementById('root'));
