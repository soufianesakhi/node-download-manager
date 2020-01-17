declare module "model" {
    interface TimeStampedModel {
        createdAt?: Date | string;
        updatedAt?: Date | string;
    }
}
