const { DRONE_PARAMS } = require('./constants')
const { generateLocation } = require('./components/utils/location')
const MissionWrapper = require('./components/mission/MissionWrapper')

const processArgs = (args) => {
  let commandlineArgs = DRONE_PARAMS

  for (i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-a': commandlineArgs['agents'] = parseInt(args[i + 1]); break
      case '-s': commandlineArgs['simulated'] = args[i + 1] !== 'false'; break
      case '-i': commandlineArgs['id'] = args[i + 1]; break
      case '-l': commandlineArgs['location'] = args[i + 1]; break
      case '-t': commandlineArgs['timeout'] = parseInt(args[i + 1]); break
      case '-o': commandlineArgs['deployObjective'] = args[i + 1] !== 'false'; break
      case '-r': commandlineArgs['objectiveRadius'] = parseInt(args[i + 1]); break
      case '-m': commandlineArgs['moveSpeed'] = parseInt(args[i + 1]); break
      case '-g': commandlineArgs['gt'] = args[i + 1] !== 'false'; break
      case '--agents': commandlineArgs['agents'] = parseInt(args[i + 1]); break
      case '--simulated': commandlineArgs['simulated'] = args[i + 1]; break
      case '--id': commandlineArgs['id'] = args[i + 1]; break
      case '--location': commandlineArgs['location'] = args[i + 1]; break
      case '--timeout': commandlineArgs['timeout'] = args[i + 1]; break
      case '--objective': commandlineArgs['deployObjective'] = args[i + 1] !== 'false'; break
      case '--objectiveRadius': commandlineArgs['objectiveRadius'] = parseInt(args[i + 1]); break
      case '--moveSpeed': commandlineArgs['moveSpeed'] = parseInt(args[i + 1]); break
      case '--gt': commandlineArgs['gt'] = args[i + 1] !== 'false'; break
      case 'default': break
    }
  }
  return commandlineArgs
}

if (require.main === module) {
  let { agents, id, simulated, timeout, location, deployObjective, objectiveRadius, moveSpeed } = processArgs(process.argv)
  for (var i = 0; i < agents; i++) {
    location = location || generateLocation()
    if (i === 0) {
      new MissionWrapper(id, simulated, generateLocation(), timeout, deployObjective, objectiveRadius, moveSpeed).init()
    } else {
      new MissionWrapper(id, simulated, generateLocation(), timeout, false, objectiveRadius, moveSpeed).init()
    }
  }
}
