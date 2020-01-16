/********************************************************************************
 * Copyright (C) 2020 Nigel Westbury and others.
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { injectable } from 'inversify';
import { TreeImpl, TreeNode, CompositeTreeNode, SelectableTreeNode, ExpandableTreeNode } from '@theia/core/lib/browser/tree';
import { DecoratedTreeNode } from '@theia/core/lib/browser/tree/tree-decorator';

export interface TxrPatternNode  extends CompositeTreeNode, ExpandableTreeNode, SelectableTreeNode, DecoratedTreeNode {
    txrFileUri: string;
}

export namespace TxrPatternNode {
    export function is(node: TreeNode): node is TxrPatternNode {
        return 'txrFileUri' in node;
    }
}

@injectable()
export class TxrTestsTree extends TreeImpl {

    async resolveChildren(parent: CompositeTreeNode): Promise<TreeNode[]> {
        if (parent.children.length > 0) {
            return Promise.resolve([...parent.children]);
        }
        if (TxrPatternNode.is(parent)) {
            // Actually this is always resolved, so nothing to do here...
        }
        return Promise.resolve([]);
    }

}
