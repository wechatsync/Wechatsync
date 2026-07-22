(function() {
  console.log('api ready');

  var BRIDGE_NAMESPACE = 'vibemarket.syncer.bridge';
  var BRIDGE_API_VERSION = '2.0';
  var BRIDGE_REQUEST_DIRECTION = 'PAGE_TO_EXTENSION';
  var BRIDGE_RESPONSE_DIRECTION = 'EXTENSION_TO_PAGE';

  var poster = {
    versionNumber: 1001,
    dev: location.hostname === 'localhost' || location.hostname === '127.0.0.1',
  };

  var eventCb = {};
  var bridgeEventCb = {};
  var _statueandler = null;
  var _consolehandler = null;

  function callFunc(msg, cb) {
    msg.eventID = Math.floor(Date.now() + Math.random() * 100);
    eventCb[msg.eventID] = function(err, res) {
      cb(err, res);
    };
    window.postMessage(JSON.stringify(msg), '*');
  }

  function createBridgeRequestId() {
    return 'bridge_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
  }

  function callBridge(method, payload, cb, requestId) {
    var id = requestId || createBridgeRequestId();
    bridgeEventCb[id] = {
      method: method,
      callback: typeof cb === 'function' ? cb : function() {},
    };

    window.postMessage(
      {
        namespace: BRIDGE_NAMESPACE,
        apiVersion: BRIDGE_API_VERSION,
        direction: BRIDGE_REQUEST_DIRECTION,
        requestId: id,
        method: method,
        payload: payload || {},
      },
      location.origin
    );
  }

  poster.getAccounts = function(cb) {
    callFunc(
      {
        method: 'getAccounts',
      },
      cb
    );
  };

  poster.getBridgeInfo = function(cb) {
    callBridge('getBridgeInfo', {}, cb);
  };

  poster.getAccountsV2 = function(options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
    callBridge('getAccountsV2', options || {}, cb);
  };

  poster.inspectPublication = function(request, cb) {
    callBridge(
      'inspectPublication',
      request,
      cb,
      request && request.requestId
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
      if (
        evt.source === window &&
        evt.origin === location.origin &&
        evt.data &&
        typeof evt.data === 'object' &&
        evt.data.namespace === BRIDGE_NAMESPACE &&
        evt.data.apiVersion === BRIDGE_API_VERSION &&
        evt.data.direction === BRIDGE_RESPONSE_DIRECTION
      ) {
        var bridgeCallback = bridgeEventCb[evt.data.requestId];
        if (!bridgeCallback || bridgeCallback.method !== evt.data.method) return;

        if (evt.data.ok) {
          bridgeCallback.callback(null, evt.data.result);
        } else {
          bridgeCallback.callback(evt.data.error || {
            code: 'UNKNOWN_ERROR',
            message: 'Bridge request failed',
          });
        }
        delete bridgeEventCb[evt.data.requestId];
        return;
      }

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
