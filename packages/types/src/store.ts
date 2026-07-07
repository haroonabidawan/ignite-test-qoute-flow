export interface PasswordResetRequestResult {
  resetLink?: string;
}

export interface PasswordResetResult {
  ok: boolean;
  message: string;
}

export interface ApproveQuotationResult {
  message: string;
}
