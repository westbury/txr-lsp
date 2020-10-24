A Language Server Protocol implementation for the TXR text matching language

This is an implementation of the Language Server Protocol (LSP) for the TXR text matching language.

This uses the Java TXR implementation because that implementation supports incremental compilation
of the TXR files.  See https://channel9.msdn.com/Blogs/Seth-Juarez/Anders-Hejlsberg-on-Modern-Compiler-Construction
for a good introduction on incremental compilation.

# Build the LSP jar file

Build and copy over two required lsp4j jar files:
```
git clone https://github.com/eclipse/lsp4j
cd lsp4j
gradle install
cd ..
```

Now copy two jar files this project's libs directory.  Note these are coming from separate sub-project builds:
```
copy lsp4j\org.eclipse.lsp4j\build\libs\org.eclipse.lsp4j-0.10.0-SNAPSHOT.jar txr-lsp\txr-language-server\libs 
copy lsp4j\org.eclipse.lsp4j.jsonrpc\build\libs\org.eclipse.lsp4j.jsonrpc-0.10.0-SNAPSHOT.jar txr-lsp\txr-language-server\libs 
```
Note: lsp4j is active and the version may be later than 0.10.0.  You may also need to fix API breakages if a later version.

download https://repo1.maven.org/maven2/com/google/code/gson/gson/2.6.2/gson-2.6.2.jar and put in libs folder.

Build the language server. On Windows, it's 'gradlew' instead of './gradlew'.
```
  cd txr-language-server
  ./gradlew shadowJar
  cd ..
```

# Running the TXR Language Server with Eclipse

This currently does not work due to this bug (https://bugs.eclipse.org/bugs/show_bug.cgi?id=551347).  If you do want to try to get it to work then see the readme in the Eclipse_LS_Plugin directory.

# Running the TXR Language Server with Theia

## Development

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/theia-ide/txr-lsp)

or check it out locally.

## Build and Run

First start the language server from Eclipse.  This is currently configured to listen on port 5007.

project: txr-language-server
class: io.westbury.txr.lsp.Main

Build and start Theia
```
   yarn install
   cd app
   yarn start
```
