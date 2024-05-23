{
  description = "Chess dot gone";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: 
      let 
        pkgs = nixpkgs.legacyPackages.${system};
        buildPkgs = with pkgs; [
         bun
         edgedb
        ];
      in
        {
          devShell = pkgs.mkShell { buildInputs = buildPkgs; };
        }
    );
}
