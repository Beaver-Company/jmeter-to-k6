// Paste text literals into a single literal
function paste (...items) {
  items = items.filter(item => item)
  validate(items)
  if (simple(items)) return string(items)
  else return template(items)
}

function validate (items) {
  for (const item of items) {
    if (![ '"', '`' ].includes(item[0])) {
      throw new Error(`Invalid text literal: ${item}`)
    }
  }
}

function simple (items) {
  return !items.find(item => item[0] === '`')
}

function string (items) {
  const content = items.map(item => JSON.parse(item)).join('')
  return JSON.stringify(content)
}

function template (items) {
  const content = items.map(item => text(item)).join('')
  return `\`${content}\``
}

function text (item) {
  if (item[0] === '"') return direct(item)
  else return interpolate(item)
}

function direct (item) {
  const value = JSON.parse(item)
  return escape(value)
}

function escape (value) {
  return value.replace(/[\\$`]/g, '\\$&')
}

function interpolate (item) {
  return item.slice(1, -1)
}

module.exports = paste
