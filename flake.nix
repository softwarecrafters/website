{
  description = "Development shell for softwarecrafters/website with Node.js, Yarn, and testing tools. Use 'nix develop' to enter.";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs, ... }:
    let
      forAllSystems =
        f:
        nixpkgs.lib.genAttrs [ "x86_64-linux" "aarch64-linux" ] (
          system:
          f {
            pkgs = import nixpkgs { inherit system; };
            system = system;
          }
        );
    in
    {
      devShells = forAllSystems (
        { pkgs, system }:
        {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              nodejs_20 # Make sure this aligns with .nvmrc — lts/gallium (Node 16) is outdated and no longer available in nixpkgs
              yarn
              git
            ];

            shellHook = ''
              echo "✅ Dev shell ready for softwarecrafters/website on ${system}"
              echo "📦 Run \`yarn\` to install dependencies"
              echo "🛠  Then use:"
              echo "   - \`yarn build\` to build the site"
              echo "   - \`yarn watch\` to start the development server"
              echo "   - \`yarn test\` to validate the schema"
              echo "🌐 Your dev server will be available at http://localhost:3000 (or check the terminal output)"
            '';
          };
        }
      );
    };
}
