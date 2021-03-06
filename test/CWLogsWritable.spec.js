var objectAssign = require('object-assign');
var inherits = require('util').inherits;
var expect = require('expect');
var Writable = require('stream').Writable;
var proxyquire = require('proxyquire');

describe('CWLogsWritable', function() {
	var noop = function() {};
	var CWLogsWritable = proxyquire('../lib/index', {
		'aws-sdk': createAWSStub()
	});

	afterEach(function () {
		expect.restoreSpies();
	});

	describe('CWLogsWritable()', function() {

		it('should export a constructor instanceof Writable', function() {
			expect(CWLogsWritable.prototype).toBeA(Writable, 'Expected CWLogsWritable.prototype to be a Writable');
		});

		it('should call validateOptions validate options', function() {
			inherits(Child, CWLogsWritable);
			function Child(options) {
				CWLogsWritable.call(this, options);
			}

			var expectedOpts = {};
			var expectedError = new Error();
			Child.prototype.validateOptions = expect.createSpy().andThrow(expectedError);

			try {
				new Child(expectedOpts);
			}
			catch (err) {
				if (err !== expectedError) {
					throw err;
				}
			}

			expect(Child.prototype.validateOptions.calls.length).toBe(1, 'Expected validateOptions to have been called');
			expect(Child.prototype.validateOptions.calls[0].arguments.length).toBe(1);
			expect(Child.prototype.validateOptions.calls[0].arguments[0]).toBe(expectedOpts);

			expect(function() {
				new CWLogsWritable();
			}).toThrowWithProps(Error, { message: 'options must be an object' });

			expect(function() {
				new CWLogsWritable({});
			}).toThrowWithProps(Error, { message: 'logGroupName option must be a string' });

			expect(function() {
				new CWLogsWritable({
					logGroupName: ''
				});
			}).toThrowWithProps(Error, { message: 'logStreamName option must be a string' });

			expect(function() {
				new CWLogsWritable({
					logGroupName: '',
					logStreamName: ''
				});
			}).toNotThrow();

			expect(function() {
				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					objectMode: true
				});

				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					objectMode: false
				});
			}).toNotThrow();

			[void 0, null, -1, 0, 1, '', '0', '1', Infinity, -Infinity, {}, [], NaN, noop]
				.forEach(function(val) {
					expect(function() {
						new CWLogsWritable({
							logGroupName: '',
							logStreamName: '',
							objectMode: val
						});
					}).toThrowWithProps(Error, { message: 'objectMode option must be a boolean, if specified' }, val);
				});

			expect(function() {
				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					writeInterval: 'nextTick'
				});

				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					writeInterval: 0
				});

				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					writeInterval: 1
				});
			}).toNotThrow();

			[void 0, null, -1, true, false, '', '0', '1', Infinity, -Infinity, {}, [], NaN, noop]
				.forEach(function(val) {
					expect(function() {
						new CWLogsWritable({
							logGroupName: '',
							logStreamName: '',
							writeInterval: val
						});
					}).toThrowWithProps(Error, { message: 'writeInterval option must be a positive number or "nextTick", if specified' }, val);
				});

			expect(function() {
				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					writeInterval: 1
				});
			}).toNotThrow();

			[void 0, null, 0, -1, true, false, '', '0', '1', Infinity, -Infinity, {}, [], NaN, noop]
				.forEach(function(val) {
					expect(function() {
						new CWLogsWritable({
							logGroupName: '',
							logStreamName: '',
							retryableMax: val
						});
					}).toThrowWithProps(Error, { message: 'retryableMax option must be a non-zero positive number, if specified' }, val);
				});

			expect(function() {
				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					retryableDelay: 'nextTick'
				});

				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					retryableDelay: 0
				});

				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					retryableDelay: 1
				});
			}).toNotThrow();

			[void 0, null, -1, true, false, '', '0', '1', Infinity, -Infinity, {}, [], NaN, noop]
				.forEach(function(val) {
					expect(function() {
						new CWLogsWritable({
							logGroupName: '',
							logStreamName: '',
							retryableDelay: val
						});
					}).toThrowWithProps(Error, { message: 'retryableDelay option must be a positive number or "nextTick", if specified' }, val);
				});

			expect(function() {
				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					maxBatchCount: 1
				});

				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					maxBatchCount: 1000
				});

				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					maxBatchCount: 10000
				});
			}).toNotThrow();

			[void 0, null, -1, 0, 10001, true, false, '', '0', '1', '256', '1048576', Infinity, -Infinity, {}, [], NaN, noop]
				.forEach(function(val) {
					expect(function() {
						new CWLogsWritable({
							logGroupName: '',
							logStreamName: '',
							maxBatchCount: val
						});
					}).toThrowWithProps(Error, { message: 'maxBatchCount option must be a positive number from 1 to 10000, if specified' }, val);
				});

			expect(function() {
				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					maxBatchSize: 256
				});

				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					maxBatchSize: 921600
				});

				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					maxBatchSize: 1048576
				});
			}).toNotThrow();

			[void 0, null, -1, 0, 1, 255, 1048577, true, false, '', '0', '1', '256', '1048576', Infinity, -Infinity, {}, [], NaN, noop]
				.forEach(function(val) {
					expect(function() {
						new CWLogsWritable({
							logGroupName: '',
							logStreamName: '',
							maxBatchSize: val
						});
					}).toThrowWithProps(Error, { message: 'maxBatchSize option must be a positive number from 256 to 1048576, if specified' }, val);
				});

			expect(function() {
				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					onError: noop
				});
			}).toNotThrow();

			[void 0, null, -1, 0, 1, true, false, '', '0', '1', Infinity, -Infinity, {}, [], NaN]
				.forEach(function(val) {
					expect(function() {
						new CWLogsWritable({
							logGroupName: '',
							logStreamName: '',
							onError: val
						});
					}).toThrowWithProps(Error, { message: 'onError option must be a function, if specified' }, val);
				});

			expect(function() {
				new CWLogsWritable({
					logGroupName: '',
					logStreamName: '',
					filterWrite: noop
				});
			}).toNotThrow();

			[void 0, null, -1, 0, 1, true, false, '', '0', '1', Infinity, -Infinity, {}, [], NaN]
				.forEach(function(val) {
					expect(function() {
						new CWLogsWritable({
							logGroupName: '',
							logStreamName: '',
							filterWrite: val
						});
					}).toThrowWithProps(Error, { message: 'filterWrite option must be a function, if specified' }, val);
				});
		});

		it('should return instance if called without "new"', function() {
			var stream = new CWLogsWritable({
				logGroupName: '',
				logStreamName: ''
			});

			expect(stream).toBeA(CWLogsWritable);
		});

		it('should set props from options', function() {
			var streamDefaults = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			expect(streamDefaults.logGroupName).toBe('foo', 'Expected logGroupName prop %s to be %s');
			expect(streamDefaults.logStreamName).toBe('bar', 'Expected logStreamName prop %s to be %s');
			expect(streamDefaults.writeInterval).toBe('nextTick', 'Expected writeInterval prop default %s to be %s');
			expect(streamDefaults.retryableMax).toBe(100, 'Expected retryableMax prop default %s to be %s');
			expect(streamDefaults.retryableDelay).toBe(150, 'Expected retryableDelay prop default %s to be %s');
			expect(streamDefaults.maxBatchCount).toBe(10000, 'Expected maxBatchCount prop default %s to be %s');
			expect(streamDefaults.maxBatchSize).toBe(1048576, 'Expected maxBatchSize prop default %s to be %s');
			expect(streamDefaults.onError).toBe(CWLogsWritable.prototype.onError, 'Expected onError prop default %s to be %s');
			expect(streamDefaults.filterWrite).toBe(CWLogsWritable.prototype.filterWrite, 'Expected filterWrite prop default %s to be %s');

			var onError = function() {};
			var filterWrite = function() {};
			var streamOverrides = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar',
				writeInterval: 500,
				retryableMax: 600,
				retryableDelay: 700,
				maxBatchCount: 1000,
				maxBatchSize: 1000000,
				onError: onError,
				filterWrite: filterWrite
			});

			expect(streamOverrides.writeInterval).toBe(500, 'Expected writeInterval prop %s to be %s');
			expect(streamOverrides.retryableMax).toBe(600, 'Expected retryableMax prop %s to be %s');
			expect(streamOverrides.retryableDelay).toBe(700, 'Expected retryableDelay prop %s to be %s');
			expect(streamOverrides.maxBatchCount).toBe(1000, 'Expected maxBatchCount prop %s to be %s');
			expect(streamOverrides.maxBatchSize).toBe(1000000, 'Expected maxBatchSize prop %s to be %s');
			expect(streamOverrides.onError).toBe(onError, 'Expected onError prop %s to be %s');
			expect(streamOverrides.filterWrite).toBe(filterWrite, 'Expected filterWrite prop %s to be %s');
		});

		it('should call createService and pass cloudWatchLogsOptions option', function() {
			inherits(Child, CWLogsWritable);
			function Child(options) {
				CWLogsWritable.call(this, options);
			}

			var expectedOpts = {
				constructor: expect.createSpy()
			};

			var createServiceSpy = expect.spyOn(Child.prototype, 'createService').andCallThrough();

			var child = new Child({
				logGroupName: '',
				logStreamName: '',
				cloudWatchLogsOptions: expectedOpts
			});

			expect(createServiceSpy.calls.length).toBe(1);
			expect(createServiceSpy.calls[0].arguments.length).toBe(1);
			expect(createServiceSpy.calls[0].arguments[0]).toBe(expectedOpts);

			expect(expectedOpts.constructor.calls.length).toBe(1);
			expect(expectedOpts.constructor.calls[0].context).toBe(child.cloudwatch);
			expect(expectedOpts.constructor.calls[0].arguments.length).toBe(1);
			expect(expectedOpts.constructor.calls[0].arguments[0]).toBe(expectedOpts);
		});
	});

	describe('CWLogsWritable#getQueueSize', function() {
		it('should initially return 0', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			expect(stream.getQueueSize()).toBe(0);
		});

		it('should return queue size', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			stream.write('foo');
			stream.write('foo');
			stream.write('foo');

			expect(stream.getQueueSize()).toBe(3);
		});
	});

	describe('CWLogsWritable#clearQueue', function() {
		it('should remove all items from the queue', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			stream._write('rec', null, noop);
			var expectedEventLog = stream.queuedLogs[0];

			expect(stream.queuedLogs.length).toBe(1);

			var oldQueue = stream.clearQueue();
			expect(stream.queuedLogs.length).toBe(0);
			expect(oldQueue.length).toBe(1);
			expect(oldQueue[0]).toBe(expectedEventLog);
		});
	});

	describe('CWLogsWritable#createLogEvent', function() {
		it('should return a log event', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			var now = Date.now();
			var logEvent = stream.createLogEvent('foo');

			expect(Object.keys(logEvent).sort()).toEqual(['message', 'timestamp']);
			expect(logEvent.message).toBe('foo');
			expect(logEvent.timestamp).toBeA('number');
			expect(logEvent.timestamp).toBeGreaterThanOrEqualTo(now);
			expect(logEvent.timestamp).toBeLessThan(now + 10);
		});

		it('should stringify non-string log records', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			var now = Date.now();
			var logEvent = stream.createLogEvent({ foo: 'bar' });

			expect(Object.keys(logEvent).sort()).toEqual(['message', 'timestamp']);
			expect(logEvent.message).toBe('{"foo":"bar"}');
		});

		it('should get timestamp from "time" prop on object log records', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			var logEventA = stream.createLogEvent({ foo: 'bar', time: 100 });
			expect(Object.keys(logEventA).sort()).toEqual(['message', 'timestamp']);
			expect(logEventA.message).toBe('{"foo":"bar","time":100}');
			expect(logEventA.timestamp).toBe(100);

			var logEventB = stream.createLogEvent({ foo: 'bar', time: '2017-02-13T16:57:51.344Z' });
			expect(Object.keys(logEventB).sort()).toEqual(['message', 'timestamp']);
			expect(logEventB.message).toBe('{"foo":"bar","time":"2017-02-13T16:57:51.344Z"}');
			expect(logEventB.timestamp).toBe(1487005071344);
		});
	});

	describe('CWLogsWritable#onError', function() {
		it('should call "next" callback with the error', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			var expectedErr = new Error();
			var spy = expect.createSpy();

			stream.onError(expectedErr, null, spy);

			expect(spy.calls.length).toBe(1);
			expect(spy.calls[0].arguments.length).toBe(1);
			expect(spy.calls[0].arguments[0]).toBe(expectedErr);
		});
	});

	describe('CWLogsWritable#nextLogBatchSize', function() {
		var overhead = 26;
		var max = 1048576;
		var maxMessageSize = 256 * 1024 - overhead;

		// Large message that leaves a bit of room left to test batch limit.
		// i.e. 1048576 / 200000 = 5.24288 then 1048576 - (5 * 200000) = 48576 bytes for the last message
		var largeMessage = new Array(200000 - overhead + 1).join('0');

		it('should be all logs if small', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			stream.write(new Array(maxMessageSize + 1).join('0'));
			expect(stream.nextLogBatchSize(stream.queuedLogs)).toBe(1);
		});

		it('should be all logs if exactly enough', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			var willFit = Math.floor(max / (overhead + largeMessage.length));
			var remainder = max - willFit * (overhead + largeMessage.length);

			// Sanity check
			expect(remainder).toBe(48576);

			for (var i = 0; i < willFit; i++) {
				stream.write(largeMessage);
			}

			stream.write(largeMessage.substr(0, remainder - overhead));

			expect(stream.nextLogBatchSize(stream.queuedLogs)).toBe(willFit + 1);
			stream.queuedLogs = [];
		});

		it('should be part of queue if too large for one batch', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			var willFit = Math.floor(max / (overhead + largeMessage.length));
			var remainder = max - willFit * (overhead + largeMessage.length);

			// Sanity check
			expect(remainder).toBe(48576);

			for (var i = 0; i < willFit; i++) {
				stream.write(largeMessage);
			}

			stream.write(largeMessage.substr(0, remainder - overhead + 1)); // One byte over

			expect(stream.queuedLogs.length).toBe(willFit + 1);
			expect(stream.nextLogBatchSize(stream.queuedLogs)).toBe(willFit);
			stream.queuedLogs = [];
		});

		it('should use maxBatchCount option', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar',
				maxBatchCount: 10
			});

			for (var i = 0; i < 15; i++) {
				stream.write('---');
			}

			expect(stream.queuedLogs.length).toBe(15);
			expect(stream.nextLogBatchSize(stream.queuedLogs)).toBe(10);
			stream.queuedLogs = [];
		});

		it('should use maxBatchSize option', function() {
			var maxSize = (largeMessage.length + overhead) * 3 + 1000;
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar',
				maxBatchSize: maxSize
			});

			var willFit = Math.floor(maxSize / (overhead + largeMessage.length));
			var remainder = maxSize - willFit * (overhead + largeMessage.length);

			// Sanity check
			expect(remainder).toBe(1000);

			for (var i = 0; i < willFit; i++) {
				stream.write(largeMessage);
			}

			stream.write(largeMessage.substr(0, remainder - overhead + 1)); // One byte over

			expect(stream.nextLogBatchSize(stream.queuedLogs)).toBe(willFit);
			stream.queuedLogs = [];
		});
	});

	describe('CWLogsWritable#_scheduleSendLogs', function() {
		it('should call process.nextTick if writeInterval is "nextTick"', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar',
				writeInterval: 'nextTick'
			});

			var nextTickSpy = expect.spyOn(process, 'nextTick').andCallThrough();

			return new Promise(function(resolve) {
				stream._sendLogs = expect.createSpy().andCall(resolve);
				stream._scheduleSendLogs();
				expect(nextTickSpy.calls.length).toBe(1);
				expect(nextTickSpy.calls[0].arguments.length).toBe(1);
				expect(nextTickSpy.calls[0].arguments[0]).toBeA('function');
				expect(stream._sendLogs.calls.length).toBe(0);
			})
				.then(function() {
					expect(nextTickSpy.calls.length).toBe(1);
					expect(stream._sendLogs.calls.length).toBe(1);
					expect(stream._sendLogs.calls[0].arguments.length).toBe(0);
				});
		});

		it('should call setTimeout if writeInterval is a number', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar',
				writeInterval: 10
			});

			var setTimeoutSpy = expect.spyOn(global, 'setTimeout').andCallThrough();

			return new Promise(function(resolve) {
				stream._sendLogs = expect.createSpy().andCall(resolve);
				stream._scheduleSendLogs();
				expect(setTimeoutSpy.calls.length).toBe(1);
				expect(setTimeoutSpy.calls[0].arguments.length).toBe(2);
				expect(setTimeoutSpy.calls[0].arguments[0]).toBeA('function');
				expect(setTimeoutSpy.calls[0].arguments[1]).toBe(10);
				expect(stream._sendLogs.calls.length).toBe(0);
			})
				.then(function() {
					expect(setTimeoutSpy.calls.length).toBe(1);
					expect(stream._sendLogs.calls.length).toBe(1);
					expect(stream._sendLogs.calls[0].arguments.length).toBe(0);
				});
		});
	});

	describe('CWLogsWritable#filterWrite', function() {
		it('should return true if not null/undefined', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			expect(stream.filterWrite(null)).toBe(false, 'Expected filterWrite to return %s for null');
			expect(stream.filterWrite(void 0)).toBe(false, 'Expected filterWrite to return %s for undefined');

			[true, false, -1, 0, 1, '', '0', '1', Infinity, -Infinity, {}, [], NaN, noop]
				.forEach(function(val) {
					expect(stream.filterWrite(val)).toBe(true, 'Expected filterWrite to return %s for ' + valToStr(val));
				});
		});
	});

	describe('CWLogsWritable#_write', function() {
		it('should push record to queue', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			var logEventRec;
			var cbSpy = expect.createSpy();
			stream._scheduleSendLogs = expect.createSpy();
			stream.createLogEvent = expect.createSpy().andCall(function(rec) {
				return logEventRec = CWLogsWritable.prototype.createLogEvent(rec);
			});

			expect(stream.writeQueued).toBe(false);

			// Write the first record.
			stream._write('foo', null, cbSpy);

			expect(stream.queuedLogs.length).toBe(1);
			expect(stream.queuedLogs[0]).toBe(logEventRec);
			expect(stream.queuedLogs[0].message).toBe('foo');
			expect(stream.createLogEvent.calls.length).toBe(1);
			expect(stream.createLogEvent.calls[0].arguments.length).toBe(1);
			expect(stream.createLogEvent.calls[0].arguments[0]).toBe('foo');
			expect(stream.writeQueued).toBe(true);
			expect(stream._scheduleSendLogs.calls.length).toBe(1);
			expect(stream._scheduleSendLogs.calls[0].arguments.length).toBe(0);
			expect(cbSpy.calls.length).toBe(1);
			expect(cbSpy.calls[0].arguments.length).toBe(0);

			// Write a second record.
			stream._write('bar', null, cbSpy);

			// On second write, _scheduleSendLogs should NOT have been called.
			expect(stream.queuedLogs.length).toBe(2);
			expect(stream.queuedLogs[1]).toBe(logEventRec);
			expect(stream.queuedLogs[0].message).toBe('foo');
			expect(stream.queuedLogs[1].message).toBe('bar');
			expect(stream.createLogEvent.calls.length).toBe(2);
			expect(stream.createLogEvent.calls[1].arguments.length).toBe(1);
			expect(stream.createLogEvent.calls[1].arguments[0]).toBe('bar');
			expect(stream.writeQueued).toBe(true);
			expect(stream._scheduleSendLogs.calls.length).toBe(1);
			expect(cbSpy.calls.length).toBe(2);
			expect(cbSpy.calls[1].arguments.length).toBe(0);
		});

		it('should call filterWrite', function() {
			var filterWrite = expect.createSpy().andCall(function(rec) {
				return rec === 'okay';
			});

			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar',
				filterWrite: filterWrite
			});

			stream._scheduleSendLogs = expect.createSpy();

			stream._write('excl', null, noop);
			expect(filterWrite.calls.length).toBe(1);
			expect(filterWrite.calls[0].context).toBe(stream);
			expect(filterWrite.calls[0].arguments.length).toBe(1);
			expect(filterWrite.calls[0].arguments[0]).toBe('excl');
			expect(stream.queuedLogs.length).toBe(0);
			expect(stream.writeQueued).toBe(false);
			expect(stream._scheduleSendLogs.calls.length).toBe(0);

			stream._write('okay', null, noop);
			expect(filterWrite.calls.length).toBe(2);
			expect(filterWrite.calls[1].arguments.length).toBe(1);
			expect(filterWrite.calls[1].arguments[0]).toBe('okay');
			expect(stream.queuedLogs.length).toBe(1);
			expect(stream.writeQueued).toBe(true);
			expect(stream._scheduleSendLogs.calls.length).toBe(1);
		});
	});

	describe('CWLogsWritable#_sendLogs', function() {
		it('should first call _getSequenceToken if sequence token not set', function(done) {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			stream.writeQueued = true;

			var getSequenceTokenSpy = expect.spyOn(stream, '_getSequenceToken').andCallThrough();
			var nextLogBatchSizeSpy = expect.spyOn(stream, 'nextLogBatchSize').andCallThrough();

			stream._sendLogs();
			expect(getSequenceTokenSpy.calls.length).toBe(1);
			expect(getSequenceTokenSpy.calls[0].arguments.length).toBe(1);
			expect(getSequenceTokenSpy.calls[0].arguments[0]).toBeA('function');
			expect(nextLogBatchSizeSpy.calls.length).toBe(0);

			// Intercept _sendLogs call after the sequence is fetched.
			stream._sendLogs = expect.createSpy().andCall(function() {
				expect(stream.sequenceToken).toBe('first-magic-token');
				expect(getSequenceTokenSpy.calls.length).toBe(1);
				expect(nextLogBatchSizeSpy.calls.length).toBe(0);
				done();
			});
		});

		it('should handle error from _getSequenceToken', function(done) {
			var expectedError = new Error();
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar',
				cloudWatchLogsOptions: {
					describeLogStreams: function(params, cb) {
						process.nextTick(function() {
							cb(expectedError);
						});
					}
				}
			});

			stream.writeQueued = true;
			var oldNextCbId = this._onErrorNextCbId;

			var getSequenceTokenSpy = expect.spyOn(stream, '_getSequenceToken').andCallThrough();
			var nextLogBatchSizeSpy = expect.spyOn(stream, 'nextLogBatchSize').andCallThrough();

			stream._nextAfterError = expect.createSpy().andCall(function() {
				expect(arguments.length).toBe(2);
				expect(arguments[0]).toBe(this._onErrorNextCbId);
				expect(arguments[1]).toBe('foo');
				done();
			});

			stream.onError = expect.createSpy().andCall(function() {
				expect(this._onErrorNextCbId).toNotBe(oldNextCbId);
				expect(stream.sequenceToken).toBe(null);
				expect(getSequenceTokenSpy.calls.length).toBe(1);
				expect(nextLogBatchSizeSpy.calls.length).toBe(0);
				expect(arguments.length).toBe(3);
				expect(arguments[0]).toBe(expectedError);
				expect(arguments[1]).toBe(null);
				expect(arguments[2]).toBeA('function');

				// Call 'next'
				arguments[2]('foo');
			});

			stream._sendLogs();
			expect(getSequenceTokenSpy.calls.length).toBe(1);
			expect(getSequenceTokenSpy.calls[0].arguments.length).toBe(1);
			expect(getSequenceTokenSpy.calls[0].arguments[0]).toBeA('function');
			expect(nextLogBatchSizeSpy.calls.length).toBe(0);

			// Intercept _sendLogs call after the sequence is fetched.
			stream._sendLogs = function() {
				throw new Error('Expected not to be called');
			};
		});

		it('should skip if queue is empty', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			stream.writeQueued = true;
			stream.sequenceToken = 'foo-token';

			stream._getSequenceToken = function() {
				throw new Error('Expected not to be called')
			};

			stream.nextLogBatchSize = function() {
				throw new Error('Expected not to be called')
			};

			stream._sendLogs();
			expect(stream.writeQueued).toBe(false);
		});

		it('should get batch size, remove it from the queue, and call _putLogEvents', function(done) {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			stream._basePutSize = 10;
			stream.writeQueued = true;
			stream.sequenceToken = 'seq';

			var origQueue;

			var putLogEventsEventSpy = expect.createSpy();
			stream.on('putLogEvents', putLogEventsEventSpy);

			stream._scheduleSendLogs = function() {
				throw new Error('Expected not to be called')
			};

			stream._getSequenceToken = function() {
				throw new Error('Expected not to be called')
			};

			var nextLogBatchSizeSpy = expect.spyOn(stream, 'nextLogBatchSize').andCall(function() {
				expect(this).toBe(stream);
				expect(arguments.length).toBe(1);
				expect(arguments[0]).toBe(this.queuedLogs);
				return 2;
			});

			var putLogEventsSpy = expect.spyOn(stream, '_putLogEvents').andCall(function() {
				expect(this).toBe(stream);
				expect(arguments.length).toBe(2);
				expect(arguments[0]).toBeA('object');
				expect(Object.keys(arguments[0])).toEqual([
					'logGroupName',
					'logStreamName',
					'sequenceToken',
					'logEvents'
				]);
				expect(arguments[0].logGroupName).toBe('foo');
				expect(arguments[0].logStreamName).toBe('bar');
				expect(arguments[0].sequenceToken).toBe('seq');
				expect(arguments[0].logEvents).toBeA('array');
				expect(arguments[0].logEvents.length).toBe(2);
				expect(arguments[0].logEvents[0]).toBe(origQueue[0]);
				expect(arguments[0].logEvents[1]).toBe(origQueue[1]);
				expect(arguments[1]).toBeA('function');

				// Call callback
				expect(putLogEventsEventSpy.calls.length).toBe(0);
				arguments[1](null, 'next-seq');
				expect(stream.sequenceToken === 'next-seq');
				expect(putLogEventsEventSpy.calls.length).toBe(1);
				expect(putLogEventsEventSpy.calls[0].arguments.length).toBe(1);
				expect(putLogEventsEventSpy.calls[0].arguments[0]).toBe(arguments[0].logEvents);
				expect(stream.writeQueued).toBe(false);
				done();
			});

			stream._write('foo', null, noop);
			stream._write('bar', null, noop);
			expect(stream.queuedLogs.length).toBe(2);
			origQueue = stream.queuedLogs.slice(0);

			stream._sendLogs();

			expect(nextLogBatchSizeSpy.calls.length).toBe(1);
			expect(putLogEventsSpy.calls.length).toBe(1);

			expect(stream.queuedLogs.length).toBe(0);
			expect(stream.writeQueued).toBe(true);
		});

		it('should handle error from _putLogEvents', function(done) {
			var expectedError = new Error();
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			stream.writeQueued = true;
			stream.sequenceToken = 'seq';

			stream._scheduleSendLogs = function() {
				throw new Error('Expected not to be called')
			};

			stream._getSequenceToken = function() {
				throw new Error('Expected not to be called')
			};

			stream._putLogEvents = function(params, cb) {
				process.nextTick(function() {
					cb(expectedError);
				});
			};

			stream._write('foo', null, noop);
			var firstQueueLog = stream.queuedLogs[0];

			var oldNextCbId = this._onErrorNextCbId;

			stream._nextAfterError = expect.createSpy().andCall(function() {
				expect(arguments.length).toBe(2);
				expect(arguments[0]).toBe(this._onErrorNextCbId);
				expect(arguments[1]).toBe('foo');
				done();
			});

			stream.onError = expect.createSpy().andCall(function() {
				expect(this._onErrorNextCbId).toNotBe(oldNextCbId);
				expect(arguments.length).toBe(3);
				expect(arguments[0]).toBe(expectedError);
				expect(arguments[1]).toBeA('array');
				expect(arguments[1].length).toBe(1);
				expect(arguments[1][0]).toBe(firstQueueLog);
				expect(arguments[2]).toBeA('function');

				// Call 'next'
				arguments[2]('foo');
			});

			stream._sendLogs();
			expect(stream.queuedLogs.length).toBe(0);
		});

		it('should set next sequence token and call _scheduleSendLogs if queue is not empty', function(done) {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			stream.writeQueued = true;
			stream.sequenceToken = 'seq';

			var origQueue;

			var putLogEventsEventSpy = expect.createSpy();
			stream.on('putLogEvents', putLogEventsEventSpy);

			stream._scheduleSendLogs = expect.createSpy();

			stream._getSequenceToken = function() {
				throw new Error('Expected not to be called')
			};

			stream.nextLogBatchSize = function() {
				return 1;
			};

			stream._putLogEvents = function() {
				expect(stream.queuedLogs.length).toBe(1);
				expect(arguments[0].logEvents.length).toBe(1);
				expect(arguments[0].logEvents[0]).toBe(origQueue[0]);

				// Call callback
				expect(putLogEventsEventSpy.calls.length).toBe(0);
				expect(stream._scheduleSendLogs.calls.length).toBe(0);
				arguments[1](null, 'next-seq');
				expect(stream.sequenceToken === 'next-seq');
				expect(putLogEventsEventSpy.calls.length).toBe(1);
				expect(putLogEventsEventSpy.calls[0].arguments.length).toBe(1);
				expect(putLogEventsEventSpy.calls[0].arguments[0]).toBe(arguments[0].logEvents);
				expect(stream.writeQueued).toBe(true);
				expect(stream._scheduleSendLogs.calls.length).toBe(1);
				expect(stream._scheduleSendLogs.calls[0].arguments.length).toBe(0);
				done();
			};

			stream._write('foo', null, noop);
			stream._write('bar', null, noop);
			expect(stream.queuedLogs.length).toBe(2);
			origQueue = stream.queuedLogs.slice(0);

			stream._sendLogs();

			expect(stream.queuedLogs.length).toBe(1);
			expect(stream.queuedLogs[0]).toBe(origQueue[1]);
			expect(stream.writeQueued).toBe(true);
		});
	});

	describe('CWLogsWritable#_nextAfterError', function() {
		it('should abort if nextCbId doesn\'t match', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			stream._handleError = function() {
				throw new Error('Expected not to be called');
			};

			stream._scheduleSendLogs = function() {
				throw new Error('Expected not to be called');
			};

			expect(stream._onErrorNextCbId).toBeA('number');

			stream._nextAfterError(stream._onErrorNextCbId + 1);
		});

		it('should increment nextCbId, reset sequence token, and call _scheduleSendLogs', function() {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			expect(stream._onErrorNextCbId).toBeA('number');
			stream.sequenceToken = 'seq';

			stream._handleError = function() {
				throw new Error('Expected not to be called');
			};

			var scheduleSendLogsSpy = expect.spyOn(stream, '_scheduleSendLogs');

			var oldNextCbId = stream._onErrorNextCbId;
			expect(scheduleSendLogsSpy.calls.length).toBe(0);
			stream._nextAfterError(stream._onErrorNextCbId);

			expect(stream.sequenceToken).toBe(null);
			expect(stream._onErrorNextCbId).toNotBe(oldNextCbId);
			expect(scheduleSendLogsSpy.calls.length).toBe(1);
			expect(scheduleSendLogsSpy.calls[0].arguments.length).toBe(0);
		});

		it('should return log events to the head of the queue, if supplied', function() {
			var expectedRecA = {};
			var expectedRecB = {};
			var expectedRecC = {};
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			expect(stream._onErrorNextCbId).toBeA('number');
			stream.sequenceToken = 'seq';

			stream._handleError = function() {
				throw new Error('Expected not to be called');
			};

			var scheduleSendLogsSpy = expect.spyOn(stream, '_scheduleSendLogs').andCall(function() {
				expect(stream.queuedLogs.length).toBe(1);
				expect(stream.queuedLogs[0]).toBe(expectedRecA);
			});

			expect(stream.queuedLogs.length).toBe(0);

			stream._nextAfterError(++stream._onErrorNextCbId, [expectedRecA]);

			expect(scheduleSendLogsSpy.calls.length).toBe(1);

			scheduleSendLogsSpy.restore();
			scheduleSendLogsSpy = expect.spyOn(stream, '_scheduleSendLogs').andCall(function() {
				expect(stream.queuedLogs.length).toBe(3);
				expect(stream.queuedLogs[0]).toBe(expectedRecB);
				expect(stream.queuedLogs[1]).toBe(expectedRecC);
				expect(stream.queuedLogs[2]).toBe(expectedRecA);
			});

			stream._nextAfterError(++stream._onErrorNextCbId, [expectedRecB, expectedRecC]);
			expect(scheduleSendLogsSpy.calls.length).toBe(1);
		});

		it('should call _handleError if err arg is provided', function() {
			var expectedErr = new Error();
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			var handleErrorSpy = expect.spyOn(stream, '_handleError');

			stream._scheduleSendLogs = function() {
				throw new Error('Expected not to be called');
			};

			expect(stream._onErrorNextCbId).toBeA('number');

			var oldNextCbId = stream._onErrorNextCbId;
			expect(handleErrorSpy.calls.length).toBe(0);
			stream._nextAfterError(stream._onErrorNextCbId, expectedErr);

			expect(stream.sequenceToken).toBe(null);
			expect(stream._onErrorNextCbId).toNotBe(oldNextCbId);
			expect(handleErrorSpy.calls.length).toBe(1);
			expect(handleErrorSpy.calls[0].arguments.length).toBe(1);
			expect(handleErrorSpy.calls[0].arguments[0]).toBe(expectedErr);
		});
	});

	describe('CWLogsWritable#_putLogEvents', function() {
		it('should call cloudwatch.putLogEvents and return next sequence token', function(done) {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			var apiParams = {};

			stream._putLogEvents(apiParams, function() {
				expect(stream.cloudwatch.putLogEvents.calls.length).toBe(1);
				expect(arguments.length).toBe(2);
				expect(arguments[0]).toBe(null);
				expect(arguments[1]).toBe('next-magic-token');
				done();
			});

			expect(stream.cloudwatch.putLogEvents.calls.length).toBe(1);
			expect(stream.cloudwatch.putLogEvents.calls[0].arguments.length).toBe(2);
			expect(stream.cloudwatch.putLogEvents.calls[0].arguments[0]).toBe(apiParams);
			expect(stream.cloudwatch.putLogEvents.calls[0].arguments[1]).toBeA('function');
		});

		it('should retry up to retryableMax on AWS errors that are "retryable"', function(done) {
			var expectedError = objectAssign(new Error(), {
				retryable: true
			});

			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar',
				retryableDelay: 1,
				retryableMax: 5,
				cloudWatchLogsOptions: {
					putLogEvents: function(apiParams, cb) {
						process.nextTick(function() {
							cb(expectedError);
						});
					}
				}
			});

			var setTimeoutSpy = expect.spyOn(global, 'setTimeout').andCallThrough();

			stream._putLogEvents({}, function() {
				expect(stream.cloudwatch.putLogEvents.calls.length).toBe(6);
				expect(setTimeoutSpy.calls.length).toBe(5);

				// Just check first setTimeout call
				expect(setTimeoutSpy.calls[0].arguments.length).toBe(2);
				expect(setTimeoutSpy.calls[0].arguments[1]).toBe(1);

				expect(arguments.length).toBe(1);
				expect(arguments[0]).toBe(expectedError);
				done();
			});
		});

		it('should retry up using process.nextTick if retryableDelay is "nextTick"', function(done) {
			var expectedError = objectAssign(new Error(), {
				retryable: true
			});

			var nextTickNoSpy = process.nextTick.bind(process);

			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar',
				retryableDelay: 'nextTick',
				retryableMax: 5,
				cloudWatchLogsOptions: {
					putLogEvents: function(apiParams, cb) {
						nextTickNoSpy(function() {
							cb(expectedError);
						});
					}
				}
			});

			var nextTickSpy = expect.spyOn(process, 'nextTick').andCallThrough();

			stream._putLogEvents({}, function() {
				expect(stream.cloudwatch.putLogEvents.calls.length).toBe(6);
				expect(nextTickSpy.calls.length).toBe(5);
				expect(arguments.length).toBe(1);
				expect(arguments[0]).toBe(expectedError);
				done();
			});
		});

		it('should not retry non-"retryable" AWS errors', function(done) {
			var expectedError = new Error();
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar',
				cloudWatchLogsOptions: {
					putLogEvents: function(apiParams, cb) {
						process.nextTick(function() {
							cb(expectedError);
						});
					}
				}
			});

			stream._putLogEvents({}, function() {
				expect(stream.cloudwatch.putLogEvents.calls.length).toBe(1);
				expect(arguments.length).toBe(1);
				expect(arguments[0]).toBe(expectedError);
				done();
			});
		});
	});

	describe('CWLogsWritable#_getSequenceToken', function() {
		it('should return next sequence token', function(done) {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			stream._getSequenceToken(function(err, seq) {
				expect(stream.cloudwatch.describeLogStreams.calls.length).toBe(1);

				var calls0 = stream.cloudwatch.describeLogStreams.calls[0];
				expect(calls0.arguments.length).toBe(2);
				expect(calls0.arguments[0]).toBeA('object');
				expect(Object.keys(calls0.arguments[0])).toEqual(['logGroupName', 'logStreamNamePrefix']);
				expect(calls0.arguments[0].logGroupName).toBe('foo');
				expect(calls0.arguments[0].logStreamNamePrefix).toBe('bar');
				expect(calls0.arguments[1]).toBeA('function');

				expect(arguments.length).toBe(2);
				expect(arguments[0]).toBe(null);
				expect(arguments[1]).toBe('first-magic-token');
				done();
			});
		});

		it('should call _createLogGroupAndStream for "ResourceNotFoundException" errors and call _getSequenceToken again', function(done) {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar',
				cloudWatchLogsOptions: {
					describeLogStreams: function(apiParams, cb) {
						process.nextTick(function() {
							cb(objectAssign(new Error(), {
								name: 'ResourceNotFoundException'
							}));
						});
					}
				}
			});

			var cb = function() {
				throw new Error('Expected not to be called');
			};

			var createLogGroupAndStreamSpy = expect.spyOn(stream, '_createLogGroupAndStream').andCall(function(cb) {
				process.nextTick(function() {
					cb();
				});
			});

			stream._getSequenceToken = function() {
				// Override _getSequenceToken for the second call.
				stream._getSequenceToken = function() {
					expect(createLogGroupAndStreamSpy.calls.length).toBe(1);
					expect(createLogGroupAndStreamSpy.calls[0].arguments.length).toBe(1);
					expect(createLogGroupAndStreamSpy.calls[0].arguments[0]).toBeA('function');

					expect(arguments.length).toBe(1);
					expect(arguments[0]).toBe(cb);
					done();
				};

				// Call through on the first call.
				return CWLogsWritable.prototype._getSequenceToken.apply(this, arguments);
			};

			stream._getSequenceToken(cb);
		});

		it('should call _createLogStream and emit event if no streams for group and call _getSequenceToken again', function(done) {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar',
				cloudWatchLogsOptions: {
					describeLogStreams: function(apiParams, cb) {
						process.nextTick(function() {
							cb(null, {
								logStreams: []
							});
						});
					}
				}
			});

			var cb = function() {
				throw new Error('Expected not to be called');
			};

			var createLogStreamSpy = expect.spyOn(stream, '_createLogStream').andCall(function(cb) {
				process.nextTick(function() {
					cb();
				});
			});

			var createLogStreamEventSpy = expect.createSpy();
			stream.on('createLogStream', createLogStreamEventSpy);

			stream._getSequenceToken = function() {
				// Override _getSequenceToken for the second call.
				stream._getSequenceToken = function() {
					expect(createLogStreamSpy.calls.length).toBe(1);
					expect(createLogStreamSpy.calls[0].arguments.length).toBe(1);
					expect(createLogStreamSpy.calls[0].arguments[0]).toBeA('function');
					expect(createLogStreamEventSpy.calls.length).toBe(1);
					expect(createLogStreamEventSpy.calls[0].arguments.length).toBe(0);

					expect(arguments.length).toBe(1);
					expect(arguments[0]).toBe(cb);
					done();
				};

				expect(createLogStreamEventSpy.calls.length).toBe(0);

				// Call through on the first call.
				return CWLogsWritable.prototype._getSequenceToken.apply(this, arguments);
			};

			stream._getSequenceToken(cb);
		});

		it('should pass through error from cloudwatch.describeLogStreams', function(done) {
			var expectedError = new Error();
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar',
				cloudWatchLogsOptions: {
					describeLogStreams: function(apiParams, cb) {
						process.nextTick(function() {
							cb(expectedError);
						});
					}
				}
			});

			stream._createLogGroupAndStream = function() {
				throw new Error('Expected not to be called');
			};

			stream._createLogStream = function() {
				throw new Error('Expected not to be called');
			};

			stream._getSequenceToken(function() {
				expect(arguments.length).toBe(1);
				expect(arguments[0]).toBe(expectedError);
				done();
			});
		});

		it('should pass through error from _createLogGroupAndStream', function(done) {
			var expectedError = new Error();
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar',
				cloudWatchLogsOptions: {
					describeLogStreams: function(apiParams, cb) {
						process.nextTick(function() {
							cb(objectAssign(new Error(), {
								name: 'ResourceNotFoundException'
							}));
						});
					}
				}
			});

			stream._createLogGroupAndStream = function(cb) {
				process.nextTick(function() {
					cb(expectedError);
				});
			};

			stream._createLogStream = function() {
				throw new Error('Expected not to be called');
			};

			stream._getSequenceToken(function() {
				expect(arguments.length).toBe(1);
				expect(arguments[0]).toBe(expectedError);
				done();
			});
		});

		it('should pass through error from _createLogStream', function() {
			var expectedError = new Error();
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar',
				cloudWatchLogsOptions: {
					describeLogStreams: function(apiParams, cb) {
						process.nextTick(function() {
							cb(null, {
								logStreams: []
							});
						});
					}
				}
			});

			stream._createLogGroupAndStream = function(cb) {
				throw new Error('Expected not to be called');
			};

			stream._createLogStream = function() {
				process.nextTick(function() {
					cb(expectedError);
				});
			};

			stream._getSequenceToken(function() {
				expect(arguments.length).toBe(1);
				expect(arguments[0]).toBe(expectedError);
				done();
			});
		});
	});

	describe('CWLogsWritable#_createLogGroupAndStream', function() {
		it('should call _createLogGroup then _createLogStream and emit events', function(done) {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			var createLogGroupEventSpy = expect.createSpy();
			stream.on('createLogGroup', createLogGroupEventSpy);

			var createLogStreamEventSpy = expect.createSpy();
			stream.on('createLogStream', createLogStreamEventSpy);

			var createLogGroupSpy = expect.spyOn(stream, '_createLogGroup').andCall(function(cb) {
				expect(createLogGroupSpy.calls.length).toBe(1);
				expect(createLogStreamSpy.calls.length).toBe(0);
				expect(createLogGroupEventSpy.calls.length).toBe(0);
				process.nextTick(function() {
					cb();
				});
			});

			var createLogStreamSpy = expect.spyOn(stream, '_createLogStream').andCall(function(cb) {
				expect(createLogGroupSpy.calls.length).toBe(1);
				expect(createLogStreamSpy.calls.length).toBe(1);
				expect(createLogGroupEventSpy.calls.length).toBe(1);
				expect(createLogGroupEventSpy.calls[0].arguments.length).toBe(0);
				process.nextTick(function() {
					cb();
				});
			});

			stream._createLogGroupAndStream(function() {
				expect(arguments.length).toBe(0);
				expect(createLogGroupSpy.calls.length).toBe(1);
				expect(createLogStreamSpy.calls.length).toBe(1);
				expect(createLogStreamEventSpy.calls.length).toBe(1);
				expect(createLogStreamEventSpy.calls[0].arguments.length).toBe(0);
				done();
			});
		});

		it('should pass through error from _createLogGroup', function(done) {
			var expectedError = new Error();
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			stream._createLogGroup = function(cb) {
				process.nextTick(function() {
					cb(expectedError);
				});
			};

			stream._createLogStream = function() {
				throw new Error('Expected to not be called');
			};

			stream._createLogGroupAndStream(function() {
				expect(arguments.length).toBe(1);
				expect(arguments[0]).toBe(expectedError);
				done();
			});
		});

		it('should pass through error from _createLogStream', function(done) {
			var expectedError = new Error();
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			stream._createLogGroup = function(cb) {
				process.nextTick(function() {
					cb();
				});
			};

			stream._createLogStream = function(cb) {
				process.nextTick(function() {
					cb(expectedError);
				});
			};

			stream._createLogGroupAndStream(function() {
				expect(arguments.length).toBe(1);
				expect(arguments[0]).toBe(expectedError);
				done();
			});
		});
	});

	describe('CWLogsWritable#_createLogGroup', function() {
		it('should call cloudwatch.createLogGroup', function(done) {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			var cb = function() {
				done();
			};

			stream._createLogGroup(cb);

			expect(stream.cloudwatch.createLogGroup.calls.length).toBe(1);
			expect(stream.cloudwatch.createLogGroup.calls[0].arguments.length).toBe(2);
			expect(stream.cloudwatch.createLogGroup.calls[0].arguments[0]).toBeA('object');
			expect(Object.keys(stream.cloudwatch.createLogGroup.calls[0].arguments[0])).toEqual(['logGroupName']);
			expect(stream.cloudwatch.createLogGroup.calls[0].arguments[0].logGroupName).toBe('foo');
			expect(stream.cloudwatch.createLogGroup.calls[0].arguments[1]).toBe(cb);
		});
	});

	describe('CWLogsWritable#_createLogStream', function() {
		it('should call cloudwatch.createLogStream', function(done) {
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			var cb = function() {
				done();
			};

			stream._createLogStream(cb);

			expect(stream.cloudwatch.createLogStream.calls.length).toBe(1);
			expect(stream.cloudwatch.createLogStream.calls[0].arguments.length).toBe(2);
			expect(stream.cloudwatch.createLogStream.calls[0].arguments[0]).toBeA('object');
			expect(Object.keys(stream.cloudwatch.createLogStream.calls[0].arguments[0])).toEqual(['logGroupName', 'logStreamName']);
			expect(stream.cloudwatch.createLogStream.calls[0].arguments[0].logGroupName).toBe('foo');
			expect(stream.cloudwatch.createLogStream.calls[0].arguments[0].logStreamName).toBe('bar');
			expect(stream.cloudwatch.createLogStream.calls[0].arguments[1]).toBe(cb);
		});
	});

	describe('CWLogsWritable#_handleError', function() {
		it('should emit "error" event, call clearQueue, and replace filterWrite', function() {
			var expectedError = new Error();
			var stream = new CWLogsWritable({
				logGroupName: 'foo',
				logStreamName: 'bar'
			});

			var clearQueueSpy = expect.spyOn(stream, 'clearQueue');

			var errorEventSpy = expect.createSpy().andCall(function() {
				expect(clearQueueSpy.calls.length).toBe(0);
				expect(arguments.length).toBe(1);
				expect(arguments[0]).toBe(expectedError);
			});
			stream.on('error', errorEventSpy);

			stream._handleError(expectedError);
			expect(errorEventSpy.calls.length).toBe(1);
			expect(clearQueueSpy.calls.length).toBe(1);
			expect(stream.filterWrite).toBe(CWLogsWritable._falseFilterWrite);
		});
	});
});

function createAWSStub() {
	function CloudWatchLogsStub(options) {
		options = options || {};

		if (options.constructor) {
			options.constructor.call(this, options);
		}

		Object.keys(CloudWatchLogsStub.prototype)
			.forEach(function(method) {
				if (typeof this[method] === 'function') {
					this[method] = expect.createSpy()
						.andCall(options[method] || this[method]);
				}
			}.bind(this));
	}

	objectAssign(CloudWatchLogsStub.prototype, {
		describeLogStreams: function(params, cb) {
			// console.log('describeLogStreams');
			process.nextTick(function() {
				cb(null, {
					logStreams: [
						{ uploadSequenceToken: 'first-magic-token' }
					]
				});
			});
		},
		putLogEvents: function(params, cb) {
			// console.log('putLogEvents');
			process.nextTick(function() {
				cb(null, { nextSequenceToken: 'next-magic-token' });
			});
		},
		createLogGroup: function(params, cb) {
			// console.log('createLogGroup');
			process.nextTick(function() {
				cb();
			});
		},
		createLogStream: function(params, cb) {
			// console.log('createLogStream');
			process.nextTick(function() {
				cb();
			});
		}
	});

	return {
		CloudWatchLogs: CloudWatchLogsStub
	};
}

function valToStr(val) {
	return typeof val === 'function'
		? 'function'
		: val == null || isNaN(val) || val === -Infinity || val === Infinity
			? String(val)
			: val === -Infinity
				? '-Infinity'
				: JSON.stringify(val);
}
