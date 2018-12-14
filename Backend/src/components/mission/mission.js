const { randomMove: generateMove } = require('../utils/move')
const searchObjective = require('./detection/searchObjective')
const checkDetected = require('./detection/checkDetected')
let onDetect = require('./detection/onDetect')
const ORM = require('../utils/bigchainDB/ORMInterface')
const orm = new ORM(true)

async function mission () {
  if (this.drone.currentBattery < 10) throw new Error('Low battery')

  onDetect = onDetect.bind(this)
  try {
    // get all drones and check if objective detected
    const drones = await orm.retrieve('', 'droneModel')
    const detected = await checkDetected(drones)

    // console.log(chalk.blue(`Diff Objective: (${Math.abs(this.OBJECTIVE_LOCATION.x - this.drone.location.x)}, ${Math.abs(this.OBJECTIVE_LOCATION.y - this.drone.location.y)}), radius: ${this.objectiveRadius}, Diff Drone: (${Math.abs(detected.x - this.drone.location.x)}, ${Math.abs(detected.y - this.drone.location.y)}) `))

    if (detected) {
      let droneDetected = searchObjective(this.drone.location, detected, 'FOUND_DRONE')
      if (droneDetected) {
        return onDetect()
      }
      let updatedDrone = await this.drone.goto(detected)
      this.done = true
      return updatedDrone
    } else {
      if (this.drone.action === 'EXPLORE') {
        let objectiveDetected = await searchObjective(this.drone.location, this.OBJECTIVE_LOCATION, 'FOUND')
        if (objectiveDetected) {
          return onDetect()
        }

        let action = await generateMove(this.drone.location, this.moveSpeed)

        let updatedDrone = await this.drone.goto(action)
        this.done = true
        return updatedDrone
      } else {
        console.log('No action found', this.drone.action)
        throw new Error('No action found')
      }
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

module.exports = mission
