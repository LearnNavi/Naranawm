module.exports = {

    port: 3000,

    databases: {
        naranawm: {
            host: "127.0.0.1",
            database: "eana_naranawm_eltu",
            username: "root",
            password: "",
            dialect: "mysql",
            logging: false
        },
        eanaEltu: {
            host: '127.0.0.1',
            database: 'eanaeltu',
            username: 'root',
            password: ''
        },
        forum: {
            database: "learnnavi_forum",
            table: "smf_members",
            attachmentTable: "smf_attachments"
        },
        sqlite: {
            host: "127.0.0.1",
            dialect: "sqlite",
            benchmark: false,
            logging: false
        }
    },

    jwtKey: "arocxg9e8xgh;rchukuthhaetubmapx9i9xcgeu09k"

};
