import { autotest } from "."

function add(x, y) {
  return x + y
}

autotest(add)(1, 2)(3)
