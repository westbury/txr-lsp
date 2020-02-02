/********************************************************************************
 * Copyright (C) 2020 Nigel Westbury and others.
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { injectable, inject } from 'inversify';
import { TreeModelImpl, TreeNode, CompositeTreeNode, SelectableTreeNode } from '@theia/core/lib/browser/tree';
import { TreeDecoration, DecoratedTreeNode } from '@theia/core/lib/browser/tree/tree-decorator';
import { TxrTestsTree } from './txr-tests-tree';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { FileSystem } from '@theia/filesystem/lib/common';
import { LabelProvider } from '@theia/core/lib/browser/label-provider';
import { TxrPatternNode } from './txr-tests-tree';
import { TxrClientContribution } from './txr-language-contribution';
// import { ExecuteCommandRequest } from 'monaco-languageclient/lib';
import URI from '@theia/core/lib/common/uri';
import { parse } from 'yaml';

export interface TestFileList {
    txrFileUri: string,
    testFileUris: string[],
}

export type TxrOutputData = any;

export interface TxrTestFileNode extends TreeNode, SelectableTreeNode, DecoratedTreeNode {
    readonly txrFileUri: string;
    readonly textFileUri: string;
    readonly isMatchExpected?: boolean;
    readonly isMatchObtained?: boolean;
    readonly expectedOutput?: TxrOutputData;
    readonly actualOutput?: TxrOutputData;
}

export namespace TxrTestFileNode {
    export function is(node: TreeNode): node is TxrTestFileNode {
        return 'txrFileUri' in node && 'textFileUri' in node;
    }
}

export type TxrNode = (TxrPatternNode | TxrTestFileNode);

export namespace TestFileList {
    export function is(config: any): config is TestFileList {
        return typeof config.txrFileUri === 'string' && Array.isArray(config.testFileUris);
    }
}

@injectable()
export class TxrTestsTreeModel extends TreeModelImpl {

    constructor(
        @inject(TxrTestsTree) protected readonly tree: TxrTestsTree,
        @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService,
        @inject(FileSystem) protected readonly fileSystem: FileSystem,
        @inject(LabelProvider) protected readonly labelProvider: LabelProvider,
        @inject(TxrClientContribution) protected readonly languageContribution: TxrClientContribution,
    ) {
        super();
    };

    getTree(): TxrTestsTree {
        return this.tree;
    }

    async initializeTxrTestsModel(): Promise<void> {
        const testFileLists: TxrPatternNode[] = [];
        const roots = this.workspaceService.tryGetRoots();
        for (const root of roots) {
            const testConfigFileUri = root.uri + '/txr-tests.yaml';
            if (await this.fileSystem.exists(testConfigFileUri)) {
                const fileContent = await this.fileSystem.resolveContent(testConfigFileUri);
                const configList: object[] = parse(fileContent.content);
                for (const config of configList) {
                    if (TestFileList.is(config)) {
                        // const client = await this.languageContribution.languageClient;
                        // const result = await client.sendRequest(ExecuteCommandRequest.type, {
                        //     command: 'runMatch',
                        //     arguments: [ 'input text' ]
                        // });
                        
                        let decorationData: TreeDecoration.Data = {
                            tailDecorations: [
                                {
                                    iconClass: ['fa', 'fa-check'],
                                    color: 'green',
                                    tooltip: 'text matches: ' //  + result,
                                }
                            ]
                        };

                        const txrFileUri = new URI(root.uri).resolve(config.txrFileUri);

                        const testFileList: TxrPatternNode = {
                            id: txrFileUri.toString(),
                            name: this.labelProvider.getName(txrFileUri),
                            children: [],
                            parent: undefined,
                            txrFileUri: txrFileUri.toString(),
                            expanded: false,
                            selected: false,
                            decorationData,
                        }
                        testFileList.children = this.buildTestFileNodes(testFileList, config);
                        testFileLists.push(testFileList);
                    } else {
                        // Need a way to show file is corrupted
                    }
                }
            }
        }
        const root: CompositeTreeNode = {
            id: 'txr-file-lists-id',
            name: 'TXR Files',
            children: testFileLists,
            parent: undefined
        };

        this.tree.root = root;
    }

    public buildTestFileNodes(parent: TxrPatternNode, config: TestFileList) {
        let decorationData: TreeDecoration.Data = {
            tailDecorations: [
                {
                    iconClass: ['fa', 'fa-times'],
                    color: 'red',
                    tooltip: 'text fails to match'
                }
            ]
        };

        const yamlDirectory = new URI(parent.txrFileUri).parent;
        const testFileNodes: TxrTestFileNode[] = config.testFileUris.map(testFileUri => ({
            id: parent.id + ':' + testFileUri,
            name: this.labelProvider.getName(new URI(testFileUri)),
            parent,
            txrFileUri: parent.txrFileUri,
            textFileUri: yamlDirectory.resolve(testFileUri).toString(),
            selected: false,
            decorationData,
        }));

        return testFileNodes;
    }

    protected doOpenNode(node: TreeNode): void {
        // do nothing (in particular do not expand the node)
    }
}
