
import React from 'react';
import { Machine, MachineStatus, Tool, ToolStatus, ProductionRecord } from '../types';

const generateMockData = () => {
  const machines: Machine[] = Array.from({ length: 8 }, (_, i) => {
    const statuses = [MachineStatus.Running, MachineStatus.Idle, MachineStatus.Maintenance, MachineStatus.Error];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const runningTime = Math.floor(Math.random() * 20) + 4;
    const idleTime = (status === MachineStatus.Running) ? Math.floor(Math.random() * 4) : Math.floor(Math.random() * 24);
    return {
      id: `CNC-00${i + 1}`,
      name: `CNC Mill ${i + 1}`,
      status,
      oee: Math.floor(Math.random() * 30) + 65,
      runningTime,
      idleTime,
      currentPart: status === MachineStatus.Running ? `PART-${Math.floor(Math.random() * 1000)}` : null,
    };
  });

  const tools: Tool[] = Array.from({ length: 50 }, (_, i) => {
    const statuses = [ToolStatus.Active, ToolStatus.Inactive, ToolStatus.NeedsReplacement];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const remainingLife = (status === ToolStatus.NeedsReplacement) ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 80) + 20;
    return {
      id: `TOOL-${1000 + i}`,
      type: `End Mill ${Math.ceil((i+1)/5)}mm`,
      remainingLife,
      location: `Cabinet ${String.fromCharCode(65 + Math.floor(i / 10))}-S${(i%10)+1}`,
      status,
    };
  });

  const productionRecords: ProductionRecord[] = [];
  const now = new Date();
  for (let i = 0; i < 200; i++) {
    const machine = machines[Math.floor(Math.random() * machines.length)];
    productionRecords.push({
      id: `PR-${Date.now() - i * 100000}-${i}`,
      partId: `PART-${Math.floor(Math.random() * 1000)}`,
      machineName: machine.name,
      quantityProduced: Math.floor(Math.random() * 50) + 50,
      scrapCount: Math.floor(Math.random() * 5),
      cycleTime: Math.floor(Math.random() * 60) + 30,
      timestamp: new Date(now.getTime() - i * 30 * 60 * 1000), // records every 30 mins
    });
  }

  return { machines, tools, productionRecords };
};


export const useMockData = () => {
    const mockData = React.useMemo(() => generateMockData(), []);
    return mockData;
}