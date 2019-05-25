module.exports = {
    post: { set, remove, list },
    get: { list }
}

async function set (req, res) {
    var self = this
    var result = await eachShop(req.body, async function (shop) {
        let update = await setShop(shop, self.db.shop)
        return update
    })

    return setStatus(result, res, this.success)
}

async function remove (req, res) {
    var self = this
    var result = await eachShop(req.body, async function (shop) {
        let remove = await removeShop(shop, self.db.shop)
        return remove
    })

    return setStatus(result, res, this.success)
}

function list (req, res) {
    this.db.shop.find({}).toArray(function (error, result) {
        if (error === null) {
            res.send( JSON.stringify(result) )
            res.end()
        }

        else setStatus ({
            error: true,
            message: `Database error: Can't get shops list`,
            details: JSON.stringify(shop)
        }, res)
    })
}

async function eachShop (body, handler) {
    return new Promise(async function (resolve) {
        let list = body.many === undefined
            ? [ body ] : body.list

        let each = await runEach(list, handler)
        resolve(each)
    })
}

function runEach (list, handler) {
    return new Promise(async function (resolve) {
        for (let s = 0; s != list.length; ++s) {
            let shop = list[s]
            let result = await checkResult(shop, handler)

            if (result !== true)
                return resolve(result)
        }

        return resolve(true)
    })
}

function checkResult (shop, handler) {
    return new Promise(async function (resolve) {
        let check = checkShop(shop)

        if (check === true) {
            let result = await handler(shop)
            resolve(result)
        }
    
        else resolve(check)
    })
}

function setStatus (result, res, success) {
    if (result === true)
        return success()
    
    else {
        res.status(400)
        res.send( JSON.stringify(result) )

        return res.end()
    }
}

function checkShop (shop) {
        return shop.id === undefined
        ? {
            error: true,
            message: 'ID is not defined',
            details: `Not found shop ID in data ${ JSON.stringify(shop) }`
        } : true
}

function setShop (shop, db) {
    var where = { id: shop.id }
    var set = { $set: shop }

    return new Promise(function (resolve) {
        db.updateOne(
            where, set, {upsert: true},
            dbHandler(resolve, `Can\'t update shop by ID ${shop.id}`)
        )
    })
}

function removeShop (shop, db) {
    return new Promise(function (resolve) {
        db.deleteOne(
            {id: shop.id},
            dbHandler(resolve, `Can\'t delete shop by ID ${shop.id}`)
        )
    })
}

function dbHandler (resolve, errorText) {
    return function (error) {
        if (error) return resolve({
            error: true,
            message: `Database error: ${errorText}`,
            details: JSON.stringify(error)
        })

        else resolve(true)
    }
}