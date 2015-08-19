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

var niceTimeIncrements = [
         1,
         2,
         5,
         10,
         20,
         25,
         50,
         100,
         200,
         250,
         500,
         1000,
    2  * 1000,
    5  * 1000,
    10 * 1000,
    15 * 1000,
    20 * 1000,
    30 * 1000,
         60000,
    2  * 60000,
    5  * 60000,
    10 * 60000,
    15 * 60000,
    20 * 60000,
    30 * 60000,
         3600000,
    2  * 3600000,
    3  * 3600000,
    4  * 3600000,
    6  * 3600000,
    12 * 3600000,
         86400000
];

export function niceCeiling(value) {
  var floor = Math.pow(10, Math.floor(Math.log10(value)));
  if (floor >= value) {
    return floor;
  }
  if (floor * 2 >= value) {
    return floor * 2;
  }
  if (floor * 2.5 >= value) {
    return floor * 2.5;
  }
  if (floor * 4 >= value) {
    return floor * 4;
  }
  if (floor * 5 >= value) {
    return floor * 5;
  }
  return floor * 10;
}

export function isNiceIncrement(increment) {
  increment = Math.abs(increment);
  var normalized = increment / Math.pow(10, Math.floor(Math.log10(increment)));
  return normalized === 1 || normalized === 2 || normalized === 2.5 || normalized === 4 || normalized === 5;
}

export function chooseNiceIncrement(unitsPerPixel, minTickSpacingPixels) {
  if (unitsPerPixel < 0) return -chooseNiceIncrement(-unitsPerPixel, minTickSpacingPixels);
  return niceCeiling(minTickSpacingPixels * unitsPerPixel);
}

export function chooseNiceMajorIncrement(unitsPerPixel, minTickSpacingPixels, minorIncrement) {
  if (unitsPerPixel < 0) return -chooseNiceMajorIncrement(-unitsPerPixel, minTickSpacingPixels, -minorIncrement);
  for (var i = 1; i < 20; i++) {
    if (isNiceIncrement(minorIncrement * i) && minorIncrement * i >= minTickSpacingPixels * unitsPerPixel) {
      return minorIncrement * i;
    }
  }
}

/**
 * Chooses a "nice" time increment that will produce tick spacing of at least
 * <code>minTickSpacingPixels</code> at a scale of <code>pixelsPerMilli</code>.
 * Returns undefined if even an increment of one day would span less than <code>minTickSpacingPixels</code>.
 */ 
export function chooseNiceTimeIncrement(pixelsPerMilli, minTickSpacingPixels) {
    var rough = minTickSpacingPixels / pixelsPerMilli;
    return niceTimeIncrements[ceilingIndex(niceTimeIncrements, rough)];
}

export function chooseNiceTimeMajorIncrement(pixelsPerMilli, minTickSpacingPixels, minorIncrement) {
    var i = ceilingIndex(niceTimeIncrements, minorIncrement);
    while (++i < niceTimeIncrements.length) {
      var increment = niceTimeIncrements[i];
      if (increment % minorIncrement === 0 && increment * pixelsPerMilli > minTickSpacingPixels) {
        return increment;
      }
    }
}

/**
 * Chooses a "nice" time increment that will produce tick spacing of at least
 * <code>minTickSpacingPixels</code> at a scale of <code>pixelsPerMilli</code>,
 * as well as divide evenly into <code>majorIncrement</code>.  In some cases this may just return
 * <code>majorIncrement</code>.
 * Returns undefined if even an increment of one day would span less than <code>minTickSpacingPixels</code>.
 */ 
export function chooseNiceTimeSubIncrement(pixelsPerMilli, minTickSpacingPixels, majorIncrement) {
    var rough = minTickSpacingPixels / pixelsPerMilli;
    var index = ceilingIndex(niceTimeIncrements, rough);
    while (niceTimeIncrements[index] < majorIncrement && (majorIncrement % niceTimeIncrements[index]) !== 0) {
        index++;
    }
    return niceTimeIncrements[index];
}

/**
 * Returns the greatest (closest to positive infinity) multiple of <code>mod</code> that is less than or equal to <code>value</code>.
 */
export function modFloor(value, mod, anchor) {
    if (anchor) return anchor + modFloor(value - anchor, mod);
    if (value < 0.0) return -modCeiling(-value, mod);  
    mod = Math.abs(mod);
    return value - value % mod;
}

export function modLower(value, mod, anchor) {
    var result = modFloor(value, mod, anchor);
    return result > value ? result : result - mod;
}

/**
 * Returns the least (closest to negative infinity) multiple of <code>mod</code> that is greater than or equal to <code>value</code>.
 */
export function modCeiling(value, mod, anchor) {
    if (anchor) return anchor + modCeiling(value - anchor, mod);
    if (value < 0.0) return -modFloor(-value, mod);
    mod = Math.abs(mod);
    var rem = value % mod;
    if (rem !== 0.0) value += mod - rem;
    return value;
}

export function modHigher(value, mod, anchor) {
    var result = modCeiling(value, mod, anchor);
    return result < value ? result : result + mod;
}

function DEFAULT_COMPARATOR(a, b) { return a - b; };

/**
 * Finds the index of an element in an array using a binary search.
 * If the element is not present, the insertion index (index of the next
 * greater element or <code>array.length</code>) is returned.
 *
 * @param {array} the array to search in.
 * @param {find} the element to search for.
 * @param {low} the lower bound of the range in <code>array</code> to
 *      search in (defaults to 0)
 * @param {high} the upper bound of the range in <code>array</code> to
 *      search in (defaults to <code>array.length - 1</code>)
 * @param {comparator} two-argument function that returns &lt; 0 if 
 *      the first argument is less than the second; &gt; 0 if the first
 *      argument is greater; and 0 otherwise. (defaults to <code>a - b</code>)
 */
export function binarySearch(array, find, low, high, comparator) {
    if (low === undefined) low = 0;
    if (high === undefined) high = array.length - 1;
    if (!comparator) comparator = DEFAULT_COMPARATOR;
    var i, comparison;
    while (low <= high) {
        i = Math.floor((low + high) / 2);
        comparison = comparator(array[i], find);
        if (comparison < 0) { low = i + 1; continue; }
        if (comparison > 0) { high = i - 1; continue; }
        return i;
    }
    return low;
}

/**
 * Finds the index of the greatest element less than a given element in an array 
 * using a binary search.  If the given element is less than or equal to all elements in the
 * array, returns -1.
 *
 * @param {array} the array to search in.
 * @param {find} the element to search for.
 * @param {low} the lower bound of the range in <code>array</code> to
 *      search in (defaults to 0)
 * @param {high} the upper bound of the range in <code>array</code> to
 *      search in (defaults to <code>array.length - 1</code>)
 * @param {comparator} two-argument function that returns &lt; 0 if 
 *      the first argument is less than the second; &gt; 0 if the first
 *      argument is greater; and 0 otherwise. (defaults to <code>a - b</code>)
 */
export function lowerIndex(array, find, low, high, comparator) {
   var i = binarySearch.apply(undefined, arguments);
   return i === array.length || (comparator || DEFAULT_COMPARATOR)(array[i], find) >= 0 ? i - 1 : i;
}

/**
 * Finds the index of the greatest element less than or equal to a given element in an array 
 * using a binary search.  If the given element is less than all elements in the
 * array, returns -1.
 *
 * @param {array} the array to search in.
 * @param {find} the element to search for.
 * @param {low} the lower bound of the range in <code>array</code> to
 *      search in (defaults to 0)
 * @param {high} the upper bound of the range in <code>array</code> to
 *      search in (defaults to <code>array.length - 1</code>)
 * @param {comparator} two-argument function that returns &lt; 0 if 
 *      the first argument is less than the second; &gt; 0 if the first
 *      argument is greater; and 0 otherwise. (defaults to <code>a - b</code>)
 */
export function floorIndex(array, find, low, high, comparator) {
    var i = binarySearch.apply(undefined, arguments);
    // return i === array.length || (comparator || DEFAULT_COMPARATOR)(array[i], find) > 0 ? i - 1 : i;
    return i === array.length || (comparator || DEFAULT_COMPARATOR)(array[i], find) > 0 ? i - 1 : i;
}

/**
 * Finds the index of the least element greater than or equal to a given element in an array 
 * using a binary search.  If the given element is greater than all elements in the
 * array, returns the length of the array.
 *
 * @param {array} the array to search in.
 * @param {find} the element to search for.
 * @param {low} the lower bound of the range in <code>array</code> to
 *      search in (defaults to 0)
 * @param {high} the upper bound of the range in <code>array</code> to
 *      search in (defaults to <code>array.length - 1</code>)
 * @param {comparator} two-argument function that returns &lt; 0 if 
 *      the first argument is less than the second; &gt; 0 if the first
 *      argument is greater; and 0 otherwise. (defaults to <code>a - b</code>)
 */
export function ceilingIndex(array, find, low, high, comparator) {
    var i = binarySearch.apply(undefined, arguments);
    return i < array.length && (comparator || DEFAULT_COMPARATOR)(array[i], find) < 0 ? i + 1 : i;
}

/**
 * Finds the index of the least element greater than a given element in an array 
 * using a binary search.  If the given element is greater than or equal to all elements in the
 * array, returns the length of the array.
 *
 * @param {array} the array to search in.
 * @param {find} the element to search for.
 * @param {low} the lower bound of the range in <code>array</code> to
 *      search in (defaults to 0)
 * @param {high} the upper bound of the range in <code>array</code> to
 *      search in (defaults to <code>array.length - 1</code>)
 * @param {comparator} two-argument function that returns &lt; 0 if 
 *      the first argument is less than the second; &gt; 0 if the first
 *      argument is greater; and 0 otherwise. (defaults to <code>a - b</code>)
 */
export function higherIndex(array, find, low, high, comparator) {
    var i = binarySearch.apply(undefined, arguments);
   return i < array.length && (comparator || DEFAULT_COMPARATOR)(array[i], find) <= 0 ? i + 1 : i;
}

/**
 * Base class for conversions.  Right now there is only LinearConversion;
 * in the future there could also be LogConversion.
 */
export class Conversion {
  /**
   * @param d some value.
   * @returns the display position for d, in pixels.
   */
  convert(d) {
    return NaN;
  }
  /**
   * @param d a display position, in px.
   * @returns the value at d
   */
  invert(d) {
    return NaN;
  }
  chooseNiceIncrement(minTickSpacingPixels) {
    return NaN;
  }  
  chooseNiceMajorIncrement(minTickSpacingPixels, minorIncrement) {
    return NaN;
  }  
}

/////////////////////////////////////////////////////////////////   
// LinearConversion
/////////////////////////////////////////////////////////////////   

/**
 * Creates a LinearConversion.  The arguments are exactly the same
 * as those for set().
 */
export class LinearConversion extends Conversion {
    constructor( a , b , c , d ) {
        super();
        this.set( a , b , c , d );
    }
    convert( d ) {
        return ( d - this.offset ) * this.scale;
    }
    invert( d ) {
        return d / this.scale + this.offset;
    }

    chooseNiceIncrement(minTickSpacingPixels) {
      return chooseNiceIncrement(1 / this.scale, minTickSpacingPixels);
    }

    chooseNiceMajorIncrement(minTickSpacingPixels, minorIncrement) {
      return chooseNiceMajorIncrement(1 / this.scale, minTickSpacingPixels, minorIncrement);
    }

    /**
     * Sets the scale and offset.
     * 
     * If one argument is provided, copies argument.scale and
     * argument.offset.  Or if offset is an array, sets offset such that
     * convert(offset[0]) == offset[1]
     *
     * If two arguments are provided, sets scale = arg0 and
     * offset = arg1.
     *
     * If four arguments are provided, sets scale and offset such
     * that convert(arg0) == arg1 and convert(arg2) == arg3 (excepting
     * floating-point error).
     * 
     * @throws Error if this operation would set the scale or offset
     * to NaN.
     */
    set( a , b , c , d ) {
        if ( !isNaN(b) && b !== null ) {
            if ( !isNaN(c) && c !== null && !isNaN(d) && d !== null ) {
                var newScale = requireNotZero( requireNotNaN( ( b - d ) / ( a - c ) ) );
                var newOffset = requireNotNaN( a - b / newScale );
                this.scale = newScale;
                this.offset = newOffset;
            } else {
                this.scale = requireNotZero( requireNotNaN( a ) );
                this.offset = requireNotNaN( b );
            }
        } else {
            this.scale = requireNotZero( a.scale );
            if (a.offset instanceof Array) {
                this.offset = requireNotNaN(a.offset[0] - a.offset[1] / this.scale);
            }
            else {
                this.offset = a.offset;
            }                
        }
    }

    /**
     * Sets the offset such that convert(a) == b (keeping the same scale and excepting
     * floating-point error).
     */
    offset( a , b ) {
        this.offset = requireNotNaN( a - b / this.scale );
    }

    /**
     * Zooms while keeping a given point fixed.
     * @param{center} the point to keep fixed, in domain coordinates (what you pass into
     * convert()).  convert(center) before zoom() will equal convert(center) after zoom.
     * @param{factor} the zoom factor.  If convert() converts from data coordinates to
     * screen coordinates, < 1 means zoom in, > 1 means zoom out.
     */
    zoom( center , factor ) {
        var newOffset = requireNotNaN( center + ( this.offset - center ) * factor );
        var newScale = requireNotNaN( this.scale / factor );
        this.set(newScale, newOffset);
    }
}

/////////////////////////////////////////////////////////////////   
// CanvasTraceRenderer
/////////////////////////////////////////////////////////////////   

/**
 * Creates a CanvasTraceRenderer that will draw into the given
 * CanvasRendereringContext2D.
 *
 * @param {ctx} a CanvasRenderingContext2D.
 */
 export class CanvasTraceRenderer {
    constructor( ctx ) {
        this.ctx = ctx;
    }

    /**
     * Strokes the given line on the canvas using the its
     * current strokeStyle and lineWidth.
     *
     * @param {line} the line to draw, a flat array of alternating
     * x and y coordinates.
     */
    drawLine( line ) {
        if ( line.length < 2 ) {
            return;
        } else if (line.length === 2) {
            this.ctx.fillRect( line[ 0 ] , line[ 1 ] , 1 , 1 );
        } else {
            this.ctx.beginPath( );
            this.ctx.moveTo( line[ 0 ] , line[ 1 ] );

            for ( var i = 2 ; i < line.length -1 ; i += 2 ) {
                this.ctx.lineTo( line [ i ] , line[ i + 1 ] );
            }
            this.ctx.stroke( );
        }
    }

    /**
     * Fills the given boundary on the canvas using the its
     * current fillStyle.
     *
     * @param {line} the boundary of the fill to draw, a flat 
     * array of alternating x and y coordinates.
     */
    drawFill( fill ) {
        if ( fill.length < 2 ) {
            return;
        }

        this.ctx.beginPath( );
        this.ctx.moveTo( fill[ 0 ] , fill[ 1 ] );

        for ( var i = 2 ; i < fill.length -1 ; i += 2 ) {
            this.ctx.lineTo( fill [ i ] , fill[ i + 1 ] );
        }
        this.ctx.closePath( );
        this.ctx.fill( );
    }
 }

 export class FillToZeroTraceRenderer {
    constructor(ctx, zeroY) {
        this.ctx = ctx;
        this.zeroY = zeroY;
    }

    drawLine(line) {
        var {ctx, zeroY} = this;

        if (line.length < 2) {
            return;
        }
        else if (line.length === 2) {
            ctx.fillRect(line[0], Math.min(line[1], zeroY), 1, Math.abs(line[1] - zeroY));
        }
        else {
            ctx.beginPath();
            ctx.moveTo(line[0], line[1]);
            for (var i = 2; i < line.length - 1; i += 2) {
                ctx.lineTo(line[i], line[i + 1]);
            }
            i -= 2;
            for (; i >= 0; i -= 2) {
                ctx.lineTo(line[i], zeroY);
            }
            ctx.closePath();
            ctx.fill();
        }
    }

    drawFill(fill) {
        if (fill.length < 2) {
            return;
        }

        var {ctx, zeroY} = this;

        ctx.beginPath();
        ctx.moveTo(fill[0], fill[1]);
        for (var i = 2; i < fill.length - 1; i += 2) {
            ctx.lineTo(fill[i], fill[i] < fill[i - 2] ? zeroY : fill[i + 1]);
        }
        ctx.closePath();
        ctx.fill();
    }
}

/////////////////////////////////////////////////////////////////   
// AutoFatTracePlotter
/////////////////////////////////////////////////////////////////   

var resetColumn = Symbol();
var advanceColumn = Symbol();
var flushLine = Symbol();
var flushFill = Symbol();

 /**
  * Plots a trace from points you provide sequentially.  If zoomed
  * out far enough that more than two data points are in a given
  * column of pixels, a "fat trace" fill will be drawn into that column 
  * (and adjacent columns of the same type).
  *
  * Interfaces used:
  * 
  * domainConversion, valueConversion:
  *     an object with convert and invert methods.  Both methods should
  *     take and return one number, be monotonic, and inverses of each 
  *     other.
  *
  * traceRenderer:
  *     an object with 3 methods:
  *
  *     drawLine(array): draws a line from alternating x/y coordinates
  *                         in the given flat array
  *     drawFill(array): draws a fill bounded by alternating x/y 
  *                         coordinates in the given flat array
  */
export class AutoFatTracePlotter {
    constructor(domainConversion, valueConversion, traceRenderer) {
        this.domainConversion = domainConversion;
        this.valueConversion = valueConversion;
        this.traceRenderer = traceRenderer;

        // points on a line waiting to be flushed to the renderer
        this.linePoints = [];        

        // points on the bottom side of the fill waiting to be
        // flushed to the renderer
        this.fillMinPoints = [];

        // points on the top side of the fill waiting to be
        // flushed to the renderer
        this.fillMaxPoints = [];

        // whether all points seen in the current column of pixels are
        // monotonic (only increasing or decreasing from left to right)
        this.columnIsMonotonic = false;

        // the leftmost point within the current column
        this.columnStart = [NaN, NaN];

        // the rightmost point within the current column
        this.columnEnd = [NaN, NaN];

        // the highest point within the current column
        this.columnMin = [NaN, NaN];

        // the lowest point within the current column
        this.columnMax = [NaN, NaN];

        // the rightmost point within the previous column
        this.prevColumnEnd = [NaN, NaN];
    }

    reset() {
        this.linePoints.length = 0;
        this.fillMinPoints.length = 0;
        this.fillMaxPoints.length = 0;

        this[resetColumn]();

        this.prevColumnEnd[0] = this.prevColumnEnd[1] = NaN;
    }

    [resetColumn]() {
        this.columnIsMonotonic = true;
        this.columnStart[0] = this.columnStart[1] = NaN;
        this.columnMin[0] = this.columnMin[1] = NaN;
        this.columnMax[0] = this.columnMax[1] = NaN;
        this.columnEnd[0] = this.columnEnd[1] = NaN;
    }

    /**
     * Adds a point to be plotted.
     * @param {domain} the domain of the point.
     * @param {value} the value of the point.
     * @param {traceRenderer} a renderer interface (see notes at top)
     * @param {domainConversion} conversion for domain axis (see notes at top)
     * @param {valueConversion} conversion for value axis (see notes at top)
     */
    addPoint( domain , value ) {
        var columnX = this.domainConversion.convert( this.columnStart[0] );
        var viewX = this.domainConversion.convert( domain );
        
        // if the added point is not in the same column, advance the column

        if( !isNaN( this.columnStart[0] ) && Math.round( viewX ) > Math.round( columnX ) )
        {
            this[advanceColumn]( false );
        }
        
        if( isNaN( this.columnStart[0] ) )
        {
            this.columnStart[0] = domain;
            this.columnStart[1] = value;
        }
        
        this.columnEnd[0] = domain;
        this.columnEnd[1] = value;
        
        if( !isNaN( value ) )
        {
            if( this.columnMin[0] < this.columnMax[0] && value < this.columnMax[1] )
            {
                this.columnIsMonotonic = false;
            }
            if( this.columnMin[0] > this.columnMax[0] && value > this.columnMin[1] )
            {
                this.columnIsMonotonic = false;
            }
            
            if( isNaN( this.columnMin[1] ) || value < this.columnMin[1] )
            {
                this.columnMin[0] = domain;
                this.columnMin[1] = value;
            }
            if( isNaN( this.columnMax[1] ) || value > this.columnMax[1] )
            {
                this.columnMax[0] = domain;
                this.columnMax[1] = value;
            }
        }
    }
        
    /**
     * Flushes any pending lines or fills to the given trace renderer.
     */
    flush( )
    {
        this[advanceColumn]( true );
    }

    [advanceColumn]( forceFlush )
    {
        var lastX = this.domainConversion.convert( this.prevColumnEnd[0] );
        var lastY = this.valueConversion.convert( this.prevColumnEnd[1] );
        
        var startX = this.domainConversion.convert( this.columnStart[0] );
        var startY = this.valueConversion.convert( this.columnStart[1] );
        var minX = this.domainConversion.convert( this.columnMin[0] );
        var minY = this.valueConversion.convert( this.columnMin[1] );
        var maxX = this.domainConversion.convert( this.columnMax[0] );
        var maxY = this.valueConversion.convert( this.columnMax[1] );
        
        var monoStartX = NaN;
        var monoStartY = NaN;
        var monoEndX = NaN;
        var monoEndY = NaN;
        
        if( this.columnIsMonotonic )
        {
            if( minX < maxX )
            {
                monoStartX = minX;
                monoStartY = minY;
                monoEndX = maxX;
                monoEndY = maxY;
            }
            else
            {
                monoStartX = maxX;
                monoStartY = maxY;
                monoEndX = minX;
                monoEndY = minY;
            }
        }
        
        var adjacent = Math.round( lastX ) + 1 === Math.round( startX );
        var startEqualsLast = Math.round( startX ) === Math.round( lastX ) && Math.round( startY ) === Math.round( lastY );
        var monoStartEqualsLast = Math.round( monoStartX ) === Math.round( lastX ) && Math.round( monoStartY ) === Math.round( lastY );
        var drawStart = !isNaN( startY ) && !startEqualsLast;
        
        if( !isNaN( lastY ) )
        {
            if( this.fillMinPoints.length > 0 )
            {
                if( !this.columnIsMonotonic && adjacent )
                {
                    this.fillMinPoints.push( minX , minY );
                    this.fillMaxPoints.push( maxX , maxY );
                }
                else
                {
                    this.fillMinPoints.push( lastX , lastY );
                    this.fillMaxPoints.push( lastX , lastY );
                    this[flushFill]( );
                    
                    this.linePoints.push( lastX , lastY );
                }
            }
            
            if( this.fillMinPoints.length === 0 )
            {
                if( drawStart )
                {
                    this.linePoints.push( startX , startY );
                }
                
                if( this.columnIsMonotonic )
                {
                    if( !drawStart && !monoStartEqualsLast )
                    {
                        this.linePoints.push( monoStartX , monoStartY );
                    }
                    this.linePoints.push( monoEndX , monoEndY );
                }
                else
                {
                    this[flushLine]( );
                    
                    if( drawStart )
                    {
                        this.fillMinPoints.push( startX , startY );
                        this.fillMaxPoints.push( startX , startY );
                    }
                    
                    this.fillMinPoints.push( minX , minY );
                    this.fillMaxPoints.push( maxX , maxY );
                }
            }
        }
        else
        {
            this[flushLine]( );
            this[flushFill]( );
            
            if( this.columnIsMonotonic )
            {
                if( !monoStartEqualsLast )
                {
                    this.linePoints.push( monoStartX , monoStartY );
                }
                this.linePoints.push( monoEndX , monoEndY );
            }
            else
            {
                if( drawStart )
                {
                    this.fillMinPoints.push( startX , startY );
                    this.fillMaxPoints.push( startX , startY );
                }
                this.fillMinPoints.push( minX , minY );
                this.fillMaxPoints.push( maxX , maxY );
            }
        }
        
        if( forceFlush )
        {
            this[flushLine]( );
            this[flushFill]( );
        }
        
        this.prevColumnEnd[0] = this.columnEnd[0];
        this.prevColumnEnd[1] = this.columnEnd[1];
        
        this[resetColumn]( );
    }
    
    [flushLine]( )
    {
        if( this.linePoints.length > 1 )
        {
            this.traceRenderer.drawLine( this.linePoints.slice( 0 ) );
        }
        this.linePoints.length = 0;
    }
    
    [flushFill]( )
    {
        if( this.fillMinPoints.length > 1 && this.fillMaxPoints.length > 1 )
        {
            var minLine = this.fillMinPoints.slice( 0 );
            var maxLine = this.fillMaxPoints.slice( 0 );

            var fill = minLine.slice( 0 );
            for ( var i = 0 ; i < maxLine.length ; i += 2 )
            {
                fill[ minLine.length + i ] = maxLine[ maxLine.length - i - 2 ];
                fill[ minLine.length + i + 1 ]= maxLine[ maxLine.length - i - 1 ];
            }
        
            this.traceRenderer.drawFill( fill );
            this.traceRenderer.drawLine( maxLine );
            this.traceRenderer.drawLine( minLine );
        }
        
        this.fillMinPoints.length = 0;
        this.fillMaxPoints.length = 0;
    }
}

export class AutoFillToZeroPlotter extends AutoFatTracePlotter {
    constructor(domainConversion, valueConversion, traceRenderer) {
        super(domainConversion, valueConversion, traceRenderer);
        this.columnMin = [NaN, 0];
        this.columnMax = [NaN, 0];
    }

    [resetColumn]() {
        super[resetColumn]();
        this.columnMin[1] = 0;
        this.columnMax[1] = 0;
        this.columnIsMonotonic = false;
    }

    /**
     * Adds a point to be plotted.
     * @param {domain} the domain of the point.
     * @param {value} the value of the point.
     * @param {traceRenderer} a renderer interface (see notes at top)
     * @param {domainConversion} conversion for domain axis (see notes at top)
     * @param {valueConversion} conversion for value axis (see notes at top)
     */
    addPoint( domain , value ) {
        var columnX = this.domainConversion.convert( this.columnStart[0] );
        var viewX = this.domainConversion.convert( domain );
        
        // if the added point is not in the same column, advance the column

        if( !isNaN( columnX ) && Math.round( viewX ) > Math.round( columnX ) )
        {
            this[advanceColumn]( false );
        }
        
        if( isNaN( this.columnStart[0] ) )
        {
            this.columnStart[0] = domain;
            this.columnStart[1] = value;
        }

        if (isNaN( this.columnMin[0]))
        {
            this.columnMin[0] = domain;
        }
        if (isNaN( this.columnMax[0]))
        {
            this.columnMax[0] = domain;
        }
        
        this.columnEnd[0] = domain;
        this.columnEnd[1] = value;
        
        if( !isNaN( value ) )
        {
            if( isNaN( this.columnMin[1] ) || value < this.columnMin[1] )
            {
                this.columnMin[0] = domain;
                this.columnMin[1] = value;
            }
            if( isNaN( this.columnMax[1] ) || value > this.columnMax[1] )
            {
                this.columnMax[0] = domain;
                this.columnMax[1] = value;
            }
        }
    }

    [advanceColumn]( forceFlush )
    {
        var lastX = this.domainConversion.convert( this.prevColumnEnd[0] );
        var lastY = this.valueConversion.convert( this.prevColumnEnd[1] );
        
        var minX = this.domainConversion.convert( this.columnMin[0] );
        var minY = this.valueConversion.convert( this.columnMin[1] );
        var maxX = this.domainConversion.convert( this.columnMax[0] );
        var maxY = this.valueConversion.convert( this.columnMax[1] );
      
        if( !isNaN( lastY ) )
        {
            if( this.fillMinPoints.length > 0 )
            {
                this.fillMinPoints.push( minX , minY );
                this.fillMaxPoints.push( maxX , maxY );
            }
            
            if( this.fillMinPoints.length === 0 )
            {
              this[flushLine]( );
              
              this.fillMinPoints.push( minX , minY );
              this.fillMaxPoints.push( maxX , maxY );
            }
        }
        else
        {
            this[flushLine]( );
            this[flushFill]( );
            
            this.fillMinPoints.push( minX , minY );
            this.fillMaxPoints.push( maxX , maxY );
        }
        
        if( forceFlush )
        {
            this[flushLine]( );
            this[flushFill]( );
        }
        
        this.prevColumnEnd[0] = this.columnMax[0];
        this.prevColumnEnd[1] = this.columnMax[1];
        
        this[resetColumn]( );
    }
}