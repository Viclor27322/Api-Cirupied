import { pool } from 'mssql';
import nodemailer from 'nodemailer';

export const sendRecoveryEmail = async (req, res) => {
  const { Token, Correo } = req.body;
  try {
    // Generar código aleatorio de 6 dígitos
    const randomCode = generateRandomCode();

    // Configuración de Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'cirupiedinfo@gmail.com',
        pass: 'efnd nsjt hpbw wzel',
      },
    });
    const resetLink = `http://localhost:3000/reset-password/${Token}`; // Corregido aquí

    // Opciones del correo
    const mailOptions = {
      from: 'cirupiedinfo@gmail.com',
      to: Correo, // Corregido aquí
      subject: 'Recuperacion contraseña',
      html: `
        Haz clic en el siguiente enlace para restablecer tu contraseña: <a class="btn btn-primary" href="${resetLink}">Restaurar</a>
        Si tú no has intentado recuperar la contraseña ignora este correo
      `,
    };

    // Envío del correo
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.response);

    res.status(200).json({ message: 'Correo enviado con éxito', randomCode });

  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ error: 'Error al enviar el correo' });
  }
};
export const sendLogin = async (req, res) => {
  const { Token, Correo } = req.body;

  try {
    const Login = `http://localhost:3000/Login`;

    // Configuración de Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'cirupiedinfo@gmail.com',
        pass: 'efnd nsjt hpbw wzel',
      },
    });

    // Función para realizar la solicitud POST y redirigir al login
    const habilitado = async () => {
      try {
        const result = await fetch('http://localhost:3001/users/reset-Habilitado', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Token: Token,
          }),
        });

        // Verificar si la solicitud fue exitosa
        if (result.ok) {
          // Redirigir al usuario al Login
          res.redirect(Login);
        } else {
          console.error('Error al habilitar la cuenta');
          res.status(500).json({ error: 'Error al habilitar la cuenta' });
        }
      } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        res.status(500).json({ error: 'Error al realizar la solicitud' });
      }
    };

    // Opciones del correo
    const mailOptions = {
      from: 'sportgymcenterinfo@gmail.com',
      to: Correo,
      subject: 'Habilitar cuenta',
      html: `
        Haz clic en el siguiente botón para habilitar tu cuenta: <button onclick="${habilitado}">Iniciar sesión</button>
      `,
    };

    // Envío del correo
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.response);

    res.status(200).json({ message: 'Correo enviado con éxito' });

  } catch (error) {
    console.error('Error al enviar la verificación');
    res.status(500).json({ error: 'Error al enviar el correo de verificación' });
  }
};

// Función para generar un código aleatorio de 6 dígitos
function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

