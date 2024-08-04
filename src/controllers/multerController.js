
export const insertImg = (req, res) => {
    try {
        res.status(200).send("Imagen cargada correctamente")
    } catch (error) {
        res.status(500).send("Error al cargar imagen")
    }
}

export const insertDoc = (req, res) => {
    try {
      console.log(req.file);
      res.status(200).send('Documento cargado correctamente');
    } catch (e) {
      res.status(500).send('Error al cargar documento');
    }
}