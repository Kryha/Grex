const driver = require('bigchaindb-driver');
const WebSocket = require("ws")
const request = require('request');

const DB_ENDPOINT = require("./const.js")

const ws = new WebSocket(DB_ENDPOINT.ws)

class Listener {
    constructor() {
        this.on_do = {}

        ws.on("message", (data) => {
            // console.log(data)
            data = JSON.parse(data)

            var tx = data["transaction_id"]

            request(`${DB_ENDPOINT.db}transactions/${tx}`, (err, response, body) => {
                data = JSON.parse(body)
                // console.log(data)
                if (data["metadata"]["type"] in this.on_do) {
                    this.on_do[data["metadata"]["type"]](data)
                }
            })
        })
    }

    add_on_do(on, callback) {
        this.on_do[on] = callback
    }
}

// var test = new Listener()
// test.add_on_do("poepen", (data) => {
//     console.log(data);
// })

module.exports = new Listener()
