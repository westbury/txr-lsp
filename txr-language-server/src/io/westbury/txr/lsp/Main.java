package io.westbury.txr.lsp;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.Channels;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import org.eclipse.lsp4j.jsonrpc.Launcher;
import org.eclipse.lsp4j.launch.LSPLauncher;
import org.eclipse.lsp4j.services.LanguageClient;

public class Main {

	public static void main(String[] args) throws InterruptedException, ExecutionException {
		startServer(5007);
	}

	public static void startServer(int port) throws InterruptedException, ExecutionException {
		TxrLanguageServer server = new TxrLanguageServer();
		
		InetAddress host;
		try {
			host = InetAddress.getByName("127.0.0.1");
		} catch (UnknownHostException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
			throw new RuntimeException(e1);
		}
		Launcher<LanguageClient> l;
		if (port == 0) {
			InputStream in = System.in;
			OutputStream out = System.out;
			l = LSPLauncher.createServerLauncher(server, in, out);
		} else {
			InetSocketAddress inetSocketAddress = new InetSocketAddress(host, port);
			AsynchronousServerSocketChannel serverSocket;
			try {
				serverSocket = AsynchronousServerSocketChannel.open().bind(inetSocketAddress);
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
				throw new RuntimeException(e1);
			}
			try {
				AsynchronousSocketChannel socketChannel = serverSocket.accept().get();
				InputStream in = Channels.newInputStream(socketChannel);
				OutputStream out = Channels.newOutputStream(socketChannel);
				l = LSPLauncher.createServerLauncher(server, in, out);
			} catch (InterruptedException | ExecutionException e) {
				throw new RuntimeException("Error when opening a socket channel at " + host + ":" + port + ".", e);
			}
		}

		Future<?> startListening = l.startListening();
		server.setRemoteProxy(l.getRemoteProxy());
		startListening.get();
	}

}
