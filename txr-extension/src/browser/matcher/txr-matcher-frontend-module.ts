/********************************************************************************
 * Copyright (C) 2020 Nigel Westbury and others.
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { interfaces } from 'inversify';
import { WidgetFactory } from '@theia/core/lib/browser';
import { TXR_MATCHER_WIDGET_ID, TxrMatcherWidgetOptions } from './txr-matcher-widget';
import { TxrMatcherOpenHandler } from './txr-matcher-open-handler';
import { OpenHandler } from '@theia/core/lib/browser';
import { TxrMonacoEditorProvider, TxrEditorProvider } from './txr-monaco-editor-provider';
import { TxrEditorWidgetFactory } from './txr-editor-widget-factory';
import { TxrMonacoDiffNavigatorFactory } from './txr-monaco-diff-navigator-factory';

export function bindTxrMatcherModule(bind: interfaces.Bind): void {

    // bind(TxrMatcherWidget).toSelf();
    // bind(WidgetFactory).toDynamicValue(ctx => ({
    //     id: TXR_MATCHER_WIDGET_ID,
    //     createWidget: () => ctx.container.get<TxrMatcherWidget>(TxrMatcherWidget)
    // }));

    bind(TxrMatcherOpenHandler).toSelf();
    bind(OpenHandler).toService(TxrMatcherOpenHandler);

    bind(TxrMonacoDiffNavigatorFactory).toSelf().inSingletonScope();
    bind(TxrMonacoEditorProvider).toSelf().inSingletonScope();
    bind(TxrEditorProvider).toProvider(context =>
        // uri => context.container.get(TxrMonacoEditorProvider).get(uri)
        uri => {
            const x = context.container.get(TxrMonacoEditorProvider);
            return x.get(uri);
        }
    );

    // bind(WidgetFactory).toDynamicValue(ctx => ({
    //     id: TXR_MATCHER_WIDGET_ID,
    //     createWidget: (options: TxrMatcherWidgetOptions) => {
    //         const child = new Container({ defaultScope: 'Singleton' });
    //         child.parent = ctx.container;
    //         child.bind(TxrMatcherWidget).toSelf();
    //         child.bind(TxrMatcherWidgetOptions).toConstantValue(options);
    //         return child.get(TxrMatcherWidget);
    //     }
    // }));
    bind(TxrEditorWidgetFactory).toSelf().inSingletonScope();
    // bind(WidgetFactory).toService(TxrEditorWidgetFactory);
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: TXR_MATCHER_WIDGET_ID,
        createWidget: (options: TxrMatcherWidgetOptions) => {
            const factory = ctx.container.get<TxrEditorWidgetFactory>(TxrEditorWidgetFactory);
            return factory.createWidget(options);
        }
    }));
}
