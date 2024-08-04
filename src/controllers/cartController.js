import cartModel from '../models/cart.js'
import productModel from '../models/product.js'
import ticketModel from '../models/ticket.js'
import crypto from 'crypto'

//mostrar carrito
export const getCart = async (req, res) => {
    try {
        const cartId = req.params.cid
        const cart = await cartModel.findById(cartId).populate('products.id_prod');
        res.status(200).send(cart);
            productos: productosProcesados
    } catch (error) {
        res.status(500).send(`Error interno del servidor al consultar carrito: ${error}`)
    }
};

//crear carrito
export const createCart = async (req, res) => {
    try {
        const mensaje = await cartModel.create({ products: [] });
        res.status(201).send(mensaje);
    } catch (error) {
        res.status(500).send(`Error interno del servidor al crear carrito: ${error}`)
    }
};

// insertar productos al carrito
export const insertProductCart = async (req, res) => {
    try {
            const cartId = req.params.cid
            const productId = req.params.pid
            const { quantity } = req.body
            const cart = await cartModel.findById(cartId)

            if (!cart) {
                return res.status(404).send("Carrito NO encontrado");
            }

            const indice = cart.products.findIndex(product => product.id_prod == productId)

            if (indice !== -1) {
                cart.products[indice].quantity = quantity
            } else {
                cart.products.push({ id_prod: productId, quantity: quantity })
            }

            await cart.save()
            res.status(200).send(cart);
            
        } catch (error) {
            res.status(500).send(`Error interno del servidor al crear producto: ${error}`)
            }
};

//generar ticket
export const createTicket = async (req, res) => {
    try {
        const cartId = req.params.cid
        const cart = await cartModel.findById(cartId).populate('products.id_prod')
        const prodSinStock = []

        if (cart) {
            for (const prod of cart.products) {
                let producto = await productModel.findById(prod.id_prod);
                if (!producto || producto.stock < prod.quantity) {
                  prodSinStock.push(prod.id_prod);
                }
            }
            
            if (prodSinStock.length === 0) {
                let totalPrice = cart.products.reduce((total, prod) => {
                    return total + prod.id_prod.price * prod.quantity;
                  }, 0);
           
                const newTicket = await ticketModel.create({
                    code: crypto.randomUUID(),
                    purchaser: req.user.email,
                    amount: totalPrice,
                    products: cart.products
                })

                for (const prod of cart.products) {
                    await productModel.findByIdAndUpdate(prod.id_prod, {
                      $inc: { stock: -prod.quantity }, 
                    })    
                }
                    await cartModel.findByIdAndUpdate(cartId, { products: [] });
                    res.status(200).json({ ticketId: newTicket._id });

            } else {
                cart.products = cart.products.filter(
                  (prod) => !prodSinStock.includes(prod.id_prod)
                );
        
                await cartModel.findByIdAndUpdate(cartId, { products: cart.products });
                res.status(400).send(`Productos sin stock: ${prodSinStock}`);
            }
        } else {
            res.status(404).send("Carrito NO encontrado");
        }
    } catch (error) {
        console.error("Error interno del servidor:", error);
        res.status(500).send(`Error interno del servidor: ${error.message}`);
        }
}      
//mostrar ticket
export const getTicket = async (req, res) => {
    try {
      const ticketId = req.params.tid;
      const ticket = await ticketModel.findById(ticketId).populate('products.id_prod');
      if (!ticket) {
        return res.status(404).send("Ticket NO encontrado");
      }
      res.status(200).send(ticket);
    } catch (error) {
      res.status(500).send(`Error interno del servidor al consultar ticket: ${error}`);
    }
  }





/*actualizar el carrito
export const updateCart = async (req, res) => {
    try {
        if (req.user.rol == "User" || req.user.rol == "UserPremium") {
            const cartId = req.params.cid;
            const { products } = req.body;
            const cart = await cartModel.findByIdAndUpdate(cartId, { products }, { new: true });

            req.logger.info("Carrito actualizado correctamente")

            res.status(200).send(cart);
        } else {
            req.logger.error(`Metodo: ${req.method} en ruta ${req.url} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}: Usuario no autorizado`)

            res.status(403).send("Usuario no autorizado")
        }
    } catch (error) {
        req.logger.error(`Metodo: ${req.method} en ruta ${req.url} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}: ${error.message}`)

        res.status(500).send("Error interno del servidor al actualizar el carrito");
    }
}

//actualizar la cantidad de un producto
export const updateQuantity = async (req, res) => {
    try {
        if (req.user.rol == "User" || req.user.rol == "UserPremium") {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            let { quantity } = req.body;

            if (!quantity || isNaN(quantity)) {
                quantity = 1;
            }
            const cart = await cartModel.findById(cartId);
            const index = cart.products.findIndex(product => product.id_prod.toString() === productId);
            if (index !== -1) {
                cart.products[index].quantity += parseInt(quantity);
                await cart.save();

                req.logger.info("Cantidad actualizada correctamente")

                res.status(200).send(cart);
            } else {
                req.logger.error(`Metodo: ${req.method} en ruta ${req.url} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}: No se encontró el producto que buscas`)

                res.status(404).send('Producto no encontrado en el carrito');
            }
        } else {
            req.logger.error(`Metodo: ${req.method} en ruta ${req.url} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}: Usuario no autorizado`)

            res.status(403).send("Usuario no autorizado")
        }

    } catch (error) {
        req.logger.error(`Metodo: ${req.method} en ruta ${req.url} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}: ${error.message}`)

        res.status(500).send("Error interno del servidor al actualizar la cantidad del producto");
    }
};

//eliminar un producto del carrito
export const deleteProductCart = async (req, res) => {
    try {
        if (req.user.rol == "User" || req.user.rol == "UserPremium") {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            const cart = await cartModel.findById(cartId);
            cart.products = cart.products.filter(products => products.id_prod.toString() !== productId);
            await cart.save();

            req.logger.info("Producto eliminado del carrito")

            res.status(200).send(cart);
        } else {
            req.logger.error(`Metodo: ${req.method} en ruta ${req.url} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}: Usuario no autorizado`)

            req.status(403).send("Usuario no autorizado")
        }
    } catch (error) {
        req.logger.error(`Metodo: ${req.method} en ruta ${req.url} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}: ${error.message}`)

        res.status(500).send("Error interno del servidor al eliminar el producto del carrito");
    }
}


//vaciar el carrito
export const emptyCart = async (req, res) => {
    try {
        if (req.user.rol == "User" || req.user.rol == "UserPremium") {
            const cartId = req.params.cid;
            const cart = await cartModel.findByIdAndUpdate(cartId, { products: [] }, { new: true });

            res.status(200).send(cart);
        } else {

            res.status(403).send("Usuario no autorizado")
        }
    } catch (error) {

        res.status(500).send("Error interno del servidor al eliminar todos los productos del carrito");
    }
}
*/
