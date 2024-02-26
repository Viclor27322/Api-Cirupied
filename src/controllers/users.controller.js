import { DateTime } from "mssql";
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
  const { Nombre, Correo, Pass, Telefono, Registro_Pass} = req.body;

  // Validación
  if (Nombre == null || Correo == null || Pass == null  || Telefono ==null|| Registro_Pass ==null) {
    return res.status(400).json({ msg: "Por favor rellena todos los campos" });
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
      .input("Pass", sql.VarChar, Pass)
      .input("Registro_Pass", sql.VarChar, Registro_Pass)
      .input("Telefono", sql.VarChar, Telefono)
      .input("Habilitado", sql.VarChar, 'Habilitado')
      .input("Cuenta", sql.VarChar, 'Habilitado')
      .input("Token", sql.VarChar, randomCode)
      .input("Logueo", sql.DateTime, new Date())
      .input("IdRol", sql.Int, 1)
      .input("IdTipo", sql.Int, 4)
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
    return res.status(400).json({ msg: "Por favor proporciona el Correo" });
  }

  try {
    const pool = await getConnection();
      const result = await pool
        .request()
        .input("Correo", sql.VarChar, Correo)
        .query(querysUsers.getUserEmailExist);
      if (result.recordset.length === 0) {
        return res.status(404).json({ msg: "Usuario no encontrado" });
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
      return res.status(400).json({ msg: "Por favor proporciona el Correo" });
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
  const { Correo, Pass } = req.body;
  console.log(Correo)
  console.log(Pass)
  // Validación
  if (!Correo || !Pass || Correo === '' || Pass === '') {
    return res.status(400).json({ msg: "Asegurate de proporcionar correctamente el correo y contraseña" });
  }

  try {
    const pool = await getConnection();
    const cuentaBloqueadaResult = await pool
      .request()
      .input("Correo", sql.VarChar, Correo)
      .query(querysUsers.verificarCuentaBloqueada);

    if (cuentaBloqueadaResult.recordset.length > 0 && cuentaBloqueadaResult.recordset[0].Cuenta === 'Bloqueado') {
      return res.status(401).json({ msg: "Tu cuenta está bloqueada. Por favor, contacta al administrador para obtener ayuda." });
    }
    const cuentaHabilitado = await pool
      .request()
      .input("Correo", sql.VarChar, Correo)
      .query(querysUsers.verificarHabilitado);

    if (cuentaHabilitado.recordset.length > 0 && cuentaHabilitado.recordset[0].Cuenta === 'Bloqueado') {
      return res.status(401).json({ msg: "Tu cuenta no esta habilitado. Por favor, contacta al administrador para obtener ayuda." });
    }

    // Obtener la fecha de registro de la contraseña
    const resulta = await pool
      .request()
      .input("Correo", sql.VarChar, Correo)
      .query(querysUsers.getRegistroPass);

    if (resulta.recordset.length === 0) {
      return res.status(401).json({ msg: "Correo o contraseña invalidos" });
    }

    const registroPass = resulta.recordset[0].Registro_Pass;
    const fechaActual = new Date();
    const fechaRegistro = new Date(registroPass);
    const diferenciaMeses = (fechaActual - fechaRegistro) / (1000 * 60 * 60 * 24 * 30); // Convertir a meses

    if (diferenciaMeses > 3) {
      return res.status(401).json({ msg: "Password expired. Please reset your password" });
    }

    const result = await pool
      .request()
      .input("Correo", sql.VarChar, Correo)
      .input("Pass", sql.VarChar, Pass)
      .query(querysUsers.login);

    if (result.recordset.length === 0) {
      return res.status(401).json({ msg: "Correo o contraseña invalidos" });
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
  const { Token, Pass } = req.body;


  // Validación
  if (!Token || !Pass || Token === '' || Pass === '') {
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
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Actualiza la contraseña del usuario
    await pool
      .request()
      .input("Pass", sql.VarChar, Pass)
      .input("Token", sql.VarChar, Token)
      .query(querysUsers.resetPassword);

    res.json({ msg: "Se ha resatablecido la contraseña" });
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

export const bloquear = async (req, res) => {
  const { correo } = req.body;

  try {
    const pool = await getConnection();

    // Bloquear al usuario en la base de datos
    await pool.request().input("Correo", correo).query(querysUsers.bloquearcuenta);

    // Configuración de Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'cirupiedinfo@gmail.com',
        pass: 'efnd nsjt hpbw wzel',
      },
    });

    // Opciones del correo
    const mailOptions = {
      from: 'cirupiedinfo@gmail.com',
      to: 'cirupiedinfo@gmail.com', // Cambia esto al correo electrónico al que quieres enviar la notificación
      subject: 'Usuario bloqueado',
      html: `
        <p>Se ha bloqueado al siguiente usuario con el correo electronico</p>
        <p>Correo electrónico: ${correo}</p>
      `,
    };

    // Envío del correo de notificación
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo de notificación enviado:', info.response);

    res.json({ msg: 'Se realizó un bloqueo de tu cuenta. Verifica con el encargado para restablecer.' });
  } catch (error) {
    console.error('Error al bloquear usuario:', error);
    res.status(500).json({ msg: 'Error al bloquear usuario' });
  }
};
