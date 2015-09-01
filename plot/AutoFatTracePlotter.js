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
export default class AutoFatTracePlotter {
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

        this._resetColumn();

        this.prevColumnEnd[0] = this.prevColumnEnd[1] = NaN;
    }

    _resetColumn() {
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
            this._advanceColumn( false );
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
        this._advanceColumn( true );
    }

    _advanceColumn( forceFlush )
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
                    this._flushFill( );
                    
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
                    this._flushLine( );
                    
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
            this._flushLine( );
            this._flushFill( );
            
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
            this._flushLine( );
            this._flushFill( );
        }
        
        this.prevColumnEnd[0] = this.columnEnd[0];
        this.prevColumnEnd[1] = this.columnEnd[1];
        
        this._resetColumn( );
    }
    
    _flushLine( )
    {
        if( this.linePoints.length > 1 )
        {
            this.traceRenderer.drawLine( this.linePoints.slice( 0 ) );
        }
        this.linePoints.length = 0;
    }
    
    _flushFill( )
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
