/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_NWC_RELAYS?: string;
    [key: string]: string | undefined;
  };
}