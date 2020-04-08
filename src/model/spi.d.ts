declare module "model" {
  interface DownloadSPI {
    default: boolean;
    supported: string[];
    path: string;
    ignoredCats: string[];
  }
}
