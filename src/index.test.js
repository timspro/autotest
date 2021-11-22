import { autotest } from "./index.js"

function add(x, y) {
  return x + y
}

autotest(add)(1, 2)(3)

function error() {
  throw new Error("test")
}

autotest(error, { error: true })()(expect.objectContaining({ message: "test" }))
