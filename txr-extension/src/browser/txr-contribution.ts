/********************************************************************************
 * Copyright (C) 2020 Nigel Westbury and others.
 * SPDX-License-Identifier: MIT
 ********************************************************************************/
import { injectable, inject } from 'inversify';
import { Command, SelectionService } from '@theia/core';
import { AbstractViewContribution, OpenViewArguments } from '@theia/core/lib/browser';
import { EDITOR_CONTEXT_MENU } from '@theia/editor/lib/browser';
import { TxrTestsTreeWidget, TEST_FILES_WIDGET_ID } from './txr-tests-tree-widget';

export const TXR_TESTS_LABEL = 'TXR Tests';
export const TXR_TESTS_TOGGLE_KEYBINDING = 'alt+t';

export const EDITOR_CONTEXT_MENU_SCM = [...EDITOR_CONTEXT_MENU, '3_scm'];

export namespace TrxCommands {
    export const OPEN_TXR_TESTS: Command = {
        id: 'txr-tests:open-txr-tests',
    };
}

export interface TxrTestsOpenViewArguments extends OpenViewArguments {
    uri: string | undefined;
}

@injectable()
export class TxrTestsContribution extends AbstractViewContribution<TxrTestsTreeWidget> {

    constructor(
        @inject(SelectionService) protected readonly selectionService: SelectionService,
    ) {
        super({
            widgetId: TEST_FILES_WIDGET_ID,
            widgetName: TXR_TESTS_LABEL,
            defaultWidgetOptions: {
                area: 'left',
                rank: 500
            },
            toggleCommandId: TrxCommands.OPEN_TXR_TESTS.id,
            toggleKeybinding: TXR_TESTS_TOGGLE_KEYBINDING
        });
    }

    async openView(args?: Partial<TxrTestsOpenViewArguments>): Promise<TxrTestsTreeWidget> {
        const widget = await super.openView(args);
        const yamlUris: string [] = args!.uri ? [ args!.uri ] : []; // Storage? using a service? 
        widget.initializeModel(yamlUris);
        return widget;
    }

    protected async refreshWidget(uri: string | undefined) {
        const widget = this.tryGetWidget();
        if (!widget) {
            // the widget doesn't exist, so don't wake it up
            return;
        }
        await widget.initializeModel(uri ? [ uri ] : []);
    }
}
