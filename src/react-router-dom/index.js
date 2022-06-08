import React from "react"
import { Router } from '../react-router'
import {createHashHistory, createBrowserHistory} from "history" 
export * from '../react-router'

export function HashRouter({children}) {
	let historyRef = React.useRef()
	if (!historyRef.current) {
		historyRef.current = createHashHistory()
	}
	let history = historyRef.current
	let [state, setState] = React.useState({
		// 跳转到当前路径的动作类型：pushState => PUSH, go back forward => POP
		action: history.action,
		// 当前的路径 window.location.pathname
		location: history.location
	})
	// 监听 history 中的路径变化，当 history 对象中的路径发生改变后执行 setState
  React.useLayoutEffect(()=> history.listen(setState), [history])
	return (
		<Router
	  	children={children}
			location={state.location}
			navigationType={state.action}
			navigator={history}
		/>
	)
}

export function BrowserRouter({children}) {
	let historyRef = React.useRef()
	if (!historyRef.current) {
		historyRef.current = createBrowserHistory()
	}
	let history = historyRef.current
	let [state, setState] = React.useState({
		// 跳转到当前路径的动作类型：pushState => PUSH, go back forward => POP
		action: history.action,
		// 当前的路径 window.location.pathname
		location: history.location
	})
	React.useLayoutEffect(()=> history.listen(setState), [history])
	return (
		<Router
	  	children={children}
			location={state.location}
			navigationType={state.action}
			navigator={history}
		/>
	)
}