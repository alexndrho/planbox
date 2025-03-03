export type systemCode = "unknown-error" | "not-found";

export type authCode =
  | "auth/invalid-email"
  | "auth/invalid-password"
  | "auth/invalid-input"
  | "auth/unauthorized";

export type validationCode =
  | "validation/unique-constraint"
  | "validation/invalid-input";

export type errorCode = systemCode | authCode | validationCode;

export default interface IError {
  errors: {
    code: errorCode;
    message: string;
  }[];
}
