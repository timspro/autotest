import { autotest } from "./index.js"

let x = 0
afterEach(() => {
  expect(x).toEqual(3)
})

function setupTeardown() {
  expect(x).toEqual(1)
  x = 2
  return x
}
autotest(setupTeardown, {
  setup: () => {
    expect(x).toEqual(0)
    x = 1
  },
  teardown: () => {
    expect(x).toEqual(2)
    x = 3
  },
})()(2)
