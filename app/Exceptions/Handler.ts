/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { Exception } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(error: Exception, ctx: HttpContextContract) {
    if (['E_INVALID_AUTH_PASSWORD', 'E_INVALID_AUTH_UID'].includes(error.code || '')) {
      return ctx.response.status(error.status).send({
        code: 'INVALID_CREDENTIALS',
        message: 'invalid credentials',
        status: error.status,
      })
    }

    if (error.code === 'E_ROUTE_NOT_FOUND') {
      return ctx.response.status(error.status).send({
        code: 'ROUTE_NOT_FOUND',
        message: 'Route not found',
        status: error.status,
      })
    }

    if (error.code === 'E_UNAUTHORIZED_ACCESS') {
      return ctx.response.status(error.status).send({
        code: 'UNAUTHORIZED_ACCESS',
        message: 'Unauthorized Access',
        status: 401,
      })
    }

    if (error.code === 'E_VALIDATION_FAILURE') {
      return ctx.response.status(error.status).send({
        code: 'VALIDATION_FAILURE',
        message: 'Validation Failure',
        status: error.status,
        errors: error['messages']['errors'] ?? '',
      })
    }

    if (error.code === 'E_ROW_NOT_FOUND') {
      return ctx.response.status(error.status).send({
        code: 'RESOURCE_NOT_FOUND',
        message: 'Resource Not Found',
        status: error.status,
      })
    }

    if (error.code === 'E_AUTHORIZATION_FAILURE') {
      return ctx.response.status(error.status).send({
        code: 'ACCESS_DENIED',
        message: 'Access Denied',
        status: error.status,
      })
    }

    return super.handle(error, ctx)
  }
}
