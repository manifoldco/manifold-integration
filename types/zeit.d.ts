import { UiHookPayload as ZEITUiHookPayload } from '@zeit/integration-utils';

declare namespace ZEIT {
  interface UiHookPayload extends ZEITUiHookPayload {
    project?: {
      id: string;
      name: string;
    };
  }
}
