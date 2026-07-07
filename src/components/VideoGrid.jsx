import VideoTile from './VideoTile.jsx'
import { gridClassForCount } from '../lib/gridLayout.js'

export default function VideoGrid({ tiles, emptyMessage }) {
  const gridClass = gridClassForCount(tiles.length)

  return (
    <div className={`grid flex-1 auto-rows-fr gap-3 overflow-auto p-4 ${gridClass}`}>
      {tiles.map((tile) => (
        <div key={tile.key} className={tile.sharingScreen ? 'sm:col-span-2 sm:row-span-2' : ''}>
          <VideoTile
            stream={tile.stream}
            label={tile.label}
            muted={tile.muted}
            mirrored={tile.mirrored}
            videoOff={tile.videoOff}
            speaking={tile.speaking}
            sharingScreen={tile.sharingScreen}
          />
        </div>
      ))}
      {tiles.length === 0 && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-700 text-sm text-slate-500">
          {emptyMessage}
        </div>
      )}
    </div>
  )
}
