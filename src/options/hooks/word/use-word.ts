import { useEffect, useState } from 'react';
import { getDefaultPref } from '../../../preference/default';
import type { PrefWord } from '../../../preference/types/v2';
import { getStorage, listenStorage } from '../../../service/storage/storage';

export const useWord = () => {
  const [word, setWord] = useState<PrefWord>(() => getDefaultPref().word);

  useEffect(
    () =>
      listenStorage(
        ({ word }) => {
          if (word?.newValue) setWord(word.newValue as PrefWord);
        },
        { keys: ['word'], areaName: ['local'] },
      ),
    [],
  );

  useEffect(() => {
    getStorage('word').then(({ word }) => setWord(word));
  }, []);

  return { word, setWord };
};
