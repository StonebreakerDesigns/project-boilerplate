/** Logging utility. */
import config from './config';

//	Define the color to node control code mapping.
const NODE_CONSOLE_COLORS = {
	orange: '\x1b[33m',
	grey: '\x1b[2m',
	black: '\x1b[37m',
	red: '\x1b[31m'
};

/** The universal logging interface. Inheritors must override `_output()` */
class Logger {
	constructor(name) {
		this.name = name;
		this.serverSide = typeof window === 'undefined';

		['debug', 'info', 'warn', 'critical'].forEach(key => {
			this._addCurried(key);
		});
	}

	/** Internal write utility. */
	_log(level, color, messages) {
		do level += ' '; while (level.length < 6);

		let args = [this.name, ...messages];
		if (this.serverSide) {
			args = [NODE_CONSOLE_COLORS[color], ...args, '\x1b[0m'];
		}
		else {
			args = ['%c' + level, 'color: ' + color + ';', ...args];
		}
		this._write(args);
	}

	/** Currying utility. */
	_addCurried(key) {
		this[key].curry = (...args) => this[key](...args);
	}

	/** Debug level. */
	debug(...messages) { this._log('DEBUG', 'grey', messages); }
	/** Info level. */
	info(...messages) { this._log('INFO', 'black', messages); }
	/** Warning level. */
	warn(...messages) { this._log('WARN', 'orange', messages); }
	/** Error level. */
	critical(...messages) { this._log('CRIT', 'red', messages); }
}

/** A development logger. */
class ConsoleLogger extends Logger {
	/** Write to the console. */
	_write(messages) {
		//	eslint-disable-next-line no-console
		console.log(...messages);
	}
}

/** A placeholder for loggers in production. */
class ProdClientLogger extends Logger {
	constructor(...args) {
		super(...args);

		this.content = '';
	}

	/** Write to a log string. */
	_write(messages) {
		let procd = messages.slice(0, messages.length - 1).join(' ');
		this.content += procd + '\n';
	}
}

/** Logger access. */
const logger = name => {
	if (typeof window === 'undefined') {
		return new ConsoleLogger(name);
	}
	else {
		if (config.development.debug) return new ConsoleLogger(name);
		else return new ProdClientLogger(name);
	}
};
export default logger;
