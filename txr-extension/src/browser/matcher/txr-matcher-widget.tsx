/********************************************************************************
 * Copyright (C) 2020 Nigel Westbury and others.
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { inject, injectable, postConstruct } from 'inversify';
import URI from '@theia/core/lib/common/uri';
import { StatefulWidget } from '@theia/core/lib/browser';
import { EditorManager } from '@theia/editor/lib/browser';
import { LabelProvider } from '@theia/core/lib/browser/label-provider';
import * as React from 'react';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
// import { Widget } from '@theia/core/lib/browser';
// import { Message } from '@phosphor/messaging';

/* eslint-disable no-null/no-null */

export const TxrMatcherWidgetOptions = Symbol('TxrMatcherWidgetOptions');
export interface TxrMatcherWidgetOptions {
    txrFileUri: string;
    textFileUri: string;
}

export const TXR_MATCHER_WIDGET_ID = 'txr-matcher';
@injectable()
export class TxrMatcherWidget extends ReactWidget implements StatefulWidget {

    protected options?: TxrMatcherWidgetOptions;

    constructor(
        @inject(EditorManager) protected readonly editorManager: EditorManager,
        @inject(LabelProvider) protected readonly labelProvider: LabelProvider,
    ) {
        super();
        this.id = TXR_MATCHER_WIDGET_ID;
        this.title.closable = true;
        this.title.iconClass = 'theia-git-diff-icon';

        this.addClass('txr-matcher');

        this.node.tabIndex = 0;
    }

    @postConstruct()
    protected init(): void {
    }

    async setContent(options: TxrMatcherWidgetOptions): Promise<void> {
        this.options = options;
        this.title.label = 'TXR: ' + this.labelProvider.getName(new URI(options.textFileUri));
        this.title.caption = this.labelProvider.getLongName(new URI(options.textFileUri));;
        this.update();
    }

    storeState(): object {
        const { options } = this;
        return {
            options
        };

    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    restoreState(oldState: any): void {
        this.options = oldState['options'];
        this.update();
    }

    protected render(): React.ReactNode {
        return this.options ? <div>
            {this.options?.textFileUri} ({this.options?.txrFileUri})</div>
            : '';
    }

}
