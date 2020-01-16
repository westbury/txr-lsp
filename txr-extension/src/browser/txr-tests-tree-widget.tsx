/********************************************************************************
 * Copyright (C) 2020 Nigel Westbury and others.
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { injectable, inject } from 'inversify';
import {
    ContextMenuRenderer,
    TreeWidget,
    NodeProps,
    TreeProps,
    TreeNode,
    TreeModel,
    DockPanel
} from '@theia/core/lib/browser';
import { LabelProvider } from '@theia/core/lib/browser/label-provider';
import URI from '@theia/core/lib/common/uri';
import { EditorManager } from '@theia/editor/lib/browser';
import { TxrTestsTreeModel, TxrTestFileNode } from './txr-tests-tree-model';
import * as React from 'react';

export const TEST_FILES_WIDGET_ID = 'txr-test-files-widget';

@injectable()
export class TxrTestsTreeWidget extends TreeWidget {

    constructor(
        @inject(TreeProps) readonly props: TreeProps,
        @inject(TxrTestsTreeModel) readonly model: TxrTestsTreeModel,
        @inject(ContextMenuRenderer) contextMenuRenderer: ContextMenuRenderer,
        @inject(LabelProvider) protected readonly labelProvider: LabelProvider,
        @inject(EditorManager) readonly editorManager: EditorManager
    ) {
        super(props, model, contextMenuRenderer);

        this.id = TEST_FILES_WIDGET_ID;
        this.title.label = 'TXR Tests';
        this.title.caption = 'TXR Tests';
        this.title.iconClass = 'fa txr-tab-icon';
        this.title.closable = true;
        this.addClass('txr-tests-tree-widget');
        this.toDispose.push(this.model.onSelectionChanged(selection => {
            const node = selection[0];
            if (node) {
                this.openEditor(node, true);
            }
        }));
        this.toDispose.push(this.model.onOpenNode((node: TreeNode) => {
            this.openEditor(node, false);
        }));
    }

    initializeModel(_yamlUris: string []): void {
        // TODO how do we run ad-hoc tests?
        this.model.initializeTxrTestsModel();
    }

    protected createNodeClassNames(node: TreeNode, props: NodeProps): string[] {
        const classNames = super.createNodeClassNames(node, props);
        return classNames;
    }

    protected createNodeAttributes(node: TreeNode, props: NodeProps): React.Attributes & React.HTMLAttributes<HTMLElement> {
        const elementAttrs = super.createNodeAttributes(node, props);
        return {
            ...elementAttrs,
        };
    }

    protected renderTree(model: TreeModel): React.ReactNode {
        return super.renderTree(model)
            || <div className='theia-widget-noInfo'>No callers have been detected.</div>;
    }

    protected renderCaption(node: TreeNode, props: NodeProps): React.ReactNode {
        return node.name;
    }

    private openEditor(node: TreeNode, keepFocus: boolean) {
        if (TxrTestFileNode.is(node)) {
            this.editorManager.open(
                new URI(node.uri), {
                    mode: keepFocus ? 'reveal' : 'activate'
                }
            ).then(editorWidget => {
                if (editorWidget.parent instanceof DockPanel) {
                    editorWidget.parent.selectWidget(editorWidget);
                }
            });
        }
    }

    storeState(): object {
        if (this.model.root) {
            return {
                root: this.deflateForStorage(this.model.root),
            };
        } else {
            return {};
        }
    }

    restoreState(oldState: object): void {
        // tslint:disable-next-line:no-any
        if ((oldState as any).root) {
            // tslint:disable-next-line:no-any
            this.model.root = this.inflateFromStorage((oldState as any).root);
        }
        // if ((oldState as any).testConfigFileUris) {
        //     // tslint:disable-next-line:no-any
        //     this.model.initializeTxrTestsModel((oldState as any).testConfigFileUris);
        // }
    }
}
