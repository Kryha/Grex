async function checkDetected (drones) {
  var objectLocation = false
  drones = drones.filter(drone => {
    return drone.data.id !== 'OBJECTIVE'
  })
  drones.forEach((drone) => {
    if (drone.data.object_detected === true && drone.data.action === 'FOUND') {
      objectLocation = drone.data.location
    }
  })

  return objectLocation
}

module.exports = checkDetected
