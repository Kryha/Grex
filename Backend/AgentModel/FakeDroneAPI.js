const Drone = require('./DroneAPI.js')
const chalk = require('chalk')
const seedrandom = require('seedrandom')

class FakeDrone extends Drone {
  constructor (id, initLocation, moveSpeed = 5) {
    super(id, initLocation, true)
    this.currentBattery = 10
    this.moveSpeed = moveSpeed
  }

  async goto (location) {
    try {
      // console.log(`Location: (${location.x}, ${location.y}), This Location: (${this.location.x}, ${this.location.y})`)
      // if (JSON.stringify(location) === JSON.stringify(this.location)) {
      //   await this.setStateBigchain()
      //   return location
      // }

      const rng = seedrandom(new Date().getTime().toString())
      if (rng() > 0.5) {
        const diff = Math.abs(location.x - this.location.x)
        const move = diff > this.moveSpeed ? this.moveSpeed : diff
        if (location.x > this.location.x) {
          location.x = this.location.x + move
          location.y = this.location.y
        } else {
          location.x = this.location.x - move
          location.y = this.location.y
        }
      } else {
        const diff = Math.abs(location.y - this.location.y)
        const move = diff > this.moveSpeed ? this.moveSpeed : diff
        if (location.y > this.location.y) {
          location.y = this.location.y + move
          location.x = this.location.x
        } else {
          location.y = this.location.y - move
          location.x = this.location.x
        }
      }

      console.log(chalk.blue('Going to '), this.location)
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
