# @alterjs/saber-plugin-prismjs

## How to use

Install this package:

```bash
yarn add prismjs @alterjs/saber-plugin-prismjs
```

Use it in your `saber-config.yml`:

```yaml
plugins:
  - resolve: '@alterjs/saber-plugin-prismjs'
```

### Include CSS

In your `saber-browser.js`:

```js
// saber-browser.js
import 'prismjs/themes/prism.css'
import '@alterjs/saber-plugin-prismjs/default.css'
```

## License

MIT &copy; EGOIST
