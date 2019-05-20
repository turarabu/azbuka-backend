module.exports = {
    post: { add },
    get: { test }
};

function add (req, res) {
    var self = this;
    
    this.db.test.insert(req.body.data, function (error, result) {
        if (error) {
            res.status(400);
            res.send(JSON.stringify({
                error: true,
                message: 'db insert error',
                details: error
            }));

            return res.end();
        }

        console.log(result);
        self.success();
    });
}

function test (req, res) {
    console.log(this.db.catalog)

    res.status(200);
    res.send('Ok!');
}