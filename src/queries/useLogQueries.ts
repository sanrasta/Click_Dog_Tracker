import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import * as logService from '../services/logService';
import { ActivityLog, ActivityNotes, ActivityType } from '../types';
import { DEV_MODE, MOCK_LOGS } from '../constants/devMode';

let devLogs = [...MOCK_LOGS];

export const logKeys = {
  today: (userId: string, dogId: string) =>
    ['logs', userId, dogId, 'today'] as const,
  range: (userId: string, dogId: string, start: string, end: string) =>
    ['logs', userId, dogId, start, end] as const,
};

export function useTodayLogs(dogId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: logKeys.today(user?.uid ?? '', dogId ?? ''),
    queryFn: () => {
      if (DEV_MODE) return Promise.resolve([...devLogs]);
      return logService.fetchTodayLogs(user!.uid, dogId!);
    },
    enabled: !!user && !!dogId,
    refetchInterval: 1000 * 60,
  });
}

export function useLogsByDateRange(
  dogId: string | undefined,
  startDate: Date,
  endDate: Date
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: logKeys.range(
      user?.uid ?? '',
      dogId ?? '',
      startDate.toISOString(),
      endDate.toISOString()
    ),
    queryFn: () => {
      if (DEV_MODE) return Promise.resolve([...devLogs]);
      return logService.fetchLogsByDateRange(user!.uid, dogId!, startDate, endDate);
    },
    enabled: !!user && !!dogId,
  });
}

export function useCreateLog(dogId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      activityType,
      notes,
    }: {
      activityType: ActivityType;
      notes?: ActivityNotes;
    }) => {
      if (DEV_MODE) {
        const newId = `log-${Date.now()}`;
        const newLog: ActivityLog = {
          id: newId,
          activityType,
          timestamp: Timestamp.now(),
          notes: notes ?? {},
        };
        devLogs = [newLog, ...devLogs];
        return newId;
      }
      return logService.createLog(user!.uid, dogId!, activityType, notes);
    },

    onMutate: async ({ activityType }) => {
      const queryKey = logKeys.today(user!.uid, dogId!);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<ActivityLog[]>(queryKey);

      const optimisticLog: ActivityLog = {
        id: `temp-${Date.now()}`,
        activityType,
        timestamp: Timestamp.now(),
        notes: {},
      };

      queryClient.setQueryData<ActivityLog[]>(queryKey, (old) =>
        [optimisticLog, ...(old ?? [])]
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        const queryKey = logKeys.today(user!.uid, dogId!);
        queryClient.setQueryData(queryKey, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: logKeys.today(user!.uid, dogId!),
      });
    },
  });
}

export function useUpdateLogNotes(dogId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ logId, notes }: { logId: string; notes: ActivityNotes }) => {
      if (DEV_MODE) {
        devLogs = devLogs.map((l) =>
          l.id === logId ? { ...l, notes } : l
        );
        return;
      }
      return logService.updateLogNotes(user!.uid, dogId!, logId, notes);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: logKeys.today(user!.uid, dogId!),
      });
    },
  });
}
