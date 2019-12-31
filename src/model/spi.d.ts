declare module "model" {
    interface DownloadSPI {
        supported: boolean;
        path: string
        ignoredCats: string[];
    }
}