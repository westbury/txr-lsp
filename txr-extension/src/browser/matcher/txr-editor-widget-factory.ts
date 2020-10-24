/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { injectable, inject, } from 'inversify';
import URI from '@theia/core/lib/common/uri';
import { SelectionService } from '@theia/core/lib/common';
import { WidgetFactory, LabelProvider } from '@theia/core/lib/browser';
import { EditorWidget } from '@theia/editor/lib/browser/editor-widget';
// import { TextEditorProvider } from './editor';
import { TXR_MATCHER_WIDGET_ID, TxrMatcherWidgetOptions } from './txr-matcher-widget';
// import { TextEditor } from '@theia/editor/lib/browser/editor';
import { TxrEditorProvider } from './txr-monaco-editor-provider';
import { TxrMatcherUri } from './txr-matcher-open-handler';

@injectable()
export class TxrEditorWidgetFactory implements WidgetFactory {

    static ID = TXR_MATCHER_WIDGET_ID;

    readonly id = TxrEditorWidgetFactory.ID;

    @inject(LabelProvider)
    protected readonly labelProvider!: LabelProvider;

    @inject(TxrEditorProvider)
    protected readonly editorProvider!: TxrEditorProvider;

    @inject(SelectionService)
    protected readonly selectionService!: SelectionService;

    createWidget(options: TxrMatcherWidgetOptions): Promise<EditorWidget> {
        const uri = TxrMatcherUri.encodeToUri(new URI(options.txrFileUri), new URI(options.textFileUri));
        return this.createEditor(uri);
    }

    protected async createEditor(uri: URI): Promise<EditorWidget> {
        const textEditor = await this.editorProvider(uri);
        const newEditor = new EditorWidget(textEditor, this.selectionService);

        this.setLabels(newEditor, uri);
        const labelListener = this.labelProvider.onDidChange(event => {
            if (event.affects(uri)) {
                this.setLabels(newEditor, uri);
            }
        });
        newEditor.onDispose(() => labelListener.dispose());

        newEditor.id = this.id + ':' + uri.toString();
        newEditor.title.closable = true;
        newEditor.title.caption = uri.path.toString();  // ?????
        return newEditor;
    }

    private setLabels(editor: EditorWidget, uri: URI): void {
        editor.title.caption = this.labelProvider.getLongName(uri);
        const icon = this.labelProvider.getIcon(uri);
        editor.title.label = this.labelProvider.getName(uri);
        editor.title.iconClass = icon + ' file-icon';
    }
}
