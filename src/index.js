import React from "react"
import ReactDOM from "react-dom"
import {HashRouter, Routes, Route} from "./react-router-dom"
import Home from './components/Home'
import User from './components/User'
import Profile from './components/Profile'
import Post from './components/Post'
		
ReactDOM.render(
<HashRouter>
	<Routes>
		<Route path="/" element={<Home />}/>
		<Route path="/user" element={<User />}/>
		<Route path="/profile" element={<Profile />}/>
		<Route path="/post/:id" element={<Post />}/>
	</Routes>
</HashRouter>, document.getElementById("root"))
