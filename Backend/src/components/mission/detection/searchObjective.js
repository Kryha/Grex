const chalk = require('chalk')

async function searchObjective (currentLocation, objectiveLocation, newAction) {
  try {
    if (Math.abs(objectiveLocation.x - currentLocation.x) <= this.objectiveRadius && Math.abs(objectiveLocation.y - currentLocation.y) <= this.objectiveRadius) {
      this.drone.object_detected = true
      this.drone.action = newAction

      console.log(chalk.blue(`Detected at location (${currentLocation.x}, ${currentLocation.y}), by agent ${this.drone.dbid}`))

      return true
    }
    return false
  } catch (error) {
    console.log('@startDrone/checkLocationDetected', error)
    throw new Error(error.message)
  }
}

module.exports = searchObjective
