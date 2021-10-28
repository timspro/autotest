# autotest

```
npm install @tim-code/autotest
```

## Philosophy

```js
autotest(testFunction, options)(input1, input2, ...)(expected)
```

Note `expected` can be a (async) callback. If so, autotest will not attempt to compare the test output with anything and instead will pass it in to the callback.

## Options

`name`: Name the test. Otherwise, try to make one from the test function's name and passed in input.

`error`: Specify that an error is expected.

`only`: Use `test.only` to make only one test run, which is useful for debugging.

`setup`: (async) callback that is invoked with no arguments before the test is run; its return value has no effect

`before`: a (async) callback that is invoked with the input before the test is run (but after setup); its return value must be an array and will be passed to the test function via the spread operator

`after`: a (async) callback that is invoked with the test function output; its return value will be used for `expected`

## TODO

`index.js` could be split into two files.

However, doing so probably means that I couldn't use the `.cjs` file extension.

This is because the files would reference each other in the source code and would use the extension `.js`. I have not been able
to figure out a working solution using babel to rewrite the file extensions in `require` statementsto `.cjs`. Note that trying to transpile from `.mjs` to `.js`
runs into basically the same issue.

Additionally, it does not seem to be technically allowed to omit the file extensions although permitted by some tooling. (https://stackoverflow.com/questions/63459159/omit-the-file-extension-es6-module-nodejs)

The problem with using the `.js` file extension for CommonJS code is that since `package.json` specifies `"type": "module"`, Node
will think that the code cannot use `require` statements when run. This results in an error when the CommonJS code is run, such as
when it used by another module.

The official recommendation (https://nodejs.org/api/packages.html#conditional-exports) is to use
`"exports": {"import": ..., "require": ...},` to specify CommonJS and ES module code. In addition, it is suggested to use `"main": ` to specify CommonJS
code while still using `"type": "module"`. This additional recommendation seems problematic because these two directives are essentially conflicting (unless `"main"`
specifies a file with a `.cjs` extension).

This problem is compounded by Jest which does not currently support including code conditionally via `"exports"` (https://github.com/facebook/jest/issues/9771).
As a result, it will include the CommonJS code specified by `"main"` but then Node will error because it thinks the code is a module due to `"type": "module"`.
It appears that a Jest will support `"export"` by the end of the year 2021. It seems simplest to circle back to this when support is added.
