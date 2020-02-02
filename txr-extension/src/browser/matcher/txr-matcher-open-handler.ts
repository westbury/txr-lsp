/********************************************************************************
 * Copyright (C) 2020 Nigel Westbury and others.
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { injectable } from 'inversify';
import { WidgetOpenHandler, WidgetOpenerOptions } from '@theia/core/lib/browser';
import URI from '@theia/core/lib/common/uri';
import { TxrMatcherWidget, TXR_MATCHER_WIDGET_ID, TxrMatcherWidgetOptions } from './txr-matcher-widget';

export namespace TxrMatcherUri {
    export const scheme = TXR_MATCHER_WIDGET_ID;
    export function extractFromFragment(uri: URI): { txrFileUri: string, textFileUri: string } {
        if (uri.scheme === scheme) {
            const [ txrFileUri, textFileUri ] = uri.fragment.split(':');
            return { txrFileUri, textFileUri };
        }
        throw new Error('The given uri is not an commit detail URI, uri: ' + uri);
    }
}

export type TxrMatcherOpenerOptions = WidgetOpenerOptions & TxrMatcherWidgetOptions;

@injectable()
export class TxrMatcherOpenHandler extends WidgetOpenHandler<TxrMatcherWidget> {
    readonly id = TXR_MATCHER_WIDGET_ID;

    canHandle(uri: URI): number {
        try {
            TxrMatcherUri.extractFromFragment(uri);
            return 200;
        } catch {
            return 0;
        }
    }

    protected async doOpen(widget: TxrMatcherWidget, options: TxrMatcherOpenerOptions): Promise<void> {
        widget.setContent({
            txrFileUri: options.txrFileUri,
            textFileUri: options.textFileUri,
        });
        await super.doOpen(widget, options);
    }

    protected createWidgetOptions(uri: URI, commit: TxrMatcherOpenerOptions): TxrMatcherOpenerOptions {
        return commit;
    }

}
