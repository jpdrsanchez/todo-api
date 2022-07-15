import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Task from 'App/Models/Task'
import UserFactory from 'Database/factories/UserFactory'
import { generateTasks } from '../../mocks'

test.group('Tasks update', (group) => {
  test('It should update the task title', async ({ client, assert }) => {
    await Task.query().delete()
    const user = await UserFactory.create()
    const [task] = await user.related('tasks').createMany(generateTasks(1))

    const response = await client
      .put(`/api/tasks/${task.id}`)
      .json({ title: 'Edited Task' })
      .loginAs(user)

    await task.refresh()

    response.assertStatus(204)
    assert.equal(task.title, 'Edited Task')
  })

  test('It should update the task order, and reorder all tasks', async ({ client, assert }) => {
    await Task.query().delete()
    const user = await UserFactory.create()
    const [, , task] = await user.related('tasks').createMany(generateTasks(10))
    let response = await client.put(`/api/tasks/${task.id}`).json({ order: 10 }).loginAs(user)
    await task.refresh()
    response.assertStatus(204)

    let tasks = await user.related('tasks').query().orderBy('order', 'asc')
    assert.equal(tasks[9].order, task.order)
    assert.equal(tasks.filter((task) => task.order === 10).length, 1)

    response = await client.put(`/api/tasks/${task.id}`).json({ order: 4 }).loginAs(user)
    await task.refresh()
    response.assertStatus(204)

    tasks = await user.related('tasks').query().orderBy('order', 'asc')
    assert.equal(tasks[3].order, task.order)
    assert.equal(tasks.filter((task) => task.order === 4).length, 1)

    response = await client.put(`/api/tasks/${task.id}`).json({ order: 5 }).loginAs(user)
    await task.refresh()
    response.assertStatus(204)

    tasks = await user.related('tasks').query().orderBy('order', 'asc')
    assert.equal(tasks[4].order, task.order)
    assert.equal(tasks.filter((task) => task.order === 5).length, 1)

    const [, , , , , newTask] = await user.related('tasks').query()

    response = await client.put(`/api/tasks/${newTask.id}`).json({ order: 8 }).loginAs(user)
    await newTask.refresh()
    response.assertStatus(204)

    tasks = await user.related('tasks').query().orderBy('order', 'asc')
    assert.equal(tasks[7].order, newTask.order)
    assert.equal(tasks.filter((task) => task.order === 8).length, 1)
  })

  test('It should return a validation error when title or order are outside the validation rules', async ({
    client,
  }) => {
    const user = await UserFactory.create()
    const [task] = await user.related('tasks').createMany(generateTasks(1))

    let response = await client.put(`/api/tasks/${task.id}`).json({ title: 'E' }).loginAs(user)
    response.assertStatus(422)

    response = await client.put(`/api/tasks/${task.id}`).json({ order: -1 }).loginAs(user)
    response.assertStatus(422)
  })

  test('It should return http status 404 when the task doesnt exist', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.put(`/api/tasks/1`).json({ title: 'Task Edit' }).loginAs(user)

    response.assertStatus(404)
    response.assertBody({
      code: 'RESOURCE_NOT_FOUND',
      message: 'Resource Not Found',
      status: response.status(),
    })
  })

  test('It should return http status 403 when an user tries to update a task of another user', async ({
    client,
  }) => {
    const userOne = await UserFactory.create()
    const userTwo = await UserFactory.create()

    const [taskUserOne] = await userOne.related('tasks').createMany(generateTasks(1))
    const [taskUserTwo] = await userTwo.related('tasks').createMany(generateTasks(1))

    let response = await client
      .put(`/api/tasks/${taskUserTwo.id}`)
      .json({ title: 'Task Edit' })
      .loginAs(userOne)

    response.assertStatus(403)
    response.assertBody({
      code: 'ACCESS_DENIED',
      message: 'Access Denied',
      status: response.status(),
    })

    response = await client
      .put(`/api/tasks/${taskUserOne.id}`)
      .json({ title: 'Task Edit' })
      .loginAs(userTwo)

    response.assertStatus(403)
    response.assertBody({
      code: 'ACCESS_DENIED',
      message: 'Access Denied',
      status: response.status(),
    })
  })
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })
})
