/********************************************************************************
 * Copyright (C) 2020 Nigel Westbury and others.
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { injectable } from 'inversify';
import { WidgetOpenHandler, WidgetOpenerOptions } from '@theia/core/lib/browser';
import URI from '@theia/core/lib/common/uri';
import { TxrMatcherWidget, TXR_MATCHER_WIDGET_ID, TxrMatcherWidgetOptions } from './txr-matcher-widget';

export namespace TxrMatcherUri {
    export const txrMatcherScheme = 'txr-matcher';

    export function extractFromUri(uri: URI): { txrFileUri: string, textFileUri: string } {
        if (uri.scheme !== txrMatcherScheme) {
            throw new Error((`The URI must have scheme "${txrMatcherScheme}". The URI was: ${uri}.`));
        }
        const diffUris: string[] = JSON.parse(uri.query);
        return { txrFileUri: diffUris[0], textFileUri: diffUris[1] };
    }

    export function encodeToUri(txrFileUri: URI, textFileUri: URI, label?: string): URI {
        const txrTestUris = [
            txrFileUri.toString(),
            textFileUri.toString()
        ];
        const txrTestUriStr = JSON.stringify(txrTestUris);
        return new URI().withScheme(TXR_MATCHER_WIDGET_ID).withPath(label || '').withQuery(txrTestUriStr);
    }

    export function isTxrTestUri(uri: URI): boolean {
        return uri.scheme === txrMatcherScheme;
    }
}

export type TxrMatcherOpenerOptions = WidgetOpenerOptions & TxrMatcherWidgetOptions;

@injectable()
export class TxrMatcherOpenHandler extends WidgetOpenHandler<TxrMatcherWidget> {
    readonly id = TXR_MATCHER_WIDGET_ID;

    canHandle(uri: URI): number {
        if (TxrMatcherUri.isTxrTestUri(uri)) {
            return 200;
        }
        return 0;
    }

    protected async doOpen(widget: TxrMatcherWidget, options: TxrMatcherOpenerOptions): Promise<void> {
        // widget.setContent({
        //     txrFileUri: options.txrFileUri,
        //     textFileUri: options.textFileUri,
        // });
        await super.doOpen(widget, options);
    }

    protected createWidgetOptions(uri: URI, commit: TxrMatcherOpenerOptions): TxrMatcherOpenerOptions {
        return commit;
    }

}
