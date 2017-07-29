module.exports = {

    port: 3000,

    databases: {
        naranawm: {
            host: "127.0.0.1",
            database: "naranawm",
            username: "mobile",
            password: "mobile",
            dialect: "mysql",
            logging: false
        },
        eanaEltu: {
            host: '127.0.0.1',
            database: 'eanaeltu',
            username: 'mobile',
            password: 'mobile'
        },
        sqlite: {
            host: "127.0.0.1",
            dialect: "sqlite",
            benchmark: false,
            logging: false
        }
    }

};
