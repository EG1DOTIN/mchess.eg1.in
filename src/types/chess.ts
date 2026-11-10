/**
 * Chess engine and module instance interfaces for runtime components.
 */

export interface ChessModuleInstance {
  destroy?: () => void;
  clockTimer?: ReturnType<typeof setInterval>;
  clockInterval?: ReturnType<typeof setInterval>;
  heartbeatInterval?: ReturnType<typeof setInterval>;
  stockfishWorker?: { terminate: () => void };
  peer?: { destroy: () => void };
  playerName?: string;
  registerLobbyPresence?: () => void;
  [key: string]: unknown;
}

