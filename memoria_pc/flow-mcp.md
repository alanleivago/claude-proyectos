---
name: flow-mcp
description: srz-google-flow-mcp installed (Google Flow / Nano Banana image gen via dedicated Chrome); paths and output folder
metadata:
  node_type: memory
  type: reference
  originSessionId: 750061ec-7801-45cc-8773-82b3dd37b899
  modified: 2026-10-20T21:40:24.553Z
---

srz-google-flow-mcp is installed at `F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP` and registered in Claude Code (user scope). Tools: flow_generate_image, flow_upload_file, flow_list_assets, flow_new_project. CLI fallback: `node src/cli.js "prompt" --aspect 9:16`.
Output folder (config.json): `D:\Alan\Fiverr Upwork trabajo fotos y videos\Crudos\Mios\Facebook y tik tok\Reels e imagenes facebook memu\Claude\Imagenes google flow agente davis`.
The `claude` CLI is not on PATH; use the bundled one at `C:\Users\Alan Leiva\.vscode\extensions\anthropic.claude-code-*\resources\native-binary\claude.exe`.
If generation fails with "Execution context destroyed" or a ProseMirror timeout, the Flow Chrome is closed or not signed in; run `node src/cli.js chrome` and have the user sign in.
