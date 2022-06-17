import React from "react"
import Home from "./components/Home"
import User from "./components/User"
import Profile from "./components/Profile"
import UserAdd from "./components/UserAdd"
import UserList from "./components/UserList"
import UserDetail from "./components/UserDetail"
import Protected from "./components/Protected"
import Login from "./components/Login"
import NotFound from "./components/NotFound"

const routes = [
	{path: "/", element: <Home />},
	{path: "/user", element: <User />, children: [
		{path: "add", element: <UserAdd />},
		{path: "list", element: <UserList />},
		{path: "detail/:id", element: <UserDetail />}
	]},
	{path: "/profile", element: <Protected component={Profile} />},
	{path: "/login", element: <Login />},
	{path: "*", element: <NotFound/>},
]

export default routes