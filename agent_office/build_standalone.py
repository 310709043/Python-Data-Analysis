#!/usr/bin/env python3
"""把前端打包成「單一 HTML 檔」：雙擊就能開，只有示範模式（沒有伺服器可連）。

    python agent_office/build_standalone.py                 # 輸出 agent_office/dist/agent-office.html
    python agent_office/build_standalone.py -o /path/x.html
    python agent_office/build_standalone.py --fragment      # 去掉 <html>/<head>/<body> 外框，給會自行包裝頁面的平台用
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

STATIC = Path(__file__).resolve().parent / "static"


def build(fragment: bool = False) -> str:
    html = (STATIC / "index.html").read_text(encoding="utf-8")
    css = (STATIC / "style.css").read_text(encoding="utf-8")
    js = (STATIC / "office.js").read_text(encoding="utf-8").replace("</script", "<\\/script")

    html = html.replace('<link rel="stylesheet" href="style.css">', f"<style>\n{css}\n</style>")
    html = html.replace('<script src="office.js"></script>', f"<script>\n{js}\n</script>")
    if "href=\"style.css\"" in html or "src=\"office.js\"" in html:
        raise SystemExit("index.html 的資源參照格式變了，請同步更新 build_standalone.py")

    if fragment:
        head = re.search(r"<head>(.*?)</head>", html, re.S).group(1)
        body = re.search(r"<body>(.*?)</body>", html, re.S).group(1)
        head = re.sub(r'\s*<meta charset="utf-8">', "", head)
        head = re.sub(r'\s*<meta name="viewport"[^>]*>', "", head)
        html = head.strip() + "\n" + body.strip() + "\n"
    return html


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("-o", "--output", type=Path, default=STATIC.parent / "dist" / "agent-office.html")
    parser.add_argument("--fragment", action="store_true")
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(build(args.fragment), encoding="utf-8")
    print(f"已輸出 {args.output}（{args.output.stat().st_size // 1024} KB）")


if __name__ == "__main__":
    main()
