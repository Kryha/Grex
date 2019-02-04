
const bigchaindb	= require('./BigchainDB/ORMInterface');
const BigchainDB	= new bigchaindb(true);

var random_loc = () => {
	return {
		x: Math.round(Math.random() * 100),
		y: Math.round(Math.random() * 100)
	}
}
kp = BigchainDB.createKeyPair()
let OBJECTIVE_LOCATION = random_loc()

const data = {
	id: "OBJECTIVE",
	location: random_loc(),
	action: "BEING OBJECTIVE",
	type: "create_objective"
}

const createObjective = () => BigchainDB.create(kp,data,'droneModel')
const retrieveObjective = () => BigchainDB.retrieve('','droneModel').then(drones => drones.filter(drone => drone.data.id === "OBJECTIVE"))
// createObjective().then(console.log).then(retrieveObjective).then(console.log)
// retrieveObjective().then(console.log)
module.exports = {createObjective, retrieveObjective}