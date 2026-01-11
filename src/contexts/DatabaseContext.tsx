import Database, { QueryResult } from "@tauri-apps/plugin-sql";
import React, { useMemo } from "react";

import { AppRuntime, appRuntime, assertNever, OnlyChildren } from "../utils.ts";

export type SQLValue = string | number | boolean | null;

export type Select = (query: string, params?: SQLValue[]) => Promise<unknown>;
export type ExecuteSQL = (query: string, params?: SQLValue[]) => Promise<QueryResult>;

export interface DatabaseContextType {
  select: Select;
  executeSql: ExecuteSQL;
}

const DatabaseContext = React.createContext<DatabaseContextType | null>(null);

function DatabaseProvider({ children }: React.PropsWithChildren) {
  const dbPromise = useMemo(() => {
    return Database.load("sqlite:meebible.db");
  }, []);

  const value = useMemo(
    (): DatabaseContextType => ({
      select: async (query: string, params?: SQLValue[]) => {
        const db = await dbPromise;
        return db.select(query, params || []);
      },
      executeSql: async (query: string, params?: SQLValue[]) => {
        const db = await dbPromise;
        return db.execute(query, params || []);
      },
    }),
    [],
  );

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export function useDatabaseContext(): DatabaseContextType {
  const context = React.useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabaseContext must be used within a DatabaseProvider");
  }
  return context;
}

export function OptionalDatabaseProvider({ children }: OnlyChildren) {
  switch (appRuntime) {
    case AppRuntime.TAURI:
      return <DatabaseProvider>{children}</DatabaseProvider>;
    case AppRuntime.WEB:
      return <>{children}</>;
    default:
      assertNever(appRuntime);
  }
}
