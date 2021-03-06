/********************************************************************************
 * Copyright (C) 2020 Nigel Westbury and others.
 * SPDX-License-Identifier: MIT
 ********************************************************************************/
import { ContainerModule, Container, interfaces } from "inversify";
// import { LanguageClientContribution } from '@theia/languages/lib/browser';
import { WidgetFactory, bindViewContribution } from '@theia/core/lib/browser';
import { createTreeContainer, Tree, TreeImpl, TreeModel, TreeModelImpl, TreeWidget, TreeProps, defaultTreeProps } from '@theia/core/lib/browser';
// import { TxrClientContribution } from './txr-language-contribution';
import { TxrTestsTree } from './txr-tests-tree';
import { TxrTestsTreeModel } from './txr-tests-tree-model';
import { TxrTestsTreeWidget, TEST_FILES_WIDGET_ID } from './txr-tests-tree-widget';
import { TxrTestsContribution } from './txr-contribution';
import { bindTxrMatcherModule } from './matcher/txr-matcher-frontend-module';
import { TXR_TESTS_CONTEXT_MENU } from './txr-contribution';

import '../../src/browser/style/index.css';

export const TXR_TESTS_TREE_PROPS = <TreeProps>{
    ...defaultTreeProps,
    contextMenuPath: TXR_TESTS_CONTEXT_MENU,
    multiSelect: true,
    search: true,
    globalSelection: true
};

function createTxrTestsTreeContainer(parent: interfaces.Container): Container {
    const child = createTreeContainer(parent);

    child.unbind(TreeImpl);
    child.bind(TxrTestsTree).toSelf();
    child.rebind(Tree).toService(TxrTestsTree);

    child.unbind(TreeModelImpl);
    child.bind(TxrTestsTreeModel).toSelf();
    child.rebind(TreeModel).toService(TxrTestsTreeModel);

    child.bind(TxrTestsTreeWidget).toSelf();
    child.rebind(TreeWidget).toService(TxrTestsTreeWidget);

    child.rebind(TreeProps).toConstantValue(TXR_TESTS_TREE_PROPS);

    return child;
}

function createTxrTestsTreeWidget(parent: interfaces.Container): TxrTestsTreeWidget {
    return createTxrTestsTreeContainer(parent).get<TxrTestsTreeWidget>(TxrTestsTreeWidget);
}

export default new ContainerModule(bind => {
    // bind(TxrClientContribution).toSelf().inSingletonScope();
    // bind(LanguageClientContribution).toService(TxrClientContribution);

    bind(WidgetFactory).toDynamicValue(context => ({
        id: TEST_FILES_WIDGET_ID,
        createWidget: () => createTxrTestsTreeWidget(context.container)
    }));

    bindViewContribution(bind, TxrTestsContribution);

    bindTxrMatcherModule(bind);
})


