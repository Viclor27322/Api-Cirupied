import { Router } from "express";
import {
  sendRecoveryEmail,
  sendLogin
} from "../controllers/email.controller"; // Asegúrate de importar los controladores de usuarios

const router = Router();

router.post("/send-email", sendRecoveryEmail);

router.post("/sendLogin",sendLogin);

export default router;
