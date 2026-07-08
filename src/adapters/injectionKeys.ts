import type { InjectionKey } from 'vue';
import type { PersistencePort } from '@/domain/persistencePort';

export const URL_PORT_KEY = Symbol('urlPort');
export const STORAGE_PORT_KEY = Symbol('storagePort');
export const PERSISTENCE_PORT_KEY: InjectionKey<PersistencePort> = Symbol('persistencePort');
