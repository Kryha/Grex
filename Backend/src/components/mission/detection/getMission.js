async function getMission (droneId) {
  const mission = droneId.split('_')

  if (mission.length === 1) {
    console.log('No mission specified')
    return 'No mission specified'
  } else {
    return mission[0]
  }
}

module.exports = { getMission }
