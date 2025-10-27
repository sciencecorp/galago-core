import * as grpc from "@grpc/grpc-js";

type GrpcCallbackFunction<Request, Response> = (
  request: Request,
  metadata: grpc.Metadata,
  options: grpc.CallOptions,
  callback: (error: any, response: Response) => void,
) => grpc.ClientUnaryCall;

type PromisifiedGrpcCall<F extends Function> =
  F extends GrpcCallbackFunction<infer Request, infer Response>
    ? (request: Request, metadata?: grpc.Metadata, options?: grpc.CallOptions) => Promise<Response>
    : never;

export type PromisifiedGrpcClient<T extends grpc.Client> = {
  [K in keyof T]: T[K] extends GrpcCallbackFunction<any, any> ? PromisifiedGrpcCall<T[K]> : T[K];
};

export function promisifyGrpcCall<F extends Function>(func: F, bind?: any): PromisifiedGrpcCall<F> {
  return ((...args: any) =>
    new Promise((resolve, reject) => {
      // console.debug("gRPC request:", ...args);
      func.call(bind, ...args, (error: any, response: any) => {
        if (error) {
          // console.error("gRPC error:", error);
          reject(error);
        } else {
          // console.debug("gRPC response:", response);
          resolve(response);
        }
      });
    })) as any;
}

// Make a proxy with wrapped methods
export function promisifyGrpcClient<T extends grpc.Client>(client: T): PromisifiedGrpcClient<T> {
  const wrappedClient: PromisifiedGrpcClient<T> = Object.create(client);
  for (const key in client) {
    const func: (typeof client)[keyof T] = client[key];
    if (typeof func === "function") {
      Object.defineProperty(wrappedClient, key, {
        value: promisifyGrpcCall(func, client),
      });
    }
  }
  return wrappedClient;
}
