const WebSocket = require('ws')
const request = require('request')
const { DB_ENDPOINT } = require('../../../constants')
const ws = new WebSocket(DB_ENDPOINT.ws)

class Listener {
  constructor () {
    this.on_do = {}

    ws.on('message', (data) => {
      data = JSON.parse(data)

      var tx = data['transaction_id']

      request(`${DB_ENDPOINT.db}transactions/${tx}`, (error, response, body) => {
        if (error) throw new Error(error.message)
        data = JSON.parse(body)
        if (data['metadata']['type'] in this.on_do) {
          this.on_do[data['metadata']['type']](data)
        }
      })
    })
  }

  addOnDo (on, callback) {
    this.on_do[on] = callback
  }
}

module.exports = new Listener()
