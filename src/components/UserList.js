import React from "react"
import { UserAPI } from "../utils"
import { Link } from "../react-router-dom"
function UserList() {
  const [users, setUsers] = React.useState([])
  React.useEffect(() => {
    let users = UserAPI.list()
    setUsers(users)
  }, [])
  return (
    <ul>
      {users.map((user, index) => (
        <li key={index}>
          <Link to={{ pathname: `/user/detail/${user.id}`, state: user }}>
            {user.username}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default UserList
