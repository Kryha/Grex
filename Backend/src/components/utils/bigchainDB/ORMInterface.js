const ORM = require('bigchaindb-orm')
const driver = require('bigchaindb-driver')
const { DB_ENDPOINT } = require('../../../constants')

class ORMInterface {
  constructor (drone = true) {
    this.bdbOrm = new ORM.default(DB_ENDPOINT.db, {
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

      const object = await asset.append({
        toPublicKey: keypair.publicKey,
        keypair: keypair,
        data: data
      })
      return object
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

module.exports = ORMInterface
