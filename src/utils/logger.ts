type LogLevel = 'info' | 'warn' | 'error' | 'debug';

type LogData = object | Error | string | number | boolean | null | undefined | unknown;

class Logger {
  private static formatMessage(level: LogLevel, message: string, data?: LogData): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]:`;

    switch (level) {
      case 'info':
        console.info(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'error':
        console.error(prefix, message, data || '');
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(prefix, message, data || '');
        }
        break;
    }
  }

  static info(message: string, data?: LogData): void {
    this.formatMessage('info', message, data);
  }

  static warn(message: string, data?: LogData): void {
    this.formatMessage('warn', message, data);
  }

  static error(message: string, data?: LogData): void {
    this.formatMessage('error', message, data);
  }

  static debug(message: string, data?: LogData): void {
    this.formatMessage('debug', message, data);
  }
}

export const logger = Logger;
