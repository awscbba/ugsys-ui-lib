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
}: LoginCardProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-primary font-sans">
      <form
        onSubmit={onSubmit}
        noValidate
        aria-label={title}
        className="flex flex-col gap-4 p-10 bg-white rounded-xl shadow-lg w-[360px]"
      >
        <h1 className="m-0 text-[22px] font-bold text-gray-900">{title}</h1>

        {error && (
          <p role="alert" className="m-0 text-[13px] text-red-600">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm text-gray-700">
          {emailLabel}
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            autoComplete="email"
            disabled={isLoading}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-50 disabled:text-gray-400"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-700">
          {passwordLabel}
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            autoComplete="current-password"
            disabled={isLoading}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-50 disabled:text-gray-400"
          />
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="py-2.5 bg-brand hover:bg-brand/90 text-primary border-none rounded-md text-sm font-semibold cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? loadingLabel : submitLabel}
        </button>
      </form>
    </div>
  );
}
