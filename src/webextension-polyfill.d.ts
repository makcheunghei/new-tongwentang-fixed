import type { CommandType } from './service/commands/type';

declare module 'webextension-polyfill' {
  namespace Browser {
    // NOTE: mix with `undefined` is because these API may not exist on the mobile runtime
    const commands:
      | (Omit<Commands.Static, 'onCommand'> & {
          onCommand: Events.Event<(command: CommandType, tab: Tabs.Tab | undefined) => void>;
        })
      | undefined;
    const tabs: Tabs.Static;
  }

  export = Browser;
}
