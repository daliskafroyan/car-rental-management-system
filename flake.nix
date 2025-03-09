{
  description = "React + TypeScript + Vite Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js (using version 20 as per Vite 5 requirements)
            nodejs_20

            # Package managers
            nodePackages.pnpm
            yarn

            # Development tools
            nodePackages.typescript
            nodePackages.typescript-language-server
            nodePackages.vscode-langservers-extracted # HTML/CSS/JSON/ESLint language servers
            nodePackages.prettier
            
            # System dependencies
            watchman # For file watching
          ];

          shellHook = ''
            echo "Node.js development environment ready!"
            echo "Run 'pnpm install' to install dependencies"
            echo "Run 'pnpm run dev' to start the development server"
          '';

          # Environment variables
          VITE_CJS_IGNORE_WARNING = "true";
        };
      }
    );
} 