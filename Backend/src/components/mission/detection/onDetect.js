async function onDetect () {
  if (!this.simulated) {
    this.drone.drone.animationsSpin()

    return setTimeout(() => {
      this.drone.drone.stop()
    }, 1000)
  }
  this.done = 'DETECTED'
  return this.drone.setStateBigchain()
}

module.exports = onDetect
