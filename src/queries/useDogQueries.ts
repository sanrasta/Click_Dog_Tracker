import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import * as dogService from '../services/dogService';
import { DEV_MODE, getDevDog, setDevDog } from '../constants/devMode';
import { Dog } from '../types';

export const dogKeys = {
  all: (userId: string) => ['dogs', userId] as const,
  active: (userId: string) => ['dogs', userId, 'active'] as const,
};

export function useActiveDog() {
  const { user } = useAuth();
  return useQuery({
    queryKey: dogKeys.active(user?.uid ?? ''),
    queryFn: () => {
      if (DEV_MODE) return Promise.resolve(getDevDog());
      return dogService.fetchActiveDog(user!.uid);
    },
    enabled: !!user,
  });
}

export function useDogs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: dogKeys.all(user?.uid ?? ''),
    queryFn: () => {
      if (DEV_MODE) {
        const dog = getDevDog();
        return Promise.resolve(dog ? [dog] : []);
      }
      return dogService.fetchDogs(user!.uid);
    },
    enabled: !!user,
  });
}

export function useAddDog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; breed: string; photoUri?: string | null }) => {
      if (DEV_MODE) {
        const newDog: Dog = {
          id: `dog-${Date.now()}`,
          name: data.name,
          breed: data.breed,
          originalPhotoUrl: data.photoUri ?? null,
          stickerPhotoUrl: null,
          createdAt: Timestamp.now(),
          isActive: true,
        };
        setDevDog(newDog);
        return newDog.id;
      }
      return dogService.addDog(user!.uid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogKeys.all(user!.uid) });
      queryClient.invalidateQueries({ queryKey: dogKeys.active(user!.uid) });
    },
  });
}

export function useUploadDogPhoto() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dogId, uri }: { dogId: string; uri: string }) => {
      if (DEV_MODE) return uri;
      return dogService.uploadDogPhoto(user!.uid, dogId, uri);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogKeys.active(user!.uid) });
    },
  });
}
