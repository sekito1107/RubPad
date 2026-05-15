import { registerInspectValueCommand } from './command/inspectValue';

export const registerCommands = () => {
  const disposables = [
    registerInspectValueCommand(),
  ];

  return {
    dispose: () => {
      disposables.forEach(d => d.dispose());
    }
  };
};
