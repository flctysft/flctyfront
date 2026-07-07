// Shared tile-layout rules for the call gallery, used by both the on-screen
// VideoGrid and the off-screen canvas compositor (recordingMixer) so a
// recording's layout matches what participants actually saw.

const GRID_CLASS_BY_COUNT = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
}

export function gridClassForCount(count) {
  return GRID_CLASS_BY_COUNT[Math.min(Math.max(count, 1), 6)]
}

// Computes { columns, rows } for a given tile count, matching the
// grid-cols breakpoints above at their largest (lg) size.
function gridDimensions(count) {
  if (count <= 1) return { columns: 1, rows: 1 }
  if (count === 2) return { columns: 2, rows: 1 }
  const columns = 3
  const rows = Math.ceil(count / columns)
  return { columns, rows }
}

// Lays out `count` tiles (0-indexed) into a canvas of size width x height.
// If `spotlightIndex` is set, that tile takes a larger 2x2 area and the rest
// flow into the remaining space below/beside it.
export function computeTileRects(count, width, height, spotlightIndex = -1) {
  if (count <= 0) return []

  if (spotlightIndex >= 0 && count > 1) {
    const spotlightWidth = width * 0.7
    const rects = new Array(count)
    rects[spotlightIndex] = { x: 0, y: 0, width: spotlightWidth, height }

    const others = []
    for (let i = 0; i < count; i += 1) {
      if (i !== spotlightIndex) others.push(i)
    }
    const sideWidth = width - spotlightWidth
    const sideHeight = height / Math.max(others.length, 1)
    others.forEach((tileIndex, position) => {
      rects[tileIndex] = {
        x: spotlightWidth,
        y: position * sideHeight,
        width: sideWidth,
        height: sideHeight,
      }
    })
    return rects
  }

  const { columns, rows } = gridDimensions(count)
  const cellWidth = width / columns
  const cellHeight = height / rows
  const rects = []
  for (let i = 0; i < count; i += 1) {
    const col = i % columns
    const row = Math.floor(i / columns)
    rects.push({ x: col * cellWidth, y: row * cellHeight, width: cellWidth, height: cellHeight })
  }
  return rects
}
