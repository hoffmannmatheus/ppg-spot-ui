var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = babelHelpers.interopRequireDefault(_ParsePromise);

var TaskQueue = function () {
  function TaskQueue() {
    babelHelpers.classCallCheck(this, TaskQueue);

    this.queue = [];
  }

  babelHelpers.createClass(TaskQueue, [{
    key: 'enqueue',
    value: function enqueue(task) {
      var _this = this;

      var taskComplete = new _ParsePromise2.default();
      this.queue.push({
        task: task,
        _completion: taskComplete
      });
      if (this.queue.length === 1) {
        task().then(function () {
          _this._dequeue();
          taskComplete.resolve();
        }, function (error) {
          _this._dequeue();
          taskComplete.reject(error);
        });
      }
      return taskComplete;
    }
  }, {
    key: '_dequeue',
    value: function _dequeue() {
      var _this2 = this;

      this.queue.shift();
      if (this.queue.length) {
        var next = this.queue[0];
        next.task().then(function () {
          _this2._dequeue();
          next._completion.resolve();
        }, function (error) {
          _this2._dequeue();
          next._completion.reject(error);
        });
      }
    }
  }]);
  return TaskQueue;
}();

module.exports = TaskQueue;