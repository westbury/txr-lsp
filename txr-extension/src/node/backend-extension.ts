/********************************************************************************
 * Copyright (C) 2020 Nigel Westbury and others.
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { injectable, ContainerModule } from "inversify";
import { createSocketConnection } from 'vscode-ws-jsonrpc/lib/server'
import { BaseLanguageServerContribution, LanguageServerContribution, IConnection } from "@theia/txr-language/lib/node";
import * as path from 'path';
import * as net from 'net'


export default new ContainerModule(bind => {
    bind(LanguageServerContribution).to(TxrContribution);
});

function getPort(): number | undefined {
    let arg = process.argv.filter(arg => arg.startsWith('--LSP_PORT='))[0]
    if (!arg) {
        return undefined
    } else {
        return Number.parseInt(arg.substring('--LSP_PORT='.length))
    }
}

@injectable()
class TxrContribution extends BaseLanguageServerContribution {

    readonly id = "txr";
    readonly name = "TXR";

    start(clientConnection: IConnection): void {
        const socketPort = getPort();
        if (socketPort) {
            const socket = new net.Socket()
            const serverConnection = createSocketConnection(
                socket,
                socket,
                () => socket.destroy()
            );
            this.forward(clientConnection, serverConnection)
            socket.connect(socketPort)
        } else {
            const jar = path.resolve(__dirname, '../../build/txr-language-server-1.0.0-SNAPSHOT.jar');
            const args: string[] = [ '-jar', jar ];
            const serverConnection = this.createProcessStreamConnection('java', args);
            this.forward(clientConnection, serverConnection);
        }
    }

    protected onDidFailSpawnProcess(error: Error): void {
        super.onDidFailSpawnProcess(error);
        console.error("Error starting TXR language server.", error)
    }

}
