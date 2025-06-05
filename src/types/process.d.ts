// Process environment variables declaration
declare namespace NodeJS {
  interface ProcessEnv {
    NOSTR_PRIVATE_KEY?: string;
    [key: string]: string | undefined;
  }
}