module.exports = {
    server: server(),
    database: database()
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