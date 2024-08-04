import { Schema, model } from 'mongoose'
import cartModel from './cart.js'

const userSchema = new Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        unique: true,
        index: true
    },
    rol: {
        type: String,
        default: 'User',
    },
    documents: {
        type: Array,
        default: [],
      },
    last_connection: {
        type: Date,
      },

      cart_id: {
        type: Schema.Types.ObjectId,
        ref: 'carts'
    },
})
// Define un middleware pre-save para el modelo userSchema, que se ejecuta antes de guardar un nuevo documento de usuario
userSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const newCart = await cartModel.create({ products: [] })
            this.cart_id = newCart._id;
        } catch (error) {
        // Si ocurre un error, pásalo al siguiente middleware en la cadena
        //NEXT se usa para continuar
        return next(error)
        }
    }
    next();
});

// Define un middleware pre-find para el modelo userSchema, que se ejecuta antes de buscar documentos de usuario
userSchema.pre(['find', 'findOne'], function (next) {
        // Encuentra un documento de carrito por su _id
        //const PRODS = await cartModel.findOne({ _id: '65f61c1cb5793c2ca93ed7f9' })
        // Registra el documento de carrito encontrado
        //console.log(PRODS)
        // Rellena el campo 'cart_id' del documento de usuario actual con el documento de carrito referenciado
        this.populate('cart_id')
        next()
})

export const userModel = model('users', userSchema)
