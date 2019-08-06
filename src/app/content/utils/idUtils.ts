export const stripIdVersion = (id: string): string => id.split('@')[0];
export const getIdVersion = (id: string): string | undefined => id.split('@')[1];
