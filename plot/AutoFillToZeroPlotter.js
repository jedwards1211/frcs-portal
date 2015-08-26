import AutoFatTracePlotter from './AutoFatTracePlotter';

export default class AutoFillToZeroPlotter extends AutoFatTracePlotter {
    constructor(domainConversion, valueConversion, traceRenderer) {
        super();
        super(domainConversion, valueConversion, traceRenderer);
        this.columnMin = [NaN, 0];
        this.columnMax = [NaN, 0];
    }

    _resetColumn() {
        super_resetColumn();
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
            this._advanceColumn( false );
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

    _advanceColumn( forceFlush )
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
              this._flushLine( );
              
              this.fillMinPoints.push( minX , minY );
              this.fillMaxPoints.push( maxX , maxY );
            }
        }
        else
        {
            this._flushLine( );
            this._flushFill( );
            
            this.fillMinPoints.push( minX , minY );
            this.fillMaxPoints.push( maxX , maxY );
        }
        
        if( forceFlush )
        {
            this._flushLine( );
            this._flushFill( );
        }
        
        this.prevColumnEnd[0] = this.columnMax[0];
        this.prevColumnEnd[1] = this.columnMax[1];
        
        this._resetColumn( );
    }
}