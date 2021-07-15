const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const request = require('supertest')
const test = require('ava')

const { exchangeMiddleware } = require('../dist/index')

const publicKey = fs.readFileSync(
  path.resolve(__dirname, '../keys/testing_public_key.pem'),
  'utf8'
)
const privateKey = fs.readFileSync(
  path.resolve(__dirname, '../keys/testing_private_key.pem'),
  'utf8'
)

let localKey = ''
let localSecret = ''

const exposePublicKeyPath = '/public-key'
const exposeSecretPath = '/secret'

const setSecret = (key, secret) => {
  localKey = key
  localSecret = secret
}

const app = new Koa()

app.use(bodyParser())
app.use(
  exchangeMiddleware({
    publicKey,
    privateKey,
    exposePublicKeyPath,
    exposeSecretPath,
    setSecret,
  })
)

app.use((ctx) => {
  ctx.body = 'success'
})

test('should skip options request', async (t) => {
  const response = await request(app.listen()).options('/').expect(200)

  t.is(response.text, 'success')
})

test('should respond public key', async (t) => {
  const response = await request(app.listen())
    .get(exposePublicKeyPath)
    .expect(200)

  t.is(response.text, publicKey)
})

test('should setup secret', async (t) => {
  const cipherText = crypto
    .publicEncrypt(publicKey, 'secret')
    .toString('base64')

  const response = await request(app.listen())
    .post(exposeSecretPath)
    .send({
      secret: cipherText,
    })
    .expect(200)

  t.is(response.body.key, localKey)
  t.is(localSecret, 'secret')
})

test('should skip the middleware', async (t) => {
  const response = await request(app.listen()).post('/ping').expect(200)

  t.is(response.text, 'success')
})
