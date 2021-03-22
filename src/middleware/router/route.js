const Middleware = require('mode-server/src/middleware')
const {
    isRegExp,
} = require('../../utils/utils')

class Route {
    constructor(option = {}) {
        const {
            name,
            path
        } = option
        this.name = name
        this.path = path
        this.regExp = isRegExp(path) ? path : new RegExp(path)
        this.middleware = new Middleware()
    }

    use(fns) {
        if (Array.isArray(fns)) {
            fns.forEach(route => {
                this.middleware.use(route)
            })
        } else {
            this.middleware.use(fns)
        }
    }

    match(path) {
        if (this.regExp.test(path)) {
            return true
        }
        return false
    }

    handler(ctx, next) {
        this.middleware.handler(ctx, next)
    }
}

module.exports = Route