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
  const navigatorContext = React.useMemo(() => ({ navigator }), [navigator])
  const locationContext = React.useMemo(() => ({ location }), [location])
  return (
    <NavigatorContext.Provider value={navigatorContext}>
      <LocationContext.Provider value={locationContext} children={children} />
    </NavigatorContext.Provider>
  )
}

export function Routes({ children }) {
  const routes = createRoutesFromChildren(children)
  return useRoutes(routes)
}

export function createRoutesFromChildren(children) {
  let routes = []
  React.Children.forEach(children, (element) => {
    let route = {
      path: element.props.path, // /user 此路由对应的路径
      element: element.props.element // <User/> 此路由对应的元素
    }
    if (element.props.children) {
      route.children = createRoutesFromChildren(element.props.children)
    }
    routes.push(route)
  })
  return routes
}

/**
 * 把此路由数组渲染成真正的数组
 * @param {*} routes 路由配置数组
 */
export function useRoutes(routes) {
  // 当前的路径对象
  let location = useLocation()
  // 当前的路径字符串
  let pathname = location.pathname
  // 用当前的地址栏中的路径和路由进行匹配
  let matches = matchRoutes(routes, { pathname })
  // 渲染匹配的结果
  return _renderMatches(matches)
}
function _renderMatches(matches) {
  if (!matches) return null
  // 渲染结果的时候是从右向左执行的
  // matches = [{route: {element: User}}, {route: {element:  UserAdd}}]
  return matches.reduceRight((outlet, match, index) => {
    return (
      <RouteContext.Provider value={{outlet, matches: matches.slice(0, index + 1)}}>
        {match.route.element}
      </RouteContext.Provider>
    )
  }, null)
}
/**
 * 用当前路径和路由配置进行匹配，获取匹配的结果
 * @param {*} routes 路由配置
 * @param {*} location 当前路径
 */
function matchRoutes(routes, location) {
  // 获取路径名
  let pathname = location.pathname
  // 打平所有的分支路径
  let branches = flattenRoutes(routes)
	// 匹配的结果
  let matches = null
	// 按分支顺序依次进行匹配，如果匹配上了直接退出循环，不再进行后续的匹配
	for (let i = 0; matches == null && i < branches.length; i++) {
		matches = matchRouteBranch(branches[i], pathname)
	}
	return matches
}
/**
 * 用分支的路径匹配地址栏的路径名
 * @param {*} branch
 * @param {*} pathname
 */
function matchRouteBranch(branch, pathname) {
	let {routesMeta} = branch
  // 此分支路径的参数对象
	let matchesParams = {}
	let matchedPathname = "/"
	let matches = []
	for (let i = 0; i < routesMeta.length; i++) {
		// 获取当前的 meta
		let meta = routesMeta[i]
		// 判断是否是最后一个 meta
		let end = i === routesMeta.length - 1
		// 获取剩下的将要匹配的路径
		let remainingPathname = matchedPathname === "/" ? pathname : pathname.slice(matchedPathname.length)
		let match = matchPath({path: meta.relativePath, end}, remainingPathname)
		// 如果没有匹配上，那就表示匹配失败了
		if (!match) {
			return null
		}
    Object.assign(matchesParams, match.params)
    let route = meta.route
    matches.push({
      params: matchesParams,
      pathname: joinPaths([matchedPathname, match.pathname]),
      pathnameBase: joinPaths([matchedPathname, match.pathnameBase]),
      route
    })
    if (match.pathnameBase !== '/') {
      matchedPathname = joinPaths([matchedPathname, match.pathnameBase])
    }
	}
  return matches
}
/**
 * @param {*} path 路由的路径
 * @param {*} pathname 当前地址栏中的路径
 */
 export function matchPath({path, end}, pathname) {
  // 把路径编译成正则
  let [matcher, paramNames] = compilePath(path, end)
  // 匹配结果
  let match = pathname.match(matcher)
  // 如果没有匹配上就结束
  if (!match) return null
  // 获取匹配的路径
  let matchedPathname = match[0] //  /user//
  // base 就是基本路径  /user/ => /user 把结束的一个或多个 / 去掉
  let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1")
  // 拼出 paramNames
  let values = match.slice(1)
  let captureGroups = match.slice(1)
  let params = paramNames.reduce((memo, paramName, index) => {
    // /user/*
    if (paramName === "*") {
      let splatValue = captureGroups[index] || "" // 表示*匹配到的内容； pathname=/user/add => add
      // pathnameBase = matchedPathname = /user/add
      // 重写 pathnameBase => slice=/user/ => replace=/user 截取*之前的字符串作为后续匹配的父字符串
      pathnameBase = matchedPathname.slice(0, matchedPathname.length - splatValue.length).replace(/(.)\/+/, "$1")
    }
    memo[paramName] = values[index]
    return memo
  }, {})
  return {
    params,
    pathname: matchedPathname,  //  /user/add
    pathnameBase  //  /user
  }
}
/**
 * 打平所有分支
 * @param {*} routes 路由配置
 */
function flattenRoutes(
  routes,
  branches = [],
  parentsMeta = [],
  parentPath = ""
) {
  routes.forEach((route) => {
    // 定义一个路由元数据
    let meta = {
      relativePath: route.path || "",  // 路径相对父路径的路径 UserAdd relativePath = add
			route  // 路由对象
    }
		// 现在 routes 其实只有一个元素，/user/* parentPath="" relativePath=/user/*
		// path=/user/*
		// 把父路径加上自己的相对路径构建成匹配的完整路径
    let path = joinPaths([parentPath, meta.relativePath])
		// 在父 meta 数组中，添加自己这个 meta
		let routesMeta = parentsMeta.concat(meta)
		if (route.children && route.children.length > 0) {
			flattenRoutes(route.children, branches, routesMeta, path)
		}
		branches.push({
			path,
			routesMeta
		})
  })
	return branches
}
function joinPaths(paths) {
	//["/user/*/", "/add"] => /user/*/add
	return paths.join("/").replace(/\/\/+/g, "/")
}
function compilePath(path, end) {
  // 路径参数的参数名数组 /post/:id paramNames=["id"]
  let paramNames = []
  let regexpSource =
    "^" + path
    .replace(/\/*\*?$/, "") //  把 /*或者//*或者* 全部转换为空; /user/* /user* /user//* => /user
    .replace(/^\/*/, "/")  //  把开始的 多个或0个/ 转换成1个/; /user 不变  //user user => /user
    .replace(/:(\w+)/g, (_, key) => {
      paramNames.push(key)
      return "([^\\/]+?)"
    })
  if(path.endsWith("*")) {
    paramNames.push("*")
    regexpSource += "(?:\\/(.+)|\\/*)$"
  } else {
    regexpSource += end ? "\\/*$" : "(?:\b|\\/|$)"
  }
  let matcher = new RegExp(regexpSource)
  return [matcher, paramNames]
}

export function useLocation() {
  return React.useContext(LocationContext).location
}

export function Route() {}

export function useNavigate() {
  const { navigator } = React.useContext(NavigatorContext)
  const navigate = React.useCallback(
    (to) => {
      navigator.push(to)
    },
    [navigator]
  )
  return navigate
}

export function Outlet(){
  return useOutlet()
}

function useOutlet() {
  let { outlet } = React.useContext(RouteContext)
  return outlet
}

export function useParams() {
  let { matches } = React.useContext(RouteContext)
  let routeMatch = matches[matches.length - 1]
  return routeMatch ? routeMatch.params : {}
}

export function Navigate({ to }) {
  let navigate = useNavigate()
  React.useLayoutEffect(() => {
    navigate(to)
  })
  return null
}
