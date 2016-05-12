/* eslint no-constant-condition: 0 */

/**
 * This is where the magic happens.  It's sort of like a flow
 * layout in that the blocks are placed one after another.
 * However, instead of constraining them to neatly defined columns
 * and rows, you simply keep scanning cells from left to right,
 * top to bottom until you find room to place the block.  Thus a
 * large block can cause smaller blocks in subsequent "rows" to
 * wrap around it.
 */
export default function layoutBlockGrid(layout, grabbed) {
  var maxWidth    = layout.get('maxWidth'),
    cellWidth   = layout.get('cellWidth'),
    cellHeight  = layout.get('cellHeight'),
    spacing     = layout.get('spacing'),
    origBlocks  = layout.get('blocks')

  // map from cell '{row}-{col}' to block in that cell
  var cells = {}

  // number of available columns
  var cols = Math.floor((maxWidth - spacing) / cellWidth)
  var lastRow = 0, lastCol = 0

  var row = 0, col = 0

  var grabbedRow, grabbedCol, grabbedIndex, grabbedBlock

  if (grabbed) {
    grabbedIndex = origBlocks.findIndex(block => block.get('key') === grabbed.get('key'))

    if (grabbedIndex >= 0) {
      grabbedBlock = origBlocks.get(grabbedIndex)

      grabbedRow = Math.floor((grabbed.get('y') - spacing) / cellHeight)
      grabbedRow = Math.max(0, grabbedRow)

      grabbedCol = Math.floor((grabbed.get('x') - spacing) / cellWidth)
      grabbedCol = Math.max(0, Math.min(cols - grabbedBlock.get('colSpan'), grabbedCol))
    }
  }

  function allEmpty(startrow, startcol, rowSpan, colSpan) {
    for (var row = startrow; row < startrow + rowSpan; row++) {
      for (var col = startcol; col < startcol + colSpan; col++) {
        if (cells[row + '-' + col]) return false
      }
    }
    return true
  }

  /**
   * Attempts to place the given block at or above the given row and column.
   *
   * @param{Immutable.Map} block - the block to place.
   * @param{number} row - the row in which to place the top edge of the block
   *   (it may be placed above this row though)
   * @param{number} col - the column in which to place the left edge of the block
   *
   * @return {Immutable.Map} the block with updated position, or undefined if it
   *   could not be placed at or above the given row and column
   */
  function place(block, row, col) {
    var rowSpan = block.get('rowSpan')
    var colSpan = block.get('colSpan')
    if (!allEmpty(row, col, rowSpan, colSpan)) return

    // don't place the block where it would extend off the right side of the
    // window, unless the window is just to narrow
    if (col > 0 && col + colSpan > cols) return

    // move up if possible, to avoid wasting space
    while (row > 0 && allEmpty(row - 1, col, rowSpan, colSpan)) {
      row--
    }

    // okay, now we know where the block can go!

    // mark the cells we've placed the block in occupied
    for (var r = row; r < row + rowSpan; r++) {
      for (var c = col; c < col + colSpan; c++) {
        cells[r + '-' + c] = true
      }
    }

    // update lastRow and lastCol
    lastRow = Math.max(lastRow, row + rowSpan - 1)
    lastCol = Math.max(lastCol, col + colSpan - 1)

    // update the block position
    return block.withMutations(block =>
      block .set('col',     col)
            .set('row',     row)
            .set('x',       spacing + col * cellWidth)
            .set('y',       spacing + row * cellHeight)
            .set('width',   colSpan * cellWidth - spacing)
            .set('height',  rowSpan * cellHeight - spacing))
  }

  return layout.withMutations(layout => {
    layout.set('blocks', origBlocks.withMutations(blocks => {
      var nextIndex = 0

      var placedGrabbedBlock

      // for each block...
      for (var i = 0; i < blocks.size; i++) {
        if (i === grabbedIndex) continue

        var block = origBlocks.get(i)

        // move left-to-right, top-to-bottom until we successfully place it...
        while (true) {
          // always try to place the grabbed block in the cells it's hovering over
          // before anything else
          if (row >= grabbedRow &&
              col >= grabbedCol &&
              row <  grabbedRow + grabbedBlock.get('rowSpan') &&
              col <  grabbedCol + grabbedBlock.get('colSpan')) {

            placedGrabbedBlock = place(grabbedBlock, row, col)

            if (placedGrabbedBlock) {
              blocks.set(nextIndex++, placedGrabbedBlock)
              // by undefining these we ensure that we won't try to place the
              // grabbed block again
              grabbedRow = grabbedCol = undefined
            }
          }

          var placedBlock = place(block, row, col)
          if (placedBlock) {
            blocks.set(nextIndex++, placedBlock)
            break
          }
          if (++col >= cols) {
            col = 0
            row++
          }
        }
      }

      // finally, if the grabbed block still hasn't been placed,
      // place it after everything else
      if (grabbedBlock && !placedGrabbedBlock) {
        while (true) {
          placedGrabbedBlock = place(grabbedBlock, row, col)
          if (placedGrabbedBlock) {
            blocks.set(nextIndex++, placedGrabbedBlock)
            break
          }
          if (++col >= cols) {
            col = 0
            row++
          }
        }
      }
    })).set('width',  spacing + (lastCol + 1) * cellWidth )
       .set('height',  spacing + (lastRow + 1) * cellHeight)
  })
}
