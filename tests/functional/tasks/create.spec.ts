import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Task from 'App/Models/Task'
import UserFactory from 'Database/factories/UserFactory'

test.group('Creating tasks tests', (group) => {
  test('It should create a task', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const response = await client.post('/api/tasks').json({ title: 'Test Task' }).loginAs(user)

    const task = await user.related('tasks').query().first()

    assert.isNotNull(task)
    response.assertStatus(201)
    response.assertBody({
      code: 'TASK_CREATED',
      message: 'task created successfully',
      task: {
        id: task?.id,
        title: task?.title,
        order: task?.order,
        status: 'TODO',
      },
    })
  })

  test('It should increment tasks order field', async ({ client }) => {
    const user = await UserFactory.create()
    const userTwo = await UserFactory.create()
    await Task.query().delete()
    await client.post('/api/tasks').json({ title: 'Task 1' }).loginAs(user)
    await client.post('/api/tasks').json({ title: 'Task 2' }).loginAs(user)
    await client.post('/api/tasks').json({ title: 'Task 3' }).loginAs(user)
    await client.post('/api/tasks').json({ title: 'Task 1' }).loginAs(userTwo)
    await client.post('/api/tasks').json({ title: 'Task 2' }).loginAs(userTwo)
    await client.post('/api/tasks').json({ title: 'Task 3' }).loginAs(userTwo)

    let response = await client.get('/api/tasks').loginAs(user)
    response.assertBodyContains({
      tasks: [
        {
          order: 1,
        },
        {
          order: 2,
        },
        {
          order: 3,
        },
      ],
    })

    response = await client.get('/api/tasks').loginAs(userTwo)
    response.assertBodyContains({
      tasks: [
        {
          order: 1,
        },
        {
          order: 2,
        },
        {
          order: 3,
        },
      ],
    })
  })

  test('It should return a validantion error when title isnt provided', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.post('/api/tasks').json({ title: '' }).loginAs(user)

    response.assertStatus(422)
    response.assertBody({
      code: 'VALIDATION_FAILURE',
      message: 'Validation Failure',
      status: response.status(),
      errors: [
        {
          rule: 'required',
          field: 'title',
          message: 'The title field is required to create a new task',
        },
      ],
    })
  })

  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })
})
