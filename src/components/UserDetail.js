import React from "react"
import { UserAPI } from "../utils"
import { useParams, useLocation } from "../react-router-dom"
function UserDetail(props) {
  const [user, setUser] = React.useState({})
  const params = useParams()
	const location = useLocation()
  React.useEffect(() => {
    let user = location.state
    if (!user) {
      let id = params.id
      user = UserAPI.find(id)
    }
    if (user) setUser(user)
  }, [location.state, params.id])
  return (
    <div>
      <p>ID:{user.id}</p>
      <p>username: {user.username}</p>
    </div>
  )
}

export default UserDetail
