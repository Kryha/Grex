const Drone = require('../models/DroneAPI')
const FakeDrone = require('../models/FakeDroneAPI')
const chalk = require('chalk')
const missionLoop = require('./mission')
const { createObjective, retrieveObjective } = require('./createObjective')
const { getMission } = require('./detection/getMission')
const { checkClosest } = require('../utils/location')

class MissionWrapper {
  constructor (id = 'SEARCHANDRESCUE_TEST', simulated = true, location = { x: 0, y: 0 }, timeout = 1000, deployObjective = false, objectiveRadius = 30, moveSpeed = 10, gt = false) {
    this.eventLoopTimeout = this.eventLoopTimeout.bind(this)
    this.eventLoopPromise = this.eventLoopPromise.bind(this)
    this.checkClosest = checkClosest.bind(this)
    this.missionLoop = missionLoop.bind(this)

    this.done = false
    this.objectiveRadius = objectiveRadius
    this.moveSpeed = moveSpeed

    this.simulated = simulated
    this.timeout = timeout

    this.deployObjective = deployObjective
    this.simulated = simulated
    this.location = location
    this.nextAction = Promise.resolve()
  }

  async init () {
    try {
      this.OBJECTIVE_LOCATION = this.deployMission(this.deployObjective)

      if (!this.simulated) {
        this.drone = new Drone('SEARCHANDRESCUE_TEST', this.location)
      } else {
        this.drone = new FakeDrone('SEARCHANDRESCUE_TEST', this.location, this.moveSpeed)
      }
      this.action = 'EXPLORE'
      this.mission = getMission(this.drone.id)

      await this.drone.done
      this.done = true
      return this.eventLoopTimeout()
    } catch (error) {
      console.log('@startDrone/init', error)
      if (error.message === 'NO OBJECTIVE FOUND') return setTimeout(() => this.init(), this.timeout)
      throw new Error(error.message)
    }
  }

  async deployMission (deployObjective) {
    let objective
    if (deployObjective) {
      objective = await createObjective()
    } else {
      objective = await retrieveObjective()
      if (objective.length === 0) throw new Error('NO OBJECTIVE FOUND')

      objective = objective[objective.length - 1]
    }

    return objective.data.location
  }

  async eventLoopTimeout () {
    const loop = this.eventLoopTimeout.bind(this)
    try {
      if (this.done === false) {
        return setTimeout(loop, this.timeout)
      } else if (this.done === 'DETECTED') {
        return null
      } else if (this.done === 'FAILURE') {
        await this.drone.retrieveAsset()
        this.done = true
        return setTimeout(loop, this.timeout)
      }
      this.done = false

      // mission code
      await this.missionLoop()
      return setTimeout(loop, this.timeout)
    } catch (error) {
      console.log(chalk.red(`error reason code message, ${this.drone.dbid} `), error.reason, error.code, error.message)
      this.done = 'FAILURE'
      return setTimeout(loop, this.timeout)
    }
  }

  async eventLoopPromise () {
    await this.nextAction
    const loop = this.eventLoopPromise.bind(this)
    try {
      if (this.done === false) {
        this.nextAction = loop()
        return
      } else if (this.done === 'DETECTED') {
        this.nextAction = Promise.resolve()
        return
      } else if (this.done === 'FAILURE') {
        await this.drone.retrieveAsset()
        this.done = true
        this.nextAction = loop()
        return
      }
      this.done = false

      // mission code
      this.nextAction = this.missionLoop()
      return loop()
    } catch (error) {
      console.log(chalk.red(`error reason code message, ${this.drone.dbid} `), error.reason, error.code, error.message)

      this.done = 'FAILURE'
      this.nextAction = loop()
    }
  }
}

module.exports = MissionWrapper
