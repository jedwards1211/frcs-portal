import TraceRenderer from './TraceRenderer';

/**
 * Creates a CanvasTraceRenderer that will draw into the given
 * CanvasRendereringContext2D.
 *
 * @param {ctx} a CanvasRenderingContext2D.
 */
export default class CanvasTraceRenderer extends TraceRenderer {
    constructor( ctx ) {
        super();
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
