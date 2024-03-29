<div align=“center”>

# Secure log [![Release](https://github.com/onboardbase/secure-log/actions/workflows/main.yml/badge.svg)](https://github.com/onboardbase/secure-log/actions/workflows/main.yml)[![Lint](https://github.com/onboardbase/secure-log/actions/workflows/main.yml/badge.svg)](https://github.com/onboardbase/secure-log/actions/workflows/main.yml)

A better and more secure console logging experience. Detects and prevents leaking secrets and API tokens into your logs.

Check out other language support [Python](https://github.com/Onboardbase/secure-log-py)

</div>

# Contents

- [Secure log ](#secure-log-)
- [Contents](#contents)
  - [Install](#install)
  - [Usage](#usage)
    - [Supported console methods](#supported-console-methods)
- [Roadmap](#roadmap)
    - [Features](#features)

## Install

To use `log`,

```bash
yarn add @onboardbase/secure-log # npm i @onboardbase/secure-log
```

## Usage

Import the SecureLog library at the top level of your project. If you use any env/secret library (e.g. dotenv) in your project, you should import those before importing SecureLog.

```js
import SecureLog from '@onboardbase/secure-log';
new SecureLog(); // For JS projects, use new SecureLog.default()

console.log('random value'); // Onboardbase Signatures here: random value.
```

Then you can use your `console.log` as usual. This should include the `SecureLog` prefix and log your value.

The SecureLog Library also accepts an object.

```js
export default interface IOptions {
  disableOn?: 'development' | 'production'; // You can use this to specify if you want the SecureLog library to be disabled in a specific environment
  disableConsoleOn?: 'development' | 'production'; // You can use this to disable the console entirely in a specific environment
  warnOnly?: boolean; // If this is true, secure log will only print out a warning message rather than exit the program when it detects a secret leak. 
}
```

Example:

```js
new SecureLog({ disableConsoleOn: 'development', warnOnly: true }); // This will disable the SecureLog library on development environment.
console.log('sensitive secret here'); // This won't be executed.
```

If a secret is detected in a log message, SecureLog can either issue a warning or **exit** the process, depending on the `warnOnly` option. The default value for `warnOnly` is `false`, hence SecureLog will exit the process when it detects a secret leak.

The `disableConsoleOn` option passed to the `SecureLog` library will ensure that the `console.log` statement is not executed.

The `disableOn` && `disableConsoleOn` depend on your `process.env.NODE_ENV` to work perfectly. That is, it compares the environment passed from the `disableOn` || `disableConsoleOn` option with the environment in your `process.env.NODE_ENV` to know when to disable the SecureLog library or the `console` statements itself.

The SecureLog library scans the `arguments` passed to the `console.log` function to check if any of the `...args` inside your `console.log` function is a potential secret. It does this by comparing the `arguments` passed to `console.log` with the values of your current environment: `process.env`. It throws an error if any potential secret is found.

Example:

```js
console.log('secret', process.env.AWS_ACCESS_KEY_ID); // Onboardbase Signatures here: ************ is a valid secret for the key: AWS_ACCESS_KEY_ID
```

This will throw a warning if an actual `AWS_ACCESS_KEY_ID` is found in the `process.env` to notify the user that they are logging a potential secret.

Example: `React App`

```html
<head>
  <script defer src="https://cdn.jsdelivr.net/npm/@onboardbase/secure-log/dist/index.min.js">
    new SecureLog.default()
  </script>
</head>
```

Example: `NodeJs`

```js index.js
const express = require('express')
const app = express()
const SecureLog = require('@onboardbase/secure-log')

const port = 3000
new SecureLog()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
```

### Supported console methods

The SecureLog library currently only supports these console methods:

- `console.log`, `console.clear`, `console.warn`, `console.profileEnd`, `console.debug`, `console.info`, `console.error`, `console.table`

# Roadmap

### Features

- [ ] AI will scan values passed to `console.log` and report potentially sensitive logs.
