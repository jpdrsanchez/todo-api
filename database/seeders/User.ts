import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run() {
    await User.create({
      username: 'jotape',
      email: 'contato@jotape.tech',
      password: '123456',
    })

    try {
      const user = await User.findOrFail(1)
      await user.related('tasks').createMany([
        {
          status: 'DONE',
          title: 'Send a gift to the client',
          order: 1,
        },
        {
          status: 'DONE',
          title: 'Create a Google Drive folder',
          order: 2,
        },
        {
          status: 'DONE',
          title: 'E-mail John about the deadline',
          order: 3,
        },
        {
          status: 'DONE',
          title: 'Home Page Design ',
          order: 4,
        },
        {
          status: 'DONE',
          title: 'Get FTP credentials',
          order: 5,
        },
        {
          status: 'TODO',
          title: 'This item label may be edited',
          order: 6,
        },
        {
          status: 'TODO',
          title: 'Checked item goes to Done list',
          order: 7,
        },
        {
          status: 'TODO',
          title: 'Erase all',
          order: 8,
        },
        {
          status: 'TODO',
          title: 'Delete itens',
          order: 9,
        },
        {
          status: 'TODO',
          title: 'Add new tasks',
          order: 10,
        },
        {
          status: 'TODO',
          title: 'Create the drag-and-drop function',
          order: 11,
        },
        {
          status: 'TODO',
          title: 'Develop the To-do list page',
          order: 12,
        },
      ])
    } catch (err) {
      console.log(err)
    }
  }
}
