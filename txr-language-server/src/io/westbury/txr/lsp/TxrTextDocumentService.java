package io.westbury.txr.lsp;

import java.util.ArrayList;
import java.util.Collections;
import java.util.EmptyStackException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.eclipse.lsp4j.CodeAction;
import org.eclipse.lsp4j.CodeActionParams;
import org.eclipse.lsp4j.CodeLens;
import org.eclipse.lsp4j.CodeLensParams;
import org.eclipse.lsp4j.Command;
import org.eclipse.lsp4j.CompletionItem;
import org.eclipse.lsp4j.CompletionList;
import org.eclipse.lsp4j.CompletionParams;
import org.eclipse.lsp4j.DefinitionParams;
import org.eclipse.lsp4j.Diagnostic;
import org.eclipse.lsp4j.DiagnosticSeverity;
import org.eclipse.lsp4j.DidChangeTextDocumentParams;
import org.eclipse.lsp4j.DidCloseTextDocumentParams;
import org.eclipse.lsp4j.DidOpenTextDocumentParams;
import org.eclipse.lsp4j.DidSaveTextDocumentParams;
import org.eclipse.lsp4j.DocumentFormattingParams;
import org.eclipse.lsp4j.DocumentHighlight;
import org.eclipse.lsp4j.DocumentHighlightParams;
import org.eclipse.lsp4j.DocumentOnTypeFormattingParams;
import org.eclipse.lsp4j.DocumentRangeFormattingParams;
import org.eclipse.lsp4j.DocumentSymbol;
import org.eclipse.lsp4j.DocumentSymbolParams;
import org.eclipse.lsp4j.Hover;
import org.eclipse.lsp4j.HoverParams;
import org.eclipse.lsp4j.Location;
import org.eclipse.lsp4j.LocationLink;
import org.eclipse.lsp4j.MarkedString;
import org.eclipse.lsp4j.Position;
import org.eclipse.lsp4j.PublishDiagnosticsParams;
import org.eclipse.lsp4j.Range;
import org.eclipse.lsp4j.ReferenceParams;
import org.eclipse.lsp4j.RenameParams;
import org.eclipse.lsp4j.SignatureHelp;
import org.eclipse.lsp4j.SignatureHelpParams;
import org.eclipse.lsp4j.SymbolInformation;
import org.eclipse.lsp4j.SymbolKind;
import org.eclipse.lsp4j.TextEdit;
import org.eclipse.lsp4j.WorkspaceEdit;
import org.eclipse.lsp4j.jsonrpc.messages.Either;
import org.eclipse.lsp4j.services.TextDocumentService;

import io.westbury.txr.lsp.TxrDocumentModel.Route;
import io.westbury.txr.lsp.TxrDocumentModel.VariableDefinition;
import txr.matchers.DocumentMatcher;
import txr.matchers.TxrException;
import txr.parser.Expr;
import txr.parser.Ident;
import txr.parser.Line;
import txr.parser.Node;

public class TxrTextDocumentService implements TextDocumentService {

	private final Map<String, TxrDocumentModel> docs = Collections.synchronizedMap(new HashMap<>());
	private final TxrLanguageServer eclipseConLanguageServer;

	public TxrTextDocumentService(TxrLanguageServer eclipseConLanguageServer) {
		this.eclipseConLanguageServer = eclipseConLanguageServer;
	}

	@Override
	public void didOpen(DidOpenTextDocumentParams params) {
		TxrDocumentModel model = new TxrDocumentModel(params.getTextDocument().getText());
		this.docs.put(params.getTextDocument().getUri(),
				model);

		// send errors found in the document
		CompletableFuture.runAsync(() ->
		eclipseConLanguageServer.client.publishDiagnostics(
				new PublishDiagnosticsParams(params.getTextDocument().getUri(), validate(model))
			)
		);
	}

	@Override
	public void didChange(DidChangeTextDocumentParams params) {
		TxrDocumentModel model = new TxrDocumentModel(params.getContentChanges().get(0).getText());
		this.docs.put(params.getTextDocument().getUri(),
				model);

		// send errors found in the document
		CompletableFuture.runAsync(() ->
		eclipseConLanguageServer.client.publishDiagnostics(
				new PublishDiagnosticsParams(params.getTextDocument().getUri(), validate(model))
			)
		);
	}

	private List<Diagnostic> validate(TxrDocumentModel model) {
		List<Diagnostic> res = new ArrayList<>();
		
		DocumentMatcher matcher;
		try {
			matcher = new DocumentMatcher(model.ast);
			
			// Some errors only occur when matching??????
			matcher.process(new String [] { "test" } );
		} catch (TxrException e) {
			Diagnostic diagnostic = new Diagnostic();
			diagnostic.setSeverity(DiagnosticSeverity.Error);
			diagnostic.setMessage(e.getLocalizedMessage());
			diagnostic.setRange(new Range(
					new Position(e.lineNumber, 0),
					new Position(e.lineNumber, 4)));
			res.add(diagnostic);
		} catch (EmptyStackException e) {
			Diagnostic diagnostic = new Diagnostic();
			diagnostic.setSeverity(DiagnosticSeverity.Error);
			diagnostic.setMessage("Empty stack exception");
			diagnostic.setRange(new Range(
					new Position(3, 0),
					new Position(3, 4)));
			res.add(diagnostic);
		}

//		Route previousRoute = null;
//		for (Route route : model.getResolvedRoutes()) {
//			if (!TxrMap.INSTANCE.all.contains(route.name)) {
//				Diagnostic diagnostic = new Diagnostic();
//				diagnostic.setSeverity(DiagnosticSeverity.Error);
//				diagnostic.setMessage("This is not a Session");
//				diagnostic.setRange(new Range(
//						new Position(route.line, route.charOffset),
//						new Position(route.line, route.charOffset + route.text.length())));
//				res.add(diagnostic);
//			} else if (previousRoute != null && !TxrMap.INSTANCE.startsFrom(route.name, previousRoute.name)) {
//				Diagnostic diagnostic = new Diagnostic();
//				diagnostic.setSeverity(DiagnosticSeverity.Warning);
//				diagnostic.setMessage("'" + route.name + "' does not follow '" + previousRoute.name + "'");
//				diagnostic.setRange(new Range(
//						new Position(route.line, route.charOffset),
//						new Position(route.line, route.charOffset + route.text.length())));
//				res.add(diagnostic);
//			}
//			previousRoute = route;
//		}
		return res;
	}

	@Override
	public CompletableFuture<Either<List<CompletionItem>, CompletionList>> completion(CompletionParams position) {
		return CompletableFuture.supplyAsync(() -> Either.forLeft(TxrMap.INSTANCE.all.stream()
				.map(word -> {
					CompletionItem item = new CompletionItem();
					item.setLabel(word);
					item.setInsertText(word);
					return item;
				}).collect(Collectors.toList())));
	}

	@Override
	public CompletableFuture<CompletionItem> resolveCompletionItem(CompletionItem unresolved) {
		return null;
	}

//	public CompletableFuture<Hover> hover(TextDocumentPositionParams position) {
	@Override
	public CompletableFuture<Hover> hover(HoverParams params) {
		return CompletableFuture.supplyAsync(() -> {
			TxrDocumentModel doc = docs.get(params.getTextDocument().getUri());
			Hover res = new Hover();
			
			List<Either<String, MarkedString>> l = new ArrayList<>();
			
			int line = params.getPosition().getLine();
			Line x = doc.ast.lineSequence.get(line);
			for (Node y : x.nodes) {
				if (y instanceof Expr) {
					Expr e = (Expr)y;
					l.add(getHoverContent2(e.subExpressions.get(0).toString()));
				}
				if (y instanceof Ident) {
					Ident e = (Ident)y;
					l.add(getHoverContent2(e.id));
				}
			}
//			res.setContents(.getResolvedRoutes().stream()
//				.filter(route -> route.line == position.getPosition().getLine())
//				.map(route -> route.name)
//				.map(TxrMap.INSTANCE.type::get)
//				.map(this::getHoverContent)
//				.collect(Collectors.toList()));
			
			res.setContents(l);
			
			return res;
		});
	}
	
	private Either<String, MarkedString> getHoverContent(String type) {
		if ("Verte".equals(type)) {
			return Either.forLeft("<font color='green'>Verte</font>");
		} else if ("Bleue".equals(type)) {
			return Either.forLeft("<font color='blue'>Bleue</font>");
		} else if ("Rouge".equals(type)) {
			return Either.forLeft("<font color='red'>Rouge</font>");
		} else if ("Noire".equals(type)) {
			return Either.forLeft("<font color='black'>Noire</font>");
		}
		return Either.forLeft(type);
	}

	private Either<String, MarkedString> getHoverContent2(String type) {
		return Either.forLeft("<font color='green'>" + type + "</font>");
	}

	@Override
	public CompletableFuture<SignatureHelp> signatureHelp(SignatureHelpParams params) {
		return null;
	}

	@Override
	public CompletableFuture<Either<List<? extends Location>, List<? extends LocationLink>>> definition(DefinitionParams params) {
		
		return CompletableFuture.supplyAsync(() -> {
			TxrDocumentModel doc = docs.get(params.getTextDocument().getUri());
			String variable = doc.getVariable(params.getPosition().getLine(), params.getPosition().getCharacter()); 
			if (variable != null) {
				int variableLine = doc.getDefintionLine(variable);
				if (variableLine == -1) {
					return Either.forLeft(Collections.emptyList());
				}
				Location location = new Location(params.getTextDocument().getUri(), new Range(
					new Position(variableLine, 0),
					new Position(variableLine, variable.length())
					));
				return Either.forLeft(Collections.singletonList(location));
			}
			return null;
		});
	}

	@Override
	public CompletableFuture<List<? extends Location>> references(ReferenceParams params) {
		return CompletableFuture.supplyAsync(() -> {
			TxrDocumentModel doc = docs.get(params.getTextDocument().getUri());
			String variable = doc.getVariable(params.getPosition().getLine(), params.getPosition().getCharacter()); 
			if (variable != null) {
				return doc.getResolvedRoutes().stream()
					.filter(route -> route.text.contains("${" + variable + "}") || route.text.startsWith(variable + "="))
					.map(route -> new Location(params.getTextDocument().getUri(), new Range(
						new Position(route.line, route.text.indexOf(variable)),
						new Position(route.line, route.text.indexOf(variable) + variable.length())
					)))
					.collect(Collectors.toList());
			}
			String routeName = doc.getResolvedRoutes().stream()
					.filter(route -> route.line == params.getPosition().getLine())
					.collect(Collectors.toList())
					.get(0)
					.name;
			return doc.getResolvedRoutes().stream()
					.filter(route -> route.name.equals(routeName))
					.map(route -> new Location(params.getTextDocument().getUri(), new Range(
							new Position(route.line, 0),
							new Position(route.line, route.text.length()))))
					.collect(Collectors.toList());
		});
	}

	@Override
	public CompletableFuture<List<? extends DocumentHighlight>> documentHighlight(DocumentHighlightParams params) {
		return null;
	}

	@Override
	public CompletableFuture<List<Either<SymbolInformation, DocumentSymbol>>> documentSymbol(DocumentSymbolParams params) {
		TxrDocumentModel model = docs.get(params.getTextDocument().getUri());
		if(model == null)
			return null;
		return CompletableFuture.supplyAsync(() -> 
			docs.get(params.getTextDocument().getUri()).getResolvedLines().stream().map(line -> {
				SymbolInformation symbol = new SymbolInformation();
				symbol.setLocation(new Location(params.getTextDocument().getUri(), new Range(
						new Position(line.line, line.charOffset),
						new Position(line.line, line.charOffset + line.text.length()))));
				if (line instanceof VariableDefinition) {
					symbol.setKind(SymbolKind.Variable);
					symbol.setName(((VariableDefinition) line).variableName);
				} else if (line instanceof Route) {
					symbol.setKind(SymbolKind.String);
					symbol.setName(((Route) line).name);
				}
				return Either.<SymbolInformation, DocumentSymbol>forLeft(symbol);
			}).collect(Collectors.toList())
		);
	}

	@Override
	public CompletableFuture<List<Either<Command, CodeAction>>> codeAction(CodeActionParams params) {
		return CompletableFuture.supplyAsync(() -> 
			new ArrayList<Either<Command, CodeAction>>()
	);
	}

	@Override
	public CompletableFuture<List<? extends CodeLens>> codeLens(CodeLensParams params) {
		return CompletableFuture.supplyAsync(() -> 
		new ArrayList<CodeLens>()
);
	}

	@Override
	public CompletableFuture<CodeLens> resolveCodeLens(CodeLens unresolved) {
		return null;
	}

	@Override
	public CompletableFuture<List<? extends TextEdit>> formatting(DocumentFormattingParams params) {
		return null;
	}

	@Override
	public CompletableFuture<List<? extends TextEdit>> rangeFormatting(DocumentRangeFormattingParams params) {
		return null;
	}

	@Override
	public CompletableFuture<List<? extends TextEdit>> onTypeFormatting(DocumentOnTypeFormattingParams params) {
		return null;
	}

	@Override
	public CompletableFuture<WorkspaceEdit> rename(RenameParams params) {
		return null;
	}

	@Override
	public void didClose(DidCloseTextDocumentParams params) {
		this.docs.remove(params.getTextDocument().getUri());
	}

	@Override
	public void didSave(DidSaveTextDocumentParams params) {
	}

}
