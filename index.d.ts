/// <reference types="node" />
declare module "libreoffice-convert" {
  function convert(
    source: string,
    format: string,
    filter: string | undefined,
  ): Promise<string>;
  function convertWithOptions(
    source: string,
    format: string,
    filter: string | undefined,
    options: {
      sofficeBinaryPaths?: string[];
      fileName?: string;
    },
  ): Promise<string>;
}
