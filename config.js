const path = require('path')

module.exports = {
    server: server(),
    database: database(),
    storage: storage()
};

function server () {
    return {
        host: '127.0.0.1',
        port: 8080
    };
}

function database () {
    return {
        base: 'azbuka',
        host: '127.0.0.1',
        port: 27017
    };
}

function storage () {
    return {
        image: filename => path.join(__dirname, '../images')
    }
}