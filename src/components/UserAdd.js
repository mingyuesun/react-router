import React from "react"
import { UserAPI } from "../utils.js"
import { useNavigate } from "../react-router-dom"
function UserAdd() {
  const usernameRef = React.useRef()
  const navigate = useNavigate()
  const handleSubmit = (event) => {
    event.preventDefault()
    let username = usernameRef.current.value
    let user = { id: Date.now() + "", username }
    UserAPI.add(user)
    navigate("/user/list")
  }
  return (
    <form onSubmit={handleSubmit}>
      <input ref={usernameRef} type="text" />
      <button type="submit">添加</button>
    </form>
  )
}

export default UserAdd
