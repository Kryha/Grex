const listener = require('./components/utils/bigchainDB/Listeners')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const { saveOnClose } = require('./constants')

const processArgs = (args) => {
  let commandlineArgs = {
    agents: 1,
    timeout: 1000,
    objectiveRadius: 10,
    moveSpeed: 10
  }
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-a': commandlineArgs['agents'] = parseInt(args[i + 1]); break
      case '--agents': commandlineArgs['agents'] = parseInt(args[i + 1]); break
      case '-t': commandlineArgs['timeout'] = parseInt(args[i + 1]); break
      case '--timeout': commandlineArgs['timeout'] = parseInt(args[i + 1]); break
      case '-r': commandlineArgs['objectiveRadius'] = parseInt(args[i + 1]); break
      case '--objectiveRadius': commandlineArgs['objectiveRadius'] = parseInt(args[i + 1]); break
      case '-m': commandlineArgs['moveSpeed'] = parseInt(args[i + 1]); break
      case '--moveSpeed': commandlineArgs['moveSpeed'] = parseInt(args[i + 1]); break

      case 'default': break
    }
  }
  return commandlineArgs
}

if (require.main === module) {
  const { agents, timeout, objectiveRadius, moveSpeed } = processArgs(process.argv)
  let agentCounter = 0
  let totalTransactionCounter = 0
  let totalTransactionPerAgent = {}
  let totalCompleted = 0
  let timestampStartTotal
  let timestampStartPerAgent = {}
  let timestampStopTotal
  let timestampStopPerAgent = {}
  let timeElapsedTotal = 0
  let completedAgents = {}
  let objectiveLocation = {}
  let firstComplete = {}
  let transactions = []
  let txs = 0
  const txps = (totalTransactionCounter, timeElapsedTotal, transactions, txs) => {
    let txstemp = totalTransactionCounter / (timeElapsedTotal / 1000)
    if (!isNaN(txstemp)) {
      transactions.push({
        timeElapsedTotal,
        totalTransactionCounter,
        txs: txstemp,
        txsDelta: Math.abs(txs - txstemp)
      })
    }
  }
  listener.addOnDo('create_objective', (data) => {
    objectiveLocation = data.metadata.location
    console.log(chalk.blue('OBJECTIVE CREATED'), objectiveLocation)
  })
  listener.addOnDo('create_drone', (data) => {
    agentCounter++
    totalTransactionPerAgent[data.id] = 0
    timestampStartPerAgent[data.id] = new Date().getTime()
    if (agentCounter === agents) timestampStartTotal = new Date().getTime()
    console.log(chalk.blue('NEW CREATE'))
    console.log('agentCounter', agentCounter)
    console.log('totalTransactionCounter', totalTransactionCounter)
    console.log('timestampStartTotal', timestampStartTotal)
  })
  listener.addOnDo('SIM', (data) => {
    totalTransactionCounter++
    totalTransactionPerAgent[data.asset.id]++
    timeElapsedTotal = timestampStartTotal === undefined ? undefined : new Date().getTime() - timestampStartTotal
    txps(totalTransactionCounter, timeElapsedTotal, transactions, txs)
    if ((data.metadata.action === 'FOUND' || data.metadata.action === 'FOUND_DRONE') && completedAgents[data.asset.id] === undefined) {
      if (data.metadata.action === 'FOUND') {
        firstComplete = {
          timeElapsedTotal,
          totalTransactionCounter,
          txs: totalTransactionCounter / (timeElapsedTotal / 1000)
        }
      }
      completedAgents[data.asset.id] = true
      totalCompleted++
      timestampStopPerAgent[data.asset.id] = new Date().getTime()
      if (totalCompleted === agents) {
        timestampStopTotal = new Date().getTime()
        const data = {
          inputs: {
            agents,
            objectiveRadius,
            timeout,
            moveSpeed
          },
          agentCounter,
          totalTransactionCounter,
          totalTransactionPerAgent,
          totalCompleted,
          timestampStartTotal,
          timestampStartPerAgent,
          timestampStopTotal,
          timestampStopPerAgent,
          timeElapsedTotal,
          completedAgents,
          objectiveLocation,
          transactions,
          firstComplete
        }
        console.log('EXPERIMENT FINISHED DATA DUMP:\n', data)
        const now = new Date()
        fs.writeFile(path.resolve('..', 'logs', `R${objectiveRadius}T${timeout}A${agents}Y${now.getFullYear()}M${now.getMonth()}D${now.getDate()}H${now.getHours()}m${now.getMinutes()}.json`), JSON.stringify(data), 'utf8', () => process.exit(0))
      }
    }

    console.log(chalk.blue('NEW TX:'))
    console.log('agentCounter', agentCounter)
    console.log('totalTransactionCounter', totalTransactionCounter)
    console.log('totalTransactionPerAgent', totalTransactionPerAgent)
    console.log('timestampStartTotal', timestampStartTotal)
    console.log('timestampStopTotal', timestampStopTotal)
    console.log('timeElapsedTotal', timeElapsedTotal)
    console.log('totalCompleted', totalCompleted)
  })
  console.log(chalk.green('Listener ready'))

  process.once('SIGINT', function () {
    console.log('Exiting...')
    if (saveOnClose) {
      console.log('Saving logs to logs folder')
      const now = new Date()
      const data = {
        inputs: {
          agents,
          objectiveRadius,
          timeout,
          moveSpeed
        },
        agentCounter,
        totalTransactionCounter,
        totalTransactionPerAgent,
        totalCompleted,
        timestampStartTotal,
        timestampStartPerAgent,
        timestampStopTotal,
        timestampStopPerAgent,
        timeElapsedTotal,
        completedAgents,
        objectiveLocation,
        transactions,
        firstComplete
      }
      fs.writeFile(path.resolve('..', 'logs', `FAILED_R${objectiveRadius}T${timeout}A${agents}Y${now.getFullYear()}M${now.getMonth()}D${now.getDate()}H${now.getHours()}m${now.getMinutes()}.json`), JSON.stringify(data), 'utf8', () => process.exit(0))
    }
    process.exit(0)
  })
}
