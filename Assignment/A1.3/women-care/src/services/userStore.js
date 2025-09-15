// getAllUsers, addUser, isUsernameExists
export function getAllUsers() {
  const users = localStorage.getItem('registeredUsers')
  return users ? JSON.parse(users) : []
}

// addUser
export function addUser(userData) {
  const users = getAllUsers()
  const newUser = {
    ...userData,
    registeredAt: new Date().toLocaleDateString(),
  }
  users.push(newUser)
  localStorage.setItem('registeredUsers', JSON.stringify(users))
}

// check if username exists
export function isUsernameExists(username) {
  const users = getAllUsers()
  return users.some((user) => user.username === username)
}
