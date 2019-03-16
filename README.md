# flow-webpack-next-plugin

> Webpack Flow plugin based on [flow-webpack-plugin](https://github.com/happylynx/flow-webpack-plugin)

## Installation

`yarn add --dev flow-webpack-next-plugin flow-bin`

## Usage

```js
const FlowWebpackPlugin = require('flow-webpack-next-plugin');

module.exports = {
  ...
  plugins: [
    ...
    new FlowWebpackPlugin({
      failOnError: false,
      ...
    }),
    ...
  }
]

```

## Configuration

| option | type | default value | description |
| --- | --- | --- | --- |
| `failOnError` | `boolean` | `false` | Webpack exits with non-zero error code if flow typechecking fails. |
| `failOnErrorWatch` | `boolean` | `false` | Webpack in watch mode exits with non-zero error code if flow typechecking fails. |
| `reportingSeverity` | <code>'warning' &#124; 'error'</code> | `'error'` | Webpack severity level of reported flow type problems. When using webpack-dev-server, page reload is blocked in case of webpack error. `warning` can be used to enable page reloads in case of flow errors when using webpack-dev-server. |
| `printFlowOutput` | `boolean` | `true` | `true` ~ Output of `flow` is printed at the end of webpack compilation in case of error, `false` ~ output of `flow` is discarded. |
| `flowPath` | `string` | `require('flow-bin')` if `flow-bin` package is installed. Otherwise the parameter is required. | Path to flow executable. It may be both absolute, relative to the 'cwd' of webpack process or just name of an executable on the PATH.
| `flowArgs` | `Array<string>` | `['--color=always']` if standard output is directed to a terminal, otherwise `[]` | Flow command line arguments. See [flow cli documentation][1]. |
| `verbose` | `boolean` | `false` | It enables plugin logging for debug purposes. |
| `callback` | `({exitCode: number, stdout: string, stderr: string}) => ?Promise<any>` | `(result) => {}` | Custom user function that is called when Flow check finishes and is passed Flow type check result. If function returns a promise, it is called asynchronously. |