/// <reference types="vite/client" />

// На случай, если reference выше не сработет в строгом режиме,
// Добавил типы для TS (чтобы tsc --noEmit не ругался) :
declare module '*.svg?react' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
