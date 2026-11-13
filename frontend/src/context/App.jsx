import { createContext, useContext } from 'react';

export const AppContext = createContext({ version: 0, bump: () => {}, openTxForm: () => {} });
export const useApp = () => useContext(AppContext);
