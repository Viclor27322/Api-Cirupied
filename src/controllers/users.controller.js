import { getConnection, querysUsers, sql } from "../database";
import { sendRecoveryEmail } from "./email.controller";



export const getUsers = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(querysUsers.getAllUsers);
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

export const createNewUser = async (req, res) => {
  const { Nombre, Correo, Password, Telefono } = req.body;
  console.log(Telefono);

  // Validación
  if (Nombre == null || Correo == null || Password == null, Telefono ==null) {
    return res.status(400).json({ msg: "Bad Request. Please fill all fields" });
  }

  try {
    const pool = await getConnection();
    const randomCode = generateRandomCode();
    // Verifica si ya existe un usuario con el mismo correo
    const userExistResult = await pool
      .request()
      .input("Correo", sql.VarChar, Correo)
      .query(querysUsers.getUserByEmail);

    if (userExistResult.recordset.length > 0) {
      return res.status(400).json({ msg: "Correo electrónico ya registrado. Por favor, elige otro correo." });
    }

    // Si no hay un usuario con el mismo correo, procede a crear uno nuevo
    await pool
      .request()
      .input("Nombre", sql.VarChar, Nombre)
      .input("Correo", sql.VarChar, Correo)
      .input("Password", sql.VarChar, Password)
      .input("Telefono", sql.VarChar, Telefono)
      .input("Habilitado", sql.VarChar, 'Pendiente')
      .input("Token", sql.VarChar, randomCode)
      .input("IdRol", sql.Int, 1)
      .input("IdTipo", sql.Int, 4)
      .input("IdDependencia", sql.Int, 1)
      .query(querysUsers.addNewUser);

    res.json({ Nombre, Correo, randomCode });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error", error: error.message });
  }
};


export const getUserById = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("IdUser", req.params.IdUser)
      .query(querysUsers.getUserById);
    return res.json(result.recordset[0]);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

export const getEmailExist = async (req, res) => {
  const { Correo } = req.params;
  console.log(Correo);
  
  if (!Correo) {
    return res.status(400).json({ msg: "Bad Request. Please provide an email" });
  }

  try {
    const pool = await getConnection();
      const result = await pool
        .request()
        .input("Correo", sql.VarChar, Correo)
        .query(querysUsers.getUserEmailExist);
      if (result.recordset.length === 0) {
        return res.status(404).json({ msg: "User not found" });
      }
  
      res.json(result.recordset[0]);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
export const getUserByEmail = async (req, res) => {
  const { email } = req.params;

  // Validación
  if (email == null) {
      return res.status(400).json({ msg: "Bad Request. Please provide an email" });
  }

  try {
      const pool = await getConnection();
      const result = await pool
          .request()
          .input("email", sql.VarChar, email)
          .query(querysUsers.getUserByEmail);

      if (result.recordset.length === 0) {
          return res.status(404).json({ msg: "User not found" });
      }

      // Envía el correo de recuperación
      const response = await fetch('http://localhost:3001/api/send-email', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              to: email,
          }),
      });

      if (!response.ok) {
          throw new Error('Failed to send recovery email');
      }

      // Extrae el randomCode de la respuesta y agrega a la respuesta del controlador
      const { randomCode } = await response.json();

      res.json({ ...result.recordset[0], randomCode });

  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};


export const deleteUserById = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", req.params.id)
      .query(querysUsers.deleteUser);

    if (result.rowsAffected[0] === 0) return res.sendStatus(404);

    return res.sendStatus(204);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

export const getTotalUsers = async (req, res) => {
  const pool = await getConnection();

  const result = await pool.request().query(querysUsers.getTotalUsers);
  res.json(result.recordset[0][""]);
};

export const updateUserById = async (req, res) => {
  const { username, email, password } = req.body;

  // Validación
  if (username == null || email == null || password == null) {
    return res.status(400).json({ msg: "Bad Request. Please fill all fields" });
  }

  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("username", sql.VarChar, username)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, password)
      .input("id", req.params.id)
      .query(querysUsers.updateUserById);
    res.json({ username, email });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

//Login
export const login = async (req, res) => {
  const { Correo, Password } = req.body;

  // Validación
  if (!Correo || !Password || Correo === '' || Password === '') {
    return res.status(400).json({ msg: "Bad Request. Please provide both email and password" });
  }

  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("Correo", sql.VarChar, Correo)
      .input("Password", sql.VarChar, Password)
      .query(querysUsers.login);

    if (result.recordset.length === 0) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    const user = result.recordset[0];
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error", error: error.message });
  }
};


/// Editar la contaseña
export const resetPassword = async (req, res) => {
  const { Token, Password } = req.body;
  console.log(Token);
  console.log(Password);

  // Validación
  if (!Token || !Password || Token === '' || Password === '') {
    return res.status(400).json({ msg: "Bad Request. Please provide both email and new password" });
  }

  try {
    const pool = await getConnection();

    // Verifica si el usuario existe
    const userExistResult = await pool
      .request()
      .input("Token", sql.VarChar, Token)
      .query(querysUsers.getUserByToken);

    if (userExistResult.recordset.length === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Actualiza la contraseña del usuario
    await pool
      .request()
      .input("Password", sql.VarChar, Password)
      .input("Token", sql.VarChar, Token)
      .query(querysUsers.resetPassword);

    res.json({ msg: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error", error: error.message });
  }
};


//cambiar estado 
export const cambiarHabilitado = async (req, res) => {
  const { Token } = req.params;

  // Validación
  if (Token === '' ) {
    return res.status(400).json({ msg: "Bad Request. Please provide both token" });
  }

  try {
    const pool = await getConnection();

    // Verifica si el usuario existe
    const userExistResult = await pool
      .request()
      .input("Token", sql.VarChar, Token)
      .query(querysUsers.getUserByToken);

    if (userExistResult.recordset.length === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Actualiza la contraseña del usuario
    await pool
      .request()
      .input("Habilitado", sql.VarChar, 'Si')
      .input("Token", sql.VarChar, Token)
      .query(querysUsers.cambiarHabilitado);

    res.json({ msg: "Habilitado reset successfully" });
    res.redirect('http://localhost:3000/Login');
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error", error: error.message });
  }
};

function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}