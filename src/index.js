import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "./react-router-dom"
import Home from "./components/Home"
import User from "./components/User"
import Profile from "./components/Profile"
import Post from "./components/Post"
import UserAdd from "./components/UserAdd"
import UserList from "./components/UserList"
import UserDetail from "./components/UserDetail"
import Protected from "./components/Protected"
import Login from "./components/Login"

const activeStyle = {
	backgroundColor: 'green'
}
const activeClassName = "active"
const activeNavProps = {
	style: ({isActive}) => isActive ? activeStyle: {},
	className: ({isActive}) => isActive ? activeClassName : ""
}

ReactDOM.render(
  <BrowserRouter>
    <ul>
      <li>
        <NavLink end={true} to="/" {...activeNavProps}>首页</NavLink>
      </li>
      <li>
        <NavLink to="/user" {...activeNavProps}>用户管理</NavLink>
      </li>
      <li>
        <NavLink to="/profile" {...activeNavProps}>个人中心</NavLink>
      </li>
      <li>
        <NavLink to="/xxx" {...activeNavProps}>重定向</NavLink>
      </li>
    </ul>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/user/*" element={<User />}>
        <Route path="add" element={<UserAdd />} />
        <Route path="list" element={<UserList />} />
        <Route path="detail/:id" element={<UserDetail />} />
      </Route>
      <Route path="/profile" element={<Protected component={Profile} path="/profile" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/post/:id" element={<Post />} />
			<Route path="*" element={<Navigate to="/" />}/>
    </Routes>
  </BrowserRouter>,
  document.getElementById("root")
)
