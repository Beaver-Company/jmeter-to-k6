const makeContext = require('../context')
const match = require('./match')

const left = '(?:^|\\\\\\\\|[^\\\\])\\${'
const right = '}'

function interpolate (string, context = makeContext()) {
  const ranges = match(string, left, right, 'g')
  if (!ranges.length) return string
  const values = ranges.map(range => replace(string, range, context))
  for (let i = ranges.length - 1; i > -1; i--) {
    const [ start, end ] = ranges[i]
    const value = values[i]
    string = splice(string, start, end, value)
  }
  return string
}

function replace (string, [ start, end ], context) {
  return evaluate(string.substring(start + 2, end - 1), context)
}

function evaluate (string, context) {
  string = interpolate(string, context)
  if (string === '') return ''
  else if (string.substring(0, 2) === '__') return func(string, context)
  else return variable(string, context)
}

function func (string, context) {
  const name = /^__([^(]+)\(/.exec(string)[1]
  switch (name) {
    case 'threadNum': throw new Error('__threadNum invalid at convert time')
    default: throw new Error('JMeter function not implemented: __' + name)
  }
}

function variable (name, context) {
  if (!context.vars.has(name)) throw new Error('Undefined variable: ' + name)
  return context.vars.get(name)
}

function splice (string, start, end, substitute) {
  const lead = string.substring(0, start)
  const tail = string.substring(end)
  return lead + substitute + tail
}

module.exports = interpolate
