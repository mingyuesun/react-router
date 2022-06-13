import React, { memo } from 'react';
//导航上下文
const NavigationContext = React.createContext();
//路径上下文
const LocationContext = React.createContext();
//路由上下文
const RouteContext = React.createContext();
export { NavigationContext, LocationContext, RouteContext }
export function Outlet() {
  return useOutlet();
}
function useOutlet() {
  let { outlet } = React.useContext(RouteContext);
  return outlet;
}
export function useParams() {
  let { matches } = React.useContext(RouteContext);
  let routeMatch = matches[matches.length - 1];
  return routeMatch ? routeMatch.params : {};
}
/**
 * 
 * @param {*} children 子组件
 * @param {*} location 当前的路径对象
 * @param {*} navigator history对象 go back forward push....
 */
export function Router({ children, location, navigator }) {
  const navigationContext = React.useMemo(() => ({ navigator }), [navigator]);
  const locationContext = React.useMemo(() => ({ location }), [location]);
  return (
    <NavigationContext.Provider value={navigationContext}>
      <LocationContext.Provider value={locationContext} children={children} />
    </NavigationContext.Provider>
  )
}

export function Routes({ children }) {
  const routes = createRoutesFromChildren(children);
  return useRoutes(routes)
}
//
export function Route() { }
export function useLocation() {
  return React.useContext(LocationContext).location;
}
/**
 * 把此路由配置数组渲染成真正的组件
 * @param {*} routes 路由配置数组
 */
export function useRoutes(routes) {
 //当前的路径对象
 let location = useLocation();
 //当前的路径字符串  /user/add
 let pathname = location.pathname;
 //用当前的地址栏中的路径和路由进行匹配
 let matches = matchRoutes(routes, { pathname });
 //渲染匹配的结果
 return _renderMatches(matches);
}
function _renderMatches(matches) {
  if (!matches) return null;
  //渲染结果的时候是从右向左执行的
  //matches=[{route:{element:User}},{route:{element:UserAdd]}}]
  return matches.reduceRight((outlet, match, index) => {
    return (
      <RouteContext.Provider value={{ outlet, matches: matches.slice(0, index + 1) }}>
        {match.route.element}
      </RouteContext.Provider>
    )
  }, null);
}
/**
 * 用当前路径和路由配置进行匹配,获取匹配的结果 
 * @param {*} routes 路由配置
 * @param {*} location 当前路径
 */
function matchRoutes(routes, location) {
  //获取路径名
  let pathname = location.pathname;
  //打平所有的分支路径
  let branches = flattenRoutes(routes);
  rankRouteBranches(branches);
  console.log(branches);
  //匹配的结果
  let matches = null;
  //按分支顺序依次进行匹配，如果匹配上了，直接退出循环，不再进行后续的匹配
  for (let i = 0; matches == null && i < branches.length; i++) {
    matches = matchRouteBranch(branches[i], pathname);
  }
  return matches;
}
function rankRouteBranches(branches) {
  branches.sort((a, b) => {
    //如果分数不一样，按分数倒序排列 
    //如果分数一样，只能比过索引
    return a.score !== b.score ? b.score - a.score : compareIndexes(
      a.routesMeta.map(meta => meta.childrenIndex),
      b.routesMeta.map(meta => meta.childrenIndex)
    );
  });
}
/**
 * /user/add   routesMeta=[userMeta,addMeta]=>[2,0]
 * /user/list  routesMeta = [userMeta,listMeta]=>[2,1];
 */
function compareIndexes(a, b) {
  //如果级别数量相等，并且父亲都 一样，说是他们是兄弟 
  let sibling = a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i])
  //如果是兄弟的话，那和比索引，索引越小级别越高，索引越大，级别越低
  //如果不是兄弟，那就认为相等的
  return sibling ? a[a.length - 1] - b[b.length - 1] : 0;
}
/**
 * 用分支的路径匹配地址栏的路径名
 * @param {*} branch 
 * @param {*} pathname 完整路径
 */
function matchRouteBranch(branch, pathname) {
  let { routesMeta } = branch;
  //此分支路径参数对象  path =/:a/:b/:c  pathname=/vA/vB/vC
  let matchesParams = {};//{a:vA,b:vB,c:vC}
  let matchedPathname = "/";
  let matches = [];
  for (let i = 0; i < routesMeta.length; i++) {
    //获取当前的meta
    let meta = routesMeta[i];
    //判断是否是最后一个meta
    let end = i === routesMeta.length - 1;
    //获取剩下的的将要匹配的路径
    let remainingPathname = matchedPathname === "/" ? pathname : pathname.slice(matchedPathname.length);
    let match = matchPath({ path: meta.relativePath, end }, remainingPathname);
    //如果没有匹配上，那就表示匹配失败了
    if (!match) {
      return null;
    }
    Object.assign(matchesParams, match.params);
    let route = meta.route;
    matches.push({
      params: matchesParams,
      pathname: joinPaths([matchedPathname, match.pathname]),
      pathnameBase: joinPaths([matchedPathname, match.pathnameBase]),
      route
    });
    if (match.pathnameBase !== '/') {
      matchedPathname = joinPaths([matchedPathname, match.pathnameBase]);
    }
  }
  return matches;
}
/**
 * 匹配路径
 * @param {*} path 路由的路径
 * @param {*} pathname 当前地址栏中的路径
 */
export function matchPath({ path, end }, pathname) {
  //把路径编译 成正则
  let [matcher, paramNames] = compilePath(path, end);
  //匹配结果  
  let match = pathname.match(matcher);
  //如果没有匹配上结束 
  if (!match) {
    return null;
  }
  //获取匹配的路径
  let matchedPathname = match[0]; //  /user//
  //base就是基本路径 /user/  => /user  把结束的一个/或多个/去掉 
  let pathnameBase = matchedPathname.replace(/(.)\/+$/, '$1');
  //拼出paramNames
  let values = match.slice(1);
  let captureGroups = match.slice(1);
  let params = paramNames.reduce((memo, paramName, index) => {
    //  /user/*
    if (paramName === '*') {
      let splatValue = captureGroups[index] || '';//后面的内容  pathname=/user/add
      //pathnameBase=matchedPathname=/user/add
      //重写pathnameBase == /user/add  slice=/user/ /user  截取*之前的串作为后续匹配的父串 
      pathnameBase = matchedPathname.slice(0, matchedPathname.length - splatValue.length).replace(/(.)\/+/, '$1');
    }
    memo[paramName] = values[index];
    return memo;
  }, {});
  return {
    params,
    pathname: matchedPathname,//user/add
    pathnameBase // /user
  }
}
function compilePath(path, end) {
  //路径参数的参数名数组 /post/:id paramNames=["id"]
  let paramNames = [];
  let regexpSource = '^' + path
   .replace(/\/*\*?$/, '') //的 /*或者//* 或者 * 全部转为空  /user/* /user* /user//* /user 在转正则的时候是等价的
   .replace(/^\/*/, '/')//把开始多个/或者说没有/转成一个/   /user 不变 //user 变/user  user /user
    .replace(
      /:(\w+)/g, (_, key) => {
        paramNames.push(key);
        return "([^\\/]+?)";
      }
    )
 if (path.endsWith('*')) {
   paramNames.push('*');
   regexpSource += path === "*" || path === "/*" ? "(.*)$"
     : "(?:\\/(.+)|\\/*)$";
   //regexpSource += "(?:\\/(.+)|\\/*)$";
 } else {
   regexpSource += end ? "\\/*$" : "(?:\b|\\/|$)";
 }
  let matcher = new RegExp(regexpSource);
  return [matcher, paramNames];
}
const isSplat = s => s === '*';
const splatPenalty = -2;
const indexRouteValue = 2;
const paramRe = /^:\w+$/;
const dynamicSegmentValue = 3;
const emptySegmentValue = 1;
const staticSegmentValue = 10;
function computeScore(path, index) {
  let segments = path.split('/'); // /user/add   => ['user','add']
  let initialScore = segments.length;//分片的长度就是基础分数
  if (segments.some(isSplat)) {//  /user/* 有星说是通配，分数分降低
    initialScore += splatPenalty;
  }
  if (index) {
    initialScore += indexRouteValue;
  }
 return segments.filter(s => !isSplat(s)).reduce((score, segment) => {
   return score + (paramRe.test(segment) ? dynamicSegmentValue : segment === '' ? emptySegmentValue : staticSegmentValue);
 }, initialScore);
}
/**
 * 打平所有的分支
 * @param {*} routes 路由配置 
 */
function flattenRoutes(routes, branches = [], parentsMeta = [], parentPath = "") {
  routes.forEach((route, index) => {
    //定义一个路由元数据
    let meta = {
      relativePath: route.path || "",//路径相对父路径的路径 UserAdd relativePath=add
      route, //路由对象
      childrenIndex: index,
    }
    //现在我们的routes其实只有一个元素,/user/*  parentPath=''  relativePath=/user/*
    //path=/user/*
    //把父路径加上自己的相对路径构建成匹配的完整路径
    let path = joinPaths([parentPath, meta.relativePath]);
    //在父meta数组中添加自己这个meta
    let routesMeta = parentsMeta.concat(meta);
    //如果有子路由的话，递归添加到 branches分支数组中
    if (route.children && route.children.length > 0) {
      flattenRoutes(route.children, branches, routesMeta, path);
    }
    branches.push({
      path,
      routesMeta,
      score: computeScore(path, route.index)
    });
  });
  return branches;
}
function joinPaths(paths) {
  // ['/user/*/','/add']=> /user/*/add
  return paths.join('/').replace(/\/\/+/g, '/');
}

export function createRoutesFromChildren(children) {
  let routes = [];
  React.Children.forEach(children, (element) => {
    let route = {
      path: element.props.path,//       /user 此路由对应的路径
      element: element.props.element // <User/> 此路由对应的元素
    }
   if (element.props.children) {
     route.children = createRoutesFromChildren(element.props.children);
   }
    routes.push(route);
  });
  return routes;
}
export function useNavigate() {
  const { navigator } = React.useContext(NavigationContext);
  const navigate = React.useCallback((to) => navigator.push(to), [navigator]);
  return navigate;
}