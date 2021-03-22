const Route = require('./route')
class Router {
    constructor() {
        this.routes = []
    }

    use() {
        const args = Array.prototype.slice.call(arguments)
        const path = args.splice(0, 1)[0]
        const routes = this.routes

        for (let i = 0, len = routes.length; i < len; i++) {
            const route = routes[i];

            if (path === route.path) {
                route.use(args)
                return
            }
        }

        const route = new Route({
            name: path,
            path: path
        })
        route.use(args)
        this.routes.push(route)
    }

    /**
     * 如果有路由匹配项就处理返回
     * @param {*} ctx 
     * @param {*} next 
     */
    async match(ctx, next) {
        const routes = this.routes

        for (let i = 0, len = routes.length; i < len; i++) {
            const route = routes[i]
            if (route.match(ctx.request.pathname)) {
                ctx.response.setMimeType('.txt')
                return route.handler(ctx, next)
            }
        }
        return await next()
    }
}

module.exports = Router