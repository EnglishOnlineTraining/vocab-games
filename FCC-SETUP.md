# FCC startup

Free Claude Code (FCC) runs through a local proxy and a separate terminal client.

## Start in VS Code

Open two integrated terminals.

### Terminal 1: start the proxy

```sh
fcc-server
```

If `fcc-server` is not found, use:

```sh
$HOME/.local/share/uv/tools/free-claude-code/bin/fcc-server
```

Leave this terminal running. The proxy should be available at `http://127.0.0.1:8082`.

### Terminal 2: start the client

```sh
cd /Users/strezise/Documents/GitHub/vocab-games
fcc-claude
```

If `fcc-claude` is not found, use:

```sh
$HOME/.local/share/uv/tools/free-claude-code/bin/fcc-claude
```

Then type requests directly at the FCC prompt, for example:

```text
Inspect this project and explain what needs improving.
```

## One-time PATH setup

To use the short commands in future terminals:

```sh
echo 'export PATH="$HOME/.local/share/uv/tools/free-claude-code/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## Admin page

Open `http://127.0.0.1:8082/admin` to check providers and configuration. Never put an API key in this file or commit one to the repository.

The configured NVIDIA NIM model is:

```text
nvidia_nim/openai/gpt-oss-20b
```

FCC is configured to fall back automatically to:

```text
nvidia_nim/meta/llama-3.2-11b-vision-instruct
```

## Troubleshooting

- `Connection refused`: start `fcc-server` in Terminal 1.
- `command not found`: run the full-path command or add the FCC directory to `PATH`.
- Model error: restart both the server and `fcc-claude`; do not add an `anthropic/` prefix to the NVIDIA model in FCC's managed config.
- Stop either process with `Ctrl+C`.
