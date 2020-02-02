/********************************************************************************
 * Copyright (C) 2020 Nigel Westbury and others.
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

 import { injectable, inject } from 'inversify';
import { MenuModelRegistry, CommandRegistry, Command, SelectionService, MenuPath } from '@theia/core';
import { AbstractViewContribution, OpenViewArguments } from '@theia/core/lib/browser';
import { EDITOR_CONTEXT_MENU } from '@theia/editor/lib/browser';
import { OpenerService, open } from '@theia/core/lib/browser';
import { UriCommandHandler, UriAwareCommandHandler } from '@theia/core/lib/common/uri-command-handler';
import URI from '@theia/core/lib/common/uri';
import { TxrTestsTreeWidget, TEST_FILES_WIDGET_ID } from './txr-tests-tree-widget';
import { TXR_MATCHER_WIDGET_ID } from './matcher/txr-matcher-widget'
import { TxrNode, TxrTestFileNode } from './txr-tests-tree-model';

export const TXR_TESTS_TOGGLE_KEYBINDING = 'alt+t';

export const EDITOR_CONTEXT_MENU_SCM = [...EDITOR_CONTEXT_MENU, '3_scm'];

// Right place for this?
export interface TxrMatcherOpenViewArguments extends OpenViewArguments {
    uri: string;
    txrFileUri: string;
    textFileUri: string;
}

export namespace TrxCommands {
    export const OPEN_TXR_TESTS: Command = {
        id: 'txr-tests:open-txr-tests',
    };
    export const OPEN_TXR_MATCHER: Command = {
        id: 'txr.open-matcher',
        category: 'TXR',
        label: 'TXR Matcher'
    };

}

export const TXR_TESTS_CONTEXT_MENU: MenuPath = ['txr-tests-context-menu'];

export interface TxrTestsOpenViewArguments extends OpenViewArguments {
    uri: string;
}

@injectable()
export class TxrTestsContribution extends AbstractViewContribution<TxrTestsTreeWidget> {

    constructor(
        @inject(SelectionService) protected readonly selectionService: SelectionService,
        @inject(OpenerService) protected openerService: OpenerService,
    ) {
        super({
            widgetId: TEST_FILES_WIDGET_ID,
            widgetName: 'TXR Tests',
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

    protected async openMatcherWidget(node: TxrTestFileNode): Promise<void> {
        const options = {
            txrFileUri: node.txrFileUri,
            textFileUri: node.textFileUri,
            mode: 'reveal'
        };
        open(
            this.openerService,
            this.toCommitDetailUri(node),
            options
        );
    }

    protected toCommitDetailUri(node: TxrTestFileNode): URI {
        const fragment = `${node.txrFileUri}:${node.textFileUri}`; 
        return new URI('').withScheme(TXR_MATCHER_WIDGET_ID).withFragment(fragment);
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(TXR_TESTS_CONTEXT_MENU, {
            commandId: TrxCommands.OPEN_TXR_MATCHER.id,
            label: 'Troubleshoot Matching'
        });
        super.registerMenus(menus);
    }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(TrxCommands.OPEN_TXR_TESTS, this.newUriAwareCommandHandler({
            isEnabled: (uri: URI) => uri.toString().endsWith('.yaml'),
            isVisible: (uri: URI) => uri.toString().endsWith('.yaml'),
            execute: async uri => this.openView({ activate: true, uri: uri.toString() }),
        }));
        commands.registerCommand(TrxCommands.OPEN_TXR_MATCHER, {
            isEnabled: () => true,
            isVisible: () => {
                const selection = this.selectionService.selection as TxrNode[];
                return selection.length === 1 && selection.some(node => TxrTestFileNode.is(node));
            },
            execute: async () => {
                const selection = this.selectionService.selection as TxrNode[];
                const node = selection[0] as TxrTestFileNode;
                return this.openMatcherWidget(node);
            },
        });
        super.registerCommands(commands);
    }

    protected async refreshWidget(uri: string | undefined) {
        const widget = this.tryGetWidget();
        if (!widget) {
            // the widget doesn't exist, so don't wake it up
            return;
        }
        await widget.initializeModel(uri ? [ uri ] : []);
    }

    protected newUriAwareCommandHandler(handler: UriCommandHandler<URI>): UriAwareCommandHandler<URI> {
        return new UriAwareCommandHandler(this.selectionService, handler);
    }

}
