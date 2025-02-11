/* eslint-disable */
import {
  CallOptions,
  ChannelCredentials,
  Client,
  ClientOptions,
  ClientUnaryCall,
  handleUnaryCall,
  makeGenericClientConstructor,
  Metadata,
  ServiceError,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import { Empty } from "../../google/protobuf/empty";
import {
  Command,
  Config,
  ConfigureReply,
  EstimateDurationReply,
  ExecuteCommandReply,
  StatusReply,
} from "./tool_base";

export const protobufPackage = "com.science.foundry.tools.grpc_interfaces";

export type ToolDriverService = typeof ToolDriverService;
export const ToolDriverService = {
  getStatus: {
    path: "/com.science.foundry.tools.grpc_interfaces.ToolDriver/GetStatus",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Empty.decode(value),
    responseSerialize: (value: StatusReply) => Buffer.from(StatusReply.encode(value).finish()),
    responseDeserialize: (value: Buffer) => StatusReply.decode(value),
  },
  executeCommand: {
    path: "/com.science.foundry.tools.grpc_interfaces.ToolDriver/ExecuteCommand",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: Command) => Buffer.from(Command.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Command.decode(value),
    responseSerialize: (value: ExecuteCommandReply) =>
      Buffer.from(ExecuteCommandReply.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ExecuteCommandReply.decode(value),
  },
  estimateDuration: {
    path: "/com.science.foundry.tools.grpc_interfaces.ToolDriver/EstimateDuration",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: Command) => Buffer.from(Command.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Command.decode(value),
    responseSerialize: (value: EstimateDurationReply) =>
      Buffer.from(EstimateDurationReply.encode(value).finish()),
    responseDeserialize: (value: Buffer) => EstimateDurationReply.decode(value),
  },
  configure: {
    path: "/com.science.foundry.tools.grpc_interfaces.ToolDriver/Configure",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: Config) => Buffer.from(Config.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Config.decode(value),
    responseSerialize: (value: ConfigureReply) =>
      Buffer.from(ConfigureReply.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ConfigureReply.decode(value),
  },
} as const;

export interface ToolDriverServer extends UntypedServiceImplementation {
  getStatus: handleUnaryCall<Empty, StatusReply>;
  executeCommand: handleUnaryCall<Command, ExecuteCommandReply>;
  estimateDuration: handleUnaryCall<Command, EstimateDurationReply>;
  configure: handleUnaryCall<Config, ConfigureReply>;
}

export interface ToolDriverClient extends Client {
  getStatus(
    request: Empty,
    callback: (error: ServiceError | null, response: StatusReply) => void,
  ): ClientUnaryCall;
  getStatus(
    request: Empty,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: StatusReply) => void,
  ): ClientUnaryCall;
  getStatus(
    request: Empty,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: StatusReply) => void,
  ): ClientUnaryCall;
  executeCommand(
    request: Command,
    callback: (error: ServiceError | null, response: ExecuteCommandReply) => void,
  ): ClientUnaryCall;
  executeCommand(
    request: Command,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ExecuteCommandReply) => void,
  ): ClientUnaryCall;
  executeCommand(
    request: Command,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ExecuteCommandReply) => void,
  ): ClientUnaryCall;
  estimateDuration(
    request: Command,
    callback: (error: ServiceError | null, response: EstimateDurationReply) => void,
  ): ClientUnaryCall;
  estimateDuration(
    request: Command,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: EstimateDurationReply) => void,
  ): ClientUnaryCall;
  estimateDuration(
    request: Command,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: EstimateDurationReply) => void,
  ): ClientUnaryCall;
  configure(
    request: Config,
    callback: (error: ServiceError | null, response: ConfigureReply) => void,
  ): ClientUnaryCall;
  configure(
    request: Config,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ConfigureReply) => void,
  ): ClientUnaryCall;
  configure(
    request: Config,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ConfigureReply) => void,
  ): ClientUnaryCall;
}

export const ToolDriverClient = makeGenericClientConstructor(
  ToolDriverService,
  "com.science.foundry.tools.grpc_interfaces.ToolDriver",
) as unknown as {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ClientOptions>,
  ): ToolDriverClient;
  service: typeof ToolDriverService;
};
