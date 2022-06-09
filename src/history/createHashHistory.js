/**
 * hash 不能用浏览器的 history 对象
 */
function createHashHistory() {
  // 类似于历史栈，里面存放的都是路径
  let historyStack = []
  // 栈的指针，默认是 -1
  let index = -1
  // 动作
  let action = "POP"
  // 最新状态
  let state
  // 存放监听函数的数组
  let listeners = []
  function listen(listener) {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((item) => item !== listener)
    }
  }
	let hashChangeHandler = () => {
		// 取出最新的 hash 值对应的路径 #/user
		let pathname = window.location.hash.slice(1)
		Object.assign(history, {action, location: {pathname, state}})
		// 当调用 push 方法时，需要往历史栈中添加新的条目
		if (action === 'PUSH') {
			historyStack[++index] = history.location
		}
		listeners.forEach(listener => listener({location: history.location}))
	}
	function go(n){
		action = 'POP'
		if (index + n < 0 || index + n >= historyStack.length) return
		// 更改栈顶的指针
		index+=n
		// 取出指定索引对应的路径对象
		let nextLocation = historyStack[index]
		state = nextLocation.state
		// 修改 hash 值，从而修改当前的路径
		window.location.hash = nextLocation.pathname
	}
	// 当 hash 发生变化，会执行回调
	window.addEventListener('hashchange', hashChangeHandler)
	function goBack(){
		go(-1)
	}
	function goForward(){
		go(1)
	}
	function push(pathname, nextState) {
		action = 'PUSH'
		if (typeof pathname === 'object') {
			state = pathname.state
			pathname = pathname.pathname
		} else {
			state = nextState
		}
		window.location.hash = pathname
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
	// 如果初始情况下 hash 是有值的
	if (window.location.hash) {
		action = 'PUSH'
		hashChangeHandler()
	} else {
		window.location.hash = '/'
	}
  return history
}

export default createHashHistory
