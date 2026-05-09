import katex from 'katex'
import 'katex/dist/katex.min.css'

export function KatexBlock({ tex }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: true })
  return (
    <div
      style={{ overflowX: 'auto', padding: '2px 0' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function KatexInline({ tex }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: false })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}
