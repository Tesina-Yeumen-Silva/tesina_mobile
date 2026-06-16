import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { LoginRequest, RegisterRequest } from "@/models";

export interface ActionResult<T = void> {
  ok: boolean;
  error?: string;
  data?: T;
}

export const authController = {
  loginAction: async (credentials: LoginRequest): Promise<ActionResult> => {
    if (!credentials.email || !credentials.email.includes("@")) {
      return { ok: false, error: "Por favor, ingrese un email válido." };
    }
    if (!credentials.password || credentials.password.length < 6) {
      return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
    }

    try {
      await useAuthStore.getState().login(credentials);
      return { ok: true };
    } catch (error: any) {
      return {
        ok: false,
        error: error.response?.data?.message || "Email o contraseña incorrectos.",
      };
    }
  },

  registerAction: async (userData: RegisterRequest): Promise<ActionResult<string>> => {
    if (!userData.name.trim()) {
      return { ok: false, error: "El nombre es obligatorio." };
    }
    if (!userData.email.includes("@")) {
      return { ok: false, error: "Por favor, ingrese un email válido." };
    }
    if (userData.password.length < 6) {
      return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
    }

    try {
      const signupToken = await useAuthStore.getState().register(userData);
      return { ok: true, data: signupToken };
    } catch (error: any) {
      return {
        ok: false,
        error: error.response?.data?.message || "Ocurrió un error al registrarse.",
      };
    }
  },

  confirmRegisterAction: async (
    email: string,
    code: string,
    signupToken: string,
  ): Promise<ActionResult> => {
    if (!code) {
      return { ok: false, error: "Por favor, ingrese el código de verificación." };
    }

    try {
      await useAuthStore.getState().confirmRegister(email, code, signupToken);
      return { ok: true };
    } catch (error: any) {
      return {
        ok: false,
        error: error.response?.data?.message || "Código incorrecto o expirado.",
      };
    }
  },

  requestPasswordResetAction: async (email: string): Promise<ActionResult> => {
    if (!email || !email.includes("@")) {
      return { ok: false, error: "Por favor, ingrese un correo válido." };
    }

    try {
      await authService.requestPasswordReset(email);
      return { ok: true };
    } catch (error: any) {
      return {
        ok: false,
        error: error.response?.data?.message || "Error al solicitar restablecer contraseña.",
      };
    }
  },

  confirmPasswordResetAction: async (
    email: string,
    code: string,
    newPassword: string,
  ): Promise<ActionResult> => {
    if (!code) {
      return { ok: false, error: "Por favor, ingrese el código." };
    }
    if (newPassword.length < 6) {
      return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
    }

    try {
      await authService.confirmPasswordReset(email, code, newPassword);
      return { ok: true };
    } catch (error: any) {
      return {
        ok: false,
        error: error.response?.data?.message || "Error al restablecer la contraseña.",
      };
    }
  },

  logoutAction: async (): Promise<void> => {
    await useAuthStore.getState().logout();
  },
};
