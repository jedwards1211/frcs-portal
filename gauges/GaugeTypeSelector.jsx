import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import './GaugeTypeSelector.sass';

var gaugePropType = PropTypes.shape({
  name:       PropTypes.string.isRequired,
  type:       PropTypes.any.isRequired,
  component:  PropTypes.any.isRequired,
});

export { gaugePropType };

export default class GaugeTypeSelector extends Component {
  static propTypes = {
    gaugeProps:         PropTypes.object.isRequired,
    gaugeTypes:         PropTypes.oneOfType([
      PropTypes.objectOf(gaugePropType),
      PropTypes.arrayOf(gaugePropType),
    ]).isRequired,
    selectedGaugeType:  PropTypes.any,
    onSelect:           PropTypes.func,
  };
  static defaultProps = {
    onSelect: function() {},
  };
  render() {
    var {gaugeTypes, selectedGaugeType, className, gaugeProps, onSelect, ...props} = this.props;

    return <div {...props} className={classNames('gauge-type-selector', className)}>
      <h3 className="gauge-radio-header">Gauge Type</h3>
      <div role="radiogroup">
        {_.map(gaugeTypes,gaugeType => {
          var {name, type} = gaugeType;
          var Gauge = gaugeType.component;
          var checked = type === selectedGaugeType;
          return <div key={type} className={classNames('gauge-radio', {checked})} 
            role="radio" aria-checked={checked} onClick={() => onSelect(type)}>
            <h4 className="gauge-radio-label" role="label">{name}</h4>
            <div className="gauge-holder">
              <Gauge {...gaugeProps}/>
              <div className="checked-overlay"/>
            </div>
          </div>;
        })}
      </div>
    </div>;
  }
}
