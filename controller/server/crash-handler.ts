if (typeof process !== "undefined") {
  process.on("uncaughtException", (error) => {
    console.error("💥 UNCAUGHT EXCEPTION:", error);
    console.error("Stack:", error.stack);
    console.error("Time:", new Date().toISOString());
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("💥 UNHANDLED REJECTION at:", promise);
    console.error("Reason:", reason);
    console.error("Time:", new Date().toISOString());
  });

  process.on("exit", (code) => {
    console.error("💥 Process exit with code:", code);
  });

  process.on("SIGTERM", () => {
    console.error("💥 SIGTERM received");
  });

  process.on("SIGINT", () => {
    console.error("💥 SIGINT received");
  });
}

export {};
