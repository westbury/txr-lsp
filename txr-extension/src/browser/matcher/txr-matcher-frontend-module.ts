/********************************************************************************
 * Copyright (C) 2020 Nigel Westbury and others.
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { interfaces, Container } from 'inversify';
import { WidgetFactory } from '@theia/core/lib/browser';
import { TxrMatcherWidget, TXR_MATCHER_WIDGET_ID, TxrMatcherWidgetOptions } from './txr-matcher-widget';
import { TxrMatcherOpenHandler } from './txr-matcher-open-handler';
import { OpenHandler } from '@theia/core/lib/browser';

export function bindTxrMatcherModule(bind: interfaces.Bind): void {

    bind(TxrMatcherWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: TXR_MATCHER_WIDGET_ID,
        createWidget: () => ctx.container.get<TxrMatcherWidget>(TxrMatcherWidget)
    }));

    bind(TxrMatcherOpenHandler).toSelf();
    bind(OpenHandler).toService(TxrMatcherOpenHandler);

    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: TXR_MATCHER_WIDGET_ID,
        createWidget: (options: TxrMatcherWidgetOptions) => {
            const child = new Container({ defaultScope: 'Singleton' });
            child.parent = ctx.container;
            child.bind(TxrMatcherWidget).toSelf();
            child.bind(TxrMatcherWidgetOptions).toConstantValue(options);
            return child.get(TxrMatcherWidget);
        }
    }));
}
