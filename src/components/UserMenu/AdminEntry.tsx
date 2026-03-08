interface AdminEntryProps {
  adminPanelUrl: string;
  onClose: () => void;
}

/** Internal sub-component — not exported from the library */
export function AdminEntry({ adminPanelUrl, onClose }: AdminEntryProps) {
  return (
    <a
      href={adminPanelUrl}
      role="menuitem"
      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-brand hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-accent"
      onClick={onClose}
    >
      {/* Shield icon */}
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      Panel de Administración
    </a>
  );
}
