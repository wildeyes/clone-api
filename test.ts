import { start } from './lib'
import * as path from 'path'

test('Server runs', async () => {
  const server = await start(path.resolve(__dirname, 'test.yaml'), 1337)
  server.close(err => {
    expect(err).toBe(undefined)
  })
})
