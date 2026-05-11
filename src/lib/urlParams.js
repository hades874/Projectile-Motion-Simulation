/**
 * url_param_schema — validation rules for each {{param}}.
 * lowercase, hyphenated names as per requirements.
 */
export const url_param_schema = {
  // Common
  'lang': { type: 'string', allowed: ['bn', 'en'], default: 'bn' },
  'tab': { type: 'string', allowed: ['tug', 'motion', 'controls', 'vectors', 'formulas', 'comparison'], default: 'tug' },

  // Junior - Tug of War
  'tug-left': { type: 'string', default: '0,0,0' },
  'tug-right': { type: 'string', default: '0,0,0' },

  // Junior - Motion
  'motion-obj': { type: 'string', allowed: ['box', 'fridge', 'car', 'ice'], default: 'box' },
  'motion-force': { type: 'int', min: -800, max: 800, default: 0 },
  'motion-friction': { type: 'bool', default: true },

  // Senior
  'v0': { type: 'int', min: 1, max: 100, default: 20, aliases: ['velocity', 'initial-velocity'] },
  'theta': { type: 'int', min: 1, max: 89, default: 45, aliases: ['angle', 'launch-angle', 'deg'] },
  'h0': { type: 'int', min: 0, max: 50, default: 0, aliases: ['height', 'initial-height', 'elevation'] },
  'show-vectors': { type: 'bool', default: false },
  'show-dots': { type: 'bool', default: false },
  'show-axes': { type: 'bool', default: true },
  'speed': { type: 'float', allowed: [0.5, 1, 2], default: 1 },

  // Senior - Comparison
  'comp-v0': { type: 'int', min: 1, max: 100, aliases: ['c-v0'] },
  'comp-theta': { type: 'int', min: 1, max: 89, aliases: ['c-theta'] },
  'comp-h0': { type: 'int', min: 0, max: 50, aliases: ['c-h0'] },
}

/**
 * parseUrlParams — reads current URL search params
 * and returns an object with validated values.
 */
export function parseUrlParams(searchParams) {
  const result = {}

  for (const [key, schema] of Object.entries(url_param_schema)) {
    const candidates = [key, ...(schema.aliases ?? [])]
    let raw = null
    for (const c of candidates) {
      if (searchParams.has(c)) { raw = searchParams.get(c); break }
    }

    if (raw == null) {
      if (schema.default !== undefined) result[key] = schema.default
      continue
    }

    let val
    if (schema.type === 'int') {
      val = Math.round(Number(raw))
      if (isNaN(val)) val = schema.default
      else {
        if (schema.min != null && val < schema.min) val = schema.min
        if (schema.max != null && val > schema.max) val = schema.max
      }
    } else if (schema.type === 'float') {
      val = Number(raw)
      if (isNaN(val)) val = schema.default
      else {
        if (schema.min != null && val < schema.min) val = schema.min
        if (schema.max != null && val > schema.max) val = schema.max
      }
    } else if (schema.type === 'bool') {
      val = raw === 'true' || raw === '1' || raw === 'on'
    } else if (schema.type === 'string') {
      val = raw
      if (schema.allowed && !schema.allowed.includes(val)) {
        val = schema.default
      }
    }

    result[key] = val
  }

  return result
}

/**
 * updateUrlParams — updates the URL search params without reload.
 * HashRouter-aware: updates params within the hash part if present.
 */
export function updateUrlParams(params, replace = true) {
  const href = window.location.href
  const hashIndex = href.indexOf('#')

  if (hashIndex === -1) {
    // No hash, use standard search params
    const url = new URL(href)
    const oldQueryNormalized = url.searchParams.toString()

    for (const [key, val] of Object.entries(params)) {
      if (val === undefined || val === null) url.searchParams.delete(key)
      else url.searchParams.set(key, String(val))
    }

    const newQuery = url.searchParams.toString()
    if (newQuery === oldQueryNormalized) return

    const newUrl = url.pathname + url.search
    if (replace) window.history.replaceState(null, '', newUrl)
    else window.history.pushState(null, '', newUrl)
    return
  }

  // Hash exists. HashRouter params are usually after the '?' in the hash part.
  // e.g. #/junior?tab=motion
  const hashPart = href.slice(hashIndex)
  const qIndex = hashPart.indexOf('?')

  let pathPart = qIndex === -1 ? hashPart : hashPart.slice(0, qIndex)
  let queryPart = qIndex === -1 ? '' : hashPart.slice(qIndex + 1)

  const searchParams = new URLSearchParams(queryPart)
  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === null) searchParams.delete(key)
    else searchParams.set(key, String(val))
  }

  const newQuery = searchParams.toString()
  // Compare newQuery with a "normalized" version of the old query
  const oldQueryNormalized = new URLSearchParams(queryPart).toString()

  if (newQuery === oldQueryNormalized) return // No change, skip

  const newHash = pathPart + (newQuery ? '?' + newQuery : '')
  const newUrl = href.slice(0, hashIndex) + newHash

  if (replace) window.history.replaceState(null, '', newUrl)
  else window.history.pushState(null, '', newUrl)
}
