import React, { useEffect, useState } from 'react';
import { NodeStatusCard } from './NodeStatusCard';
import io from 'socket.io-client';

export const NodeStatusList = () => {
  const socket = io();
  useEffect(() => {
    socket.on('stats', function(data) {
      const stats = data ? data.split('\n') : [];
      if (stats.length > 0) {
        stats.pop();
      }
      setStats(stats);
    });
    return () => {
      socket.disconnect();
    };
  });
  const [stats, setStats] = useState([]);
  return stats.map(s => {
    return <div style={{ marginTop: 16 }}><NodeStatusCard stats={s}/></div>;
  });
};
