import Conversion from './Conversion';

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
    /**
     * Creates a LinearConversion.  The arguments are exactly the same
     * as those for set().
     */
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

    move( a , b ) {
        this.offset = requireNotNaN(a - b / this.scale);
    }

    /**
     * Adjusts the scale and offset to the nearest values for which
     * convert(anchor), convert(anchor + increment), etc. will be whole numbers (excluding
     * round-off error).
     */
    align( increment , anchor =  0 ) {
        var origAnchor = this.convert(anchor);
        var newScale = Math.round(increment * this.scale) / increment;
        if (newScale !== this.scale) {
            this.scale = newScale;
            this.offset = requireNotNaN(anchor - Math.round(origAnchor) / this.scale);
        }
        return this;
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