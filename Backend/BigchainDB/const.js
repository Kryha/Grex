let BDB_HOST = process.env.BDB || 'localhost'


const DB_ENDPOINT = {
  db: "http://"+BDB_HOST+":9984/api/v1/",
  ws: "ws://"+BDB_HOST+":9985/api/v1/streams/valid_transactions"
}

module.exports = DB_ENDPOINT
