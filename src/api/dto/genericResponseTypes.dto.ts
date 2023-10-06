export class ArrayResponse<T> {
  result: T[] = [];
  limit?: number;
  page?: number;
  filter?: object;
  message?: string = '';
}

export interface ObjectResponse<T> {
  result: T | null;
  message?: string;
}
