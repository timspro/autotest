import { autotest } from "./index.js"

let x
afterEach(() => {
  expect(x).toEqual(3)
})

function setupTeardown() {
  expect(x).toEqual(1)
  x = 2
  return x
}
const setup = () => {
  x = 1
}
const teardown = () => {
  expect(x).toBeLessThan(3)
  x = 3
}
autotest(setupTeardown, { setup, teardown })()(2)

const errorOutput = expect.objectContaining({ message: "my error" })
function setupTeardownError() {
  throw new Error("my error")
}
autotest(setupTeardownError, { setup, teardown, error: true })()(errorOutput)
