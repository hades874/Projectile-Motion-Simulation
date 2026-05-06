/**
 * url_template — the canonical URL pattern for the Projectile Motion Simulator.
 * Placeholder syntax: {{param_name}} matches the TenTen media sheet convention.
 */
export const url_template =
  '{base}/#/senior?v0={{v0}}&theta={{theta}}&h0={{h0}}'

/**
 * url_param_schema — validation rules for each {{param}}.
 * Compatible with the TenTen media sheet url_param_schema column format.
 */
export const url_param_schema = {
  v0: {
    type: 'int',
    min: 1,
    max: 100,
    aliases: ['v0', 'velocity', 'speed', 'initial_velocity'],
  },
  theta: {
    type: 'int',
    min: 1,
    max: 89,
    aliases: ['theta', 'angle', 'launch_angle', 'deg'],
  },
  h0: {
    type: 'int',
    min: 0,
    max: 50,
    aliases: ['h0', 'height', 'initial_height', 'elevation'],
  },
}

/**
 * url_build — constructs a valid URL from the template and a params object.
 *
 * - Resolves aliases to canonical param names.
 * - Clamps numeric values to schema min/max.
 * - Skips params whose value is undefined/null (leaves placeholder empty).
 * - Returns the filled URL string.
 *
 * @param {string} template  A url_template string with {{param}} slots.
 * @param {object} params    Key-value map of param names (or aliases) to values.
 * @param {string} [base]    Optional base URL to substitute {base}. Defaults to window.location.origin.
 * @returns {string}
 */
export function url_build(template, params, base) {
  // Build canonical alias map: alias → canonical key
  const aliasMap = {}
  for (const [key, schema] of Object.entries(url_param_schema)) {
    for (const alias of schema.aliases ?? [key]) {
      aliasMap[alias] = key
    }
  }

  // Resolve and validate params
  const resolved = {}
  for (const [rawKey, rawVal] of Object.entries(params)) {
    const key = aliasMap[rawKey] ?? rawKey
    const schema = url_param_schema[key]
    if (!schema || rawVal == null) continue

    let val = schema.type === 'int' ? Math.round(Number(rawVal))
            : schema.type === 'float' ? Number(rawVal)
            : rawVal

    if (schema.min != null && val < schema.min) val = schema.min
    if (schema.max != null && val > schema.max) val = schema.max

    resolved[key] = val
  }

  // Substitute {base}
  const origin = base ?? (typeof window !== 'undefined' ? window.location.origin : '')
  let url = template.replace('{base}', origin)

  // Fill {{param}} placeholders
  url = url.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    resolved[key] != null ? encodeURIComponent(resolved[key]) : ''
  )

  return url
}

/**
 * parseUrlParams — reads current URL search params (HashRouter-aware)
 * and returns an object with validated values merged over defaults.
 *
 * Intended for use with React Router's useSearchParams() inside components.
 *
 * @param {URLSearchParams} searchParams  from useSearchParams()
 * @param {object} defaults               fallback values if param is absent/invalid
 * @returns {object}
 */
export function parseUrlParams(searchParams, defaults = {}) {
  const result = { ...defaults }

  for (const [key, schema] of Object.entries(url_param_schema)) {
    // Check canonical key first, then all aliases
    const candidates = [key, ...(schema.aliases ?? [])]
    let raw = null
    for (const c of candidates) {
      if (searchParams.has(c)) { raw = searchParams.get(c); break }
    }
    if (raw == null) continue

    let val = schema.type === 'int'   ? Math.round(Number(raw))
            : schema.type === 'float' ? Number(raw)
            : raw

    if (!Number.isFinite(val)) continue
    if (schema.min != null && val < schema.min) val = schema.min
    if (schema.max != null && val > schema.max) val = schema.max

    result[key] = val
  }

  return result
}
