import { userModel } from '../models/user.js'
import { sendEmailChangePassword } from '../utils/nodemailer.js'
import jwt from 'jsonwebtoken'
import { validatePassword, createHash} from '../utils/bcrypt.js'
import varenv from '../dotenv.js'

export const login = async (req, res) => {
    
        try {
            const user = req.user
            req.session.user = {
                _id: user._id,
                email: user.email,
                rol: user.rol,
                cart_id: user.cart_id,
            };
            console.log("Datos de Sesión:", req.session.user)
            res.status(200).json({ rol: req.session.user.rol })
    
        } catch (error) {
            res.status(500).json({ message: "Error en el servidor" })
        }
    };

/*ruta Current: verificando logueo de usuario, func. asincrona utiliz estrategia JWT
export const current = async (req, res) => {
    try {
        if(req.user) {
            res.status(200).send("Usuario logueado")
        } else {
            res.status(401).send("Usuario no autenticado")

        }
    } catch (e) {
        res.status(500).send("Error al verificar usuario actual")
        }
}*/

export const register = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(400).send("Usuario ya existente en la aplicacion")
        }
        res.redirect('/')

    } catch (error) {
        res.status(500).send("Error al registrar usuario")
    }

}
// LOGOUT : cerrar sesion
export const logout = async (req, res) => {
    const user = await userModel.findOne({ email: req.session.user.email });
    if (user) {
     user.last_connection = new Date();
     await user.save();
    }
    req.session.destroy(function (error) {
        if (error) {
           console.log(error) 
        } else {
            res.status(200).redirect('/')
        }
    })
}
// ruta GitHub
export const sessionGithub = async (req, res) => {
    console.log(req)
    req.session.user = {
        email: req.user.email,
        first_name: req.user.name
    }
    res.redirect('/')

}
//ruta JWT 
export const testJWT = async (req, res) => {
    if (req.user.rol == 'User')
        res.status(403).send("Usuario NO autorizado")
    else
        res.status(200).send(req.user)
}

//ruta reestablecer Contraseña
export const changePassword = async( req, res) => {
    const { token } = req.params
    const { newPassword}  = req.body

    try {
        const validateToken = jwt.verify(token.substr(6,), varenv.jwt_secret )
        const user = userModel.findOne({ email: validateToken.userEmail })
        if(user) {
            if (!validatePassword(newPassword, user.password)) {
                const hashPassword = createHash(newPassword)
                user.password = hashPassword
                const resultado = await userModel.findByIdAndUpdate(user._id, user )
                console.log(resultado)
                res.status(200).send("Contraseña modificada correctamente")
            }else {
                res.status(400).send("Contraseña diferente a la anterior")
                // Contraseñas iguales
            }
        } else {
            // usuario no existe
            res.status(404).send("Usuario NO Encontrado")
        }
    } catch(error) {
        console.log(error)
        if(e?.message == 'jwt expired') {
            res.status(400).send("Expiró el tiempo del Token. Se enviará otro email con nuevo token")
        }
            res.status(500).send("error")


    }
}
//ruta envio de email 
export const sendEmailPassword = async (req, res) => {
    try {
        const { email } = req.body
    //console.log(req.user.email)
        const user = await userModel.find({ email: email }) 

        if (user) {
            const token = jwt.sign({userEmail: email}, varenv.jwt_secret, { expiresIn: '1h'})
            const resetLink = `http://localhost:8000/api/session/reset-password?token=${token}`
            sendEmailChangePassword(email, resetLink ) //(  ,"https://www.google.com/")
            res.status(200).send("Email enviado correctamente")
        } else {
            res.status(404).send("Usuario NO Encontrado")
        }
    } catch (error) {
        console.log(error)
        if ((error.message = "jwt expired")) {
        res.status(400).send("Token Expirado")
        }
        res.status(500).send(error)
    }
}

/* **********REESTABLECER CONTRASEÑA ********

// // Función asíncrona para manejar la solicitud de cambio de contraseña cuando se hace clic en esta ruta.
export const changePassword = async (req, res) => {
    const{email} = req.body//tomamos el email del body
    sendEmailChangePassword(email, "https://www.google.com/")
    //cuanda haga click en la ruta voy a consultar el email.
    // Imprime el correo electrónico del usuario en la consola
   // console.log(req.user.email)
    // Verifica si el usuario tiene permisos de 'premium'.
   // if (req.user.rol == 'premium')
        res.status(200).send("Tiene un 15% de descuento por ser usuario premium");  
}
*/