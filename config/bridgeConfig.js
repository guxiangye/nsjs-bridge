/**
 * bridgeConfig.js
 * js-native 交互配置
 * Created by neil on 2019-06-21
 * Copyright © 2018年. All rights reserved.
 */

/**
 * native: ios，android 桥名
 */
let bridgeNative = {
  ios: 'ios',
  android: ''
}

/**
 * methods：交互方法名 js 方法，native 原生回掉方法
 */
let bridgeMethods = [
  {js: "example1", native: "getExample1"},
  {js: "example2", native: "getExample2"}
]

export default {
  bridgeMethods, bridgeNative
}