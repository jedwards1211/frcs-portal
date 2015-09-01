import Conversion from './Conversion';

import * as GridMath from './GridMath';

function requireNotNaN(number) {
  if (isNaN(number)) {
    throw new Error("argument must not be NaN");
  }
  return number;
}

function requireNotZero(number) {
  if (number === 0) {
    throw new Error("argument must not be zero");
  }
  return number;
}

export default class LinearConversion extends Conversion {
  constructor(...args) {
    super(...args);
  }

  convert( d ) {
    return ( d - this.offset ) * this.scale;
  }

  invert( d ) {
    return d / this.scale + this.offset;
  }

  clone() {
    var {scale, offset} = this;
    return new LinearConversion({scale, offset});
  }

  set( a , b , c , d ) {
    if ( c !== undefined ) {
      var newScale = requireNotZero( requireNotNaN( ( b - d ) / ( a - c ) ) );
      var newOffset = requireNotNaN( a - b / newScale );
      this.scale = newScale;
      this.offset = newOffset;
    }
    else if ( b !== undefined ) {
      this.offset = requireNotNaN( a - b / this.scale );
    }
    else {
      this.scale  = requireNotZero( requireNotNaN( a.scale ) );
      this.offset = requireNotNaN( a.offset );
    }
    return this;
  }

  zoom( center , factor ) {
    var offset = requireNotNaN( center + ( this.offset - center ) * factor );
    var scale = requireNotNaN( this.scale / factor );
    return this.set({scale, offset});
  }

  chooseNiceIncrement(minTickSpacingPixels, subIncrement) {
    return GridMath.chooseNiceIncrement(1 / this.scale, minTickSpacingPixels, subIncrement);
  }

  chooseNiceTimeIncrement(minTickSpacingPixels, subIncrement) {
    return GridMath.chooseNiceTimeIncrement(1 / this.scale, minTickSpacingPixels, subIncrement);
  }

  /**
   * Adjusts the scale and offset to the nearest values for which
   * convert(anchor), convert(anchor + increment), etc. will be whole numbers (excluding
   * round-off error).
   */
  align( increment , anchor =  0 ) {
    var origAnchor = this.convert(anchor);
    var scale = Math.round(increment * this.scale) / increment;
    if (scale !== this.scale) {
      var offset = anchor - Math.round(origAnchor) / scale;
      this.set({scale, offset});
    }
    return this;
  }
}
