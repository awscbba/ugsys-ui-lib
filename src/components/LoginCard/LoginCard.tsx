import React from "react";

export interface LoginCardProps {
  /** Card heading — service name, e.g. "Admin Panel" or "Mi Perfil" */
  title: string;
  /** Label for the email input */
  emailLabel?: string;
  /** Label for the password input */
  passwordLabel?: string;
  /** Label for the submit button (idle state) */
  submitLabel?: string;
  /** Label for the submit button (loading state) */
  loadingLabel?: string;
  /** Current email value */
  email: string;
  /** Current password value */
  password: string;
  /** Whether the form is submitting */
  isLoading: boolean;
  /** Error message to display, or null */
  error: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  /** Optional footer content rendered below the submit button (e.g. register link, forgot password) */
  footer?: React.ReactNode;
}

export function LoginCard({
  title,
  emailLabel = "Email",
  passwordLabel = "Password",
  submitLabel = "Sign in",
  loadingLabel = "Signing in…",
  email,
  password,
  isLoading,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  footer,
}: LoginCardProps) {
  return (
    <div className="flex items-center justify-center min-h-screen font-sans">
      <form
        onSubmit={onSubmit}
        noValidate
        aria-label={title}
        className="flex flex-col gap-4 p-10 bg-background rounded-xl shadow-lg w-[360px]"
      >
        <h1
          className="m-0 text-[22px] font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h1>

        {error && (
          <p
            role="alert"
            className="m-0 text-[13px]"
            style={{ color: "var(--color-error)" }}
          >
            {error}
          </p>
        )}

        <label
          className="flex flex-col gap-1 text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {emailLabel}
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            autoComplete="email"
            disabled={isLoading}
            className="px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-input-bg)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "var(--color-input-border)",
              color: "var(--color-text-primary)",
            }}
          />
        </label>

        <label
          className="flex flex-col gap-1 text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {passwordLabel}
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            autoComplete="current-password"
            disabled={isLoading}
            className="px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-input-bg)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "var(--color-input-border)",
              color: "var(--color-text-primary)",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="py-2.5 bg-brand hover:bg-brand/90 text-primary border-none rounded-md text-sm font-semibold cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? loadingLabel : submitLabel}
        </button>

        {footer && <div className="mt-4">{footer}</div>}
      </form>
    </div>
  );
}
