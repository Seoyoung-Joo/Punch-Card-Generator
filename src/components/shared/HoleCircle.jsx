/**
 * A single punch-card cell.
 * Dark filled = punched hole; transparent with border = solid card material.
 *
 * @param {{ punched: boolean, size?: number, onClick?: Function }} props
 */
export default function HoleCircle({ punched, size = 14, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: punched ? '#1A1A1A' : 'transparent',
        border: `1.5px solid ${punched ? '#1A1A1A' : '#C8BFAD'}`,
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        transition: 'background 0.1s, border-color 0.1s',
      }}
    />
  )
}
