import { QRCodeSVG } from 'qrcode.react'
import { CardIcon } from './components/CardIcon'
import { PAIRS } from './data/questions'

/**
 * /banner — a promotional screen to project at an event. People scan the QR
 * code to open the game on their phones. The QR encodes this deployment's
 * own origin, so it works on any environment without configuration.
 */
export default function Banner() {
  const url = `${window.location.origin}/`
  const displayUrl = window.location.host
  const pair = PAIRS[0]

  return (
    <div className="stage banner">
      <svg className="grain" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      <div className="banner__minis" aria-hidden="true">
        <div className="card banner__mini banner__mini--left">
          <div className="card__inner">
            <div className="card__label">{pair.left}</div>
            <div className="card__icon">
              <CardIcon label={pair.left} />
            </div>
            <div className="card__number">1</div>
          </div>
        </div>
        <div className="vs">VS</div>
        <div className="card banner__mini banner__mini--right">
          <div className="card__inner">
            <div className="card__label">{pair.right}</div>
            <div className="card__icon">
              <CardIcon label={pair.right} />
            </div>
            <div className="card__number">1</div>
          </div>
        </div>
      </div>

      <div className="masthead banner__masthead">
        <div className="masthead__eyebrow">Est. 2026 · A Taste Test</div>
        <h1 className="masthead__title">
          Which Is <span>Better</span>?
        </h1>
        <div className="masthead__rule" />
        <div className="masthead__sub">Five choices · Two cards each · No wrong answers</div>
      </div>

      <div className="banner__qr">
        <QRCodeSVG value={url} size={220} bgColor="transparent" fgColor="#2a0a0c" level="M" />
      </div>

      <div className="banner__url">{displayUrl}</div>
      <div className="banner__hint">Scan with your phone camera to play</div>
    </div>
  )
}
