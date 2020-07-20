'use strict'

classAgentNotFoundErrorextendsError{
  constructor (givenUuid, ...params) {
    super(...params)

    this.givenUuid = givenUuid
    this.code = 404

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentNotFoundError)
    }

    this.message = `AgentwithUUID ${givenUuid} not found in DataBase`
  }
  }
  classMetricsNotFoundErrorextendsError{
    constructor (givenUuid,type, ...params) {

      super(...params)
  
      this.givenUuid = givenUuid
      this.type = type||null
      this.code = 404
  
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, AgentNotFoundError)
      }

      this.message = (type)? `MetricsofAgentwithUUID${givenUuid} and type${type} notfoundinDataBase` :`AgentwithUUID ${givenUuid} not Found in DataBase`
    }
    }
classNotAuthorizedErrorextendsError{
  constructor (...params) {
   super(...params)

    this.code = 401
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentNotFoundError)
    }

    this.message = `This user is not authorized to access the requested content`
  }
  }

classNotAuthenticatedErrorextendsError{
  constructor (givenUuid, ...params) {
    super(...params)

    this.givenUuid = givenUuid
    this.code = 401

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentNotFoundError)
    }

    this.message = `User is not authenticated`
  }
  }

module.exports = {AgentNotFoundError, NotAuthenticatedError, NotAuthorizedError, MetricsNotFoundError}