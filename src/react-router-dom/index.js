/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import React from "react"
import { Router, useNavigate } from '../react-router/index'
import {createHashHistory, createBrowserHistory} from "../history" 
export * from '../react-router/index'

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
	// history 不会变，但是它的属性会变 history.push('/user')
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
	React.useLayoutEffect(()=> history.listen((state) => setState(state)), [history])
	return (
		<Router
	  	children={children}
			location={state.location}
			navigationType={state.action}
			navigator={history}
		/>
	)
}

export function Link(props) {
	let navigate = useNavigate()
	let { to, children, ...rest} = props
	return ( <a {...rest} onClick={() => navigate(to)}>{children}</a>)
}