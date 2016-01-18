import React, {Component} from 'react';
import classNames from 'classnames';
import Immutable from 'immutable';
import _ from 'lodash';
import layoutBlockGrid from './layoutBlockGrid';
import EventEmitter from 'events';

import RobustTransitionGroup from '../transition/InterruptibleTransitionGroup';

import './BlockGrid.sass';

export default class BlockGrid extends Component {
  static propTypes = {
    onReorderBlocks:  React.PropTypes.func,
    onReorderFinished:React.PropTypes.func,
    onResizeBlock:    React.PropTypes.func,
    onResizeFinished: React.PropTypes.func,
    layoutBlockGrid:  React.PropTypes.func,
    cellWidth:        React.PropTypes.number,
    cellHeight:       React.PropTypes.number,
    spacing:          React.PropTypes.number,
    minWidth:         React.PropTypes.number,
    maxWidth:         React.PropTypes.number,
    minColSpan:       React.PropTypes.number,
    maxColSpan:       React.PropTypes.number,
    minRowSpan:       React.PropTypes.number,
    maxRowSpan:       React.PropTypes.number,
    snapSize:         React.PropTypes.number,
    hAlign:           React.PropTypes.string,
  };
  static defaultProps = {
    hAlign: 'center',
    cellWidth: 50,
    cellHeight: 50,
    spacing: 10,
    minColSpan: 1,
    maxColSpan: 10,
    minRowSpan: 1,
    maxRowSpan: 10,
    snapSize: 20,
    layoutBlockGrid,
    onReorderBlocks: _.noop,
    onReorderFinished: _.noop,
    onResizeBlock: _.noop,
    onResizeFinished: _.noop,
  };
  static childContextTypes = {
    observePosition:  React.PropTypes.func.isRequired,
    onDragStart:      React.PropTypes.func.isRequired,
    onDragMove:       React.PropTypes.func.isRequired,
    onDragEnd:        React.PropTypes.func.isRequired,
    onResizeStart:    React.PropTypes.func.isRequired,
    onResizeMove:     React.PropTypes.func.isRequired,
    onResizeEnd:      React.PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);

    // this determines the actual DOM order of the children.
    // Children that change order won't animate
    // from one position to the next properly.  Since they're
    // absolutely positioned anyway, their actual order doesn't
    // matter.
    this.blocks = [];
    this.emitter = new EventEmitter();

    let layout = Immutable.fromJS({
      availWidth: 0,
      cellWidth:  props.cellWidth,
      cellHeight: props.cellHeight,
      spacing:    props.spacing,
      blocks:     React.Children.map(props.children, child => Immutable.Map({
        key:        child.key,
        rowSpan:    child.props.rowSpan,
        colSpan:    child.props.colSpan
      })),
    });

    let blockGridProps = Immutable.Map();

    this.state = {
      layout, 
      blockGridProps
    };
  }
  getChildContext() {
    return {
      observePosition:  this.observePosition,
      onDragStart:      this.onDragStart,
      onDragMove:       this.onDragMove,
      onDragEnd:        this.onDragEnd,
      onResizeStart:    this.onResizeStart,
      onResizeMove:     this.onResizeMove,
      onResizeEnd:      this.onResizeEnd,
    }
  } 
  observePosition = (key, observer) => {
    this.emitter.addListener(key, observer);
    return () => this.emitter.removeListener(key, observer);
  };
  componentWillReceiveProps(newProps) {
    var layout = this.state.layout.withMutations(layout => {
      layout.set('cellWidth',   newProps.cellWidth)
            .set('cellHeight',  newProps.cellHeight)
            .set('spacing',     newProps.spacing);

      layout.set('blocks',      layout.get('blocks').withMutations(blocks => {
        // move existing blocks into the new order corresponding to new children.
        // don't copy blocks that are no longer have corresponding children,
        // and create new blocks will for new children.
        var indexedBlocks = {};
        blocks.forEach(block => indexedBlocks[block.get('key')] = block);

        blocks.setSize(React.Children.count(newProps.children));
        React.Children.forEach(newProps.children, (child, index) => {
          var block = indexedBlocks[child.key] || Immutable.Map({key: child.key});
          blocks.set(index, block.set('rowSpan', child.props.rowSpan)
                                 .set('colSpan', child.props.colSpan));
        });
      }));
    });
    if (layout !== this.state.layout || this.props.layoutBlockGrid !== newProps.layoutBlockGrid) {
      this.setState({layout: newProps.layoutBlockGrid(layout)});
    }
  }
  resize = () => {
    var root = this.refs.blockGrid;
    var maxWidth =  _.max([this.props.minWidth, 
                    _.min([this.props.maxWidth, root.offsetWidth])]);
    var layout = this.state.layout.set('maxWidth', maxWidth)
                                  .set('availWidth', root.offsetWidth);
    if (layout !== this.state.layout) {
      this.setState({layout: this.props.layoutBlockGrid(layout)});
    }
  };
  checkOrder = () => {
    var layout = this.props.layoutBlockGrid(this.state.layout, this.grabbed);
    if (layout !== this.state.layout) {
      var newOrder = [];
      layout.get('blocks').forEach(block => newOrder.push(block.get('key')));
      this.props.onReorderBlocks(newOrder);
    }
  };
  componentDidMount() {
    this.throttledResize      = _.throttle(this.resize, 250);
    this.throttledCheckOrder  = _.throttle(this.checkOrder, 100);
    window.addEventListener('resize', this.throttledResize);
    this.resize();
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.throttledResize);
  }
  onDragStart = (key, startPosition) => {
    this.startPosition = startPosition;
    this.grabbed = this.state.layout.get('blocks').find(b => b.get('key') === key);
    this.grabbed = this.grabbed.set('startX', this.grabbed.get('x'))
                               .set('startY', this.grabbed.get('y'));
    this.forceUpdate();
  };
  onDragMove = (key, newPosition) => {
    let {x: startX, y: startY} = this.startPosition;
    let {x: newX,   y: newY  } = newPosition;

    this.grabbed = 
      this.grabbed.set('x', this.grabbed.get('startX') + newX - startX)
                  .set('y', this.grabbed.get('startY') + newY - startY);

    var block = this.state.layout.get('blocks').find(b => b.get('key') === key);
    var position = block.set('x', this.grabbed.get('x'))
                        .set('y', this.grabbed.get('y'));

    this.emitter.emit(key, block, position);

    this.throttledCheckOrder();
  };
  onDragEnd = (key) => {
    delete this.grabbed;
    
    this.forceUpdate();

    this.props.onReorderFinished();
  };
  onResizeStart = (key, startPosition) => {
    this.startPosition = startPosition;
    var block = this.state.layout.get('blocks').find(b => b.get('key') === key);
    this.resizing = block.set('startWidth' , block.get('width' ))
                         .set('startHeight', block.get('height'));
    this.forceUpdate();
  };
  onResizeMove = (key, newPosition) => {
    let {x: startX, y: startY} = this.startPosition;
    let {x: newX,   y: newY  } = newPosition;
   
    var cellWidth  = this.props.cellWidth,
        cellHeight = this.props.cellHeight,
        minColSpan = this.props.minColSpan,
        maxColSpan = this.props.maxColSpan,
        minRowSpan = this.props.minRowSpan,
        maxRowSpan = this.props.maxRowSpan,
        spacing    = this.props.spacing,
        snapSize   = this.props.snapSize;

    var newWidth  = this.resizing.get('startWidth' ) + newX - startX;
    var newHeight = this.resizing.get('startHeight') + newY - startY;

    newWidth  = Math.max(minColSpan * cellWidth  - spacing, Math.min(maxColSpan * cellWidth  - spacing, newWidth));
    newHeight = Math.max(minRowSpan * cellHeight - spacing, Math.min(maxRowSpan * cellHeight - spacing, newHeight));

    var newColSpan = Math.max(minColSpan, Math.min(maxColSpan, Math.ceil(newWidth  / cellWidth )));
    var newRowSpan = Math.max(minRowSpan, Math.min(maxRowSpan, Math.ceil(newHeight / cellHeight)));

    var snapWidth  = newColSpan * cellWidth  - spacing;
    var snapHeight = newRowSpan * cellHeight - spacing;

    if (Math.abs(newWidth  - snapWidth ) <= snapSize) newWidth  = snapWidth;
    if (Math.abs(newHeight - snapHeight) <= snapSize) newHeight = snapHeight;

    this.resizing = this.resizing.set('width' , newWidth )
                                 .set('height', newHeight)

    var block = this.state.layout.get('blocks').find(b => b.get('key') === key);
    var position = block.set('width' , this.resizing.get('width' ))
                        .set('height', this.resizing.get('height'));

    this.emitter.emit(key, block, position);

    if (newRowSpan !== block.get('rowSpan') ||
        newColSpan !== block.get('colSpan')) {
      this.props.onResizeBlock(key, {
        rowSpan: newRowSpan,
        colSpan: newColSpan
      });
    }

    this.throttledCheckOrder();
  };
  onResizeEnd = (key) => {
    delete this.resizing;
    this.setState({layout: this.props.layoutBlockGrid(this.state.layout)});
    this.props.onResizeFinished();
  };
  render() {
    var {props, state, grabbed, resizing} = this;
    var {className, hAlign} = props;
    var {layout, blockGridProps} = state;
    var spacing   = layout.get('spacing');

    blockGridProps = blockGridProps.withMutations(blockGridProps => {
      blockGridProps.set('spacing', spacing);
      blockGridProps.set('arranging', !!grabbed);
    });

    // index the layout blocks by their key
    var blockMap = {};
    layout.get('blocks').forEach(block => {
      blockMap[block.get('key')] = block;
    });

    // now replace them with the child React nodes
    React.Children.forEach(this.props.children, child => {
      var position = blockMap[child.key];

      var isGrabbed = grabbed && grabbed.get('key') === child.key;
      if (isGrabbed) {
        position = position.set('x', grabbed.get('x')).set('y', grabbed.get('y'));
      }

      var isResizing = resizing && resizing.get('key') === child.key;
      if (isResizing) {
        position = position.set('width', resizing.get('width')).set('height', resizing.get('height'));
      }

      blockMap[child.key] = React.cloneElement(child, {
        position,
        blockKey: child.key,
        blockGridProps,
        grabbed: isGrabbed,
        resizing: isResizing,
      });
    });

    // copy pre-existing blocks in the same order.
    // this ensures that they will animate properly
    // (if their DOM order changes their animation state
    // will be reset)
    var newBlocks = [];
    for (let oldBlock of this.blocks) {
      var key = oldBlock.key;
      var block = blockMap[key];
      if (block) {
        newBlocks.push(block);
        delete blockMap[key];
      }
    }

    // add all of the new blocks at the end
    newBlocks = newBlocks.concat(_.values(blockMap));

    // save the order for next render
    this.blocks = newBlocks;

    className = classNames('block-grid', className);

    var blocksLeft = Math.max(0, layout.get('availWidth') - layout.get('width')) *
              (hAlign === 'left' ? 0 : hAlign === 'right' ? 1 : 0.5)

    var blocksStyle = {
      width:  layout.get('width' ),
      height: layout.get('height'),
      left:   blocksLeft
    };

    blocksStyle = _.pick(blocksStyle, prop => !isNaN(prop) && prop !== null);

    return (
      <div ref = "blockGrid" {...props} className={className}>
        <div className="blocks" style={blocksStyle}>
          <RobustTransitionGroup transitionName="blocks" key="blocks" className="blocks" component="div">
            {!!layout.get('availWidth') && newBlocks}
          </RobustTransitionGroup>
        </div>
      </div>
    );
  } 
}