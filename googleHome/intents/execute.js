const deviceCollection = require('../../iot/collection')

/**
 * Intent handler
 *
 * @param {Object} intent
 * @returns {Object}
 */
module.exports = async (intent) => {
  const commandsToExecute = []
  intent.commands.forEach(command => {
    command.devices.forEach(device => {
      commandsToExecute.push({
        deviceId: device.id,
        command: command.execution.command,
        payload: command.execution.params
      })
    })
  })

  return {
    commands: await Promise.all(
      commandsToExecute.map(command => executeCommandOnDevice(command))
    )
  }
}

/**
 * Execute commands
 *
 * @param {Object} command
 */
async function executeCommandOnDevice ({ deviceId, command, payload }) {
  const device = await deviceCollection.loadSingleDevice('google', deviceId)
  if (device === null) {
    return null
  }
  const handled = await device.execute(command, payload)
  if (handled === false) {
    return {
      ids: [deviceId],
      status: 'ERROR',
      errorCode: 'executionFailed'
    }
  }
  const state = await device.getState()
  return {
    ids: [deviceId],
    status: 'SUCCESS',
    states: state
  }
}
