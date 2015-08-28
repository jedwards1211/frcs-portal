import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classNames from 'classnames';
import shouldPureComponentUpdate from 'react-pure-render/function';

import Canvas from './Canvas';
import CanvasClearer from './CanvasClearer';
import Trace from './Trace';
import GridLines from './GridLines';
import PlotInteractionController from './PlotInteractionController';
import LinearConversion from './LinearConversion';
import {GridMetrics} from './GridMetrics';

import {Axis, xAxis} from '../orient';

import './Plot.sass';

export default class Plot extends React.Component {
  shouldComponentUpdate = shouldPureComponentUpdate
  constructor(props) {
    super(props);
    this.state = {
      plotSize: {
        width: 1,
        height: 1,
      },
    };
  }
  static propTypes = {
    domainAxis:     React.PropTypes.instanceOf(Axis),
    domainMetrics:  React.PropTypes.instanceOf(GridMetrics),
    dataCache:      React.PropTypes.shape({
      get:            React.PropTypes.func.isRequired,
      addListener:    React.PropTypes.func.isRequired,
      removeListener: React.PropTypes.func.isRequired,
    }).isRequired,
    onMove:         React.PropTypes.func,
    onResize:       React.PropTypes.func,
    traces:         ImmutablePropTypes.listOf(
      ImmutablePropTypes.shape({
        id:             React.PropTypes.any.isRequired,
        min:            React.PropTypes.number.isRequired,
        max:            React.PropTypes.number.isRequired,
        conversionType: React.PropTypes.func,
        color:          React.PropTypes.string.isRequired,
      })
    ),
  }
  static defaultProps = {
    wrapCanvas: i => i,
    domainAxis: xAxis,
  }
  componentWillReceiveProps(newProps) {
    if (newProps.dataCache !== this.props.dataCache) {
      this.props.dataCache.removeListener('dataChange', this.onDataChange);
      newProps.  dataCache.addListener   ('dataChange', this.onDataChange);
    }
  }
  componentDidMount() {
    this.props.dataCache.addListener   ('dataChange', this.onDataChange); 
  }
  componentWillUnmount() {
    this.props.dataCache.removeListener('dataChange', this.onDataChange);
  }
  onPlotResize = (newSize) => {
    this.setState({plotSize: newSize});
    if (this.props.onResize) this.props.onResize(newSize);
  }
  onDataChange = (details) => {
    var {plotSize} = this.state;
    var {domainAxis, domainMetrics, traces} = this.props;

    var domainConversion = domainMetrics.conversion;
    var minTime = domainConversion.invert(0.5);
    var maxTime = domainConversion.invert(plotSize[domainAxis.span] - 0.5);
    var hasChannel = traces.find(trace => details.channels.hasOwnProperty(trace.get('id')));

    if (details.beginTime < maxTime && details.endTime > minTime && hasChannel) {
      this.forceUpdate();
    }
  }
  render() {
    var {plotSize} = this.state;
    var {domainAxis, domainMetrics, dataCache, onMove, traces} = this.props;

    var domainConversion = domainMetrics.conversion;

    var plotInteractionControllerProps = {
      [domainAxis.name + 'Conversion']: domainConversion
    };

    var className = classNames('plot', 'plot-' + domainAxis.name + '-axis');

    var mappedTraces = [];
    if (plotSize[domainAxis.opposite.span] > 1) {
      traces.forEach(trace => {
        var id = trace.get('id');
        var valueConversion = new (trace.get('conversionType') || LinearConversion)(
          trace.get('min'), plotSize[domainAxis.opposite.span] - 0.5, trace.get('max'), 0.5);

        mappedTraces.push(<Trace key={id} forEachPoint={(...args) => dataCache.get(id, ...args)} lineColor={trace.get('color')}
          domainConversion={domainConversion} valueConversion={valueConversion} domainAxis={domainAxis}/>);
      });
    }

    return <div className={className}>
      <div className="trace-blocks">
      </div>
      <PlotInteractionController {...plotInteractionControllerProps} onMove={onMove}>
        <div className="plot-border">
          <Canvas className="plot-canvas" ref="plot" onResize={this.onPlotResize}>
            <CanvasClearer/>
            <GridLines metrics={domainMetrics} axis={domainAxis}/>
            {mappedTraces}
          </Canvas>
        </div>
      </PlotInteractionController>
    </div>;
  } 
}