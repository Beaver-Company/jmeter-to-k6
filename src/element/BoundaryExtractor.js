const { Post } = require('../symbol')
const literal = require('../literal')
const renderInput = require('../common/input')
const runtimeString = require('../string/run')
const text = require('../text')
const value = require('../value')
const makeResult = require('../result')

function BoundaryExtractor (node, context) {
  const result = makeResult()
  if (node.attributes.enabled === 'false') return result
  const settings = { component: 'false' }
  for (const key of Object.keys(node.attributes)) attribute(node, key)
  const props = node.children.filter(node => /Prop$/.test(node.name))
  for (const prop of props) property(prop, context, settings)
  if (sufficient(settings)) render(settings, result)
  return result
}

function attribute (node, key) {
  switch (key) {
    case 'enabled':
    case 'guiclass':
    case 'testclass':
    case 'testname':
      break
    default:
      throw new Error('Unrecognized BoundaryExtractor attribute: ' + key)
  }
}

function property (node, context, settings) {
  const name = node.attributes.name.split('.').pop()
  switch (name) {
    case 'comments':
      settings.comment = value(node, context)
      break
    case 'default':
      settings.default = literal(node, context)
      break
    case 'default_empty_value':
      settings.clear = (text(node.children) === 'true')
      break
    case 'lboundary':
      settings.left = literal(node, context)
      break
    case 'match_number':
      settings.index = Number.parseInt(text(node.children), 10)
      break
    case 'rboundary':
      settings.right = literal(node, context)
      break
    case 'refname':
      settings.output = text(node.children)
      break
    case 'scope':
      settings.samples = text(node.children)
      break
    case 'useHeaders':
      settings.component = text(node.children)
      break
    default:
      throw new Error('Unrecognized BoundaryExtractor property: ' + name)
  }
}

function sufficient (settings) {
  return (
    settings.left &&
    'index' in settings &&
    settings.right &&
    settings.output &&
    settings.component
  )
}

function render (settings, result) {
  result.state.add('regex')
  result.state.add('matches')
  result.state.add('match')
  result.state.add('extract')
  result.state.add('vars')
  let logic = ''
  if (settings.comment) logic += `/* ${settings.comment} */\n`
  const left = escape(settings.left)
  const right = escape(settings.right)
  const regex = `new RegExp(${left} + '(.*)' + ${right}, 'g')`
  const input = renderInput(settings.component, result)
  const transport = renderTransport(settings)
  logic += '' +
`regex = ${regex}
matches = (() => {
  const matches = []
  while (match = regex.exec(${input})) matches.push(match[1])
  return matches
})()
${transport}`
  result.defaults.push({ [Post]: [ logic ] })
}

function escape (string) {
  return string.replace(/[-/^$*+?.()|[\]{}]|\\\\/g, '\\\\$&')
}

function renderTransport (settings) {
  if (settings.index < 0) return renderDistribute(settings)
  else {
    const extract = renderExtract(settings)
    const write = renderWrite(settings)
    return `extract = ${extract}
${write}`
  }
}

function renderDistribute (settings) {
  const output = runtimeString(settings.output)
  const defaultValue = renderDefault(settings)
  const components = []
  if (defaultValue) components.push(`vars[${output}] = ${defaultValue}`)
  components.push(`vars[${output} + '_matchNr'] = matches.length`)
  components.push('' +
`for (let i = (matches.length - 1); i >= 0; i--) {
  vars[${output} + '_' + (i+1)] = matches[i]
}`)
  return components.join('\n')
}

function renderExtract (settings) {
  const { index } = settings
  if (index > 0) return namedExtract(index)
  else return randomExtract()
}

function namedExtract (index) {
  return `(${index} >= matches.length ? null : matches[${index - 1}])`
}

function randomExtract () {
  const index = `Math.floor(Math.random()*matches.length)`
  const extract = `matches[${index}]`
  return `(matches.length === 0 ? null : ${extract})`
}

function renderWrite (settings) {
  const output = runtimeString(settings.output)
  const defaultValue = renderDefault(settings)
  if (defaultValue) return `vars[${output}] = extract || ${defaultValue}`
  else return `if (extract) vars[${output}] = extract`
}

function renderDefault (settings) {
  return (
    (settings.clear && `''`) ||
    settings.default ||
    null
  )
}

module.exports = BoundaryExtractor
