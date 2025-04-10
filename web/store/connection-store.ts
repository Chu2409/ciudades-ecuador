import { Connection } from '@/actions/connections';
import { create } from 'zustand'

interface ConnectionState {
  connection?: Connection;
  setConnection: (connection?: Connection) => void;
}

const useConnectionStore = create<ConnectionState>((set) => ({
  connection: undefined,
  setConnection: (connection?: Connection) => set(() => ({ connection  })),
}));

export default useConnectionStore;