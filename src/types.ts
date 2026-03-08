import React from "react";

/** Router-agnostic link renderer. Consumers inject their router's Link component. */
export type RenderLink = (props: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  role?: string;
  tabIndex?: number;
  "aria-current"?: "page" | undefined;
}) => React.ReactNode;

/** Default renderLink — plain <a> tag */
export const defaultRenderLink: RenderLink = ({ href, children, ...rest }) =>
  React.createElement("a", { href, ...rest }, children);

/** Navigation link descriptor */
export interface LinkItem {
  label: string;
  href: string;
  active?: boolean;
  external?: boolean;
}

/** Authenticated user info passed to UserMenu */
export interface UserInfo {
  name: string;
  email: string;
  avatarUrl?: string;
  roles: string[];
}

/** Extra menu item for UserMenu extensibility */
export interface ExtraMenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}
