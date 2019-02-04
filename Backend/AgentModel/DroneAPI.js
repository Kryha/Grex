const sumo = require('node-jumping-night')
const bigchaindb = require('../BigchainDB/ORMInterface')
const BigchainDB = new bigchaindb(true)
const chalk = require('chalk')
// const blobUtil = require('blob-util')
// const fs = require('fs')
// const cv = require('opencv')

const WAITTIME = 100
const STARTUPTIME = 100
const MOVEMULT = 1000

class Drone {
  constructor (id, initLocation, fake = false) {
    this.id = id

    this.keypair = BigchainDB.createKeyPair()
    this.dbid = null
    this.done = this._createDroneBigchain()

    this.object_detected = false
    this.location = initLocation
    this.history = []
    this.action = 'EXPLORE'

    this.directions = ['N', 'E', 'S', 'W']

    // Initial facing north
    this.facing = this.directions[0]

    // fixed speed 50
    this.speed = 50
    this.detected = false

    if (!fake) {
      this._initDrone()
    }
  }

  _initDrone () {
    this.drone = sumo.createClient()

    console.log(chalk.blue(`Trying to connect`))
    this.connected = new Promise(function (resolve, reject) {
      this.drone.connect(() => {
        console.log(chalk.blue(`Connected to drone ${this.id}`))
        resolve()
      })
    }.bind(this))

    this.currentBattery = 100
    this.getBatteryLifePromise().then(battery => {
      this.currentBattery = battery
    })

    this.movement = this.createMovementControls()
  }

  getBatteryLifePromise () {
    return new Promise(function (resolve, reject) {
      this.drone.on('battery', battery => {
        console.log(chalk.green(`Battery-life: ${battery}`))
        resolve(battery)
      })
    }.bind(this))
  }

  async _createDroneBigchain () {
    try {
      var data = {
        droneName: this.id,
        type: 'create_drone',
        location: this.location
      }

      let drone = await BigchainDB.create(this.keypair, data, 'droneModel')
      this.dbid = drone.id
      this.bdbDrone = drone
      console.log(chalk.green(`Created drone on BigChainDB ${this.dbid}`))
      return this.bdbDrone
    } catch (error) {
      console.log('@DroneAPI/_createDroneBigchain', error)
      throw new Error(error.message)
    }
  }

  async retrieveAsset () {
    try {
      let updatedDrone = await BigchainDB.retrieve(this.dbid, 'droneModel')
      this.bdbDrone = updatedDrone[0]
      console.log(chalk.yellow(`Retrieved asset: ${updatedDrone.id}`))
      return updatedDrone
    } catch (error) {
      console.log('@DroneAPI/retrieveAsset', error)
      throw new Error(error.message)
    }
  }

  async setStateBigchain () {
    try {
      let battery = await this.getBatteryLifePromise()
      var data = {
        droneName: this.id,
        location: this.location,
        action: this.action,

        object_detected: this.object_detected,
        battery: battery,
        cost: this.currentBattery - battery,
        keypair: this.keypair,

        type: 'SIM'
      }

      this.currentBattery = battery

      let updatedDrone = await BigchainDB.append(this.bdbDrone, this.keypair, data, this.dbid)
      this.bdbDrone = updatedDrone
      console.log(chalk.yellow(`Posted new transaction: ${updatedDrone.id}`))
      return updatedDrone
    } catch (error) {
      console.log('@DroneAPI/setStateBigchain', this.dbid, error)
      throw new Error(error.message)
    }
  }

  getVideoData () {
    var video = this.drone.getVideoStream()

    video.on('data', function (data) {
      return data
    })
  }

  async goto (location) {
    try {
      let x
      let y
      console.log(chalk.blue('Going to '), location)
      if (this.location.x < 0 && location.x >= 0) {
        x = location.x + Math.abs(this.location.x)
      } else {
        x = location.x - this.location.x
      }

      if (this.location.y < 0 && location.y >= 0) {
        y = location.y + Math.abs(this.location.y)
      } else {
        y = location.y - this.location.y
      }

      await this._goto_y(y)
      await this._goto_x(x)
      console.log(chalk.blue(`Finished move to: (${location.x}, ${location.y})`))

      this.location = location
      return this.setStateBigchain()
    } catch (error) {
      throw new Error(error.message)
    }
  }

  _goto_x (x, location) {
    return new Promise(function (resolve, reject) {
      if (x !== 0) {
        this.movement.then((movement) => {
          var forward_func = x > 0 ? movement.forward : movement.backward
          var backward_func = x < 0 ? movement.backward : movement.forward

          switch (this.facing) {
            case 'N':
              movement.right().then(() => {
                forward_func(Math.abs(x)).then(resolve)
              })
              break
            case 'E':
              forward_func(Math.abs(x)).then(resolve)
              break
            case 'S':
              movement.left().then(() => {
                forward_func(Math.abs(x)).then(resolve)
              })
              break
            case 'W':
              backward_func(Math.abs(x)).then(resolve)
              break
            default:
              console.log(chalk.red('IMPOSSIBLE FACING'))
          }
        })
      } else {
        resolve()
      }
    }.bind(this))
  }

  _goto_y (y, location) {
    return new Promise(function (resolve, reject) {
      if (y !== 0) {
        this.movement.then((movement) => {
          console.log('testing testing', this.facing)

          var forward_func = y > 0 ? movement.forward : movement.backward
          var backward_func = y < 0 ? movement.backward : movement.forward

          switch (this.facing) {
            case 'N':
              backward_func(Math.abs(y)).then(resolve)
              break
            case 'E':
              movement.left().then(() => {
                forward_func(Math.abs(y)).then(resolve)
              })
              break
            case 'S':
              forward_func(Math.abs(y)).then(resolve)
              break
            case 'W':
              movement.right().then(() => {
                forward_func(Math.abs(y)).then(resolve)
              })
              break
            default:
              console.log(chalk.red('IMPOSSIBLE FACING'))
          }
        })
      } else {
        resolve()
      }
    }.bind(this))
  }

  _setLocation (distance, multiplier) {
    console.log(distance, distance * multiplier)

    switch (this.facing) {
      case 'N':
        this.location.y -= distance * multiplier
        break
      case 'E':
        this.location.x += distance * multiplier
        break
      case 'S':
        this.location.y += distance * multiplier
        break
      case 'W':
        this.location.x -= distance * multiplier
        break
      default:
        console.log(chalk.red('IMPOSSIBLE FACING'))
    }

    console.log(chalk.blue(`New location: (${this.location.x}, ${this.location.y})`))

    return this.location
  }

  _forward (time) {
    return new Promise(function (resolve, reject) {
      this.drone.forward(this.speed)

      setTimeout(() => {
        this.drone.stop()
        this._setLocation(time, 1)

        setTimeout(() => {
          resolve()
        }, WAITTIME)
      }, time * MOVEMULT + STARTUPTIME)
    }.bind(this))
  }

  _backward (time) {
    return new Promise(function (resolve, reject) {
      this.drone.backward(this.speed)

      setTimeout(() => {
        this.drone.stop()
        this._setLocation(time, 1)

        setTimeout(() => {
          resolve()
        }, WAITTIME)
      }, time * MOVEMULT + STARTUPTIME)
    }.bind(this))
  }

  _right () {
    return new Promise(function (resolve, reject) {
      var current = this.directions.indexOf(this.facing)
      var next = current + 1

      // if greater than length then 0
      if (next >= this.directions.length) {
        next = 0
      }

      this.facing = this.directions[next]

      this.drone.right(this.speed)

      setTimeout(() => {
        this.drone.stop()

        setTimeout(() => {
          resolve()
        }, WAITTIME)
      }, 350) // magic number; almost right
    }.bind(this))
  }

  _left () {
    return new Promise(function (resolve, reject) {
      var current = this.directions.indexOf(this.facing)
      var next = current - 1

      // if less than 0 then 0
      if (next < 0) {
        next = 0
      }

      this.facing = this.directions[next]
      this.drone.left(this.speed)

      setTimeout(() => {
        this.drone.stop()

        setTimeout(() => {
          resolve()
        }, WAITTIME)
      }, 350) // magic number; almost left
    }.bind(this))
  }

  createMovementControls () {
    return new Promise(function (resolve, reject) {
      this.connected.then(() => {
        resolve({
          forward: this._forward.bind(this),
          backward: this._backward.bind(this),
          right: this._right.bind(this),
          left: this._left.bind(this),
          stop: () => { this.drone.stop() }
        })
      })
    }.bind(this))
  }
}
module.exports = Drone
