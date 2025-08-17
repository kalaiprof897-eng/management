import { useState, useEffect } from 'react';
import { supabase, supabaseInitializationError } from '../services/supabaseClient';
import { Machine, Tool, ProductionRecord } from '../types';

interface AppData {
  machines: Machine[];
  tools: Tool[];
  productionRecords: ProductionRecord[];
}

export const useData = () => {
  const [data, setData] = useState<AppData>({
    machines: [],
    tools: [],
    productionRecords: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState<boolean>(false);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setSetupRequired(false);

      if (supabaseInitializationError) {
        setError(supabaseInitializationError);
        setLoading(false);
        return;
      }
      
      // We can assert that supabase is not null here because of the check above.
      const supabaseClient = supabase!;

      try {
        const [machinesRes, toolsRes, productionRecordsRes] = await Promise.all([
          supabaseClient.from('machines').select('*'),
          supabaseClient.from('tools').select('*'),
          supabaseClient.from('production_records').select('*').order('timestamp', { ascending: false }),
        ]);

        if (machinesRes.error) throw new Error(`Machines fetch error: ${machinesRes.error.message}`);
        if (toolsRes.error) throw new Error(`Tools fetch error: ${toolsRes.error.message}`);
        if (productionRecordsRes.error) throw new Error(`Production records fetch error: ${productionRecordsRes.error.message}`);

        // Explicitly map snake_case fields from Supabase to camelCase fields for the app.
        // This avoids ambiguity and ensures type safety.
        
        const machinesData: Machine[] = (machinesRes.data || []).map((m: any) => ({
            id: m.id,
            name: m.name,
            status: m.status,
            oee: m.oee,
            runningTime: m.running_time,
            idleTime: m.idle_time,
            currentPart: m.current_part,
        }));

        const toolsData: Tool[] = (toolsRes.data || []).map((t: any) => ({
            id: t.id,
            type: t.type,
            remainingLife: t.remaining_life,
            location: t.location,
            status: t.status,
        }));

        const productionRecordsData: ProductionRecord[] = (productionRecordsRes.data || []).map((p: any) => ({
            id: p.id,
            timestamp: new Date(p.timestamp),
            partId: p.part_id,
            machineId: p.machine_id,
            quantityProduced: p.quantity_produced,
            scrapCount: p.scrap_count,
            cycleTime: p.cycle_time,
        }));

        setData({
          machines: machinesData,
          tools: toolsData,
          productionRecords: productionRecordsData,
        });

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while fetching data from Supabase.";
        console.error(errorMessage);
        if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
            setSetupRequired(true);
            setError("Database tables not found. Please follow the setup instructions.");
        } else {
            setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { ...data, loading, error, setupRequired };
};