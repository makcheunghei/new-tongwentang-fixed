import type { ChangeEventHandler } from 'react';
import { useEffect, useState } from 'react';
import { updatePreference } from '../../../service/storage/preference-update';
import { getDefaultPref } from '../../../preference/default';
import type { Pref } from '../../../preference/types/lastest';
import { getStorage, listenStorage } from '../../../service/storage/storage';

export const useMenu = () => {
  const [menu, setMenu] = useState(() => getDefaultPref().menu);

  const setMenuEnable: ChangeEventHandler<HTMLInputElement> = e => {
    void updatePreference({ section: 'menu', enabled: e.currentTarget.checked });
  };
  const setItem =
    (group: 'webpage' | 'textarea', target: 's2t' | 't2s'): ChangeEventHandler<HTMLInputElement> =>
    e => {
      void updatePreference({ section: 'menuItem', group, target, enabled: e.currentTarget.checked });
    };
  const setWebS2t = setItem('webpage', 's2t');
  const setWebT2s = setItem('webpage', 't2s');
  const setTextS2t = setItem('textarea', 's2t');
  const setTextT2s = setItem('textarea', 't2s');

  useEffect(
    () =>
      listenStorage(
        changes => {
          if (changes.menu?.newValue) setMenu(changes.menu.newValue as Pref['menu']);
        },
        { keys: ['menu'], areaName: ['local'] },
      ),
    [],
  );

  useEffect(() => {
    getStorage('menu').then(({ menu }) => {
      setMenu(menu);
    });
  }, []);

  return { menu, setMenuEnable, setWebS2t, setWebT2s, setTextS2t, setTextT2s };
};
