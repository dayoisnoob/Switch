export interface FormValues {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

export interface CompleteUserData extends FormValues {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
