import React from 'react';

import { AlertDialog,
         AlertDialogAction,
         AlertDialogCancel,
         AlertDialogContent,
         AlertDialogDescription,
         AlertDialogFooter,
         AlertDialogHeader,
         AlertDialogTitle } from '../ui/alert-dialog';

export interface SystemDialogAlertOptions {
  readonly title: string
  readonly description?: string
  readonly actionText?: string
  readonly onConfirm?: () => void | Promise<void>
  readonly onClose?: () => void | Promise<void>
}

export interface SystemDialogConfirmOptions extends SystemDialogAlertOptions {
  readonly cancelText?: string
  readonly onCancel?: () => void | Promise<void>
}

interface SystemDialogAlertRequest {
  readonly type: 'alert'
  readonly options: SystemDialogAlertOptions
  readonly resolve: () => void
}

interface SystemDialogConfirmRequest {
  readonly type: 'confirm'
  readonly options: SystemDialogConfirmOptions
  readonly resolve: (confirmed: boolean) => void
}

type SystemDialogRequest = SystemDialogAlertRequest | SystemDialogConfirmRequest;

let listener: ((request: SystemDialogRequest) => void) | null = null;

export function alert(options: SystemDialogAlertOptions): Promise<void> {
  return new Promise((resolve) => {
    const request: SystemDialogAlertRequest = { type: 'alert', options, resolve };

    if (!listener) {
      resolve();
      return;
    }

    listener(request);
  });
}

export function confirm(options: SystemDialogConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const request: SystemDialogConfirmRequest = { type: 'confirm', options, resolve };

    if (!listener) {
      resolve(false);
      return;
    }

    listener(request);
  });
}

export function SystemDialog() {
  const [request, setRequest] = React.useState<SystemDialogRequest | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  React.useEffect(() => {
    listener = setRequest;

    return () => {
      listener = null;
    };
  }, []);

  if (!request) {
    return null;
  }

  const close = async (confirmed: boolean) => {
    if (isPending) {
      return;
    }

    setIsPending(true);

    try {
      if (request.type === 'confirm') {
        if (confirmed) {
          await request.options.onConfirm?.();
        }
        else {
          await request.options.onCancel?.();
        }

        request.resolve(confirmed);
      }
      else {
        await request.options.onConfirm?.();
        request.resolve();
      }

      await request.options.onClose?.();
      setRequest(null);
    }
    finally {
      setIsPending(false);
    }
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
              <AlertDialogCancel onClick={() => void close(false)}>
                {request.options.cancelText ?? '취소'}
              </AlertDialogCancel>
            )
            : null}
          <AlertDialogAction
            onClick={() => {
              void close(true);
            }}
            disabled={isPending}
          >
            {request.options.actionText ?? '확인'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
