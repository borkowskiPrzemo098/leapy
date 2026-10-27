// Node module hooks for the prerender: stylesheet imports (katex.css, fonts) mean nothing
// on the server, so they resolve to an empty module.
export async function load(url, context, next) {
  if (/\.css(\?|$)/.test(url)) return { format: 'module', source: '', shortCircuit: true }
  return next(url, context)
}
