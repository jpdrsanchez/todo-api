import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import UserFactory from 'Database/factories/UserFactory'

test.group('User Authentication', (group) => {
  test('It should login an user e-mail or username', async ({ client, assert }) => {
    const user = await UserFactory.merge({ password: '123456' }).create()
    let response = await client.post('/api/auth/login').json({
      username: user.username,
      password: '123456',
    })
    let body = response.body()

    response.assertStatus(200)
    response.assertBodyContains({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
    assert.isDefined(body.token, 'Token is not defined')

    response = await client.post('/api/auth/login').json({
      username: user.email,
      password: '123456',
    })
    body = response.body()

    response.assertStatus(200)
    response.assertBodyContains({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
    assert.isDefined(body.token, 'Token is not defined')
  })

  test('It should fire the same error message with https status 400 when one of the credentials is incorrect', async ({
    client,
  }) => {
    const user = await UserFactory.merge({ password: '123456' }).create()
    let response = await client.post('/api/auth/login').json({
      username: user.username,
      password: 'incorrect',
    })

    response.assertStatus(400)
    response.assertBody({
      code: 'INVALID_CREDENTIALS',
      message: 'invalid credentials',
      status: 400,
    })

    response = await client.post('/api/auth/login').json({
      username: 'incorrect',
      password: '123456',
    })

    response.assertStatus(400)
    response.assertBody({
      code: 'INVALID_CREDENTIALS',
      message: 'invalid credentials',
      status: 400,
    })
  })

  test('It should logout an user', async ({ client }) => {
    const user = await UserFactory.merge({ password: '123456' }).create()
    const response = await client.post('/api/auth/logout').loginAs(user)

    response.assertStatus(204)
  })

  test('It should return http status 401 when user isnt logged in or token is expired', async ({
    client,
  }) => {
    const response = await client.post('/api/auth/logout')

    response.assertStatus(401)
    response.assertBody({
      code: 'UNAUTHORIZED_ACCESS',
      message: 'Unauthorized Access',
      status: 401,
    })
  })

  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })
})
