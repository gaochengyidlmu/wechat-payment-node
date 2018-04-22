'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _urls = require('./urls');

var _urls2 = _interopRequireDefault(_urls);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WechatPayment = function () {
    function WechatPayment(options) {
        (0, _classCallCheck3.default)(this, WechatPayment);

        if (!options.appid || !options.mch_id) {
            throw new Error("Seems that app id or merchant id is not set, please provide wechat app id and merchant id.");
            //throw new Error('haha');
        }
        this.options = options;
    }

    /**
     * create wechat unified order
     * @params order object
     * 
     * spec: https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_1
     */

    (0, _createClass3.default)(WechatPayment, [{
        key: 'createUnifiedOrder',
        value: function createUnifiedOrder(order) {
            var _this2 = this;

            return new _promise2.default(function (resolve, reject) {
                order.nonce_str = order.nonce_str || _utils2.default.createNonceStr();
                order.appid = _this2.options.appid;
                order.mch_id = _this2.options.mch_id;
                order.sign = _utils2.default.sign(order, _this2.options.apiKey);
                var requestParam = {
                    url: _urls2.default.UNIFIED_ORDER,
                    method: 'POST',
                    body: _utils2.default.buildXML(order)
                };
                (0, _request2.default)(requestParam, function (err, response, body) {
                    if (err) {
                        reject(err);
                    }
                    _utils2.default.parseXML(body).then(function (result) {
                        resolve(result);
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            });
        }

        /**
         * config for payment 
         * 
         * @param prepayId from prepay id
         */

    }, {
        key: 'configForPayment',
        value: function configForPayment(prepayId) {
            var configData = {
                appid: this.options.appid,
                partnerid: this.options.mch_id,
                prepayid: prepayId,
                package: 'Sign=WXPay',
                noncestr: _utils2.default.createNonceStr(),
                timestamp: parseInt(new Date().getTime() / 1000).toString()
            };
            configData.sign = _utils2.default.sign(configData, this.options.apiKey);
            return configData;
        }

        /**
         * query
         * 
         * 
         * spec: https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_2
         */

    }, {
        key: 'queryOrder',
        value: function queryOrder(query) {
            var _this3 = this;

            return new _promise2.default(function (resolve, reject) {
                if (!(query.transaction_id || query.out_trade_no)) {
                    reject(new Error('缺少参数'));
                }

                query.nonce_str = query.nonce_str || _utils2.default.createNonceStr();
                query.appid = _this3.options.appid;
                query.mch_id = _this3.options.mch_id;
                query.sign = _utils2.default.sign(query, _this3.options.apiKey);

                (0, _request2.default)({
                    url: _urls2.default.ORDER_QUERY,
                    method: "POST",
                    body: _utils2.default.buildXML({ xml: query })
                }, function (err, res, body) {
                    _utils2.default.parseXML(body).then(function (result) {
                        resolve(result);
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            });
        }
    }, {
        key: 'closeOrder',
        value: function closeOrder(order) {
            var _this4 = this;

            return new _promise2.default(function (resolve, reject) {
                if (!order.out_trade_no) {
                    reject(new Error('缺少参数'));
                }

                order.nonce_str = order.nonce_str || _utils2.default.createNonceStr();
                order.appid = _this4.options.appid;
                order.mch_id = _this4.options.mch_id;
                order.sign = _utils2.default.sign(order, _this4.options.apiKey);

                (0, _request2.default)({
                    url: _urls2.default.CLOSE_ORDER,
                    method: "POST",
                    body: _utils2.default.buildXML({ xml: order })
                }, function (err, res, body) {
                    _utils2.default.parseXML(body).then(function (result) {
                        resolve(result);
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            });
        }
    }, {
        key: 'refund',
        value: function refund(order) {
            var _this5 = this;

            return new _promise2.default(function (resolve, reject) {
                if (!order.transaction_id && !order.out_trade_no || !order.out_refund_no) {
                    reject(new Error('缺少参数'));
                }

                order.nonce_str = order.nonce_str || _utils2.default.createNonceStr();
                order.appid = _this5.options.appid;
                order.mch_id = _this5.options.mch_id;
                order.op_user_id = order.op_user_id || order.mch_id;
                order.sign = _utils2.default.sign(order, _this5.options.apiKey);

                (0, _request2.default)({
                    url: _urls2.default.REFUND,
                    method: "POST",
                    body: _utils2.default.buildXML({ xml: order }),
                    agentOptions: {
                        pfx: _this5.options.pfx,
                        passphrase: _this5.options.mch_id
                    }
                }, function (err, response, body) {
                    _utils2.default.parseXML(body).then(function (result) {
                        resolve(result);
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            });
        }
    }, {
        key: 'queryRefund',
        value: function queryRefund(order) {
            var _this6 = this;

            return new _promise2.default(function (resolve, reject) {
                if (!(order.transaction_id || order.out_trade_no || order.out_refund_no || order.refund_id)) {
                    reject(new Error('缺少参数'));
                }

                order.nonce_str = order.nonce_str || _utils2.default.createNonceStr();
                order.appid = _this6.options.appid;
                order.mch_id = _this6.options.mch_id;
                order.sign = _utils2.default.sign(order, _this6.options.apiKey);

                (0, _request2.default)({
                    url: _urls2.default.REFUND_QUERY,
                    method: "POST",
                    body: _utils2.default.buildXML({ xml: order })
                }, function (err, response, body) {
                    _utils2.default.parseXML(body).then(function (result) {
                        resolve(result);
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            });
        }
    }, {
        key: 'transfers',
        value: function transfers(order) {
            var _this7 = this;

            return new _promise2.default(function (resolve, reject) {
                if (!(order.partner_trade_no && order.openid && order.check_name && order.amount && order.desc && order.spbill_create_ip)) {
                    reject(new Error('缺少参数'));
                }

                order.nonce_str = order.nonce_str || _utils2.default.createNonceStr();
                order.mch_appid = _this7.options.appid;
                order.mchid = _this7.options.mch_id;
                order.sign = _utils2.default.sign(order, _this7.options.apiKey);

                (0, _request2.default)({
                    url: _urls2.default.TRANSFERS,
                    method: "POST",
                    body: _utils2.default.buildXML(order),
                    agentOptions: {
                        pfx: _this7.options.pfx,
                        passphrase: _this7.options.mch_id
                    }
                }, function (err, response, body) {
                    if (err) return reject(err);
                    _utils2.default.parseXML(body).then(function (result) {
                        if (!result || result.result_code === 'FAIL') reject(result);else resolve(result);
                    }).catch(reject);
                });
            });
        }
    }, {
        key: 'queryTransferInfo',
        value: function queryTransferInfo(order, fn) {
            var _this8 = this;

            return new _promise2.default(function (resolve, reject) {
                if (!order.partner_trade_no) {
                    reject(new Error('缺少参数'));
                }

                order.nonce_str = order.nonce_str || _utils2.default.createNonceStr();
                order.appid = _this8.options.appid;
                order.mch_id = _this8.options.mch_id;
                order.sign = _utils2.default.sign(order, _this8.options.apiKey);

                (0, _request2.default)({
                    url: _urls2.default.TRNSFER_INFO,
                    method: "POST",
                    body: _utils2.default.buildXML({ xml: order }),
                    agentOptions: {
                        pfx: _this8.options.pfx,
                        passphrase: _this8.options.mch_id
                    }
                }, function (err, response, body) {
                    _utils2.default.parseXML(body, fn);
                });
            });
        }
    }, {
        key: 'getBrandWCPayRequestParams',
        value: function getBrandWCPayRequestParams(order) {
            var _this9 = this;

            return new _promise2.default(function (resolve, reject) {
                order.trade_type = "JSAPI";
                _this9.createUnifiedOrder(order).then(function (data) {
                    var reqparam = {
                        appId: _this9.options.appid,
                        timeStamp: _utils2.default.createTimestamp(),
                        nonceStr: data.nonce_str,
                        package: "prepay_id=" + data.prepay_id,
                        signType: "MD5"
                    };
                    reqparam.paySign = _utils2.default.sign(reqparam, _this9.options.apiKey);
                    resolve(reqparam);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    }, {
        key: 'createMerchantPrepayUrl',
        value: function createMerchantPrepayUrl(param) {
            param.time_stamp = param.time_stamp || _utils2.default.createTimestamp();
            param.nonce_str = param.nonce_str || _utils2.default.createNonceStr();
            param.appid = this.options.appid;
            param.mch_id = this.options.mch_id;
            param.sign = _utils2.default.sign(param, this.options.apiKey);

            var query = (0, _keys2.default)(param).filter(function (key) {
                return ['sign', 'mch_id', 'product_id', 'appid', 'time_stamp', 'nonce_str'].indexOf(key) >= 0;
            }).map(function (key) {
                return key + "=" + encodeURIComponent(param[key]);
            }).join('&');

            return "weixin://wxpay/bizpayurl?" + query;
        }
    }], [{
        key: 'checkNotification',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(xml, apiKey) {
                var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'payment';

                var notification, dataForSign, signValue, _notification, decryptedData, finalData;

                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;

                                if (!(type == 'payment')) {
                                    _context.next = 15;
                                    break;
                                }

                                _context.next = 4;
                                return _utils2.default.parseXML(xml);

                            case 4:
                                notification = _context.sent;
                                dataForSign = (0, _assign2.default)({}, notification);

                                delete dataForSign.sign;
                                signValue = _utils2.default.sign(dataForSign, apiKey);

                                if (!(signValue != notification.sign)) {
                                    _context.next = 12;
                                    break;
                                }

                                return _context.abrupt('return', null);

                            case 12:
                                return _context.abrupt('return', notification);

                            case 13:
                                _context.next = 23;
                                break;

                            case 15:
                                _context.next = 17;
                                return _utils2.default.parseXML(xml);

                            case 17:
                                _notification = _context.sent;
                                decryptedData = _utils2.default.decryptByAes256Cbc(_notification.req_info, apiKey);
                                _context.next = 21;
                                return _utils2.default.parseXML(decryptedData);

                            case 21:
                                finalData = _context.sent;
                                return _context.abrupt('return', finalData);

                            case 23:
                                _context.next = 28;
                                break;

                            case 25:
                                _context.prev = 25;
                                _context.t0 = _context['catch'](0);
                                return _context.abrupt('return', _context.t0);

                            case 28:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[0, 25]]);
            }));

            function checkNotification(_x2, _x3) {
                return _ref.apply(this, arguments);
            }

            return checkNotification;
        }()
    }, {
        key: 'wxCallback',
        value: function wxCallback(fn, apiKey) {
            var _this10 = this;

            var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'payment';

            return function (req, res, next) {
                var _this = _this10;
                res.success = function () {
                    res.end(_utils2.default.buildXML({ xml: { return_code: 'SUCCESS' } }));
                };
                res.fail = function () {
                    res.end(_utils2.default.buildXML({ xml: { return_code: 'FAIL' } }));
                };
                _utils2.default.pipe(req, function () {
                    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(err, data) {
                        var xml, notification;
                        return _regenerator2.default.wrap(function _callee2$(_context2) {
                            while (1) {
                                switch (_context2.prev = _context2.next) {
                                    case 0:
                                        xml = data.toString('utf8');
                                        _context2.next = 3;
                                        return WechatPayment.checkNotification(xml, apiKey, type);

                                    case 3:
                                        notification = _context2.sent;

                                        fn.apply(_this, [notification, req, res, next]);

                                    case 5:
                                    case 'end':
                                        return _context2.stop();
                                }
                            }
                        }, _callee2, this);
                    }));

                    return function (_x5, _x6) {
                        return _ref2.apply(this, arguments);
                    };
                }());
            };
        }
    }]);
    return WechatPayment;
}();

exports.default = WechatPayment;
