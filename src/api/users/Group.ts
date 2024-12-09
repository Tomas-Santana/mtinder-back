import e from 'express'
import type { RouterGroup } from '../../types/server/RouterGroup'
import { deleteUser, getUsers, updateUser } from './User'
import { token } from '../middleware/token'
import { me } from './me'

class UserGroup implements RouterGroup {
  public path = '/user'
  public router = e.Router()

  getRouter(): e.Router {
    this.router.use(token)
    this.router.put('/:id', updateUser)
    this.router.delete('/:id', deleteUser)
    this.router.get("/all", getUsers)
    this.router.get("/me", me)
    return this.router
  }
}

export default UserGroup