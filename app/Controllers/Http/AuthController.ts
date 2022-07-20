import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {
  public async login(ctx: HttpContextContract) {
    const body = ctx.request.only(['username', 'password'])

    const token = await ctx.auth.use('api').attempt(body.username, body.password, {
      expiresIn: '1hour',
    })
    return ctx.response.ok({ user: ctx.auth.user, token: token.token })
  }

  public async logout(ctx: HttpContextContract) {
    await ctx.auth.use('api').revoke()
    return ctx.response.noContent()
  }

  public async me(ctx: HttpContextContract) {
    const user = ctx.auth.user!

    return ctx.response.ok({
      username: user.username,
      email: user.email,
    })
  }
}
