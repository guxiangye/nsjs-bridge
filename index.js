/**
 * js-bridge.js
 * 交互组件
 *
 * Create by Neil.gu 2019-06-27
 */

/**
 * js:
 * this.$jsBridge.photo(['colin', 'neil'], function (data) {
          alert('js-bridge:' + JSON.stringify(data))
        })
 *
 * ios:
 * 在iOS中通过`WKWebView`的`WKScriptMessageHandler` 或`UIWebView`的`JSContext`绑定反调，
 * 有两种方式绑定，二选一即可：
 * 1.单一绑定法，配置如下
 * let native = {
      ios: 'ios',
      android: 'android'
    }
 let methods = [{js: "photo", native: "getPhoto"},{js: "openWX", native: "getOpenWX"}]

 * JSContext *context = [self.webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];
 * context[@"photo"] = ^(NSString *class) {
        [webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"getPhoto('%@')", class]];
    };

 context[@"ios"] = ^(NSDictionary *dict) {
        [webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"getPhoto(%@)", [YEAFNRequestManager dictionaryToJson:dict[@"parameter"]]]];
    };

 2.多方法，配置如下
 let native = {
      ios: '',
      android: 'android'
    }
 let methods = [{js: "photo", native: "getPhoto"},{js: "openWX", native: "getOpenWX"}]
 *
 * android:
 * 在Android中通过`webView.addJavascriptInterface(obj,'android')` 绑定反调；
 * 注意：为了安全考虑，`android` 可以替换成自己设置的方法名
 * */


(function (window) {
  function JSBridge() {

  }

  let js_log = function () {
    let args = Array.prototype.slice.call(arguments);
    args.unshift('[JSBridge: ]==>');
    console.log.apply(console, args)
  }

  let injectObj = function () {
    let _this = this

    if (arguments.length === 0) {
      return
    }

    let isAndroid = navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1
    let isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)

    /**
     * androidBridgeName 交互名 默认 android
     * iOSBridgeName 默认不开启，开启则 传值
     * */
    let androidBridgeName = "android"
    let iOSBridgeName = ""

    let find = function (arr, e) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].js === e) {
          return true
        }
      }
      return false
    }

    // 数据处理
    let getRealArags = function (args) {
      /*
      'colin', function (data) {
          alert('js-bridge:' + JSON.stringify(data))
        }

      ['colin', 'neil'], function (data) {
          alert('js-bridge:' + JSON.stringify(data))
        }

      {name: 'colin'}, function (data) {
          alert('js-bridge:' + JSON.stringify(data))
        }

      Object, function (data) {
          alert('js-bridge:' + JSON.stringify(data))
        }
      */

      let ios_result = []
      let android_result = []
      let callBack = null

      for (let i = 0; i < args.length; i++) {
        // 数据暂时区分 Android&iOS 以防万一
        if (isiOS) {
          if (args[i] instanceof Function) {
            callBack = args[i]
          } else {
            ios_result.push(args[i])
          }
        } else {
          if (args[i] instanceof Function) {
            callBack = args[i]
          } else {
            android_result.push(args[i])
          }
        }
      }

      let ret = {
        callBack: callBack,
        args: args
      }

      if (isAndroid) {
        if (android_result !== []) {
          ret.args = android_result[0]
        }
      } else if (isiOS) {
        if (ios_result !== []) {
          if (iOSBridgeName === "") {
            ret.args = ios_result
          } else {
            ret.args = ios_result[0]
          }
        }
      }

      return ret
    }

    let callBack = function (m) {
      return function () {
        let args = Array.prototype.slice.apply(arguments)
        console.log(args)
        // iOS 交互
        if (isiOS) {
          let arg = getRealArags(args)
          // [多方法交互式]
          if (iOSBridgeName === "") {
            // 1.WKWebView
            if (typeof window.webkit != 'undefined' && typeof window.webkit.messageHandlers[m.js] != 'undefined') {
              js_log('WKWebView')
              let o1 = window.webkit.messageHandlers[m.js]
              if (arg.callBack != null) {
                window[m.native] = arg.callBack
              }
              o1.postMessage.apply(o1, arg.args)
            }

            // 2.UIWebView
            else if (typeof window[m.js] != 'undefined') {
              js_log('UIWebView')
              let o2 = window[m.js]
              if (arg.callBack != null) {
                window[m.native] = arg.callBack
              }
              o2.apply(o2, arg.args)
            }

            // 3.其他
            else {
              js_log("ios webview do not define object " + m.js)
              if (arg.callBack != null) {
                window[m.native] = arg.callBack
                let o3 = arg.callBack
                o3.apply(o3, arg.args)
              }
            }

            return
          }
          // [单一方法交互式]
          else {
            let arg = getRealArags(args)
            // 1.WKWebView
            if (typeof window.webkit != 'undefined' && typeof window.webkit.messageHandlers[iOSBridgeName] != 'undefined') {
              js_log('WKWebView')
              let o1 = window.webkit.messageHandlers[iOSBridgeName]
              if (arg.callBack != null) {
                window[m.native] = arg.callBack
              }
              o1.postMessage.call(o1, {method: m.js, parameter: arg.args})
            }

            // 2.UIWebView
            else if (typeof window[iOSBridgeName] != 'undefined') {
              js_log('UIWebView')
              let o2 = window[iOSBridgeName]
              if (arg.callBack != null) {
                window[m.native] = arg.callBack
              }
              o2.call(o2, {method: m.js, parameter: arg.args})
            }

            // 3.其他
            else {
              js_log("ios webview do not define object " + m.js)
              if (arg.callBack != null) {
                window[m.native] = arg.callBack
                let o3 = arg.callBack
                o3.call(o3, {method: m.js, parameter: arg.args})
              }
            }

            return
          }
        }

        // Android 交互
        if (isAndroid) {
          let arg = getRealArags(args)
          if (typeof window[androidBridgeName] != 'undefined') {

            // 1.通过WebView的 addJavascriptInterface() 进行对象映射
            if (typeof window[androidBridgeName][m.js] != 'undefined') {

              if (arg.callBack != null) {
                window[m.native] = arg.callBack
              }
              window[androidBridgeName][m.js].call(window[androidBridgeName], arg.args)
            } else {
              js_log("android webview do not define method " + m.js)
            }

            // 2.通过 WebViewClient 的shouldOverrideUrlLoading() 方法回调拦截 url


            // 3.通过 WebChromeClient 的onJsAlert()、onJsConfirm()、onJsPrompt（）
            // 方法回调拦截JS对话框alert()、confirm()、prompt（） 消息

          } else {
            js_log("android webview do not define obj " + androidBridgeName)
            if (arg.callBack != null) {
              window[m.native] = arg.callBack
              let o = arg.callBack
              o.call(o, {method: m.js, parameter: arg.args})
            }
          }

          return
        }

        js_log("call in moblie webview")
      }
    }

    let addMethods = function (ms) {
      for (let i = 0; i < ms.length; i++) {
        _this[ms[i].js] = callBack(ms[i])
      }

      if (isAndroid && typeof window[androidBridgeName] != 'undefined') {
        debugger
        for (let j in window[androidBridgeName]) {
          if (!find(ms, j)) {
            _this[j] = callBack(j)
          }
        }
      }
    }

    if (arguments.length === 1) {
      if (arguments[0] instanceof Array) {
        addMethods(arguments[0])
      }
    } else if (arguments.length === 2) {
      let native = arguments[0]
      let args = arguments[1]
      if (native.android && native.android != '') {
        androidBridgeName = native.android
      }
      if (native.ios && native.ios != '') {
        iOSBridgeName = native.ios
      }

      if (args instanceof Array) {
        addMethods(args)
      }
    } else {
      js_log("parameters error!")
    }
  }

  JSBridge.create = function () {
    let easy = new JSBridge()
    // apply: 劫持另外一个对象的方法，继承另外一个对象的属性.
    injectObj.apply(easy, arguments)
    return easy
  }
  window.JSBridge = JSBridge
})(window)


let JSBridgePlugin = {}

JSBridgePlugin.install = (Vue, config) => {
  /**
   * native: ios，android 桥名
   * methods：交互方法名 js 方法，native 原生回掉方法
   */
  let native = config.bridgeNative
  let methods = config.bridgeMethods
  Vue.prototype.$jsBridge = JSBridge.create(native, methods)
}


export default JSBridgePlugin
