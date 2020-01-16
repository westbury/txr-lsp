/********************************************************************************
 * Copyright (C) 2020 Nigel Westbury and others.
 * SPDX-License-Identifier: MIT
 ********************************************************************************/
import { injectable, inject } from 'inversify';
import { Workspace, Languages, LanguageClientFactory, BaseLanguageClientContribution } from '@theia/languages/lib/browser';

@injectable()
export class TxrClientContribution extends BaseLanguageClientContribution {

    readonly id = "txr";
    readonly name = "TXR";

    constructor(
        @inject(Workspace) protected readonly workspace: Workspace,
        @inject(Languages) protected readonly languages: Languages,
        @inject(LanguageClientFactory) protected readonly languageClientFactory: LanguageClientFactory
    ) {
        super(workspace, languages, languageClientFactory);
    }

    protected get globPatterns() {
        return [
            '**/*.txr'
        ];
    }
}

registerTxr();

export function registerTxr() {
    monaco.languages.register({
        id: 'txr',
        aliases: ['TXR', 'txr'],
        extensions: ['.txr'],
        mimetypes: ['text/txr']
    })
    monaco.languages.setLanguageConfiguration('txr', {
        comments: {
            lineComment: "//",
            blockComment: ['@;', '@;']
        },
        brackets: [['(', ')']],
        autoClosingPairs: [
            {
                open: '@(collect)',
                close: '@(end)'
            },
            {
                open: '(',
                close: ')'
            }]
    })
}