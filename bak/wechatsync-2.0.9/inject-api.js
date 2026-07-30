(function() {
  console.log('api ready');

  var poster = {
    versionNumber: 1001,
    dev: location.hostname === 'localhost' || location.hostname === '127.0.0.1',
  };

  var eventCb = {};
  var _statueandler = null;
  var _consolehandler = null;

  function callFunc(msg, cb) {
    msg.eventID = Math.floor(Date.now() + Math.random() * 100);
    eventCb[msg.eventID] = function(err, res) {
      cb(err, res);
    };
    window.postMessage(JSON.stringify(msg), '*');
  }

  poster.getAccounts = function(cb) {
    callFunc(
      {
        method: 'getAccounts',
      },
      cb
    );
  };

  poster.addTask = function(task, statueandler, cb) {
    _statueandler = statueandler;
    callFunc(
      {
        method: 'addTask',
        task: task,
      },
      cb
    );
  };

  poster.magicCall = function(data, cb) {
    callFunc(
      {
        method: 'magicCall',
        methodName: data.methodName,
        data: data,
      },
      cb
    );
  };

  poster.updateDriver = function(data, cb) {
    callFunc(
      {
        method: 'updateDriver',
        data: data,
      },
      cb
    );
  };

  poster.startInspect = function(handler, cb) {
    _consolehandler = handler;
    callFunc(
      {
        method: 'startInspect',
      },
      cb
    );
  };

  poster.uploadImage = function(data, cb) {
    callFunc(
      {
        method: 'magicCall',
        methodName: 'uploadImage',
        data: data,
      },
      cb
    );
  };

  window.addEventListener('message', function(evt) {
    try {
      var action = JSON.parse(evt.data);
      if (action.method && action.method === 'taskUpdate') {
        if (_statueandler != null) _statueandler(action.task);
        return;
      }

      if (action.method && action.method === 'consoleLog') {
        if (_consolehandler != null) _consolehandler(action.args);
        return;
      }
      if (!action.callReturn) return;
      if (action.eventID && eventCb[action.eventID]) {
        eventCb[action.eventID](action.result);
        delete eventCb[action.eventID];
      }
    } catch (e) {}
  });

  window.$poster = poster;
  window.$syncer = poster;
})();
