package io.westbury.txr.lsp;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.eclipse.lsp4j.DidChangeConfigurationParams;
import org.eclipse.lsp4j.DidChangeWatchedFilesParams;
import org.eclipse.lsp4j.ExecuteCommandParams;
import org.eclipse.lsp4j.SymbolInformation;
import org.eclipse.lsp4j.WorkspaceSymbolParams;
import org.eclipse.lsp4j.services.WorkspaceService;

import com.google.gson.JsonPrimitive;

public class TxrWorkspaceService implements WorkspaceService {

	@Override
	public CompletableFuture<Object> executeCommand(ExecuteCommandParams params) {
		switch (params.getCommand()) {
		case "runMatch":
			JsonPrimitive text = (JsonPrimitive)params.getArguments().get(0);
			return runMatch(text.getAsString());
		}
		throw new UnsupportedOperationException();
	}

	@Override
	public CompletableFuture<List<? extends SymbolInformation>> symbol(WorkspaceSymbolParams params) {
		return null;
	}

	@Override
	public void didChangeConfiguration(DidChangeConfigurationParams params) {
	}

	@Override
	public void didChangeWatchedFiles(DidChangeWatchedFilesParams params) {
	}

	public CompletableFuture<Object> runMatch(String text) {
		return CompletableFuture.supplyAsync(() -> "result123");
	}
}
