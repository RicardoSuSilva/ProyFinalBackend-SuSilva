export const toAdmin = (req, res, next) => {
    console.log(req.session.user);
    if (req.session.user) {
      next() // Continuar si el usuario tiene rol de Admin
    } else {
      res.status(403).send("Acceso denegado")
    }
  }