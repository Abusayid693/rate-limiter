import React, { useState, useEffect } from "react";
import axios from "axios";

import List from "../components/list";
import Stats from "../components/recent";
import { Form } from "../components/form";
import { SnackbarProvider, enqueueSnackbar } from "notistack";

interface Stats {
  smsSentToday: number;
  smsSentLastMinute: number;
  logs: Array<{ ip: string; phoneNumber: string }>;
}

export const Main: React.FC<any> = ({ phoneNumber }) => {
  const [stats, setStats] = useState<Stats>({
    smsSentToday: 0,
    smsSentLastMinute: 0,
    logs: [],
  });
  const [loading, setLoading] = useState(false);

  const [reloadStats, setReloadStats] = useState(true);

  const reloadData = () => setReloadStats(true);

  const getData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<Stats>(
        `http://localhost:3000/api/stats?phoneNumber=${phoneNumber}`
      );
      console.log("data :", data);

      setStats({
        logs: data.logs as any,
        smsSentToday: data.smsSentToday,
        smsSentLastMinute: data.smsSentLastMinute,
      });
    } catch (error) {
      enqueueSnackbar({
        message:"Unable to load stats",
        variant:"error"
      })
    } finally {
      setLoading(false);
      setReloadStats(false);
    }
  };

  useEffect(() => {
    if (reloadStats) {
      getData();
    }
  }, [reloadStats]);

  return (
    <div className="w-[900px] m-auto">
      <>
      <Form phoneNumber={phoneNumber} reloadData={reloadData} />
        {loading && (
          <div className="mt-[400px]">
            <div
              className="w-12 h-12 rounded-full animate-spin
                    border-8 border-solid border-purple-500 border-t-transparent m-auto"
            ></div>
          </div>
        )}
        {!loading && (
          <>
            <Stats
              smsSentLastMinute={stats.smsSentLastMinute}
              smsSentToday={stats.smsSentToday}
            />
            <List data={stats?.logs} />
          </>
        )}
      </>
    </div>
  );
};