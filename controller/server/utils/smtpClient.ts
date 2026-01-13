import net from "node:net";
import tls from "node:tls";

type SocketLike = net.Socket | tls.TLSSocket;

function b64(s: string) {
  return Buffer.from(s, "utf8").toString("base64");
}

async function readLine(sock: SocketLike): Promise<string> {
  return await new Promise((resolve, reject) => {
    let buf = "";
    const onData = (chunk: Buffer) => {
      buf += chunk.toString("utf8");
      const idx = buf.indexOf("\n");
      if (idx !== -1) {
        const line = buf.slice(0, idx + 1);
        buf = buf.slice(idx + 1);
        sock.off("data", onData);
        resolve(line.trimEnd());
      }
    };
    const onErr = (e: any) => {
      sock.off("data", onData);
      reject(e);
    };
    sock.on("data", onData);
    sock.once("error", onErr);
  });
}

async function readReply(sock: SocketLike): Promise<{ code: number; lines: string[] }> {
  const lines: string[] = [];
  while (true) {
    const line = await readLine(sock);
    lines.push(line);
    const m = /^(\d{3})([ -])/.exec(line);
    if (!m) continue;
    if (m[2] === " ") return { code: Number(m[1]), lines };
  }
}

async function sendCmd(sock: SocketLike, cmd: string): Promise<{ code: number; lines: string[] }> {
  sock.write(cmd + "\r\n");
  return await readReply(sock);
}

function ensure(code: number, ok: number[], ctx: string, lines: string[]) {
  if (!ok.includes(code)) {
    throw new Error(`${ctx} failed (${code}): ${lines.join(" | ")}`);
  }
}

export async function sendSmtpMail(opts: {
  host: string;
  port: number;
  user?: string;
  password?: string;
  from: string;
  to: string[];
  subject: string;
  message: string;
}): Promise<void> {
  const { host, port } = opts;
  const implicitTls = port === 465;

  let sock: SocketLike = implicitTls
    ? tls.connect({ host, port, servername: host })
    : net.connect({ host, port });

  await new Promise<void>((resolve, reject) => {
    sock.once("connect", () => resolve());
    sock.once("error", (e) => reject(e));
  });

  const greet = await readReply(sock);
  ensure(greet.code, [220], "SMTP greeting", greet.lines);

  const ehlo = await sendCmd(sock, `EHLO galago`);
  ensure(ehlo.code, [250], "EHLO", ehlo.lines);
  const ehloText = ehlo.lines.join("\n");

  const supportsStartTls = /250[ -]STARTTLS/i.test(ehloText);
  if (!implicitTls && supportsStartTls) {
    const startTls = await sendCmd(sock, "STARTTLS");
    ensure(startTls.code, [220], "STARTTLS", startTls.lines);

    sock = tls.connect({ socket: sock as net.Socket, servername: host });
    await new Promise<void>((resolve, reject) => {
      (sock as tls.TLSSocket).once("secureConnect", () => resolve());
      sock.once("error", (e) => reject(e));
    });

    const ehlo2 = await sendCmd(sock, `EHLO galago`);
    ensure(ehlo2.code, [250], "EHLO (post-STARTTLS)", ehlo2.lines);
  }

  // AUTH (LOGIN) if user provided
  if (opts.user) {
    const auth = await sendCmd(sock, "AUTH LOGIN");
    ensure(auth.code, [334], "AUTH LOGIN", auth.lines);
    const u = await sendCmd(sock, b64(opts.user));
    ensure(u.code, [334], "AUTH username", u.lines);
    const p = await sendCmd(sock, b64(opts.password ?? ""));
    ensure(p.code, [235], "AUTH password", p.lines);
  }

  const mailFrom = await sendCmd(sock, `MAIL FROM:<${opts.from}>`);
  ensure(mailFrom.code, [250], "MAIL FROM", mailFrom.lines);

  for (const rcpt of opts.to) {
    const rcptTo = await sendCmd(sock, `RCPT TO:<${rcpt}>`);
    ensure(rcptTo.code, [250, 251], "RCPT TO", rcptTo.lines);
  }

  const data = await sendCmd(sock, "DATA");
  ensure(data.code, [354], "DATA", data.lines);

  const headers = [
    `From: ${opts.from}`,
    `To: ${opts.to.join(", ")}`,
    `Subject: ${opts.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=utf-8`,
    ``,
  ].join("\r\n");

  // Dot-stuffing: lines starting with '.' must be escaped
  const body = opts.message.replace(/^\./gm, "..");
  sock.write(headers + body + "\r\n.\r\n");
  const sent = await readReply(sock);
  ensure(sent.code, [250], "Send message", sent.lines);

  try {
    await sendCmd(sock, "QUIT");
  } catch {
    // ignore
  }

  sock.end();
}
