const defaults = {
  name: 'Saber PWA App',
  themeColor: '#ffffff',
  assetsVersion: '',
}

export default function (config: {
  name?: string
  appleTouchIcon?: string
} = {}) {
  return Object.assign({}, defaults, config, {
    name: config.name || defaults.name,
  })
}
