
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase, supabaseInitializationError } from '../services/supabaseClient';
import { Machine, Tool, ProductionRecord, CncTimeLog } from '../types';
import { useMockData } from '../hooks/useMockData';
import { useAuth } from './AuthContext';

interface AppData {
  machines: Machine[];
  tools: Tool[];
  productionRecords: ProductionRecord[];
  cncTimeLogs: CncTimeLog[];
}

interface NotificationState {
  message: string;
  type: 'success' | 'error';
}

interface DataContextState extends AppData {
  loading: boolean;
  error: string | null;
  setupRequired: boolean;
  isCncLogSchemaMissing: boolean;
  addCncTimeLog: (log: Omit<CncTimeLog, 'id' | 'userId'>) => Promise<{ error: Error | null }>;
  notification: NotificationState | null;
  hideNotification: () => void;
  showNotification: (message: string, type: 'success' | 'error') => void;
  refetchData: () => Promise<void>;
}

const DataContext = createContext<DataContextState | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>({
    machines: [],
    tools: [],
    productionRecords: [],
    cncTimeLogs: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState<boolean>(false);
  const [isCncLogSchemaMissing, setIsCncLogSchemaMissing] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const mockData = useMockData();
  
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };
  
  const hideNotification = () => {
    setNotification(null);
  };

  const addCncTimeLog = async (log: Omit<CncTimeLog, 'id' | 'userId'>): Promise<{ error: Error | null }> => {
    try {
      if (!user) {
        return { error: new Error("User not authenticated") };
      }
      
      const newLogData = {
        machine_name: log.machineName,
        work_order_number: log.workOrderNumber,
        work_piece_name: log.workPieceName,
        quantity: log.quantity,
        si_no: log.siNo,
        in_time: log.inTime.toISOString(),
        out_time: log.outTime.toISOString(),
        user_id: user.id,
      };

      const { data: insertedData, error: supabaseError } = await supabase!
        .from('cnc_time_logs')
        .insert(newLogData)
        .select()
        .single();
      
      if (supabaseError) {
        console.error("Error adding CNC time log:", supabaseError);
        return { error: new Error(supabaseError.message || 'An unknown database error occurred.') };
      }

      if (insertedData) {
        const newEntry: CncTimeLog = {
          id: insertedData.id,
          machineName: insertedData.machine_name,
          workOrderNumber: insertedData.work_order_number,
          workPieceName: insertedData.work_piece_name,
          quantity: insertedData.quantity,
          siNo: insertedData.si_no,
          inTime: new Date(insertedData.in_time),
          outTime: new Date(insertedData.out_time),
          userId: insertedData.user_id,
        };
        setData(prev => ({ ...prev, cncTimeLogs: [newEntry, ...prev.cncTimeLogs] }));
        showNotification('CNC time log added successfully!', 'success');
      }

      return { error: null };
    } catch (e) {
      console.error("Exception caught while adding CNC time log:", e);
      let errorMessage = 'An unexpected error occurred.';
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as any).message === 'string') {
        errorMessage = (e as any).message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      }
      return { error: new Error(errorMessage) };
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSetupRequired(false);
    setIsCncLogSchemaMissing(false);

    if (supabaseInitializationError) {
      setError(supabaseInitializationError);
      setData({ ...mockData, cncTimeLogs: [] }); 
      setLoading(false);
      return;
    }
    
    const supabaseClient = supabase!;

    try {
      const [machinesRes, toolsRes, productionRecordsRes, cncTimeLogsRes] = await Promise.all([
        supabaseClient.from('machines').select('*'),
        supabaseClient.from('tools').select('*'),
        supabaseClient.from('production_records').select('*').order('timestamp', { ascending: false }),
        supabaseClient.from('cnc_time_logs').select('*').order('created_at', { ascending: false }),
      ]);

      if (cncTimeLogsRes.error && cncTimeLogsRes.error.code === '42P01') {
        setIsCncLogSchemaMissing(true);
      }

      const coreErrors = [machinesRes.error, toolsRes.error, productionRecordsRes.error].filter(Boolean);
      const isMissingCoreTable = coreErrors.some(
        (e) => e?.code === '42P01' || (e?.message && e.message.includes('Could not find the table'))
      );

      if (isMissingCoreTable) {
          throw new Error("Tables not found");
      }
      if (coreErrors.length > 0) {
          throw new Error(coreErrors.map(e => e?.message).join(', '));
      }
      if (cncTimeLogsRes.error && cncTimeLogsRes.error.code !== '42P01') {
        console.error(`Error fetching CNC time logs: ${cncTimeLogsRes.error.message}`);
      }

      const machinesData: Machine[] = (machinesRes.data || []).map((m: any) => ({
          id: m.id, name: m.name, status: m.status, oee: m.oee,
          runningTime: m.running_time, idleTime: m.idle_time, currentPart: m.current_part,
      }));
      const toolsData: Tool[] = (toolsRes.data || []).map((t: any) => ({
          id: t.id, type: t.type, remainingLife: t.remaining_life,
          location: t.location, status: t.status,
      }));
      const productionRecordsData: ProductionRecord[] = (productionRecordsRes.data || []).map((p: any) => ({
          id: p.id, timestamp: new Date(p.timestamp), partId: p.part_id, machineName: p.machine_name,
          quantityProduced: p.quantity_produced, scrapCount: p.scrap_count, cycleTime: p.cycle_time,
      }));
      const cncTimeLogsData: CncTimeLog[] = (cncTimeLogsRes.data || []).map((l: any) => ({
          id: l.id,
          machineName: l.machine_name,
          workOrderNumber: l.work_order_number,
          workPieceName: l.work_piece_name,
          quantity: l.quantity,
          siNo: l.si_no,
          inTime: new Date(l.in_time),
          outTime: new Date(l.out_time),
          userId: l.user_id,
      }));

      setData({ machines: machinesData, tools: toolsData, productionRecords: productionRecordsData, cncTimeLogs: cncTimeLogsData });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      
      if (errorMessage.includes("Tables not found")) {
          console.log("Supabase core tables not found. This is expected during initial setup. Falling back to mock data.");
          setSetupRequired(true);
          setData({ ...mockData, cncTimeLogs: [] });
      } else {
          console.error("An unexpected data fetching error occurred:", errorMessage);
          setError(errorMessage);
            setData({ ...mockData, cncTimeLogs: [] });
      }
    } finally {
      setLoading(false);
    }
  }, [mockData, user]);


  useEffect(() => {
    if (user) {
        fetchData();
    } else {
        setData({ ...mockData, cncTimeLogs: [] });
        setLoading(false);
    }
  }, [user, fetchData, mockData]);

  const value = { ...data, loading, error, setupRequired, isCncLogSchemaMissing, addCncTimeLog, notification, hideNotification, showNotification, refetchData: fetchData };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useAppData = (): DataContextState => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within a DataProvider');
  }
  return context;
};
