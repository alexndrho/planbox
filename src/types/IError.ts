export type systemCode = "unknown-error";

export type authCode =
  | "auth/invalid-email"
  | "auth/invalid-password"
  | "auth/invalid-input";

export default interface IError {
  errors: {
    code: systemCode | authCode;
    message: string;
  }[];
}
