import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Task from 'App/Models/Task'
import UserFactory from 'Database/factories/UserFactory'
import { generateTasks } from '../../mocks/index'

test.group('Tasks delete', (group) => {
  test('It should delete a task', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const task = await user.related('tasks').create({ title: 'Task One', order: 1 })

    const response = await client.delete(`/api/tasks/${task.id}`).loginAs(user)
    const findTask = await Task.find(task.id)

    response.assertStatus(204)
    assert.isNull(findTask)
  })

  test('It should return http status 404 when the task doesnt exist', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.delete(`/api/tasks/0`).loginAs(user)
    response.assertStatus(404)
    response.assertBody({
      code: 'RESOURCE_NOT_FOUND',
      message: 'Resource Not Found',
      status: response.status(),
    })
  })

  test('It should return http status 403 when an user tries to delete a task of another user', async ({
    client,
  }) => {
    const userOne = await UserFactory.create()
    const userTwo = await UserFactory.create()

    const [taskUserOne] = await userOne.related('tasks').createMany(generateTasks(1))
    const [taskUserTwo] = await userTwo.related('tasks').createMany(generateTasks(1))

    let response = await client
      .delete(`/api/tasks/${taskUserTwo.id}`)
      .json({ title: 'Task Edit' })
      .loginAs(userOne)

    response.assertStatus(403)
    response.assertBody({
      code: 'ACCESS_DENIED',
      message: 'Access Denied',
      status: response.status(),
    })

    response = await client
      .delete(`/api/tasks/${taskUserOne.id}`)
      .json({ title: 'Task Edit' })
      .loginAs(userTwo)

    response.assertStatus(403)
    response.assertBody({
      code: 'ACCESS_DENIED',
      message: 'Access Denied',
      status: response.status(),
    })
  })

  test('It should delete all the tasks of an user by status', async ({ client }) => {
    const user = await UserFactory.create()
    await user.related('tasks').createMany(generateTasks(10))

    const response = await client.delete('/api/tasks').json({ status: 'TODO' }).loginAs(user)

    response.assertStatus(204)
  })

  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })
})
