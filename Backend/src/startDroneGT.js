const Drone = require('./AgentModel/DroneAPI.js')
const FakeDrone = require('./AgentModel/FakeDroneAPI.js')
const Bigchaindb = require('./BigchainDB/ORMInterface')
const BigchainDB = new Bigchaindb(true)
const chalk = require('chalk')
const seedrandom = require('seedrandom')
const { createObjective, retrieveObjective } = require('./components/mission/createObjective')

class DroneWrapper {
  constructor (id = 'SEARCHANDRESCUE_TEST', simulated = true, willDetect = false, location = { x: 0, y: 0 }, timeout = 1000, deployObjective = false, objectiveRadius = 30, moveSpeed = 10) {
    this.listenForActions = this.listenForActions.bind(this)
    this.checkClosest = this.checkClosest.bind(this)

    this.done = false
    this.objectiveRadius = objectiveRadius
    this.moveSpeed = moveSpeed

    this.simulated = simulated
    this.willDetect = willDetect
    this.timeout = timeout
    this.nextAction = Promise.resolve()
    this.init(deployObjective, simulated, location)
  }

  async init (deployObjective, simulated, location) {
    try {
      let objective
      if (deployObjective) {
        objective = await createObjective()
      } else {
        objective = await retrieveObjective()
        if (objective.length === 0) throw new Error('NO OBJECTIVE FOUND')

        objective = objective[objective.length - 1]
      }

      this.OBJECTIVE_LOCATION = objective.data.location

      if (!simulated) {
        this.drone = new Drone('SEARCHANDRESCUE_TEST', location)
      } else {
        this.drone = new FakeDrone('SEARCHANDRESCUE_TEST', location, this.moveSpeed)
      }
      this.action = 'EXPLORE'
      this.mission = this.getMission(this.drone.id)

      await this.drone.done
      this.done = true
      let nextAction = await this.listenForActions()
      this.nextAction = nextAction
    } catch (error) {
      console.log('@startDrone/init', error)
      if (error.message === 'NO OBJECTIVE FOUND') return setTimeout(() => this.init(deployObjective, simulated, location), this.timeout)
      throw new Error(error.message)
    }
  }
  async randomMove () {
    try {
      let action
      // generate move
      const rng = seedrandom(new Date().getTime())

      if (rng() > 0.5) {
        if (this.drone.location.x + this.moveSpeed > 100) action = this.drone.goto({ x: this.drone.location.x - this.moveSpeed, y: this.drone.location.y })
        if (this.drone.location.x - this.moveSpeed < 0) action = this.drone.goto({ x: this.drone.location.x + this.moveSpeed, y: this.drone.location.y })
        if (rng() > 0.5) {
          action = this.drone.goto({ x: this.drone.location.x + this.moveSpeed, y: this.drone.location.y })
        } else {
          action = this.drone.goto({ x: this.drone.location.x - this.moveSpeed, y: this.drone.location.y })
        }
      } else {
        if (this.drone.location.y + this.moveSpeed > 100) action = this.drone.goto({ x: this.drone.location.x, y: this.drone.location.y - this.moveSpeed })
        if (this.drone.location.y - this.moveSpeed < 0) action = this.drone.goto({ x: this.drone.location.x, y: this.drone.location.y + this.moveSpeed })

        if (rng() > 0.5) {
          action = this.drone.goto({ x: this.drone.location.x, y: this.drone.location.y + this.moveSpeed })
        } else {
          action = this.drone.goto({ x: this.drone.location.x, y: this.drone.location.y - this.moveSpeed })
        }
      }

      return action
    } catch (error) {
      console.log('@startDrone/randomMove', error)
      throw new Error(error.message)
    }
  }

  async checkLocationDetected (checkLocation, newAction) {
    try {
      if (Math.abs(checkLocation.x - this.drone.location.x) <= this.objectiveRadius && Math.abs(checkLocation.y - this.drone.location.y) <= this.objectiveRadius) {
        this.drone.object_detected = true
        this.drone.action = newAction

        this.willDetect = false

        if (!this.simulated) {
          this.drone.drone.animationsSpin()

          setTimeout(() => {
            this.drone.drone.stop()
          }, 1000)
        }

        console.log(chalk.blue(`Detected at location (${this.drone.location.x}, ${this.drone.location.y}), by agent ${this.drone.dbid}`))
        this.done = 'DETECTED'
        await this.drone.setStateBigchain()
        return true
      }
      return false
    } catch (error) {
      console.log('@startDrone/checkLocationDetected', error)
      throw new Error(error.message)
    }
  }
  async listenForActions () {
    await this.nextAction
    const fun = this.listenForActions.bind(this)
    try {
      if (this.done === false) {
        this.nextAction = fun()
        return
      } else if (this.done === 'DETECTED') {
        this.nextAction = Promise.resolve()
        return
      } else if (this.done === 'FAILURE') {
        await this.drone.retrieveAsset()
        this.done = true
        this.nextAction = fun()
        return
      }
      this.done = false

      // get all drones and check if objective detected
      const drones = await BigchainDB.retrieve('', 'droneModel')
      const detected = this.checkDetected(drones)

      if (this.drone.currentBattery < 10) throw new Error('Low battery')
      console.log(chalk.blue(`Diff Objective: (${Math.abs(this.OBJECTIVE_LOCATION.x - this.drone.location.x)}, ${Math.abs(this.OBJECTIVE_LOCATION.y - this.drone.location.y)}), radius: ${this.objectiveRadius}, Diff Drone: (${Math.abs(detected.x - this.drone.location.x)}, ${Math.abs(detected.y - this.drone.location.y)}) `))

      if (detected) {
        // console.log(chalk.yellow(`Detected at location (${detected.x}, ${detected.y}), Agent ${this.drone.dbid} moving, current location (${this.drone.location.x}, ${this.drone.location.y})  `))
        let droneDetected = await this.checkLocationDetected(detected, 'FOUND_DRONE')
        if (droneDetected) { this.nextAction = Promise.resolve(); return }
        // console.log(`go to detected:  (${detected.x}, ${detected.y})`)
        await this.drone.goto(detected)
        this.done = true
      } else {
        if (this.drone.action === 'EXPLORE') {
          let objectiveDetected = await this.checkLocationDetected(this.OBJECTIVE_LOCATION, 'FOUND')
          if (objectiveDetected) { this.nextAction = Promise.resolve(); return }
          let action = await this.randomMove()

          this.counter += 1

          await action
          // terminate sequence
          this.done = true
          this.nextAction = fun()
          return
        } else {
          console.log('No action found', this.drone.action)
          throw new Error('No action found')
        }
      }
    } catch (error) {
      console.log('message:', chalk.red(error.message), this.drone.dbid)
      console.log('code:', chalk.red(error.code))
      console.log('code equals:', error.code === 'ECONNRESET', 'msg equals:', error.message === 'HTTP Error: Requested page not reachable')
      if (error.message === 'HTTP Error: Requested page not reachable') {
        this.done = 'FAILURE'
        let nextAction = await fun()
        this.nextAction = nextAction
        return
      }
      if (error.code === 'ECONNRESET') {
        this.done = 'FAILURE'
        let nextAction = await fun()
        this.nextAction = nextAction
        return
      }
      if (error.reason === 'read ECONNRESET') {
        this.done = 'FAILURE'
        let nextAction = await fun()
        this.nextAction = nextAction
        return
      }

      console.log(chalk.red(`shit too fucked, bugging out, ${this.drone.dbid} bowing out`), error)
      console.log(chalk.red(`error reason code message, ${this.drone.dbid} `), error.reason, error.code, error.message)

      this.done = 'FAILURE'
      this.nextAction = fun()
      return
      // throw new Error(error.message)
    }
    let nextAction = await fun()
    this.nextAction = nextAction
  }

  calcDistance (location1, location2) {
    var x = location1.x - location2.x
    var y = location1.y - location2.y
    return Math.sqrt(x * x + y * y)
  }

  checkDetected (drones) {
    var objectLocation = false
    drones = drones.filter(drone => {
      return drone.data.id !== 'OBJECTIVE'
    })
    drones.forEach((drone) => {
      if (drone.data.object_detected === true && drone.data.action === 'FOUND') {
        objectLocation = drone.data.location
      }
    })

    // console.log(chalk.green('FOUND LOCATION: '), objectLocation)
    return objectLocation
  }

  getMission (droneId) {
    const mission = droneId.split('_')

    if (mission.length === 1) {
      console.log('No mission specified')
      return 'No mission specified'
    } else {
      return mission[0]
    }
  }

  checkClosest (drones, objectLocation) {
    const distance = this.calcDistance(this.drone.location, objectLocation)
    var closest = true

    drones.map((drone) => {
      if (distance > this.calcDistance(drone.location, objectLocation) && this.mission === this.getMission(drone.id)) {
        closest = false
      }
    })

    return closest
  }
}

module.exports = DroneWrapper

var randomLoc = () => {
  const rng = seedrandom(new Date().getTime())
  return {
    x: Math.round(rng() * 100),
    y: Math.round(rng() * 100)
  }
}
const processArgs = (args) => {
  let commandlineArgs = {
    agents: 1,
    simulated: true,
    id: 'SEARCHANDRESCUE_TEST',
    willDetect: false,
    // location: 'random',
    timeout: 1000,
    deployObjective: true,
    objectiveRadius: 10,
    moveSpeed: 10
  }
  for (i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-a': commandlineArgs['agents'] = parseInt(args[i + 1]); break
      case '-s': commandlineArgs['simulated'] = args[i + 1] !== 'false'; break
      case '-i': commandlineArgs['id'] = args[i + 1]; break
      case '-d': commandlineArgs['willDetect'] = args[i + 1] !== 'false'; break
      case '-l': commandlineArgs['location'] = args[i + 1]; break
      case '-t': commandlineArgs['timeout'] = parseInt(args[i + 1]); break
      case '-o': commandlineArgs['deployObjective'] = args[i + 1] !== 'false'; break
      case '-r': commandlineArgs['objectiveRadius'] = parseInt(args[i + 1]); break
      case '-m': commandlineArgs['moveSpeed'] = parseInt(args[i + 1]); break
      case '--agents': commandlineArgs['agents'] = parseInt(args[i + 1]); break
      case '--simulated': commandlineArgs['simulated'] = args[i + 1]; break
      case '--id': commandlineArgs['id'] = args[i + 1]; break
      case '--willDetect': commandlineArgs['willDetect'] = args[i + 1]; break
      case '--location': commandlineArgs['location'] = args[i + 1]; break
      case '--timeout': commandlineArgs['timeout'] = args[i + 1]; break
      case '--objective': commandlineArgs['deployObjective'] = args[i + 1] !== 'false'; break
      case '--objectiveRadius': commandlineArgs['objectiveRadius'] = parseInt(args[i + 1]); break
      case '--moveSpeed': commandlineArgs['moveSpeed'] = parseInt(args[i + 1]); break
      case 'default': break
    }
  }
  return commandlineArgs
}

if (require.main === module) {
  let { agents, id, simulated, willDetect, timeout, location, deployObjective, objectiveRadius, moveSpeed } = processArgs(process.argv)

  for (var i = 0; i < agents; i++) {
    location = location || randomLoc()
    if (i === 0) {
      new DroneWrapper(id, simulated, willDetect, randomLoc(), timeout, deployObjective, objectiveRadius, moveSpeed)
    } else {
      new DroneWrapper(id, simulated, willDetect, randomLoc(), timeout, false, objectiveRadius, moveSpeed)
    }
  }
}
