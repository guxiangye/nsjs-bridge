
Install with npm:

```bash
npm install --save-dev jsbridge
```

Install with yarn:

```bash
yarn add jsbridge --dev
```


```angular2html
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
 * var native = {
      ios: 'ios',
      android: 'android'
    }
 var methods = [{js: "photo", native: "getPhoto"},{js: "openWX", native: "getOpenWX"}]

 * JSContext *context = [self.webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];
 * context[@"photo"] = ^(NSString *class) {
        [webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"getPhoto('%@')", class]];
    };

 context[@"ios"] = ^(NSDictionary *dict) {
        [webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"getPhoto(%@)", [YEAFNRequestManager dictionaryToJson:dict[@"parameter"]]]];
    };

 2.多方法，配置如下
 var native = {
      ios: '',
      android: 'android'
    }
 var methods = [{js: "photo", native: "getPhoto"},{js: "openWX", native: "getOpenWX"}]
 *
 * android:
 * 在Android中通过`webView.addJavascriptInterface(obj,'android')` 绑定反调；
 * 注意：为了安全考虑，`android` 可以替换成自己设置的方法名
 * */
```