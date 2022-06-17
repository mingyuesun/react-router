import React from 'react'
import { useNavigate, useLocation } from '../react-router-dom'

function Login(){
	let navigate = useNavigate()
	let location = useLocation()
	const login = () => {
		localStorage.setItem('login', 'true')
		let to = "/"	
		if (location.state && location.state.from) {
			to = location.state.from
			navigate(to)
		}
	}
	return <button onClick={login}>登录</button>
}

export default Login