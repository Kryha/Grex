const bdbOrm = require('bigchaindb-orm')
const DB_ENDPOINT = require('./const.js').db
const driver = require('bigchaindb-driver')
// let MYSTERY_COUNTER = 0

class ORMInterface {
  constructor (drone = true) {
    this.bdbOrm = new bdbOrm.default(DB_ENDPOINT, {
      app_id: 'DRONECONNECT',
      app_key: 'CLICK CLICK UNLOCK'
    })

    if (drone) {
      this.bdbOrm.define('droneModel', {
        id: String,
        location: Object,
        action: String,

        object_detected: Boolean,
        battery: Number,
        cost: Number,
        type: String
      })
    } else {
      this.bdbOrm.define('objectiveModel', {
        x: Number,
        y: Number,
        drone_id: String
      })
    }

    // this.bdbOrm.define("gridModel", {
    //     type: String,
    //     size: Object,
    //     drones: Object,
    //     grid: Object,
    //     name: String
    // });
  }

  createKeyPair () {
    return new driver.Ed25519Keypair()
  }

  async create (keypair, data, type) {
    try {
      const object = await this.bdbOrm[type].create({
        keypair: keypair,
        data: data
      })

      return object
    } catch (error) {
      console.log('@ORMInterface/create', error)
      throw new Error(error.message)
    }
  }

  async retrieve (id, type) {
    try {
      const objects = await this.bdbOrm[type].retrieve(id)
      return objects
    } catch (error) {
      console.log('@ORMInterface/retrieve', error)
      throw new Error(error.message)
    }
  }

  async append (asset, keypair, data, dbid) {
    try {
      if (asset === undefined) {
        asset = await this.retrieve(dbid, 'droneModel')
      }
      // MYSTERY_COUNTER++
      // console.log('SECRET MYSTERY COUNTER', MYSTERY_COUNTER)
      const object = await asset.append({
        toPublicKey: keypair.publicKey,
        keypair: keypair,
        data: data
      })
      return object
    } catch (error) {
      // MYSTERY_COUNTER--
      // console.log('@SECRET MYSTERY COUNTER FAILED', MYSTERY_COUNTER)
      // console.log('@ORMInterface/append', error)
      throw new Error(error.message)
      // console.log('FAILED TO APPEND: ', error.message, '\nRETRYING')
      // return this.append(undefined, keypair, data, dbid)
      // throw new Error(error.message);
    }
  }
}

module.exports = ORMInterface
// module.exports = new ORMInterface()
// export default const bla = new BigChainDBInterface
