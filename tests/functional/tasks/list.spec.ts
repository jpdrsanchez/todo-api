import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import UserFactory from 'Database/factories/UserFactory'
import { generateTasks } from '../../mocks'

test.group('Listing tasks tests', (group) => {
  test('it should list the current user tasks', async ({ client, assert }) => {
    const user = await UserFactory.create()
    await user.related('tasks').createMany(generateTasks(3))

    const response = await client.get('/api/tasks').loginAs(user)
    await user.load('tasks')

    response.assertStatus(200)
    response.assertBodyContains({
      tasks: [
        {
          id: user.tasks[0].id,
          title: user.tasks[0].title,
          order: user.tasks[0].order,
          status: user.tasks[0].status,
        },
      ],
    })
    assert.equal(user.tasks.length, 3)
  })

  test('it should return http status 401 when user isnt logged in', async ({ client }) => {
    const response = await client.get('/api/tasks')

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
