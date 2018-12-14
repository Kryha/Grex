const seedrandom = require('seedrandom')

const calcDistance = (location1, location2) => {
  var x = location1.x - location2.x
  var y = location1.y - location2.y
  return Math.sqrt(x * x + y * y)
}

const checkClosest = (from, drones, objectLocation) => {
  const distance = calcDistance(from, objectLocation)
  var closest = true

  drones.forEach((drone) => {
    if (distance > calcDistance(drone.location, objectLocation) && this.mission === this.getMission(drone.id)) {
      closest = false
    }
  })

  return closest
}

var generateLocation = () => {
  const rng = seedrandom(new Date().getTime())
  return {
    x: Math.round(rng() * 100),
    y: Math.round(rng() * 100)
  }
}

module.exports = { calcDistance, checkClosest, generateLocation }
