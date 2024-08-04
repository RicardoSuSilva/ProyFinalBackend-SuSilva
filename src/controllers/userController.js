import { userModel } from '../models/user.js'

/*export const getUsers = async (req,res) => {
    try {
        const users = await userModel.find()
        req.logger.info("usuarios consultados correctamente")
        res.status(200).send(users)
    } catch (error) {
        req.logger.error(`Metodo: ${req.method} en ruta ${req.url} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}: ${error.message}`)
        res.status(500).send("Error al consultar users: ", e)
    }
}*/
export const getUsers = async () =>  {
    const users = await userModel.find({}, 'first_name last_name email rol')
    return users
}  
export const sendDocuments = async (req, res) => {
  try {
    const { uid } = req.params
    const newDocs = req.body
    const user = await userModel.findByIdAndUpdate(
      uid,
      {
        $push: { documents: { $each: newDocs } },
      },
      { new: true }
    );
    if (!user) {
      res.status(404).send("Usuario No Existe");
    } else {
      res.status(200).send(user);
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

export const deleteInactiveUsers = async () => {
  try {
    const inactiveThreshold = new Date(Date.now() - 30 * 60 * 1000); 
    const inactiveUsers = await userModel.find({
      last_connection: { $lt: inactiveThreshold },
    });

    for (let user of inactiveUsers) {
      await userModel.deleteOne({ _id: user._id });
    }

    return { message: "Usuarios Inactivos Eliminados" };
  } catch (error) {
    throw new Error("Error al Eliminar Usuarios Inactivos: " + error.message);
  }
};
export const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    await userModel.findByIdAndDelete(uid);
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar el usuario: " + error.message });
  }
};

/* Genera productos aleatorio carpeta mockings
export const generateRandomUsers = () => {
    const products = [];
    for (let i = 0; i < 100; i++) {
        products.push(createRandomUser());
    }
    return products;
};*/
