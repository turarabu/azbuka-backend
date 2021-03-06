const routes = {
    catalog: require('./catalog'),
    cart: require('./cart'),
    shop: require('./shop'),
    city: require('./city'),
    warehouse: require('./warehouse'),
    stock: require('./stock'),
    service: require('./service'),
    item: require('./item'),
    image: require('./image')
};

module.exports = { init };

function init (express, mongodb) {
    var dirs = Object.keys(routes);
    var router = express.Router();

    signCheck('post', dirs, router, mongodb);
    signCheck('get', dirs, router, mongodb);

    signErrors(router, mongodb);

    return router;
}

function signCheck (type, dirs, router, mongodb) {
    dirs.forEach(function (dir) {
        if ( routes[dir][type] === undefined )
            return;
        
        else sign(router, type, dir, mongodb);
    });
}

function sign (Router, type, dir, mongodb) {
    var methods = Object.keys( routes[dir][type] );
    function router (...data) {
        Router[type](...data);
    };

    methods.forEach(function (method) {
        router(
            `/${dir}/${method}`,
            decor(dir, type, method, mongodb)
        );
    });
}

function signErrors (router, mongodb) {
    router.use(function (req, res, next) {
        if ( req.route === undefined ) {
            res.status(404);
            res.send(JSON.stringify({
                success: false,
                message: 'method does not exists!'
            }))

            console.log('Response code', 404, {
                success: false,
                message: 'method does not exists!'
            })
        }

        else next();
    });
}

function decor (dir, type, method, db) {
    var handler = routes[dir][type][method]

    return function (req, res, next) {
        var cont = { next, db, success, error }
        res.header('access-control-allow-origin', '*')
        res.header('access-control-expose-headers', '*')
        handler.call(cont, req, res)

        function error (message) {
            console.log('Response code', 400, message)
            res.status(400);
            res.send( JSON.stringify(message) )

            return res.end()
        }

        function success (data = {}) {
            data = Object.assign({data}, {
                error: false,
                success: true
            })

            console.log('Response code', 200, data)
            res.status(200);
            res.send( JSON.stringify(data) );

            return res.end()
        }
    };
}