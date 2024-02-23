export const querys = {
  getAllProducts: "SELECT * FROM Productos",
  getProducById: "SELECT * FROM Productos Where Id = @Id",
  addNewProduct:
    "INSERT INTO Productos (Nombre, Tipo, Descripcion) VALUES (@name,@description,@quantity);",
  deleteProduct: "DELETE FROM Productos WHERE Id= @Id",
  getTotalProducts: "SELECT COUNT(*) FROM Productos",
  updateProductById:
    "UPDATE Productos SET Nombre = @name, Tipo = @description, Descripcion = @quantity WHERE Id = @id",
};

export const querysUsers = {
  getAllUsers: "SELECT * FROM Usuario",
  getUserById: "SELECT * FROM Usuario WHERE IdUser = @IdUser",
  addNewUser: "INSERT INTO Usuario (Nombre,Correo, Password,Telefono,Habilitado,Token,IdRol, IdTipo, IdDependencia) VALUES (@Nombre, @Correo, @Password,@Telefono,@Habilitado,@Token, @IdRol, @IdTipo, @IdDependencia);", 
  deleteUser: "DELETE FROM Usuarios WHERE IdUser = @IdUser",
  getTotalUsers: "SELECT COUNT(*) FROM Usuarios",
  updateUserById: "UPDATE Usuarios SET NombreUsuario = @username, CorreoElectronico = @email, Contraseña = @password WHERE Id = @id",
  getUserByEmail: "SELECT Correo FROM Usuario WHERE Correo = @Correo",
  getUserEmailExist: "SELECT * FROM Usuario WHERE Correo = @Correo",
  login: "SELECT * FROM Usuario WHERE Correo = @correo AND Password = @password",
  resetPassword: "UPDATE Usuario SET Password = @Password WHERE Token = @Token",
  getUserByToken: "SELECT * FROM Usuario WHERE Token = @Token",
  cambiarHabilitado: "UPDATE Usuario SET Habilitado = @Habilitado WHERE Token=@Token"
};  

