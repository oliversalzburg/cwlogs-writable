var util = require('util');
var Writable = require('stream').Writable;
var AWS = require('aws-sdk');
var hasOwnProperty = Object.prototype.hasOwnProperty;

module.exports = CWLogsWritable;

util.inherits(CWLogsWritable, Writable);

/**
 * Writable stream for AWS CloudWatch Logs.
 *
 * @constructor
 * @param {object} options
 * @param {string} options.logGroupName - AWS CloudWatch [LogGroup](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatchLogs.html#putLogEvents-property) name. It will be created if it doesn't exist.
 * @param {string} options.logStreamName - AWS CloudWatch [LogStream](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatchLogs.html#putLogEvents-property) name. It will be created if it doesn't exist.
 * @param {object} [options.cloudWatchLogsOptions={}] - Options passed to [AWS.CloudWatchLogs](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatchLogs.html#constructor-property) service.
 * @param {string|number} [options.writeInterval=nextTick] - Amount of wait time after a Writable#_write call to allow batching of log events. Must be a positive number or "nextTick". If "nextTick", `process.nextTick` is used. If a number, `setTimeout` is used.
 * @param {string|number} [options.retryableDelay=150]
 * @param {number} [options.retryableMax=100] - Maximum number of times a AWS error marked as "retryable" will be retried before the error is instead passed to {@link CWLogsWritable#onError}.
 * @param {number} [options.maxBatchCount=10000] - Maximum number of log events allowed in a single PutLogEvents API call.
 * @param {number} [options.maxBatchSize=1048576] - Maximum number of bytes allowed in a single PutLogEvents API call.
 * @param {function} [options.onError] - Called when an AWS error is encountered. Overwrites {@link CWLogsWritable#onError} method.
 * @param {function} [options.filterWrite] - Filter writes to CWLogsWritable. Overwrites {@link CWLogsWritable#filterWrite} method.
 * @param {boolean} [options.objectMode=true] - Passed to the Writable constructor. See https://nodejs.org/api/stream.html#stream_object_mode.
 * @augments {Writable}
 * @fires CWLogsWritable#putLogEvents
 * @fires CWLogsWritable#createLogGroup
 * @fires CWLogsWritable#createLogStream
 * @example
 * ```javascript
 * var CWLogsWritable = require('cwlogs-writable');
 * var stream = new CWLogsWritable({
 *   logGroupName: 'my-log-group',
 *   logStreamName: 'my-stream',
 *   cloudWatchLogsOptions: {
 *     region: 'us-east-1',
 *     accessKeyId: '{AWS-IAM-USER-ACCESS-KEY-ID}',
 *     secretAccessKey: '{AWS-SECRET-ACCESS-KEY}'
 *   }
 * });
 * ```
 */
function CWLogsWritable(options) {
	if (!(this instanceof CWLogsWritable)) {
		return new CWLogsWritable(options);
	}

	this.validateOptions(options);

	Writable.call(this, { objectMode: options.objectMode !== false });

	this._onErrorNextCbId = 1;
	this.sequenceToken = null;
	this.writeQueued = false;

	/**
	 * Logs queued to be sent to AWS CloudWatch Logs. Do not modify directly.
	 *
	 * @protected
	 * @member {Array.<{message:string,timestamp:number}>} CWLogsWritable#queuedLogs
	 */
	this.queuedLogs = [];

	/**
	 * AWS CloudWatch [LogGroup](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatchLogs.html#putLogEvents-property) name. It will be created if it doesn't exist.
	 *
	 * @member {string} CWLogsWritable#logGroupName
	 */
	Object.defineProperty(this, 'logGroupName', {
		enumerable: true,
		writable: false,
		value: options.logGroupName
	});

	/**
	 * AWS CloudWatch [LogStream](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatchLogs.html#putLogEvents-property) name. It will be created if it doesn't exist.
	 *
	 * @member {string} CWLogsWritable#logStreamName
	 */
	Object.defineProperty(this, 'logStreamName', {
		enumerable: true,
		writable: false,
		value: options.logStreamName
	});

	/**
	 * Amount of wait time after a Writable#_write call to allow batching of log events. Must be a positive number or "nextTick". If "nextTick", `process.nextTick` is used. If a number, `setTimeout` is used.
	 *
	 * @member {string|number} CWLogsWritable#writeInterval
	 * @default nextTick
	 */
	this.writeInterval = typeof options.writeInterval === 'number'
		? options.writeInterval
		: 'nextTick';

	/**
	 * Maximum number of times a AWS error marked as "retryable" will be retried before the error is instead passed to {@link CWLogsWritable#onError}.
	 *
	 * @member {number} CWLogsWritable#retryableMax
	 * @default 100
	 */
	this.retryableMax = typeof options.retryableMax === 'number'
		? Math.max(0, options.retryableMax)
		: 100;

	/**
	 * @member {string|number} CWLogsWritable#retryableDelay
	 * @default 150
	 */
	this.retryableDelay = options.retryableDelay === 'nextTick' || typeof options.retryableDelay === 'number'
		? options.retryableDelay
		: 150;

	/**
	 * Maximum number of log events allowed in a single PutLogEvents API call.
	 *
	 * @member {number} CWLogsWritable#maxBatchCount
	 * @default 10000
	 */
	this.maxBatchCount = typeof options.maxBatchCount === 'number'
		? Math.min(10000, Math.max(1, options.maxBatchCount))
		: 10000;

	/**
	 * Maximum number of bytes allowed in a single PutLogEvents API call.
	 *
	 * @member {number} CWLogsWritable#maxBatchSize
	 * @default 1048576
	 */
	this.maxBatchSize = typeof options.maxBatchSize === 'number'
		? Math.min(1048576, Math.max(1024, options.maxBatchSize))
		: 1048576;

	if (options.onError) {
		this.onError = options.onError;
	}

	if (options.filterWrite) {
		this.filterWrite = options.filterWrite;
	}

	/**
	 * The AWS.CloudWatchLogs instance.
	 *
	 * @member {CloudWatchLogs} CWLogsWritable#cloudwatch
	 */
	Object.defineProperty(this, 'cloudwatch', {
		enumerable: true,
		writable: false,
		value: this.createService(options.cloudWatchLogsOptions || {})
	});
}

/**
 * Validate the options passed to {@link CWLogsWritable}.
 *
 * @protected
 * @param {object} options
 * @throws Error
 */
CWLogsWritable.prototype.validateOptions = function(options) {
	if (!options || typeof options !== 'object') {
		throw new Error('options must be an object');
	}

	if (typeof options.logGroupName !== 'string') {
		throw new Error('logGroupName option must be a string');
	}

	if (typeof options.logStreamName !== 'string') {
		throw new Error('logStreamName option must be a string');
	}

	if (hasOwnProperty.call(options, 'objectMode') && typeof options.objectMode !== 'boolean') {
		throw new Error('objectMode option must be a boolean, if specified');
	}

	if (hasOwnProperty.call(options, 'writeInterval') && !isInterval(options.writeInterval)) {
		throw new Error('writeInterval option must be a positive number or "nextTick", if specified');
	}

	if (hasOwnProperty.call(options, 'retryableMax') && (!isFiniteNumber(options.retryableMax) || options.retryableMax < 1)) {
		throw new Error('retryableMax option must be a non-zero positive number, if specified');
	}

	if (hasOwnProperty.call(options, 'retryableDelay') && !isInterval(options.retryableDelay)) {
		throw new Error('retryableDelay option must be a positive number or "nextTick", if specified');
	}

	if (hasOwnProperty.call(options, 'maxBatchCount') && (!isFiniteNumber(options.maxBatchCount) || options.maxBatchCount < 1 || options.maxBatchCount > 10000)) {
		throw new Error('maxBatchCount option must be a positive number from 1 to 10000, if specified');
	}

	if (hasOwnProperty.call(options, 'maxBatchSize') && (!isFiniteNumber(options.maxBatchSize) || options.maxBatchSize < 256 || options.maxBatchSize > 1048576)) {
		throw new Error('maxBatchSize option must be a positive number from 256 to 1048576, if specified');
	}

	if (hasOwnProperty.call(options, 'onError') && typeof options.onError !== 'function') {
		throw new Error('onError option must be a function, if specified');
	}

	if (hasOwnProperty.call(options, 'filterWrite') && typeof options.filterWrite !== 'function') {
		throw new Error('filterWrite option must be a function, if specified');
	}
};

/**
 * Get the number of log events queued to be sent to AWS CloudWatch Logs.
 *
 * Does not include events that are actively being sent.
 *
 * @returns {number}
 */
CWLogsWritable.prototype.getQueueSize = function() {
	return this.queuedLogs.length;
};

/**
 * Remove all log events that are still queued.
 *
 * @returns {Array.<{message:string,timestamp:number}>} Log events removed from the queue.
 */
CWLogsWritable.prototype.clearQueue = function() {
	var oldQueue = this.queuedLogs;
	this.queuedLogs = [];
	return oldQueue;
};

/**
 * Create a log event object from the log record.
 *
 * @protected
 * @param {object|string} rec
 * @returns {{message: string, timestamp: number}}
 */
CWLogsWritable.prototype.createLogEvent = function(rec) {
	return {
		message: typeof rec === 'string' ? rec : JSON.stringify(rec),
		timestamp: typeof rec === 'object' && rec.time ? new Date(rec.time).getTime() : Date.now()
	};
};

/**
 * Called when an AWS error is encountered. Do not call directly.
 *
 * The default behavior of this method is call the `next` argument
 * with the error as the first argument.
 *
 * `logEvents` argument will be either:
 *
 * - An array of log event objects (see {@link CWLogsWritable#createLogEvent})
 *   if error is from PutLogEvents action.
 * - `null` if error is from any action besides PutLogEvents.
 *
 * The `next` argument must be called in one of the following ways:
 *
 * - **`next(err)`** — If the first argument is an instance of `Error`, an 'error'
 *   event will be emitted on the stream, {@link CWLogsWritable#clearQueue} is called,
 *   and {@link CWLogsWritable#filterWrite} is replaced so no further logging
 *   will be processed by the stream. This effectively disables the stream.
 *
 * - **`next()` or `next(logEvents)`** — The stream will recover from the error and
 *   resume sending logs to AWS CloudWatch Logs. The first argument may optionally be
 *   an array of log event objects (i.e. `logEvents` argument) that will be added to
 *   the head of the log events queue.
 *
 * @param {Error} err - AWS error
 * @param {null|Array.<{message:string,timestamp:number}>} logEvents
 * @param {function} next
 * @example
 * ```javascript
 * var CWLogsWritable = require('cwlogs-writable');
 * var stream = new CWLogsWritable({
 *   logGroupName: 'my-log-group',
 *   logStreamName: 'my-stream',
 *   onError: function(err, logEvents, next) {
 *     if (logEvents) {
 *       console.error(
 *         'CWLogsWritable PutLogEvents error',
 *         err,
 *         JSON.stringify(logEvents)
 *       );
 *
 *       // Resume without adding the log events back to the queue.
 *       next();
 *     }
 *     else {
 *       // Use built-in behavior of emitting an error,
 *       // clearing the queue, and ignoring all writes to the stream.
 *       next(err);
 *     }
 *   }
 * }).on('error', function(err) {
 *   // Always listen for 'error' events to catch non-AWS errors as well.
 *   console.error(
 *     'CWLogsWritable error',
 *     err
 *   );
 * });
 * ```
 */
CWLogsWritable.prototype.onError = function(err, logEvents, next) {
	next(err);
};

/**
 * Filter writes to CWLogsWritable.
 *
 * Default behavior is to return true if `rec` is not null or undefined.
 *
 * @param {string|object} rec - Raw log record passed to Writable#write.
 * @returns {boolean} true to include, and false to exclude.
 */
CWLogsWritable.prototype.filterWrite = function(rec) {
	return rec != null;
};

/**
 * Create the AWS.CloudWatchLogs service.
 *
 * @protected
 * @param {object} opts - Passed as first argument to AWS.CloudWatchLogs.
 * @returns {CloudWatchLogs}
 */
CWLogsWritable.prototype.createService = function(opts) {
	return new AWS.CloudWatchLogs(opts);
};

/**
 * Get the size of the next batch of log events to send,
 * based on the the constraints of PutLogEvents.
 *
 * @protected
 * @see http://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html
 * @param {Array.<{message:string,timestamp:number}>} queuedLogs - Number of bytes used by other JSON.
 * @returns {number}
 */
CWLogsWritable.prototype.nextLogBatchSize = function(queuedLogs) {
	var batchCount = 1;
	var sizeEstimate = 0;

	// (DONE) The maximum batch size is 1,048,576 bytes, and this size is calculated as the sum of all event messages in UTF-8, plus 26 bytes for each log event.
	// (SKIP) None of the log events in the batch can be more than 2 hours in the future.
	// (SKIP) None of the log events in the batch can be older than 14 days or the retention period of the log group.
	// TODO: The log events in the batch must be in chronological ordered by their timestamp (the time the event occurred, expressed as the number of milliseconds since Jan 1, 1970 00:00:00 UTC).
	// (DONE) The maximum number of log events in a batch is 10,000.
	// TODO: A batch of log events in a single request cannot span more than 24 hours. Otherwise, the operation fails.

	for (var i = 0, l = queuedLogs.length; i < l; i++) {
		sizeEstimate += 26 + this.getMessageSize(queuedLogs[i].message);

		// Cut off at the max bytes limit.
		if (sizeEstimate > this.maxBatchSize || batchCount >= this.maxBatchCount) {
			break;
		}
		else {
			batchCount = i + 1;
		}
	}

	return batchCount;
};

/**
 * Get the size of the message, which is used while determining
 * how many messages can fit within a single PutLogEvents API call.
 *
 * By default this is calculated by the length of the string.
 *
 * However, if a string contains multi-byte UTF characters the size
 * will be off which may result in a PutLogEvents error.
 *
 * For example, "I \u2764 AWS" is 7 characters but 9 bytes.
 *
 * You may override this method to provide your own implementation
 * to correctly measure string sizes.
 *
 * Alternatively, you can reduce `maxBatchSize` to a number that
 * takes into account possible UTF-8 characters.
 *
 * @protected
 * @param {string} message - The "message" prop of an LogEvent.
 * @returns {number} The size of the message.
 */
CWLogsWritable.prototype.getMessageSize = function(message) {
	return message.length;
};

/**
 * Schedule a call of CWLogsWritable#_sendQueuedLogs to run.
 *
 * @private
 */
CWLogsWritable.prototype._scheduleSendLogs = function() {
	if (this.writeInterval === 'nextTick') {
		process.nextTick(this._sendLogs.bind(this));
	}
	else {
		setTimeout(this._sendLogs.bind(this), this.writeInterval);
	}
};

/**
 * Internal method called by Writable#_write.
 *
 * @param {object|string} record - Logging record. Can be an object if objectMode options is true.
 * @param {*} _enc - Ignored
 * @param {function} cb - Always called with no arguments.
 * @private
 */
CWLogsWritable.prototype._write = function _write(record, _enc, cb) {
	if (this.filterWrite(record)) {
		// TODO: Handle records that are over (256 * 1024 - 26) bytes, the limit for a CloudWatch Log event minus 26 byte overhead

		this.queuedLogs.push(this.createLogEvent(record));

		if (!this.writeQueued) {
			this.writeQueued = true;
			this._scheduleSendLogs();
		}
	}

	cb();
};

/**
 * Send the next batch of log events to AWS CloudWatch Logs.
 *
 * @private
 * @returns {void}
 */
CWLogsWritable.prototype._sendLogs = function() {
	if (this.sequenceToken === null) {
		this._getSequenceToken(function(err, sequenceToken) {
			if (err) {
				this.onError(err, null, this._nextAfterError.bind(this, ++this._onErrorNextCbId));
			}
			else {
				this.sequenceToken = sequenceToken;
				this._sendLogs();
			}
		}.bind(this));
		return;
	}

	if (!this.queuedLogs.length) {
		this.writeQueued = false;
		return;
	}

	var batchCount = this.nextLogBatchSize(this.queuedLogs);

	var apiParams = {
		logGroupName: this.logGroupName,
		logStreamName: this.logStreamName,
		sequenceToken: this.sequenceToken,
		logEvents: null
	};

	if (batchCount === this.queuedLogs.length) {
		// Put all queued items since they fit
		apiParams.logEvents = this.queuedLogs;
		this.queuedLogs = [];
	}
	else {
		// Queue just the items that fit within a putLogEvents call
		apiParams.logEvents = this.queuedLogs.splice(0, batchCount);
	}

	this._putLogEvents(apiParams, function(err, sequenceToken) {
		if (err) {
			this._onErrorNextCbId++;
			this.onError(err, apiParams.logEvents, this._nextAfterError.bind(this, this._onErrorNextCbId));
		}
		else {
			this.sequenceToken = sequenceToken;
			this._emitPutLogEvents(apiParams.logEvents);

			if (this.queuedLogs.length) {
				this._scheduleSendLogs();
			}
			else {
				this.writeQueued = false;
			}
		}
	}.bind(this));
};

/**
 * Attempt to continue sending log events to AWS CloudWatch Logs after an error was previously returned.
 *
 * @param {number} _onErrorNextCbId - Internal ID used to prevent multiple calls.
 * @param {Error|Array.<{message:string,timestamp:number}>} [errOrLogEvents] - The log events that failed to send, which will be returned to the beginning of the queue.
 * @private
 */
CWLogsWritable.prototype._nextAfterError = function(_onErrorNextCbId, errOrLogEvents) {
	// Abort if not the current 'next' callback.
	if (this._onErrorNextCbId !== _onErrorNextCbId) {
		return;
	}

	// Increment to prevent calling again.
	this._onErrorNextCbId++;

	// Reset sequence token since we don't know if it's accurate anymore
	this.sequenceToken = null;

	if (errOrLogEvents instanceof Error) {
		this._handleError(errOrLogEvents);
		return;
	}

	if (errOrLogEvents) {
		// Return the log events to the beginning of the queue
		if (this.queuedLogs.length) {
			this.queuedLogs = errOrLogEvents.concat(this.queuedLogs);
		}
		else {
			this.queuedLogs = errOrLogEvents;
		}
	}

	this._scheduleSendLogs();
};

/**
 * Handle an critial error. This effectively disables the stream.
 *
 * @param {Error} err
 * @private
 */
CWLogsWritable.prototype._handleError = function(err) {
	this.emit('error', err);
	this.clearQueue();
	this.filterWrite = CWLogsWritable._falseFilterWrite;
};

/**
 * Send a PutLogEvents action to AWS.
 *
 * @param {object} apiParams
 * @param {function} cb
 * @private
 */
CWLogsWritable.prototype._putLogEvents = function(apiParams, cb) {
	var retries = 0;
	var retryableDelay = this.retryableDelay;
	var retryableMax = this.retryableMax;
	var cloudwatch = this.cloudwatch;

	attemptPut();

	function attemptPut() {
		cloudwatch.putLogEvents(apiParams, function(err, res) {
			if (err) {
				if (err.retryable && retryableMax > retries++) {
					if (retryableDelay === 'nextTick') {
						process.nextTick(attemptPut);
					}
					else {
						setTimeout(attemptPut, retryableDelay);
					}
				}
				else {
					cb(err);
				}
			}
			else {
				cb(null, res.nextSequenceToken);
			}
		});
	}
};

/**
 * Describe the LogStream in AWS CloudWatch Logs to get the next sequence token.
 *
 * @param {function} cb
 * @private
 */
CWLogsWritable.prototype._getSequenceToken = function(cb) {
	this.cloudwatch.describeLogStreams({
		logGroupName: this.logGroupName,
		logStreamNamePrefix: this.logStreamName
	}, function(err, data) {
		if (err) {
			if (err.name === 'ResourceNotFoundException') {
				this._createLogGroupAndStream(function(err) {
					if (err) {
						cb(err);
					}
					else {
						this._getSequenceToken(cb);
					}
				}.bind(this));
			}
			else {
				cb(err);
			}
		}
		else if (data.logStreams.length === 0) {
			this._createLogStream(function(err) {
				if (err) {
					cb(err);
				}
				else {
					this._emitCreateLogStream();
					this._getSequenceToken(cb);
				}
			}.bind(this));
		}
		else {
			cb(null, data.logStreams[0].uploadSequenceToken);
		}
	}.bind(this));
};

/**
 * Create both the LogGroup and LogStream in AWS CloudWatch Logs.
 *
 * @param {function} cb
 * @private
 */
CWLogsWritable.prototype._createLogGroupAndStream = function(cb) {
	this._createLogGroup(function(err) {
		if (err) {
			cb(err);
		}
		else {
			this._emitCreateLogGroup();
			this._createLogStream(function(err) {
				if (err) {
					cb(err);
				}
				else {
					this._emitCreateLogStream();
					cb();
				}
			}.bind(this));
		}
	}.bind(this));
};

/**
 * Create the LogGroup in AWS CloudWatch Logs.
 *
 * @param {function} cb
 * @private
 */
CWLogsWritable.prototype._createLogGroup = function(cb) {
	this.cloudwatch.createLogGroup({
		logGroupName: this.logGroupName
	}, cb);
};

/**
 * Create the LogStream in AWS CloudWatch Logs.
 *
 * @param {function} cb
 * @private
 */
CWLogsWritable.prototype._createLogStream = function(cb) {
	this.cloudwatch.createLogStream({
		logGroupName: this.logGroupName,
		logStreamName: this.logStreamName
	}, cb);
};

/**
 * Fired on successful PutLogEvent API calls.
 *
 * @event CWLogsWritable#putLogEvents
 * @param {Array.<{message:string,timestamp:number}>} logEvents
 */
CWLogsWritable.prototype._emitPutLogEvents = function(logEvents) {
	this.emit('putLogEvents', logEvents);
};

/**
 * Fired on successful CreateLogGroup API call.
 *
 * @event CWLogsWritable#createLogGroup
 */
CWLogsWritable.prototype._emitCreateLogGroup = function() {
	this.emit('createLogGroup');
};

/**
 * Fired on successful CreateLogStream API call.
 *
 * @event CWLogsWritable#createLogStream
 */
CWLogsWritable.prototype._emitCreateLogStream = function() {
	this.emit('createLogStream');
};

CWLogsWritable._falseFilterWrite = function() {
	return false;
};

function isFiniteNumber(val) {
	return typeof val === 'number' && isFinite(val);
}

function isInterval(val) {
	return val === 'nextTick' || isFiniteNumber(val) && val >= 0;
}
