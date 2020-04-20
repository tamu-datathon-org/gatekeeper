export enum ResponseStatus {
  Success = "Success",
  Warning = "Warning",
  Failure = "Failure"
}

export interface ResponseBase {
  status: ResponseStatus;
  message?: string;
}
