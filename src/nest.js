// 1. 把虚拟 DOM 的 children 转成路由配置对象数组
let routes = [
  {
    path: "/user/*",
    element: "User",
    children: [{ path: "add", element: "UserAdd" }]
  }
]

let branches = [
  {
    path: "/user/*/add", // 子分子在前面
    routesMeta: [
      {
        relativePath: "/user/*", // 父 meta
        route: {
          path: "/user/*",
          element: "User",
          children: [{ path: "add", element: "" }]
        }
      },
      {
        relativePath: "add", // 子 meta
        route: { path: "add", element: "UserAdd" }
      }
    ]
  },
  {
    path: "/user/*", // 父分支在后面
    routesMeta: [
      {
        relativePath: "/user/*",
        route: {
          path: "/user/*",
          element: "User",
          children: [{ path: "add", element: "" }]
        }
      }
    ]
  }
]

let match = {
  params: { "*": "add" },
  pathname: "/user/add",
  pathnameBase: "/user"
}

let matches = [
  {
    params: { "*": "add" },
    pathname: "/user/add",
    pathnameBase: "/user",
    route: {
      path: "/user/*",
      element: "User",
      children: [
        {
          path: "add",
          element: "UserAdd"
        }
      ]
    }
  },
  {
    params: { "*": "add" },
    pathname: "/user/add",
    pathnameBase: "/user/add",
    route: {
      path: "add",
      element: "UserAdd"
    }
  }
]
