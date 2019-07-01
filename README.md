
Install with npm:

```bash
npm install --save-dev nsjs-bridge
```

Install with yarn:

```bash
yarn add nsjs-bridge --dev
```


js 部分:
```angular2html
1.vue-cli 的话，建议写在 main.js 中
import JSBridgePlugin from './index.js'
import bridgeConfig from './config/bridgeConfig.js'
Vue.use(JSBridgePlugin, bridgeConfig);

2.配置文件（./config/bridgeConfig.js）拖到项目工程中，路径已当前项目路径为准

3.调用
this.$jsBridge.example1(dict, function (data) {
    alert('js-bridge:' + JSON.stringify(data))
}
```

iOS 部分:
```angular2html
在iOS中通过`WKWebView`的`WKScriptMessageHandler` 或`UIWebView`的`JSContext`绑定反调，
有两种方式绑定，二选一即可：
UIWebView
1.单一绑定法，配置如下
var native = {
    ios: 'ios',
    android: 'android' (注意：为了安全考虑，`android` 可以替换成自己设置的方法名)
}
var methods = [{js: "example1", native: "getExample1"},{js: "example2", native: "getExample2"}]
JSContext *context = [self.webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];
context[@"ios"] = ^(NSDictionary *dict) {
    if ([dict[@"method"] isEqualTo:@"example1"]) {
        [webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"getExample1(%@)", [YEAFNRequestManager dictionaryToJson:dict[@"parameter"]]]];
    }
    if ([dict[@"method"] isEqualTo:@"example2"]) {
        [webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"getExample2(%@)", [YEAFNRequestManager dictionaryToJson:dict[@"parameter"]]]];
    }
};

2.多方法，配置如下
var native = {
    ios: '',
    android: 'android'
}
var methods = [{js: "example1", native: "getExample1"},{js: "example2", native: "getExample2"}]
JSContext *context = [self.webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];
context[@"example1"] = ^(NSString *class) {
    [webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"getExample1('%@')", class]];
};
context[@"example2"] = ^(NSString *class) {
    [webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"getExample2('%@')", class]];
};

WKWebView
1.单一绑定法，配置如下
- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message {
    if ([message.name isEqualToString:@"example1"]) {
        NSString *js = [NSString stringWithFormat:@"getExample1(%@)", [YEAFNRequestManager dictionaryToJson:message.body]];
        [self.webView stringByEvaluateJavaScript:js completionHandler:^(id  _Nullable result, NSError * _Nullable error) {
            NSLog(@"%@ | %@", result, error.localizedDescription);
        }];
    }
}
2.多方法，配置如下
- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message {
    if ([message.name isEqualToString:@"ios"]) {
        NSString *js = [NSString stringWithFormat:@"getPhoto(%@)", [YEAFNRequestManager dictionaryToJson:message.body]];
        [self.webView stringByEvaluateJavaScript:js completionHandler:^(id  _Nullable result, NSError * _Nullable error) {
            NSLog(@"%@ | %@", result, error.localizedDescription);
        }];
    }
}
...
```

Android 部分:
```angular2html
android:
在Android中通过`webView.addJavascriptInterface(obj,'android')` 绑定反调；
注意：为了安全考虑，`android` 可以替换成自己设置的方法名
```

如您在使用过程中有任何建议或疑问，欢迎联系 guxiangyee@163.com