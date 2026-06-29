import React from 'react';

import { AlertDialog,
         AlertDialogAction,
         AlertDialogCancel,
         AlertDialogContent,
         AlertDialogDescription,
         AlertDialogFooter,
         AlertDialogHeader,
         AlertDialogTitle } from '../ui/alert-dialog';

export interface PopupAlertOptions {
  readonly title: string
  readonly description?: string
  readonly actionText?: string
}

export interface PopupConfirmOptions extends PopupAlertOptions {
  readonly cancelText?: string
}

interface PopupAlertRequest {
  readonly type: 'alert'
  readonly options: PopupAlertOptions
  readonly resolve: () => void
}

interface PopupConfirmRequest {
  readonly type: 'confirm'
  readonly options: PopupConfirmOptions
  readonly resolve: (confirmed: boolean) => void
}

type PopupRequest = PopupAlertRequest | PopupConfirmRequest;

let listener: ((request: PopupRequest) => void) | null = null;

export function alert(options: PopupAlertOptions): Promise<void> {
  return new Promise((resolve) => {
    const request: PopupAlertRequest = { type: 'alert', options, resolve };

    if (!listener) {
      resolve();
      return;
    }

    listener(request);
  });
}

export function confirm(options: PopupConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const request: PopupConfirmRequest = { type: 'confirm', options, resolve };

    if (!listener) {
      resolve(false);
      return;
    }

    listener(request);
  });
}

export function Popup() {
  const [request, setRequest] = React.useState<PopupRequest | null>(null);

  React.useEffect(() => {
    listener = setRequest;

    return () => {
      listener = null;
    };
  }, []);

  if (!request) {
    return null;
  }

  const close = (confirmed: boolean) => {
    if (request.type === 'confirm') {
      request.resolve(confirmed);
    }
    else {
      request.resolve();
    }

    setRequest(null);
  };

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{request.options.title}</AlertDialogTitle>
          {request.options.description
            ? (
              <AlertDialogDescription>
                {request.options.description}
              </AlertDialogDescription>
            )
            : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {request.type === 'confirm'
            ? (
              <AlertDialogCancel onClick={() => close(false)}>
                {request.options.cancelText ?? '취소'}
              </AlertDialogCancel>
            )
            : null}
          <AlertDialogAction
            onClick={() => {
              close(true);
            }}
          >
            {request.options.actionText ?? '확인'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
