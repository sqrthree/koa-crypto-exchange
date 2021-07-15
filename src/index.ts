import crypto from 'crypto'
import Koa from 'koa'
import { v4 as uuidv4 } from 'uuid'

interface ExchangeMiddlewareOptions {
  publicKey: string
  privateKey: string
  exposePublicKeyPath: string
  exposeSecretPath: string
  setSecret: (key: string, secret: string) => Promise<void>
}

export function exchangeMiddleware(
  options: ExchangeMiddlewareOptions
): Koa.Middleware {
  return async function e(
    ctx: Koa.Context,
    next: Koa.Next
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const { method, path } = ctx
    const { body } = ctx.request

    if (method === 'OPTIONS') {
      return next()
    }

    const {
      publicKey,
      privateKey,
      exposePublicKeyPath,
      exposeSecretPath,
      setSecret,
    } = options

    if (path === exposePublicKeyPath) {
      ctx.body = publicKey

      // eslint-disable-next-line consistent-return
      return
    }

    if (path === exposeSecretPath && body) {
      const { secret } = body

      const plaintext = crypto
        .privateDecrypt(privateKey, Buffer.from(secret, 'base64'))
        .toString('utf8')
      const key = uuidv4()

      await setSecret(key, plaintext)

      ctx.body = { key }

      // eslint-disable-next-line consistent-return
      return
    }

    return next()
  }
}
