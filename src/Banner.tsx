import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { CardIcon } from './components/CardIcon'
import { PAIRS } from './data/questions'

type Layout = 'vertical' | 'horizontal'

const LAYOUT_STORAGE_KEY = 'wib-banner-layout'

function storedLayout(): Layout {
  try {
    return localStorage.getItem(LAYOUT_STORAGE_KEY) === 'horizontal' ? 'horizontal' : 'vertical'
  } catch {
    return 'vertical'
  }
}

const NUMBER_WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
  'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
]

/**
 * /banner — a promotional screen to project at an event. People scan the QR
 * code to open the game on their phones. The QR encodes this deployment's
 * own origin, so it works on any environment without configuration.
 * The toggle switches between stacked and side-by-side composition.
 */
export default function Banner() {
  const [layout, setLayout] = useState<Layout>(storedLayout)
  const url = `${window.location.origin}/`
  const displayUrl = window.location.host
  const pair = PAIRS[0]
  const choiceCount = NUMBER_WORDS[PAIRS.length] ?? String(PAIRS.length)

  function toggleLayout() {
    const next: Layout = layout === 'vertical' ? 'horizontal' : 'vertical'
    setLayout(next)
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, next)
    } catch {
      // best effort
    }
  }

  return (
    <div className={`stage banner banner--${layout}`}>
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

      <div className="banner__main">
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
          <div className="masthead__sub">
            {choiceCount} choices · Two cards each · No wrong answers
          </div>
        </div>
      </div>

      <div className="banner__scan">
        <div className="banner__qr">
          <QRCodeSVG value={url} size={220} bgColor="transparent" fgColor="#2a0a0c" level="M" />
        </div>
        <div className="banner__url">{displayUrl}</div>
        <div className="banner__hint">Scan with your phone camera to play</div>
      </div>

      <button
        type="button"
        className="banner__layout-toggle"
        onClick={toggleLayout}
        aria-label={`Switch to ${layout === 'vertical' ? 'horizontal' : 'vertical'} layout`}
      >
        {layout === 'vertical' ? '⇄ Horizontal' : '⇅ Vertical'}
      </button>
    </div>
  )
}
