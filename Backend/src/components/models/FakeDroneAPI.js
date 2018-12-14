const chalk = require('chalk')
const Drone = require('./DroneAPI.js')

class FakeDrone extends Drone {
  constructor (id, initLocation, moveSpeed = 5) {
    super(id, initLocation, true)
    this.currentBattery = 10
    this.moveSpeed = moveSpeed
  }

  async goto (location) {
    try {
      this.location = location
      return this.setStateBigchain()
    } catch (error) {
      console.log(chalk.purple('@FakeDroneAPI/goto'), error)
      throw new Error(error.message)
    }
  }

  getVideoData () {
    return null
  }

  async getBatteryLifePromise () {
    return 10
  }
}

module.exports = FakeDrone
