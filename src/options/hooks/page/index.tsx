import { useReducer } from 'react';

export enum PageType {
  general = 'GENERAL',
  menu = 'MENU',
  filter = 'FILTER',
  word = 'WORD',
  about = 'ABOUT',
}

export interface PageAction {
  type: PageType;
}

export interface PageState {
  type: PageType;
}

const pageReducer = (_state: PageState, { type }: PageAction): PageState => ({ type });

export const usePage = () => useReducer(pageReducer, { type: PageType.general });
