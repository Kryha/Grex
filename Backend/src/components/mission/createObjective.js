const { generateLocation } = require('../utils/location')
const ORM = require('../utils/bigchainDB/ORMInterface')
const BigchainDB = new ORM(true)
const keypair = BigchainDB.createKeyPair()
const OBJECTIVE_LOCATION = generateLocation()
const data = {
  id: 'OBJECTIVE',
  location: OBJECTIVE_LOCATION,
  action: 'OBJECTIVE',
  type: 'create_objective'
}

const createObjective = () => BigchainDB.create(keypair, data, 'droneModel')
const retrieveObjective = () => BigchainDB.retrieve('', 'droneModel').then(drones => drones.filter(drone => drone.data.id === 'OBJECTIVE'))

module.exports = { createObjective, retrieveObjective }
