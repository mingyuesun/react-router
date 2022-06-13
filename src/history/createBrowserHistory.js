function createBrowserHistory() {
  const globalHistory = window.history
  // 存放所有监听函数
  let listeners = []
  // 当前状态
  let state
  function listen(listener) {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((item) => item !== listener)
    }
  }
  function go(n) {
    globalHistory.go(n)
  }
  window.addEventListener("popstate", () => {
    let location = {
      state: globalHistory.state,
      pathname: window.location.pathname
    }
    // 当路径改变之后，应该让 history 的监听函数执行，重新刷新组件
    notify({ action: "POP", location })
  })
  function goBack() {
    go(-1)
  }
  function goForward() {
    go(1)
  }
  /**
   * 通知函数 当状态发生改变后，可以调用此函数
   * @param {*} newState
   */
  function notify(newState) {
    // 把 newState 上的属性赋值到 history 上
    Object.assign(history, newState)
    // 路由历史栈中历史条目的长度
    history.length = globalHistory.length
    listeners.forEach((listener) => listener({ location: history.location }))
  }
  /**
   * @param {*} pathname 可以传一个对象，也可以传一个字符串
   * @param {*} nextState
   */
  function push(pathname, nextState) {
    // action 表示由于什么样的动作引起了历史的变更
    const action = "PUSH"
    if (typeof pathname === "object") {
      state = pathname.state
      pathname = pathname.pathname
    } else {
      state = nextState
    }
    globalHistory.pushState(state, null, pathname)
    let location = { state, pathname }
    notify(action, location)
  }
  const history = {
    action: "POP",
    go,
    goBack,
    goForward,
    listen,
    push,
    location: {
      pathname: window.location.pathname,
      state: window.location.state
    }
  }
  return history
}

export default createBrowserHistory
