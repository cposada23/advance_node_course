'use strict'

const debug = require('debug')('platziverse:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const db = require('./')

const prompt = inquirer.createPromptModule()

async function setup () {
  const answer = await prompt(
    {
      type: 'confirm',
      name: 'setup',
      message: 'Esto va a destruir la base de datos. Está seguro?'
    }
  )

  if (!answer.setup) {
    return debug('Nada paso, todo esta bien')
  }

  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
  }

  await db(config).catch(handleFatalError)

  debug('Sucess')
  process.exit(0)
}

function handleFatalError (err) {
  debug(`${chalk.red('[Fatal error]')} ${err.message}`)
  debug(err.stack)
  process.exit(1)
}

setup()
