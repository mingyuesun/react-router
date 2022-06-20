import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter, NavLink, useRoutes } from "./react-router-dom"
import RoutesConfig from './routesConfig'

const activeStyle = {
	backgroundColor: 'green'
}
const activeClassName = "active"
const activeNavProps = {
	style: ({isActive}) => isActive ? activeStyle: {},
	className: ({isActive}) => isActive ? activeClassName : ""
}

const LazyFoo = React.lazy(() => import("./components/Foo"))
function App() {
  let [routes, setRoutes] = React.useState(RoutesConfig)
  const addRoute = () => {
    setRoutes([
      ...routes,
      {
        path: "/foo",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <LazyFoo/>
          </React.Suspense>
        )
      }
    ])
  }
  return (
    <div>
      {useRoutes(routes)}
      <button onClick={addRoute}>addRoute</button>
    </div>
  )
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
        <NavLink to="/foo" {...activeNavProps}>Foo</NavLink>
      </li>
    </ul>
    <App/>
  </BrowserRouter>,
  document.getElementById("root")
)
