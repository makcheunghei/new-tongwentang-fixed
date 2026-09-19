import { createConverterMap, type Converter } from 'tongwen-core';
import { LangType, type DicObj, type SrcPack } from 'tongwen-core/dictionaries';
import type { PrefWord } from '../../preference/types/v2';
import { browser } from '../../service/browser';
import { bgGetPref } from '../state/storage';

const dictCache = new Map<string, Promise<DicObj>>();

const getDict = async (dir: LangType, type: 'char' | 'phrase'): Promise<DicObj> => {
  const path = `dictionaries/${dir}-${type}.min.json`;
  const cached = dictCache.get(path);
  if (cached) return cached;

  const request = fetch(browser.runtime.getURL(path)).then(async response => {
    if (!response.ok) throw new Error(`Unable to load dictionary ${path}: HTTP ${response.status}`);
    return response.json() as Promise<DicObj>;
  });
  dictCache.set(path, request);

  try {
    return await request;
  } catch (error) {
    dictCache.delete(path);
    throw error;
  }
};

const createSrcPack = async ({ default: def, custom }: PrefWord): Promise<SrcPack> => {
  return Promise.all([
    def.s2t.char ? getDict(LangType.s2t, 'char') : {},
    def.s2t.phrase ? getDict(LangType.s2t, 'phrase') : {},
    def.t2s.char ? getDict(LangType.t2s, 'char') : {},
    def.t2s.phrase ? getDict(LangType.t2s, 'phrase') : {},
  ]).then(([ss, sp, ts, tp]) => ({ s2t: [ss, sp, custom.s2t], t2s: [ts, tp, custom.t2s] }));
};

let converter: Converter | undefined;
let queue: Promise<Converter> | undefined;
let revision = 0;

export const resetConverter = (): void => {
  revision += 1;
  converter = undefined;
  queue = undefined;
};

export const getConverter = async (): Promise<Converter> => {
  if (converter) return converter;

  const currentRevision = revision;
  queue ??= bgGetPref()
    .then(async pref => createSrcPack(pref.word))
    .then(src => {
      const created = createConverterMap(src);
      if (currentRevision === revision) {
        converter = created;
        queue = undefined;
      }
      return created;
    })
    .catch(error => {
      if (currentRevision === revision) queue = undefined;
      throw error;
    });

  return queue;
};
