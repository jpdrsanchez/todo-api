import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from 'App/Models/Task'
import CreateTaskValidator from 'App/Validators/CreateTaskValidator'
import DetroyAllValidator from 'App/Validators/DetroyAllValidator'
import UpdateTaskValidator from 'App/Validators/UpdateTaskValidator'

export default class TasksController {
  public async index(ctx: HttpContextContract) {
    const user = ctx.auth.user!
    const tasks = await user.related('tasks').query().select(['id', 'title', 'order', 'status'])

    return ctx.response.ok({ tasks })
  }

  public async store(ctx: HttpContextContract) {
    const { title } = await ctx.request.validate(CreateTaskValidator)
    const user = ctx.auth.user!
    const findTask = await user
      .related('tasks')
      .query()
      .where('status', 'TODO')
      .orderBy('order', 'desc')
      .first()
    let order: number

    if (!findTask) order = 0
    else order = findTask.order

    const task = await user.related('tasks').create({ title, order: order + 1, status: 'TODO' })

    return ctx.response.created({
      code: 'TASK_CREATED',
      message: 'task created successfully',
      task: {
        id: task.id,
        title: task.title,
        order: task.order,
        status: task.status,
      },
    })
  }

  public async update(ctx: HttpContextContract) {
    const userTasks = ctx.auth.user!.related('tasks')
    const inputs = await ctx.request.validate(UpdateTaskValidator)

    const task = await Task.findOrFail(Number(ctx.params.id))
    await ctx.bouncer.authorize('taskAccess', task)

    if (inputs.title) {
      task.title = inputs.title
      await task.save()
    } else if (inputs.order) {
      let currentOrder = task.order
      task.order = inputs.order
      await task.save()

      await userTasks
        .query()
        .whereNotIn('id', [task.id])
        .andWhere('status', task.status)
        .andWhere('order', '<', currentOrder)
        .increment('order', 1)
      await userTasks
        .query()
        .whereNotIn('id', [task.id])
        .andWhere('status', task.status)
        .andWhere('order', '<=', inputs.order)
        .decrement('order', 1)
    } else if (inputs.status) {
      let order: number = 1
      let currentStatus = task.status
      let currentOrder = task.order
      task.order = order
      task.status = inputs.status
      await task.save()
      await task.refresh()

      await userTasks
        .query()
        .whereNotIn('id', [task.id])
        .andWhere('status', task.status)
        .andWhere('order', '>=', order)
        .increment('order', 1)
      await userTasks
        .query()
        .where('order', '>=', currentOrder)
        .andWhere('status', currentStatus)
        .decrement('order', 1)
    }

    return ctx.response.noContent()
  }

  public async destroy(ctx: HttpContextContract) {
    const task = await Task.findOrFail(Number(ctx.params.id))
    await ctx.bouncer.authorize('taskAccess', task)
    const taskStatus = task.status
    const taskOrder = task.order
    await task.delete()

    await ctx.auth
      .user!.related('tasks')
      .query()
      .where('order', '>', taskOrder)
      .andWhere('status', taskStatus)
      .decrement('order', 1)

    return ctx.response.noContent()
  }

  public async destroyAll(ctx: HttpContextContract) {
    const inputs = await ctx.request.validate(DetroyAllValidator)
    await ctx.auth.user!.related('tasks').query().where('status', inputs.status).delete()

    return ctx.response.noContent()
  }
}
