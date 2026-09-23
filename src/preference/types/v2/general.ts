import type { LangType } from 'tongwen-core/dictionaries';
import type { Auto, DetTransTarget, Disabled, TransTarget } from '../types';

export type AutoConvertOpt = Disabled | DetTransTarget | TransTarget;

export type BrowserActionOpt = Auto | TransTarget;

export type DetectFallback = 'skip' | 'convert';

export interface PrefGeneral {
  autoConvert: AutoConvertOpt;
  browserAction: BrowserActionOpt;
  defaultTarget: LangType;
  detectFallback: DetectFallback;
  spaMode: boolean;
  updateLangAttr: boolean;
  debugMode: boolean;
}
