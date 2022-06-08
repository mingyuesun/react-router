import React from "react"
// 导航上下文
const NavigatorContext = React.createContext({})
// 路径上下文
const LocationContext = React.createContext({})
// 路由上下文
const RouteContext = React.createContext({})
export { NavigatorContext, LocationContext, RouteContext }
/**
 *
 * @param {*} children 子组件
 * @param {*} location 当前的路径对象
 * @param {*} navigator history 对象 go back push pop....
 */
export function Router({ children, location, navigator }) {
	const navigatorContext = React.useMemo(() => ({navigator}), [navigator])
	const locationContext = React.useMemo(() => ({location}), [location])
	return (
		<NavigatorContext.Provider value={navigatorContext}>
			<LocationContext.Provider value={locationContext} children={children}/>
		</NavigatorContext.Provider>
	)
}

export function Routes({children}) {
	const routes = createRoutesFromChildren(children)
	return useRoutes(routes)
}

export function createRoutesFromChildren(children) {
	let routes = []
	React.Children.forEach(children, (element) => {
		let route = {
			path: element.props.path,       // /user
			element: element.props.element  // <User/>
		}
		routes.push(route)
	})
	return routes
}

export function useRoutes(routes) {
	const location = useLocation()
	const pathname = location.pathname
	for (let i = 0; i < routes.length; i++) {
		const { path, element } = routes[i]
		let match = matchPath(path, pathname)
		if (match) {
			return element
		}
	}
	return null
}

function compilePath(path) {
	let regexpSource = '^' + path
	regexpSource += '$'
	let matcher = new RegExp(regexpSource)
	return matcher
}
/**
 * @param {*} path 路由的路径
 * @param {*} pathname 当前地址栏中的路径
 */
export function matchPath(path, pathname) {
	let matcher = compilePath(path)
	let match = pathname.match(matcher)
	if (!match) return null
	return match
}

export function useLocation() {
	return React.useContext(LocationContext).location
}

export function Route() {}
