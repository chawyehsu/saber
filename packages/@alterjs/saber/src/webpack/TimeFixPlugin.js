module.exports = class TimeFixPlugin {
  constructor(watchOffset = 11000) {
    this.watchOffset = watchOffset
  }

  apply(compiler) {
    const watch = compiler.watch
    let watching
    let fixed

    // Modify the time for first run
    compiler.watch = function (...args) {
      watching = watch.apply(this, args)
      watching.startTime += this.watchOffset
      return watching
    }

    // Modify the time for subsequent runs
    compiler.hooks.watchRun.tap('time-fix-plugin', () => {
      if (watching && !fixed) {
        watching.startTime += this.watchOffset
      }
    })

    // Reset time
    compiler.hooks.done.tap('time-fix-plugin', (stats) => {
      if (watching && !fixed) {
        // webpack 5: #3
        if (stats.compilation.startTime) {
          stats.compilation.startTime -= this.watchOffset
        } else {
          stats.startTime -= this.watchOffset
        }
        fixed = true
      }
    })
  }
}
