import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginCard } from "../src/components/LoginCard/LoginCard";

function renderCard(
  overrides: Partial<React.ComponentProps<typeof LoginCard>> = {},
) {
  const props = {
    title: "Test App",
    email: "",
    password: "",
    isLoading: false,
    error: null,
    onEmailChange: vi.fn(),
    onPasswordChange: vi.fn(),
    onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    ...overrides,
  };
  return { ...render(<LoginCard {...props} />), props };
}

describe("LoginCard", () => {
  it("renders title, email input, password input, and submit button", () => {
    renderCard({ title: "Admin Panel" });
    expect(
      screen.getByRole("heading", { name: "Admin Panel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("uses custom labels when provided", () => {
    renderCard({
      emailLabel: "Correo electrónico",
      passwordLabel: "Contraseña",
      submitLabel: "Iniciar sesión",
    });
    expect(screen.getByText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByText("Contraseña")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
  });

  it("shows loading label and disables button while loading", () => {
    renderCard({ isLoading: true, loadingLabel: "Signing in…" });
    const btn = screen.getByRole("button", { name: /signing in/i });
    expect(btn).toBeDisabled();
  });

  it("shows error message when error is set", () => {
    renderCard({ error: "Invalid credentials" });
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials");
  });

  it("does not render alert when error is null", () => {
    renderCard({ error: null });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls onEmailChange when email input changes", () => {
    const { props } = renderCard();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "dev@example.com" },
    });
    expect(props.onEmailChange).toHaveBeenCalledWith("dev@example.com");
  });

  it("calls onPasswordChange when password input changes", () => {
    const { props } = renderCard();
    const passwordInput = document.querySelector(
      'input[type="password"]',
    ) as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: "secret" } });
    expect(props.onPasswordChange).toHaveBeenCalledWith("secret");
  });

  it("calls onSubmit when form is submitted", () => {
    const { props } = renderCard({ email: "a@b.com", password: "pass" });
    fireEvent.submit(screen.getByRole("form", { name: "Test App" }));
    expect(props.onSubmit).toHaveBeenCalled();
  });

  it("button is enabled when not loading", () => {
    renderCard({ isLoading: false });
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("inputs are disabled while loading", () => {
    renderCard({ isLoading: true });
    const emailInput = document.querySelector(
      'input[type="email"]',
    ) as HTMLInputElement;
    const passwordInput = document.querySelector(
      'input[type="password"]',
    ) as HTMLInputElement;
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });
});
