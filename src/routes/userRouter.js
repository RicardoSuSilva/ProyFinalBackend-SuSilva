import { Router } from 'express'
import { getUsers, sendDocuments, deleteInactiveUsers, deleteUser } from '../controllers/userController.js'

const userRouter = Router()

//userRouter.get('/', getUsers)
userRouter.get("/", async (req, res) => {
    try {
      const users = await getUsers()
      res.status(200).send(users)
    } catch (error) {
      res.status(500).send("Error al consultar users:", error)
    }
  })

userRouter.get('/session', (req, res) => {
  try {
    if(req.session.user) {
      res.status(200).json(req.session.user)
    } else {
      res.status(401).send("Usuario NO Autenticado")
    }
  }catch (error) {
    res.status(500).send("Error interno del Servidor")
  }
})
userRouter.post('/:uid/documents', sendDocuments)

userRouter.delete('/', deleteInactiveUsers)

userRouter.delete('/admin/:uid', deleteUser)

export default userRouter