import IOptions from './interfaces/options.interface';

const isBrowser = () => {
  try {
    return window && window?.navigator && !global.process;
  } catch (error) {
    return false;
  }
};

const getGlobalConsoleObject = () => {
  return isBrowser() ? window.console : global.console;
};

const getGlobalObject = () => {
  return isBrowser() ? window : global;
};

const LOG_PREFIX = 'Onboardbase Signatures here:';

const checkForStringOccurences = (data: {
  value: string;
  cachedConsole: Console;
  options?: IOptions;
}) => {
  const { value, cachedConsole, options } = data;
  if (value) {
    Object.keys(process.env).map(secretKey => {
      const secretValue = (process.env || {})[secretKey];
      const hasMatch = value.includes(secretValue);

      if (hasMatch) {
        cachedConsole.warn(
          `the value of the secret: "${secretKey}", is being leaked!`
        );

        if (!options?.warnOnly) {
          throw new Error('potential secret leak');
        }
      }
    });
    /**
     * @todo
     * reimplement string interpolation
     */
    // else if (secretValues.some(secret => value.includes(secret))) {
    //   cachedConsole.error(`${value} contains some secret value`);
    // }
  }
};

const isString = (value: any) => typeof value === 'string';
const isObject = (value: any) => Object.keys(value).length;
const isArray = (value: any) => Array.isArray(value);

const checkForPotentialSecrets = (data: {
  args: any[];
  cachedConsole: Console;
  options?: IOptions;
}) => {
  const { args, cachedConsole, options } = data;
  try {
    args.map((argument: any) => {
      if (isString(argument)) {
        return checkForStringOccurences({
          value: argument,
          cachedConsole,
          options,
        });
      }

      if (isObject(argument)) {
        const objectValue = Object.values(argument);
        return checkForPotentialSecrets({ args: objectValue, cachedConsole });
      }

      if (isArray(argument)) {
        argument.map((arrayValue: any) => {
          if (isString(arrayValue)) {
            return checkForPotentialSecrets({
              args: arrayValue,
              cachedConsole,
            });
          }

          if (isObject(arrayValue)) {
            return checkForPotentialSecrets({
              args: Object.values(arrayValue),
              cachedConsole,
            });
          }

          if (isArray(arrayValue)) {
            return checkForPotentialSecrets({
              args: arrayValue,
              cachedConsole,
            });
          }
        });
      }
    });
  } catch (error) {
    cachedConsole.error(error, { skipValidationCheck: true });
  }
};

/**
 * Represents a secure logging utility that wraps the console object.
 * It provides additional functionality for logging and ensures that sensitive information is not accidentally logged.
 */
class SecureLog {
  cachedLog: Console;
  options: IOptions;

  constructor(options?: IOptions) {
    this.options = options;
    if (
      options &&
      options?.disableOn &&
      process.env.NODE_ENV === options?.disableOn
    )
      return;

    const globalObject: any = getGlobalObject();
    if (globalObject.obbinitialized) {
      return globalObject.console as SecureLog;
    }
    this.cachedLog = getGlobalConsoleObject();
    globalObject.console = this;
    globalObject.obbinitialized = true;
  }

  /**
   * Logs the provided arguments to the console, while checking for potential secrets.
   * If the `disableConsoleOn` option is set and the current environment matches the value,
   * the console logging will be disabled.
   *
   * @param args - The arguments to be logged.
   */
  log(...args: any) {
    const disableConsole =
      this.options &&
      this.options.disableConsoleOn &&
      process.env.NODE_ENV === this.options?.disableConsoleOn;
    if (disableConsole) return;
    else {
      if (!isBrowser()) {
      }
      checkForPotentialSecrets({
        args,
        cachedConsole: this.cachedLog,
        options: this.options,
      });
      this.cachedLog.log.apply(console, [LOG_PREFIX, ...args]);
    }
  }

  clear() {
    // do whatever here with the passed parameters
    this.cachedLog.clear.apply(null);
  }

  assert(...args: any) {
    // do whatever here with the passed parameters
    this.cachedLog.assert.apply(null, args);
  }

  count(label?: string): void;
  count(label?: string): void;
  count(label?: unknown): void {
    throw new Error('Method not implemented.');
  }
  countReset(label?: string): void;
  countReset(label?: string): void;
  countReset(label?: unknown): void {
    throw new Error('Method not implemented.');
  }
  debug(...data: any[]): void;
  debug(message?: any, ...optionalParams: any[]): void;
  debug(...args: any): void {
    const disableConsole =
      this.options &&
      this.options.disableConsoleOn &&
      process.env.NODE_ENV === this.options?.disableConsoleOn;

    if (disableConsole) return;
    else {
      checkForPotentialSecrets({ args, cachedConsole: this.cachedLog });
      this.cachedLog.debug.apply(console, [LOG_PREFIX, ...args]);
    }
  }
  dir(item?: any, options?: any): void;
  dir(obj: any): void;
  dir(obj?: unknown, options?: unknown): void {
    throw new Error('Method not implemented.');
  }
  dirxml(...data: any[]): void;
  dirxml(...data: any[]): void;
  dirxml(...data: unknown[]): void {
    throw new Error('Method not implemented.');
  }
  error(...data: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
  error(...args: any): void {
    const modArgs = args || [];
    const disableConsole =
      this.options &&
      this.options.disableConsoleOn &&
      process.env.NODE_ENV === this.options?.disableConsoleOn;

    if (disableConsole) return;
    else {
      if (!modArgs[1]?.skipValidationCheck) {
        checkForPotentialSecrets({
          args: modArgs,
          cachedConsole: this.cachedLog,
        });
      }

      const logValue = modArgs?.[1]?.skipValidationCheck
        ? [LOG_PREFIX, modArgs?.[0]]
        : [LOG_PREFIX, ...modArgs];

      this.cachedLog.error.apply(console, logValue);
    }
  }
  group(...data: any[]): void;
  group(...label: any[]): void;
  group(...label: unknown[]): void {
    throw new Error('Method not implemented.');
  }
  groupCollapsed(...data: any[]): void;
  groupCollapsed(...label: any[]): void;
  groupCollapsed(...label: unknown[]): void {
    throw new Error('Method not implemented.');
  }
  groupEnd(): void;
  groupEnd(): void;
  groupEnd(): void {
    throw new Error('Method not implemented.');
  }
  info(...data: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  info(...args: any): void {
    const disableConsole =
      this.options &&
      this.options.disableConsoleOn &&
      process.env.NODE_ENV === this.options?.disableConsoleOn;

    if (disableConsole) return;
    else {
      checkForPotentialSecrets({ args, cachedConsole: this.cachedLog });
      this.cachedLog.info.apply(console, [LOG_PREFIX, ...args]);
    }
  }
  table(tabularData?: any, properties?: string[]): void;
  table(tabularData: any, properties?: readonly string[]): void;
  table(...args: any): void {
    throw new Error('Method not implemented.');
  }
  time(label?: string): void;
  time(label?: string): void;
  time(label?: unknown): void {
    throw new Error('Method not implemented.');
  }
  timeEnd(label?: string): void;
  timeEnd(label?: string): void;
  timeEnd(label?: unknown): void {
    throw new Error('Method not implemented.');
  }
  timeLog(label?: string, ...data: any[]): void;
  timeLog(label?: string, ...data: any[]): void;
  timeLog(label?: unknown, ...data: unknown[]): void {
    throw new Error('Method not implemented.');
  }
  timeStamp(label?: string): void;
  timeStamp(label?: string): void;
  timeStamp(label?: unknown): void {
    throw new Error('Method not implemented.');
  }
  trace(...data: any[]): void;
  trace(message?: any, ...optionalParams: any[]): void;
  trace(message?: unknown, ...optionalParams: unknown[]): void {
    throw new Error('Method not implemented.');
  }
  warn(...data: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  warn(...args: any): void {
    const disableConsole =
      this.options &&
      this.options.disableConsoleOn &&
      process.env.NODE_ENV === this.options?.disableConsoleOn;

    if (disableConsole) return;
    else {
      if (!isBrowser()) {
      }
      checkForPotentialSecrets({ args, cachedConsole: this.cachedLog });
      this.cachedLog.warn.apply(console, [LOG_PREFIX, ...args]);
    }
  }
  Console: console.ConsoleConstructor;
  profile(label?: string): void {
    return this.cachedLog.profile(label);
  }
  profileEnd(label?: string): void {
    return this.cachedLog.profileEnd.bind(null, label);
  }
}

export default SecureLog;
