import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error(
    "Error: ANTHROPIC_API_KEY is not set.\n" +
      "Create a .env file next to this script containing:\n" +
      "  ANTHROPIC_API_KEY=sk-ant-...",
  );
  process.exit(1);
}

const client = new Anthropic({ apiKey });

try {
  const stream = client.messages.stream({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content:
          "Write a short, upbeat product description for an insulated water bottle.",
      },
    ],
  });

  // `text` fires once per text delta — write it straight to stdout so the
  // reader sees the response build up incrementally instead of all at once.
  stream.on("text", (delta) => process.stdout.write(delta));

  const message = await stream.finalMessage();

  process.stdout.write("\n");
  console.log(
    `Usage: input_tokens=${message.usage.input_tokens} output_tokens=${message.usage.output_tokens}`,
  );
} catch (error) {
  process.stdout.write("\n");
  if (error instanceof Anthropic.AuthenticationError) {
    console.error("Error: the ANTHROPIC_API_KEY in .env was rejected.");
  } else if (error instanceof Anthropic.RateLimitError) {
    console.error("Error: rate limited by the Claude API — retry shortly.");
  } else if (error instanceof Anthropic.APIError) {
    console.error(
      `Error: Claude API returned ${error.status}: ${error.message}`,
    );
  } else {
    console.error(`Error: ${error.message}`);
  }
  process.exit(1);
}
