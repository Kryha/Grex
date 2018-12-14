const seedrandom = require('seedrandom')
const { GRID_SIZE, LANE_SIZE } = require('../../constants')

const checkBounds = (from, to, moveSpeed) => {
  const rng = seedrandom(new Date().getTime().toString())
  if (rng() > 0.5) {
    const diff = Math.abs(to.x - from.x)
    const move = diff > moveSpeed ? moveSpeed : diff
    if (to.x > from.x) {
      to.x = from.x + move
      to.y = from.y
    } else {
      to.x = from.x - move
      to.y = from.y
    }
  } else {
    const diff = Math.abs(to.y - from.y)
    const move = diff > moveSpeed ? moveSpeed : diff
    if (to.y > from.y) {
      to.y = from.y + move
      to.x = from.x
    } else {
      to.y = from.y - move
      to.x = from.x
    }
  }
  return to
}

function randomMove (from, moveSpeed) {
  try {
    let to
    // generate move
    const rng = seedrandom(new Date().getTime())

    if (rng() > 0.5) {
      if (from.x + moveSpeed > GRID_SIZE.x) to = { x: from.x - moveSpeed, y: from.y }
      if (from.x - moveSpeed < 0) to = { x: from.x + moveSpeed, y: from.y }
      if (rng() > 0.5) {
        to = { x: from.x + moveSpeed, y: from.y }
      } else {
        to = { x: from.x - moveSpeed, y: from.y }
      }
    } else {
      if (from.y + moveSpeed > GRID_SIZE.y) to = { x: from.x, y: from.y - moveSpeed }
      if (from.y - moveSpeed < 0) to = { x: from.x, y: from.y + moveSpeed }

      if (rng() > 0.5) {
        to = { x: from.x, y: from.y + moveSpeed }
      } else {
        to = { x: from.x, y: from.y - moveSpeed }
      }
    }

    return checkBounds(from, to, moveSpeed)
  } catch (error) {
    console.log('@startDrone/randomMove', error)
    throw new Error(error.message)
  }
}

const thirdMove = (from, limit, lane, moveSpeed) => {
  const rng = seedrandom(new Date().getTime())
  let to = rng() > 0.5 ? from + moveSpeed / 3 : from - moveSpeed / 3
  if (to > limit) {
    to = from - moveSpeed / 3
  } else if (to < limit - lane) {
    to = from + moveSpeed / 3
  } else if (to > lane) {
    to = from - moveSpeed / 3
  } else if (to < 0) {
    to = from + moveSpeed / 3
  }
  return to
}

function hexaMove (from, moveSpeed) {
  try {
    let to

    if (from.x > GRID_SIZE.x - LANE_SIZE && from.y > GRID_SIZE.y - LANE_SIZE) {
      // upper right
      to = { x: thirdMove(from.x, GRID_SIZE.x, LANE_SIZE, moveSpeed), y: from.y - moveSpeed }
    } else if (from.x > GRID_SIZE.x - LANE_SIZE && from.y > LANE_SIZE) {
      // middle right
      to = { x: thirdMove(from.x, GRID_SIZE.x, LANE_SIZE, moveSpeed), y: from.y - moveSpeed }
    } else if (from.x > GRID_SIZE.x - LANE_SIZE && from.y >= 0) {
      // bottom right
      to = { x: from.x - moveSpeed, y: thirdMove(from.y, GRID_SIZE.y, LANE_SIZE, moveSpeed) }
    } else if (from.x > LANE_SIZE && from.y > GRID_SIZE.y - LANE_SIZE) {
      // upper middle
      to = { x: from.x + moveSpeed, y: thirdMove(from.y, GRID_SIZE.y, LANE_SIZE, moveSpeed) }
    } else if (from.x > LANE_SIZE && from.y > LANE_SIZE) {
      // middle middle
      to = { x: from.x + moveSpeed, y: from.y + moveSpeed }
    } else if (from.x > LANE_SIZE && from.y >= 0) {
      // bottom middle
      to = { x: from.x - moveSpeed, y: thirdMove(from.y, GRID_SIZE.y, LANE_SIZE, moveSpeed) }
    } else if (from.x >= 0 && from.y > GRID_SIZE.y - LANE_SIZE) {
      // upper left
      to = { x: from.x + moveSpeed, y: thirdMove(from.y, GRID_SIZE.y, LANE_SIZE, moveSpeed) }
    } else if (from.x >= 0 && from.y > LANE_SIZE) {
      // middle left
      to = { x: thirdMove(from.x, GRID_SIZE.x, LANE_SIZE, moveSpeed), y: from.y + moveSpeed }
    } else if (from.x >= 0 && from.y >= 0) {
      // bottom left
      to = { x: thirdMove(from.x, GRID_SIZE.x, LANE_SIZE, moveSpeed), y: from.y + moveSpeed }
    }
    return to
  } catch (error) {
    console.log('@startDrone/randomMove', error)
    throw new Error(error.message)
  }
}
module.exports = { randomMove, hexaMove }
