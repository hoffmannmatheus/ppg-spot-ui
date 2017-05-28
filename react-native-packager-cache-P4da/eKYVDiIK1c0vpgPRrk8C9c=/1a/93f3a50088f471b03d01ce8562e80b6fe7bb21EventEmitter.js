

{
  var EventEmitter = require('EventEmitter');
  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  module.exports = EventEmitter;
}